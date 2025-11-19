import type { Picked } from "@/lib/search";
import { findProblemLinks } from "@/lib/search";
import { extractQuestionsAndQueries } from "./gemini";

export type Enrichment = {
    links: Picked[];
    practiceMd: string;
};

export async function enrichLinks(input: {
    raw: string;
    formatted?: string;
    searchBundles?: { question: string; queries: string[] }[];
}): Promise<Enrichment> {
    // 1) Build bundles from model output (or extract)
    let bundles = input.searchBundles;
    if (!bundles || !bundles.length) {
        const extracted = await extractQuestionsAndQueries({
            content_raw: input.raw,
            content_formatted: input.formatted,
        });
        bundles =
            extracted.searchQueries?.length
                ? extracted.searchQueries
                : (extracted.questions || []).map((q) => ({ question: q.name, queries: [q.name] }));
    }

    console.log("[enrichLinks] Found bundles:", bundles?.length || 0);

    // Normalize / de-dup question names
    const seenQ = new Set<string>();
    bundles = (bundles || []).filter((b) => {
        const key = (b.question || "").toLowerCase().trim();
        if (!key || seenQ.has(key)) return false;
        seenQ.add(key);
        return true;
    });

    const picks: Picked[] = [];

    // 2) First pass: ensure at least ONE link per distinct problem
    for (const b of bundles) {
        if (picks.length >= 3) break;

        // Try web search first
        let found = await findProblemLinks(b.queries || [b.question], 3);
        console.log(`[enrichLinks] Web search for "${b.question}":`, found.length, "results");

        // Gemini fallback if web search returned nothing
        if (!found.length) {
            const { findLinksWithGemini } = await import("./gemini");
            try {
                found = await findLinksWithGemini([b.question, ...(b.queries || [])]);
                console.log(`[enrichLinks] Gemini fallback for "${b.question}":`, found.length, "results");
            } catch (err) {
                console.error(`[enrichLinks] Gemini fallback error:`, err);
                found = [];
            }
        }

        if (found.length) {
            const f = found[0]; // one per problem in this pass
            if (!picks.find((p) => p.url === f.url)) {
                picks.push(f);
            }
        }
    }

    // 3) Second pass: if we still have <3, fill with remaining best candidates
    if (picks.length < 3) {
        for (const b of bundles) {
            const extras = await findProblemLinks(b.queries || [b.question], 3);
            for (const f of extras) {
                if (!picks.find((p) => p.url === f.url)) {
                    picks.push(f);
                    if (picks.length >= 3) break;
                }
            }
            if (picks.length >= 3) break;
        }
    }

    // 4) Final Gemini fallback: if we still have no links at all, use Gemini with all questions
    if (picks.length === 0 && bundles.length > 0) {
        console.log("[enrichLinks] No links found, trying Gemini with all questions");
        const { findLinksWithGemini } = await import("./gemini");
        try {
            const allQuestions = bundles.map(b => b.question).filter(Boolean);
            const geminiLinks = await findLinksWithGemini(allQuestions);
            picks.push(...geminiLinks.slice(0, 3));
            console.log("[enrichLinks] Gemini returned:", geminiLinks.length, "links");
        } catch (err) {
            console.error("[enrichLinks] Final Gemini fallback error:", err);
        }
    }

    console.log("[enrichLinks] Final picks:", picks.length);

    const practiceMd = picks.length
        ? picks.map((p) => `- **${p.title}** (${p.site}) → ${p.url}`).join("\n")
        : "";

    return { links: picks, practiceMd };
}
