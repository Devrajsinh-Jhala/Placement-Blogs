// lib/search/tavily.ts
type TavilyResult = { title: string; url: string; content: string };

export async function tavilySearch(q: string, includeDomains: string[], max = 5): Promise<TavilyResult[]> {
    const key = process.env.TAVILY_API_KEY;
    if (!key) return [];
    const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
            query: q,
            search_depth: "basic",
            include_domains: includeDomains,
            max_results: Math.min(10, Math.max(1, max)),
            include_answer: false,
            include_raw_content: false,
        }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results: any[] = data?.results || [];
    return results.map((r) => ({ title: r.title, url: r.url, content: r.content || "" }));
}
