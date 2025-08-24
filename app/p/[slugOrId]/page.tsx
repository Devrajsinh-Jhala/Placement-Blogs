import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/server";
import CopyLinkButton from "./CopyLinkButton";

export const dynamic = "force-dynamic";

export default async function PostDetail({
  params,
  searchParams,
}: {
  params: { slugOrId: string };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const returnTo = typeof sp.returnTo === "string" ? sp.returnTo : "";

  const supa = supabaseAnon();
  let { data: post } = await supa
    .from("posts")
    .select("*")
    .eq("slug", params.slugOrId)
    .maybeSingle();
  if (
    !post &&
    /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/.test(
      params.slugOrId
    )
  ) {
    const { data: byId } = await supa
      .from("posts")
      .select("*")
      .eq("id", params.slugOrId)
      .maybeSingle();
    post = byId || null;
  }
  if (!post) return notFound();

  const backHref = returnTo ? `/?${returnTo}` : "/";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={backHref} className="text-sm text-gray-500 hover:underline">
          ← Back to results
        </Link>
        <CopyLinkButton />
      </div>

      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {post.title ?? `${post.company ?? ""} ${post.role ?? "Interview"}`}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {post.company && (
            <span className="px-2 py-1 rounded-full bg-gray-100">
              {post.company}
            </span>
          )}
          {post.role && (
            <span className="px-2 py-1 rounded-full bg-gray-100">
              {post.role}
            </span>
          )}
          {post.interview_date && (
            <span className="px-2 py-1 rounded-full bg-gray-100">
              {post.interview_date}
            </span>
          )}
          {post.degree_level && (
            <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
              {post.degree_level}
            </span>
          )}
          {post.opportunity_type && (
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {post.opportunity_type}
            </span>
          )}
          <span
            className={`ml-auto px-2 py-1 rounded-full ${
              post.status === "published"
                ? "bg-green-100 text-green-700"
                : post.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {post.status}
          </span>
        </div>
      </header>

      <article className="prose prose-slate max-w-none">
        {post.content_formatted ? (
          <ReactMarkdown>{post.content_formatted}</ReactMarkdown>
        ) : (
          <p className="text-gray-500">Formatting pending…</p>
        )}
      </article>

      {post.links_json?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Quick Practice</h3>
          <div className="flex flex-wrap gap-2">
            {post.links_json.slice(0, 6).map((l: any, i: number) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50"
              >
                {l.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
