import { supabaseAdmin } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supa = supabaseAdmin();
    const {id} = await context.params;
    const { data, error } = await supa
        .from("posts")
        .select("status, slug")
        .eq("id", id)
        .single();

    if (error || !data) return new Response("Not found", { status: 404 });
    return Response.json(data);
}
