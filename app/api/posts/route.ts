import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";

export const runtime = "nodejs";

const PostSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  interview_date: z.string().nullable().optional(),
  content_raw: z.string().min(20),
  degree_level: z.enum(["BE", "ME", "Dual"]).optional(),
  opportunity_type: z.enum(["Internship", "Full-Time", "PS"]).optional(),
  topics: z.array(z.string()).optional(),
});

// tiny helpers
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const rng = (n = 6) => Math.random().toString(36).slice(2, 2 + n); // 6-char suffix

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const json = await req.json();
  const parsed = PostSchema.safeParse(json);
  if (!parsed.success) return new Response("Invalid body", { status: 400 });

  // build a slug now to satisfy NOT NULL
  const base =
    slugify(
      `${parsed.data.company ?? "post"} ${parsed.data.role ?? "interview"}`
    ) || "post";
  // add a random suffix to avoid collisions
  const slug = `${base}-${rng(6)}`;

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
      topics: parsed.data.topics ?? [],
      content_raw: parsed.data.content_raw,
      status: "processing",
      slug, // ✅ ensure NOT NULL is satisfied
    })
    .select("id, slug")
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ id: data!.id, slug: data!.slug });
}
