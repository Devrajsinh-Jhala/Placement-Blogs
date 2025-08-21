// lib/ai/curatedProblems.ts
export type PracticeHit = {
    title: string;
    url: string;
    site: "LeetCode" | "GFG" | "Other";
    matchType: "exact" | "variation" | "similar";
    note?: string;
};

export type CuratedProblem = {
    key: string; title: string; lc?: string; gfg?: string; synonyms?: string[];
};

const C: CuratedProblem[] = [
    {
        key: "reverse linked list", title: "Reverse Linked List",
        lc: "https://leetcode.com/problems/reverse-linked-list/",
        gfg: "https://www.geeksforgeeks.org/reverse-a-linked-list/",
        synonyms: ["reverse ll", "reversing a linked list", "reverse a linked list", "reverse singly linked list", "reversal of a linked list"]
    },
    {
        key: "middle of the linked list", title: "Middle of the Linked List",
        lc: "https://leetcode.com/problems/middle-of-the-linked-list/",
        gfg: "https://www.geeksforgeeks.org/middle-of-a-linked-list/",
        synonyms: ["find middle of linked list", "middle node", "slow fast pointer middle"]
    },
    {
        key: "01 matrix", title: "01 Matrix",
        lc: "https://leetcode.com/problems/01-matrix/",
        gfg: "https://www.geeksforgeeks.org/distance-of-nearest-cell-having-1/",
        synonyms: ["0-1 matrix", "zero one matrix", "0 1 matrix", "nearest zero distance", "bfs matrix", "0-1 matrix radiation"]
    },
    {
        key: "coin change", title: "Coin Change",
        lc: "https://leetcode.com/problems/coin-change/",
        gfg: "https://www.geeksforgeeks.org/coin-change-dp-7/",
        synonyms: ["change making", "min coins", "dp coins", "variation of coin change"]
    },
    {
        key: "two sum", title: "Two Sum",
        lc: "https://leetcode.com/problems/two-sum/",
        gfg: "https://www.geeksforgeeks.org/two-sum-problem/",
        synonyms: ["pair sum", "find two numbers sum"]
    },
    {
        key: "binary search", title: "Binary Search",
        lc: "https://leetcode.com/problems/binary-search/",
        gfg: "https://www.geeksforgeeks.org/binary-search/",
        synonyms: ["lower bound", "upper bound", "bs on answer", "search sorted array"]
    },
    {
        key: "lemonade change", title: "Lemonade Change",
        lc: "https://leetcode.com/problems/lemonade-change/",
        gfg: "https://www.geeksforgeeks.org/lemonade-change-problem/",
        synonyms: ["lemonade", "cash register change"]
    },
];

const VAR_WORDS = ["variation", "variant", "similar", "twist", "modified", "like"];

const STOP = new Set(["a", "an", "the", "of", "to", "and", "in", "on", "for", "with", "by", "at", "is", "was", "be", "been"]);
const stem = (w: string) => w
    .replace(/ing$|ed$|es$|s$/, "")
    .replace(/ly$/, "")
    .replace(/-+/g, "-");
const toks = (s: string) => s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/).map(stem).filter(x => x && !STOP.has(x));

function fuzzyContains(text: string, phrase: string) {
    const T = toks(text), P = toks(phrase);
    const setT = new Set(T);
    const hit = P.filter(p => setT.has(p));
    const ratio = hit.length / P.length;
    if (ratio >= 0.66) {
        // rough index: find first token occurrence
        const idx = T.findIndex(t => t === P[0] || t === P[1]);
        return { ok: true, idx: idx < 0 ? 0 : idx };
    }
    return { ok: false, idx: -1 };
}

function isNearVariation(text: string, idxToken: number) {
    const raw = text.toLowerCase();
    const approxIdx = Math.max(0, raw.indexOf(" ", idxToken) - 60);
    const window = raw.slice(approxIdx, approxIdx + 160);
    return VAR_WORDS.some(w => window.includes(w));
}

export function curatedMatch(body: string, max = 3): PracticeHit[] {
    const text = body.toLowerCase();
    const hits: PracticeHit[] = [];
    for (const p of C) {
        let found = fuzzyContains(text, p.key);
        let type: PracticeHit["matchType"] | null = null;
        if (found.ok) type = isNearVariation(text, found.idx) ? "variation" : "exact";
        if (!type && p.synonyms) {
            for (const syn of p.synonyms) {
                const f = fuzzyContains(text, syn);
                if (f.ok) { type = isNearVariation(text, f.idx) ? "variation" : "similar"; break; }
            }
        }
        if (type) {
            const url = p.lc ?? p.gfg ?? "";
            const site = p.lc ? "LeetCode" : p.gfg ? "GFG" : "Other";
            hits.push({ title: p.title, url, site, matchType: type, note: type === "variation" ? "variation mentioned" : type });
            if (hits.length >= max) break;
        }
    }
    return hits;
}

export const toLinksJson = (hits: PracticeHit[]) =>
    hits.map(h => ({ title: h.title, url: h.url, site: h.site }));

export const renderPracticeSection = (hits: PracticeHit[]) =>
    !hits.length ? "" : hits.map(h => `- **${h.title}** — ${h.note} (${h.site}) → ${h.url}`).join("\n");
