import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "4000 WEEKS — 당신의 인생 시계",
  description: "인생은 4,000주. 지금 몇 번째 주를 살고 있나요?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full bg-black text-foreground font-mono tracking-tighter">
        {children}
      </body>
    </html>
  );
}
