import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import BottomNav from "@/components/BottomNav";
import SiteFooter from "@/components/SiteFooter";
import { getAppUrl } from "@/lib/email";
import "./bottom-nav.css";
import "./calculator.css";
import "./globals.css";
import "./hero-circle.css";
import "./home.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "RefiLab | เปรียบเทียบดอกเบี้ยบ้านหลายธนาคาร",
  description:
    "เปรียบเทียบอัตราดอกเบี้ยรีไฟแนนซ์และรีเทนชั่นสินเชื่อบ้านจากหลายธนาคาร คำนวณต้นทุนรวม 3 ปีและค่าใช้จ่ายเพิ่มเติมในที่เดียว",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff7ed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <div className="theme-overlay flex min-h-full flex-col">
          <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
            {children}
          </main>
          <SiteFooter />
          <div className="print:hidden">
            <BottomNav />
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
