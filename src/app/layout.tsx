import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rummy 500",
  description: "Score tracker for Rummy 500",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight">
            Rummy 500
          </a>
        </header>
        <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
