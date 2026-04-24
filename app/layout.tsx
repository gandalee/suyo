import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수요 — 내 투표용지 보기",
  description: "2026 지방선거 유권자 의사결정 지원. 한국의 선거는 언제나 수요일.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body
        className="min-h-full flex flex-col items-center"
        style={{ background: "var(--bg-page)" }}
      >
        <div className="w-full min-h-screen flex flex-col" style={{ maxWidth: 430 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
