import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "수요 — 내 투표용지 보기",
    short_name: "수요",
    description: "2026 지방선거 유권자 의사결정 지원. 한국의 선거는 언제나 수요일.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2F2EF",
    theme_color: "#2D2D2D",
    orientation: "portrait",
    lang: "ko",
    categories: ["politics", "reference"],
    icons: [
      {
        src: "/api/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
