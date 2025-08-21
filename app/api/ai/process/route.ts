// app/api/ai/process/route.ts
import { supabaseAdmin } from "@/lib/supabase/server";
import { toFormattedPost, findLinksWithGemini } from "@/lib/ai/gemini";
import { curatedMatch, toLinksJson, renderPracticeSection } from "@/lib/ai/curatedProblems";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
    const { id } = await req.json();
    if (!id) return new Response("Missing id", { status: 400 });

    const supa = supabaseAdmin();
    const { data: post, error } = await supa.from("posts").select("*").eq("id", id).single();
    if (error || !post) return new Response("Not found", { status: 404 });

    try {
        const ai = await toFormattedPost({
            company: post.company ?? undefined,
            role: post.role ?? undefined,
            interview_date: post.interview_date ?? undefined,
            degree_level: post.degree_level ?? undefined,
            opportunity_type: post.opportunity_type ?? undefined,
            content_raw: post.content_raw,
        });

        // 1) curated fuzzy hits
        const curated = curatedMatch(`${ai.markdown}\n${post.content_raw}`, 3);

        // 2) if <3, ask Gemini for more (send the lines we think are questions)
        const missingCount = Math.max(0, 3 - curated.length);
        let llmLinks: any[] = [];
        if (missingCount > 0) {
            // quick phrase extraction from the user text (simple heuristics to keep it light)
            const candidates = Array.from(
                new Set(
                    (post.content_raw.match(/([a-zA-Z0-9 +-]+linked list|coin change|binary search|two sum|matrix|graph|tree|dp|dynamic programming)/gi) || [])
                        .map((s: any) => s.toLowerCase())
                )
            ).slice(0, 5);
            // @ts-ignore
            llmLinks = await findLinksWithGemini(candidates);
        }

        // merge + unique by title
        const merged = [...toLinksJson(curated), ...llmLinks].filter(Boolean)
            .filter((v, i, arr) => arr.findIndex(x => x.title === v.title) === i)
            .slice(0, 3);

        const practiceMd = renderPracticeSection(curated);
        const combinedMd = merged.length
            ? `${ai.markdown}\n\n## Practice & Similar Problems\n${practiceMd || merged.map(l => `- **${l.title}** (${l.site}) → ${l.url}`).join("\n")}`
            : ai.markdown;

        await supa.from("posts").update({
            title: ai.title?.slice(0, 80) ?? null,
            content_formatted: combinedMd,
            links_json: merged,
            status: "published",
        }).eq("id", id);

        return Response.json({ ok: true });
    } catch (err: any) {
        await supa.from("posts").update({ status: "failed" }).eq("id", id);
        return new Response("AI failed: " + (err?.message || "unknown"), { status: 500 });
    }
}
