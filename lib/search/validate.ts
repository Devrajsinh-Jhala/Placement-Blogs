// lib/search/validate.ts
export type Candidate = { title: string; url: string; snippet?: string };

const allowed = (process.env.ALLOWED_PRACTICE_DOMAINS || "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

export function isAllowedDomain(u: string) {
    try {
        const host = new URL(u).host.replace(/^www\./, "");
        return allowed.some((d) => host.endsWith(d));
    } catch {
        return false;
    }
}

export function isLikelyLCProblem(u: string) {
    try {
        const { host, pathname } = new URL(u);
        return /leetcode\.com$/.test(host.replace(/^www\./, "")) && /^\/problems\/[^/]+\/?$/.test(pathname);
    } catch {
        return false;
    }
}

export function isLikelyGFGArticle(u: string) {
    try {
        const { host, pathname } = new URL(u);
        return /geeksforgeeks\.org$/.test(host.replace(/^www\./, "")) && /\/[^/]+\/$|\/[^/]+$/.test(pathname);
    } catch {
        return false;
    }
}

export async function headOk(u: string): Promise<boolean> {
    try {
        const r = await fetch(u, { method: "HEAD", redirect: "follow" });
        if (r.status >= 200 && r.status < 400) return true;

        // Some sites (e.g., LeetCode) block HEAD → try a light GET
        const g = await fetch(u, { method: "GET", redirect: "follow" });
        return g.status >= 200 && g.status < 400;
    } catch {
        return false;
    }
}

export function scoreMatch(problem: string, cand: Candidate): number {
    const p = problem.toLowerCase();
    const t = (cand.title || "").toLowerCase();
    let s = 0;
    if (isLikelyLCProblem(cand.url)) s += 3;
    if (isLikelyGFGArticle(cand.url)) s += 2;
    if (t.includes(p)) s += 2;
    // token overlap
    const pt = p.split(/\W+/), tt = t.split(/\W+/);
    const inter = pt.filter((x) => tt.includes(x));
    s += inter.length * 0.5;
    return s;
}
