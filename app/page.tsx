// app/page.tsx
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { supabaseAdmin } from "@/lib/supabase/server";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = first(sp.q) ?? "";
  const degree = first(sp.degree) ?? "";
  const type = first(sp.type) ?? "";
  const year = first(sp.year) ?? ""; // e.g., "2025"
  const topicsList = many(sp.topics); // ["CN","OS"] from ?topics=CN&topics=OS or "CN,OS"
  const page = parseInt(first(sp.page) ?? "1", 10) || 1;
  const limit = parseInt(first(sp.limit) ?? "10", 10) || 10;
  const offset = (page - 1) * limit;

  // Build Supabase query directly
  const supa = supabaseAdmin();
  let query = supa
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,company.ilike.%${q}%,role.ilike.%${q}%,content_formatted.ilike.%${q}%`
    );
  }
  if (degree) query = query.eq("degree_level", degree);
  if (type) query = query.eq("opportunity_type", type);

  // Year filter without needing a generated column:
  if (year && /^\d{4}$/.test(year)) {
    query = query
      .gte("interview_date", `${year}-01-01`)
      .lte("interview_date", `${year}-12-31`);
  }

  if (topicsList.length) {
    // requires posts.topics text[]
    query = query.contains("topics", topicsList);
  }

  const { data: posts, error, count } = await query;
  if (error) {
    // Render a friendly message instead of throwing a server error
    return (
      <div className="text-sm text-red-600">
        Failed to load posts: {error.message}
      </div>
    );
  }

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  // Preserve filters when linking into a post (for Back to results)
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (degree) qs.set("degree", degree);
  if (type) qs.set("type", type);
  if (year) qs.set("year", year);
  for (const t of topicsList) qs.append("topics", t);
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  const returnTo = qs.toString();
  const formKey = JSON.stringify({ q, degree, type, year, topicsList });

  return (
    <div className="space-y-5">
      {/* Filter form (pure HTML, no handlers) */}
      <form
        key={formKey} // reset form if filters change
        action="/"
        method="get"
        className="bg-white border rounded-xl p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-end">
          <div className="md:col-span-5">
            <label className="text-xs text-gray-600">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search company, role, or topic"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Degree</label>
            <select
              name="degree"
              defaultValue={degree}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Any</option>
              <option value="BE">BE</option>
              <option value="ME">ME</option>
              <option value="Dual">Dual</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Type</label>
            <select
              name="type"
              defaultValue={type}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Any</option>
              <option value="Internship">Internship</option>
              <option value="Full-Time">Full-Time</option>
              <option value="PS">PS</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Year</label>
            <select
              name="year"
              defaultValue={year}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Any</option>
              {yearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Topics as pure HTML checkboxes */}
          <div className="md:col-span-12">
            <label className="text-xs text-gray-600">Topics</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {["CN", "OS", "DBMS", "DSA"].map((t) => (
                <label
                  key={t}
                  className="inline-flex items-center gap-2 text-xs"
                >
                  <input
                    type="checkbox"
                    name="topics"
                    value={t}
                    defaultChecked={topicsList.includes(t)}
                    className="h-4 w-4"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-12 flex gap-2">
            <button className="px-4 py-2 rounded bg-black text-white">
              Search
            </button>
            <Link href="/" className="px-4 py-2 rounded border">
              Clear
            </Link>
            <div className="ml-auto text-xs text-gray-500 self-center">
              {total} results
            </div>
          </div>
        </div>
      </form>

      {/* Cards */}
      <ul className="space-y-4">
        {(posts ?? []).map((p: any) => (
          <li
            key={p.id}
            className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow transition"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-lg">
                <Link
                  href={`/p/${p.slug || p.id}?returnTo=${encodeURIComponent(
                    returnTo
                  )}`}
                  className="hover:underline"
                >
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
                  ? "Failed"
                  : "Formatting…"}
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-2 flex gap-2 flex-wrap">
              {p.company && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100">
                  {p.company}
                </span>
              )}
              {p.role && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100">
                  {p.role}
                </span>
              )}
              {p.interview_date && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100">
                  {p.interview_date}
                </span>
              )}
              {p.degree_level && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {p.degree_level}
                </span>
              )}
              {p.opportunity_type && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {p.opportunity_type}
                </span>
              )}
              {p.topics?.length > 0 &&
                p.topics.map((t: string) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700"
                  >
                    {t}
                  </span>
                ))}
            </div>

            {p.content_formatted && (
              <div
                className="text-gray-700"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                <ReactMarkdown>{p.content_formatted}</ReactMarkdown>
              </div>
            )}

            {p.links_json?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.links_json.slice(0, 3).map((l: any, i: number) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50"
                  >
                    Practice: {l.title}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <Pagination
        page={page}
        pageCount={pageCount}
        q={q}
        degree={degree}
        type={type}
        year={year}
        topicsList={topicsList}
        limit={limit}
      />
    </div>
  );
}

function first(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

function many(v?: string | string[]) {
  if (!v) return [];
  if (Array.isArray(v))
    return v
      .flatMap((s) => s.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function yearOptions() {
  const now = new Date().getFullYear();
  const arr: number[] = [];
  for (let y = now + 1; y >= now - 6; y--) arr.push(y);
  return arr;
}

function Pagination({
  page,
  pageCount,
  q,
  degree,
  type,
  year,
  topicsList,
  limit,
}: any) {
  if (pageCount <= 1) return null;
  const params = (p: number) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (degree) usp.set("degree", degree);
    if (type) usp.set("type", type);
    if (year) usp.set("year", year);
    for (const t of topicsList) usp.append("topics", t);
    usp.set("page", String(p));
    usp.set("limit", String(limit));
    return `/?${usp.toString()}`;
  };
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <Link
        href={params(Math.max(1, page - 1))}
        className="px-3 py-1 border rounded"
      >
        Prev
      </Link>
      <span className="text-xs text-gray-600">
        Page {page} of {pageCount}
      </span>
      <Link
        href={params(Math.min(pageCount, page + 1))}
        className="px-3 py-1 border rounded"
      >
        Next
      </Link>
    </div>
  );
}
