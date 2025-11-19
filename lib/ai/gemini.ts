import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { StructuredPost, StructuredPostSchema } from "./schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export type Extracted = {
  questions: { name: string; tags?: string[]; synonyms?: string[] }[];
  searchQueries: { question: string; queries: string[] }[];
};

export async function extractQuestionsAndQueries(input: {
  content_raw: string;
  content_formatted?: string;
}): Promise<Extracted> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const sys = `You extract interview coding problem names and build web search queries.
Return strict JSON: {"questions":[{"name": "...", "tags":[], "synonyms":[]}], "searchQueries":[{"question":"...", "queries":["..."]}]}
Rules:
- Prefer canonical LC names (e.g., "Reverse Linked List", "Coin Change", "01 Matrix", "Binary Search").
- Add 3–5 queries per problem. Include synonyms and abbreviations users say (e.g., "reverse ll", "0-1 matrix", "slow fast pointer middle").
- Do not include URLs.`;
  const user = `TEXT:\n${(input.content_formatted || "")}\n\nRAW:\n${input.content_raw}`;

  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: sys + "\n\n" + user }] }],
    safetySettings,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                synonyms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              },
              required: ["name"]
            }
          },
          searchQueries: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                queries: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              },
              required: ["question", "queries"]
            }
          }
        },
        required: ["questions", "searchQueries"]
      }
    },
  });

  try {
    const obj = JSON.parse(resp.response.text() || "{}");
    return {
      questions: Array.isArray(obj.questions) ? obj.questions : [],
      searchQueries: Array.isArray(obj.searchQueries) ? obj.searchQueries : [],
    };
  } catch {
    return { questions: [], searchQueries: [] };
  }
}

export async function findLinksWithGemini(problemPhrases: string[]): Promise<{ title: string, url: string, site: "LeetCode" | "GFG" | "Other" }[]> {
  if (!problemPhrases.length) return [];
  const model = new (await import("@google/generative-ai")).GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Given these interview problem names, output JSON {links:[{title,url,site}]}. 
Rules:
- Prefer LeetCode. If not available, use GeeksForGeeks. 
- Use the official problem URLs (LeetCode: /problems/<slug>/ ; GFG: article page).
- If it's a variation, choose the closest canonical problem and keep the title canonical.
Problems: ${problemPhrases.join(", ")}`;
  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          links: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                url: { type: SchemaType.STRING },
                site: { type: SchemaType.STRING }
              },
              required: ["title", "url", "site"]
            }
          }
        },
        required: ["links"]
      }
    }
  });
  try {
    const { links } = JSON.parse(resp.response.text());
    // minimal domain validation
    return (links || []).filter((l: any) =>
      typeof l?.url === "string" &&
      (/leetcode\.com\/problems\//.test(l.url) || /geeksforgeeks\.org\//.test(l.url))
    ).map((l: any) => ({
      title: String(l.title || "Practice"),
      url: String(l.url),
      site: /leetcode/.test(l.url) ? "LeetCode" : /geeksforgeeks/.test(l.url) ? "GFG" : "Other",
    }));
  } catch {
    return [];
  }
}

export type AiResult = {
  title: string;
  markdown: string; // formatted content
};

export async function toStructuredPost(input: {
  company?: string;
  role?: string;
  interview_date?: string;
  degree_level?: "BE" | "ME" | "Dual";
  opportunity_type?: "Internship" | "Full-Time" | "PS";
  content_raw: string;
}): Promise<StructuredPost> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const sys = `You are formatting a student interview write-up and extracting problems/topics for search.
Return STRICT JSON only.
IMPORTANT: In the "markdown" field, use "\\n\\n" (double newline) to separate paragraphs and headers. Do NOT mash text together.
Structure the markdown with these headings:
# Summary
(content...)

# Rounds & Questions
(content...)

# Tips for Juniors
(content...)`;

  const meta = [
    input.company ? `Company: ${input.company}` : "",
    input.role ? `Role: ${input.role}` : "",
    input.interview_date ? `Interview Date: ${input.interview_date}` : "",
    input.degree_level ? `Degree: ${input.degree_level}` : "",
    input.opportunity_type ? `Type: ${input.opportunity_type}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const user = `
${sys}

Input:
${meta ? meta + "\n" : ""}

Raw Text:
${input.content_raw}

Output JSON shape exactly:
{
  "title": "string",
  "markdown": "string (with \\n\\n for newlines)",
  "questions": [{"name":"string","tags":["optional"],"synonyms":["optional"]}],
  "topicsDetected": ["CN","OS","DBMS","DSA"],
  "searchQueries": [{"question":"string","queries":["string","string","string"]}]
}

Rules:
- Title <= 80 chars.
- markdown: Use proper Markdown formatting. HEADERS must be preceded by \\n\\n.
- questions: only actual coding/CS problems/topics asked.
- topicsDetected: choose from CN/OS/DBMS/DSA (empty if none).
- searchQueries: 3–5 high-quality web search queries per problem; prefer canonical names (e.g., "Reverse Linked List", "01 Matrix", "Coin Change").
- No URLs in questions or queries.
`;

  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: user }] }],
    safetySettings,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      maxOutputTokens: 3000,
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          markdown: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                synonyms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              },
              required: ["name"]
            }
          },
          topicsDetected: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          searchQueries: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                queries: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
              },
              required: ["question", "queries"]
            }
          }
        },
        required: ["title", "markdown"]
      }
    },
  });

  // Validate and coerce
  try {
    const json = JSON.parse(resp.response.text() || "{}");
    return StructuredPostSchema.parse(json);
  } catch {
    // Hard fallback: reuse your existing formatter so the app never blocks
    // (Assumes you already have toFormattedPost in this file)
    const fallback = await toFormattedPost(input);
    const minimal: StructuredPost = {
      title: fallback.title || "Interview Experience",
      markdown: fallback.markdown,
      questions: [],
      topicsDetected: [],
      searchQueries: [],
    };
    return minimal;
  }
}

// keep your existing export of toFormattedPost below this comment


export async function toFormattedPost(input: {
  company?: string;
  role?: string;
  interview_date?: string | null;
  degree_level?: string | null;
  opportunity_type?: string | null;
  content_raw: string;
}): Promise<AiResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const sys = `You clean up a student's interview write-up.
Return JSON with: title (<=80 chars), markdown.
Markdown should include sections: Summary, Rounds & Questions (bullets if any), Tips for juniors.
Be concise and friendly. If info missing, omit that section.`;


  const user = `Company: ${input.company ?? ""}\nRole: ${input.role ?? ""}\nDate: ${input.interview_date ?? ""}\nDegree: ${input.degree_level ?? ""}\nType: ${input.opportunity_type ?? ""}\n\nWrite-up:\n${input.content_raw}`;


  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: sys + "\n\n" + user }] }],
    safetySettings,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          markdown: { type: SchemaType.STRING }
        },
        required: ["title", "markdown"]
      }
    },
  });


  const text = resp.response.text();
  if (process.env.DEBUG_AI === "true") {
    console.log("AI raw:", text?.slice(0, 500));
  }
  try {
    const json = JSON.parse(text);
    return { title: json.title || "Interview Experience", markdown: json.markdown || "" };
  } catch {
    // Fallback: treat as markdown
    return { title: `${input.company ?? ""} ${input.role ?? "Interview"}`.trim(), markdown: text };
  }
}