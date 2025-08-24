import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Placement Chronicles" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50 text-gray-900">
          <header className="sticky top-0 z-10 bg-white border-b">
            <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-semibold">
                Placement Chronicles
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/about" className="text-sm">
                  About
                </Link>
                <Link href="/post" className="text-sm">
                  Post
                </Link>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <Link
                    className="text-sm rounded px-3 py-1 border"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </SignedOut>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
