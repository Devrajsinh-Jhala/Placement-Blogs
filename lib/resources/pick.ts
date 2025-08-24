// lib/resources/pick.ts
import type { Topic, Resource } from "./catalog";
import { RESOURCE_CATALOG } from "./catalog";

export function pickResources(topics: string[], perTopic = 2, maxTotal = 6) {
    const wanted = new Set<Topic>(
        topics
            .map((t) => t.trim().toUpperCase())
            .filter((t): t is Topic => ["CN", "OS", "DBMS", "DSA"].includes(t))
    );

    const selected: Resource[] = [];
    for (const topic of wanted) {
        const items = RESOURCE_CATALOG.filter((r) => r.topic === topic).slice(0, perTopic);
        for (const r of items) {
            if (selected.find((x) => x.url === r.url)) continue;
            selected.push(r);
            if (selected.length >= maxTotal) break;
        }
        if (selected.length >= maxTotal) break;
    }

    const markdown = selected.length
        ? selected
            .map((r) => `- **${r.title}** (${r.type}${r.author ? ` • ${r.author}` : ""}) → ${r.url}`)
            .join("\n")
        : "";

    return { resources: selected, markdown };
}
