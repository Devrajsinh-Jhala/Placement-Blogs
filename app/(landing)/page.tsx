"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
    Sparkles,
    TrendingUp,
    Search,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    Target,
    Zap,
    Code2,
    Share2,
    Users,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#030014] text-white overflow-hidden selection:bg-purple-500/30"
        >
            {/* Background Stars/Grid */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            Placement Chronicles
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            About
                        </Link>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <Link
                                href="/sign-in"
                                className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                            >
                                Sign In
                            </Link>
                        </SignedOut>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    New: AI-Powered Interview Analysis
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50"
                >
                    Master Your Placement <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        With Confidence
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    The all-in-one platform for students to share interview experiences,
                    practice curated problems, and ace their dream companies.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)]"
                    >
                        Start Preparing
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/post"
                        className="px-8 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-semibold backdrop-blur-sm"
                    >
                        Share Experience
                    </Link>
                </motion.div>

                {/* Hero Image / Architecture */}
                <motion.div
                    style={{ y }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-20 relative max-w-5xl mx-auto"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20" />
                    <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <Image
                            src="/landing-hero.png"
                            alt="Platform Architecture"
                            width={1200}
                            height={675}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                </motion.div>
            </section>

            {/* Companies / Universities Marquee */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm text-gray-500 mb-8">
                        TRUSTED BY STUDENTS FROM TOP INSTITUTES
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {["BITS Pilani K K Birla Goa Campus"].map(
                            (name) => (
                                <span
                                    key={name}
                                    className="text-xl font-semibold text-white/40 hover:text-white/80 transition-colors cursor-default"
                                >
                                    {name}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Everything you need to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            excel
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Powerful features designed to streamline your placement preparation journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">AI-Powered Formatting</h3>
                            <p className="text-gray-400 max-w-md">
                                Just speak your experience. Our Gemini-powered AI automatically formats it into a structured blog post, extracts key topics, and finds relevant practice problems.
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                    </motion.div>

                    {/* Tall Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:row-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                                <Search className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Smart Search</h3>
                            <p className="text-gray-400 mb-8">
                                Filter by company, role, degree, or specific topics like CN, OS, and DBMS.
                            </p>
                            <div className="mt-auto space-y-3">
                                {["Google", "Microsoft", "Amazon", "Uber"].map((company) => (
                                    <div
                                        key={company}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                                    >
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-300">{company}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Card 1 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
                                <Code2 className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Practice Links</h3>
                            <p className="text-sm text-gray-400">
                                Direct links to LeetCode and GFG problems mentioned in interviews.
                            </p>
                        </div>
                    </motion.div>

                    {/* Small Card 2 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                                <Share2 className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Voice Input</h3>
                            <p className="text-sm text-gray-400">
                                Record your experience on the go. We handle the transcription.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-b from-purple-900/20 to-black p-12 md:p-24 text-center">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Ready to share your story?
                        </h2>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                            Join the community of students helping each other succeed. Your experience could be the key to someone else's dream job.
                        </p>
                        <Link
                            href="/post"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                        >
                            Start Writing
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-300">Placement Chronicles</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        <Link href="https://github.com" className="hover:text-white transition-colors">GitHub</Link>
                    </div>
                    <div className="text-sm text-gray-600">
                        © 2025. Built with ❤️ for students.
                    </div>
                </div>
            </footer>
        </div>
    );
}
