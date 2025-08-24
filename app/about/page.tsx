import Image from "next/image";
import Link from "next/link";

export default async function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20">
          <Image
            src="/my new image.jpg"
            alt="Your photo"
            fill
            sizes="80px"
            className="rounded-full object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">About</h1>
          <p className="text-sm text-gray-600">
            Why I built this & what this app can do for you.
          </p>
        </div>
      </div>

      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-2">Hi, I’m Devrajsinh Jhala</h2>
        <p className="text-gray-700">
          I built this app to make it ridiculously easy for juniors to share and
          learn from real interview experiences. Speak your story, and the AI
          tidies it up, adds practice links, and recommends the best
          resources—so you can focus on prep, not formatting.
        </p>
      </section>

      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3">Salient features</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            🎙️ Voice-first posting — speak your experience; no audio stored.
          </li>
          <li>✨ Auto-formatting — clean summary, rounds, and tips.</li>
          <li>
            🔗 Problem linking — finds canonical LeetCode/GFG links &
            variations.
          </li>
          <li>
            📚 Smart resources — topic-based playlists & sheets (Babbar, Gate
            Smashers, Striver).
          </li>
          <li>
            🧭 Filters — browse by year, degree, type, and topics
            (CN/OS/DBMS/DSA).
          </li>
        </ul>
      </section>

      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3">Let’s connect</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="https://www.linkedin.com/in/devrajsinh-jhala/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-gray-50 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.94 8.5V21H3.5V8.5h3.44zM5.22 3a2 2 0 1 1 0 4.001a2 2 0 0 1 0-4zM20.5 21h-3.44v-6.47c0-1.54-.03-3.52-2.14-3.52c-2.14 0-2.47 1.67-2.47 3.4V21H9.02V8.5h3.3v1.7h.05c.46-.87 1.58-1.79 3.26-1.79c3.49 0 4.13 2.3 4.13 5.29V21z"
              />
            </svg>
            LinkedIn
          </Link>

          <Link
            href="https://www.instagram.com/devrajsinh.jhala/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-gray-50 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.8A5.2 5.2 0 1 1 6.8 13A5.21 5.21 0 0 1 12 7.8m0 2A3.2 3.2 0 1 0 15.2 13A3.2 3.2 0 0 0 12 9.8m5.75-3.3a1 1 0 1 1-1 1a1 1 0 0 1 1-1"
              />
            </svg>
            Instagram
          </Link>
        </div>
      </section>

      <div className="text-xs text-gray-500">
        Built with Next.js, TypeScript, Supabase, Clerk, Tailwind, and Gemini.
      </div>
    </div>
  );
}
