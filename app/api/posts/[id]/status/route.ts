import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const supa = supabaseAdmin();
    const { data, error } = await supa
        .from("posts")
        .select("status, slug")
        .eq("id", params.id)
        .single();

    if (error || !data) return new Response("Not found", { status: 404 });
    return Response.json(data);
}
