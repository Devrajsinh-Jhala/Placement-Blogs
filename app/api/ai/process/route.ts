// app/api/ai/process/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { toStructuredPost } from "@/lib/ai/gemini";
import { enrichLinks } from "@/lib/ai/enrich";
import { pickResources } from "@/lib/resources/pick";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const { id } = await req.json();
    if (!id) return new Response("Missing id", { status: 400 });

    const supa = supabaseAdmin();
    const { data: post, error } = await supa.from("posts").select("*").eq("id", id).single();
    if (error || !post) return new Response("Not found", { status: 404 });

    try {
        // 1) Structured format + signals
        const structured = await toStructuredPost({
            company: post.company ?? undefined,
            role: post.role ?? undefined,
            interview_date: post.interview_date ?? undefined,
            degree_level: post.degree_level ?? undefined,
            opportunity_type: post.opportunity_type ?? undefined,
            content_raw: post.content_raw,
        });

        // 2) Use model-provided search queries for link enrichment
        const enrichment = await enrichLinks({
            raw: post.content_raw || "",
            formatted: structured.markdown || "",
            searchBundles: structured.searchQueries,
        });

        // 3) Union topics: user selections + model-detected
        const userTopics: string[] = Array.isArray(post.topics) ? post.topics : [];
        const modelTopics: string[] = structured.topicsDetected || [];
        const mergedTopics = Array.from(new Set([...userTopics, ...modelTopics]));

        // 4) Pick topic-based resources from file (no DB schema change)
        const resourcePack = pickResources(mergedTopics, 2, 6);

        // 5) Build final markdown
        let combinedMd = structured.markdown || "";
        if (enrichment.practiceMd) {
            combinedMd += `\n\n## Practice & Similar Problems\n${enrichment.practiceMd}`;
        }
        if (resourcePack.markdown) {
            combinedMd += `\n\n## Recommended Resources\n${resourcePack.markdown}`;
        }

        await supa
            .from("posts")
            .update({
                title: structured.title?.slice(0, 80) ?? null,
                content_formatted: combinedMd,
                links_json: enrichment.links, // used for practice chips on Home
                status: "published",
            })
            .eq("id", id);

        return Response.json({ ok: true });
    } catch (err: any) {
        await supa.from("posts").update({ status: "failed" }).eq("id", id);
        return new Response("AI failed: " + (err?.message || "unknown"), { status: 500 });
    }
}
