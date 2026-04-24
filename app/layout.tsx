import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "수요 — 내 투표용지 보기",
  description: "2026 지방선거 유권자 의사결정 지원. 한국의 선거는 언제나 수요일.",
  applicationName: "수요",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "수요",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "수요 — 내 투표용지 보기",
    description: "2026 지방선거 유권자 의사결정 지원. 한국의 선거는 언제나 수요일.",
    siteName: "수요",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "수요 — 내 투표용지 보기",
    description: "2026 지방선거 유권자 의사결정 지원. 한국의 선거는 언제나 수요일.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D2D2D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
        <ServiceWorkerRegistrar />
        <div className="w-full min-h-screen flex flex-col" style={{ maxWidth: 430 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
