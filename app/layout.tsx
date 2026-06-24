import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ชื่อเว็บ | เปรียบเทียบดอกเบี้ยบ้าน",
  description: "เปรียบเทียบอัตราดอกเบี้ยรีไฟแนนซ์และรีเทนชั่นของแต่ละธนาคาร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="theme-overlay">
          <header className="theme-nav sticky top-0 z-50">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="theme-brand text-lg">
                ชื่อเว็บ
              </Link>
              <AuthNav />
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
