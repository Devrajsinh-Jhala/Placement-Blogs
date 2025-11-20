import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
