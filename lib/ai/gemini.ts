import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// lib/ai/gemini.ts  (append this helper)
export async function findLinksWithGemini(problemPhrases: string[]): Promise<{ title: string, url: string, site: "LeetCode" | "GFG" | "Other" }[]> {
    if (!problemPhrases.length) return [];
    const model = new (await import("@google/generative-ai")).GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Given these interview problem names, output JSON {links:[{title,url,site}]}. 
Rules:
- Prefer LeetCode. If not available, use GeeksForGeeks. 
- Use the official problem URLs (LeetCode: /problems/<slug>/ ; GFG: article page).
- If it's a variation, choose the closest canonical problem and keep the title canonical.
Problems: ${problemPhrases.join(", ")}`;
    const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } });
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


export async function toFormattedPost(input: {
    company?: string;
    role?: string;
    interview_date?: string | null;
    degree_level?: string | null;
    opportunity_type?: string | null;
    content_raw: string;
}): Promise<AiResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const sys = `You clean up a student's interview write-up.
Return JSON with: title (<=80 chars), markdown.
Markdown should include sections: Summary, Rounds & Questions (bullets if any), Tips for juniors.
Be concise and friendly. If info missing, omit that section.`;


    const user = `Company: ${input.company ?? ""}\nRole: ${input.role ?? ""}\nDate: ${input.interview_date ?? ""}\nDegree: ${input.degree_level ?? ""}\nType: ${input.opportunity_type ?? ""}\n\nWrite-up:\n${input.content_raw}`;


    const resp = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: sys + "\n\n" + user }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 800, responseMimeType: "application/json" },
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