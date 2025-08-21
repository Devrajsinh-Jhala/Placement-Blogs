// app/page.tsx
import ReactMarkdown from "react-markdown";
import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  // Next.js 14.2+/15: searchParams is async
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const qRaw = sp?.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw || "";

  const supa = supabaseAdmin();
  let query = supa
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (q) {
    // naive search: title/company/role/content_formatted
    query = query.or(
      `title.ilike.%${q}%,company.ilike.%${q}%,role.ilike.%${q}%,content_formatted.ilike.%${q}%`
    );
  }

  const { data: posts = [], error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-4">
      <form action="/" method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search company, role, or topic"
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="border rounded px-3 py-2">Search</button>
      </form>

      {posts!.length === 0 && (
        <p className="text-sm text-gray-500">
          No posts yet. Be the first to share!
        </p>
      )}

      <ul className="space-y-4">
        {posts!.map((p: any) => (
          <li key={p.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">
                <Link href={`/p/${p.slug || p.id}`} className="hover:underline">
                  {p.title ?? `${p.company ?? ""} ${p.role ?? "Interview"}`}
                </Link>
              </h2>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === "published"
                    ? "bg-green-100 text-green-700"
                    : p.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.status === "published"
                  ? "Published"
                  : p.status === "failed"
                  ? "Formatting failed"
                  : "Formatting…"}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {[p.company, p.role, p.interview_date]
                .filter(Boolean)
                .join(" • ")}
            </div>
            {p.content_formatted && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {p.content_formatted.slice(0, 200) +
                    (p.content_formatted.length > 200 ? "…" : "")}
                </ReactMarkdown>
              </div>
            )}
            {p.links_json?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.links_json.slice(0, 3).map((l: any, i: number) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    className="text-xs px-2 py-1 rounded-full border"
                    rel="noreferrer"
                  >
                    Practice: {l.title}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
