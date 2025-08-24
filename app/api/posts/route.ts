import { getAuth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { nanoid } from "@/lib/id";
import { z } from "zod";
import { NextRequest } from "next/server";


export const runtime = "nodejs";


const PostSchema = z.object({
    company: z.string().optional(),
    role: z.string().optional(),
    interview_date: z.string().nullable().optional(),
    content_raw: z.string().min(20),
    degree_level: z.enum(["BE", "ME", "Dual"]).optional(),
    opportunity_type: z.enum(["Internship", "Full-Time", "PS"]).optional(),
});


export async function POST(req: NextRequest) {
    //@ts-ignore
    const { userId } = await getAuth(req);
    if (!userId) return new Response("Unauthorized", { status: 401 });


    const json = await req.json();
    const parsed = PostSchema.safeParse(json);
    if (!parsed.success) return new Response("Invalid body", { status: 400 });


    const base = slugify(`${parsed.data.company ?? "interview"}-${parsed.data.role ?? "experience"}`);
    const slug = `${base}-${nanoid()}`;


    const supa = supabaseAdmin();
    const { data, error } = await supa
        .from("posts")
        .insert({
            author_id: userId,
            company: parsed.data.company ?? null,
            role: parsed.data.role ?? null,
            interview_date: parsed.data.interview_date ?? null,
            degree_level: parsed.data.degree_level ?? null,
            opportunity_type: parsed.data.opportunity_type ?? null,
            content_raw: parsed.data.content_raw,
            status: "processing",
            slug,
        })
        .select("id, slug")
        .single();


    if (error) return new Response(error.message, { status: 500 });
    return Response.json({ id: data!.id, slug: data!.slug });
}


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const supa = supabaseAdmin();
    let query = supa
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
    if (q) {
        query = query.or(
            `title.ilike.%${q}%,company.ilike.%${q}%,role.ilike.%${q}%,content_formatted.ilike.%${q}%`
        );
    }
    const { data, error } = await query;
    if (error) return new Response(error.message, { status: 500 });
}