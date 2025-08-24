// lib/search/index.ts
import { tavilySearch } from "./tavily";
import { Candidate, isAllowedDomain, headOk, scoreMatch } from "./validate";

export type Picked = { title: string; url: string; site: "LeetCode" | "GFG" | "Other" };

export async function findProblemLinks(queries: string[], limit = 3): Promise<Picked[]> {
    const includeDomains = (process.env.ALLOWED_PRACTICE_DOMAINS || "")
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

    const candidates: Candidate[] = [];
    for (const q of queries.slice(0, 5)) {
        const hits = await tavilySearch(q, includeDomains, 6);
        for (const h of hits) if (isAllowedDomain(h.url)) candidates.push({ title: h.title, url: h.url, snippet: h.content });
        if (candidates.length >= limit * 3) break;
    }

    // rank by match to the FIRST query (closest to canonical name)
    const base = queries[0] || "";
    const ranked = candidates
        .map((c) => ({ c, s: scoreMatch(base, c) }))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.c);

    const out: Picked[] = [];
    for (const c of ranked) {
        if (out.find((o) => o.url === c.url)) continue;
        if (!(await headOk(c.url))) continue;
        const site = /leetcode\.com/.test(c.url) ? "LeetCode" : /geeksforgeeks\.org/.test(c.url) ? "GFG" : "Other";
        out.push({ title: cleanTitle(c.title), url: c.url, site });
        if (out.length >= limit) break;
    }
    return out;
}

function cleanTitle(t: string) {
    return t.replace(/\s*\|\s*LeetCode/i, "").replace(/\s*- GeeksforGeeks/i, "").trim();
}
