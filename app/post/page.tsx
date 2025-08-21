"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function PostPage() {
  return (
    <div>
      <SignedOut>
        <div className="bg-yellow-50 border rounded p-4 mb-4">
          You need to{" "}
          <SignInButton mode="modal">
            <button className="underline">sign in</button>
          </SignInButton>{" "}
          to post.
        </div>
      </SignedOut>
      <SignedIn>
        <WizardForm />
      </SignedIn>
    </div>
  );
}

function WizardForm() {
  const router = useRouter();
  const { user } = useUser();
  const [stage, setStage] = useState<"record" | "followups" | "review">(
    "record"
  );
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Structured fields
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("");
  const [degree, setDegree] = useState<"" | "BE" | "ME" | "Dual">("");
  const [oppType, setOppType] = useState<
    "" | "Internship" | "Full-Time" | "PS"
  >("");

  // Follow-ups
  const [projectBased, setProjectBased] = useState<"yes" | "no" | "mix" | "">(
    ""
  );
  const [topics, setTopics] = useState<string[]>([]); // e.g., ["CN", "OS", "DBMS", "DSA"]
  const [surprise, setSurprise] = useState("");
  const [advice, setAdvice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleTopic = (t: string) =>
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const finalRef = useRef("");

  const startMic = () => {
    const SR =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SR) {
      alert("Speech Recognition not supported in this browser");
      return;
    }
    if (recording) return;

    const recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.continuous = true;

    recog.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript + " ";
        else interim += r[0].transcript + " ";
      }
      setTranscript((finalRef.current + interim).trim());
    };

    recog.onend = () => setRecording(false);
    recognitionRef.current = recog;
    setRecording(true);
    recog.start();
  };

  const stopMic = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const nextToFollowups = () => {
    if (transcript.trim().length < 20 && (!company || !role)) {
      alert("Please record a bit more or fill company & role.");
      return;
    }
    setStage("followups");
  };

  const toReview = () => setStage("review");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build the raw text the AI will format
    const content_raw = [
      "Transcript:",
      transcript.trim(),
      "",
      "Context:",
      `Company: ${company || "N/A"}`,
      `Role: ${role || "N/A"}`,
      `Date: ${date || "N/A"}`,
      `Degree: ${degree || "N/A"}`,
      `Type: ${oppType || "N/A"}`,
      `Project-based: ${projectBased || "N/A"}`,
      topics.length ? `Topics: ${topics.join(", ")}` : "",
      surprise ? `Surprised by: ${surprise}` : "",
      advice ? `Advice: ${advice}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      setSubmitting(true);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          interview_date: date || null,
          degree_level: degree || undefined,
          opportunity_type: oppType || undefined,
          content_raw,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { id, slug } = await res.json();

      // kick background AI
      fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      }).catch(() => {});

      // poll status before redirect
      const until = Date.now() + 90_000; // 90s max
      while (Date.now() < until) {
        const s = await fetch(`/api/posts/${id}/status`, {
          cache: "no-store",
        }).then((r) => r.json());
        if (s.status === "published") {
          router.push(`/p/${s.slug}`);
          return;
        }
        if (s.status === "failed") {
          alert("AI formatting failed. Showing draft.");
          router.push(`/p/${s.slug}`);
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      // timeout fallback
      router.push(`/p/${slug}`);
    } catch (err: any) {
      alert(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Stage: Record */}
      {stage === "record" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value as any)}
              className="border rounded px-3 py-2"
            >
              <option value="">Degree (opt)</option>
              <option value="BE">BE</option>
              <option value="ME">ME</option>
              <option value="Dual">Dual</option>
            </select>
            <select
              value={oppType}
              onChange={(e) => setOppType(e.target.value as any)}
              className="border rounded px-3 py-2"
            >
              <option value="">Type (opt)</option>
              <option value="Internship">Internship</option>
              <option value="Full-Time">Full-Time</option>
              <option value="PS">PS</option>
            </select>
          </div>

          <label className="block text-sm">
            Speak your experience (or type below)
          </label>
          <div className="flex items-center gap-3">
            {!recording ? (
              <button
                type="button"
                onClick={startMic}
                className="px-3 py-1.5 rounded border"
              >
                🎙️ Start mic
              </button>
            ) : (
              <button
                type="button"
                onClick={stopMic}
                className="px-3 py-1.5 rounded border bg-red-50"
              >
                ⏹ Stop
              </button>
            )}
            <div className="text-xs text-gray-500">
              We do not upload audio; only the text transcript is sent.
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={8}
            placeholder="Your transcript appears here…"
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={nextToFollowups}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Next
          </button>
        </div>
      )}

      {/* Stage: Follow-ups */}
      {stage === "followups" && (
        <div className="space-y-4">
          <div>
            <div className="font-medium mb-1">Was it project-based?</div>
            <div className="flex gap-2">
              {(["yes", "no", "mix"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setProjectBased(v)}
                  className={`px-3 py-1.5 rounded border ${
                    projectBased === v ? "bg-gray-900 text-white" : "bg-white"
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">Were these asked?</div>
            <div className="flex flex-wrap gap-2">
              {["CN", "OS", "DBMS", "DSA"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={`px-3 py-1.5 rounded border ${
                    topics.includes(t) ? "bg-gray-900 text-white" : "bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">What surprised you?</div>
            <input
              value={surprise}
              onChange={(e) => setSurprise(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <div className="font-medium mb-1">
              Your recommendation for juniors
            </div>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStage("record")}
              className="px-4 py-2 rounded border"
            >
              Back
            </button>
            <button
              onClick={toReview}
              className="px-4 py-2 rounded bg-black text-white"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Stage: Review + Submit */}
      {stage === "review" && (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="bg-white border rounded p-3">
            <div className="text-sm text-gray-600 mb-2">
              {[company, role, date, degree, oppType]
                .filter(Boolean)
                .join(" • ")}
            </div>
            <pre className="whitespace-pre-wrap text-sm">
              {[
                transcript,
                "\n--\nProject-based:",
                projectBased || "N/A",
                topics.length ? "\nTopics: " + topics.join(", ") : "",
                surprise ? "\nSurprised by: " + surprise : "",
                advice ? "\nAdvice: " + advice : "",
              ]
                .filter(Boolean)
                .join(" ")}
            </pre>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStage("followups")}
              type="button"
              className="px-4 py-2 rounded border"
            >
              Back
            </button>
            <button
              disabled={submitting}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
