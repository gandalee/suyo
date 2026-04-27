import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#111",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, color: "#B9D9A5", marginBottom: 32 }}>
          수요<span style={{ color: "#E84040" }}>일</span>
        </span>
        <span style={{ fontSize: 72, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-2px" }}>
          내 투표용지
          <br />
          확인하기
        </span>
        <span style={{ fontSize: 24, color: "#888", marginTop: 32 }}>
          2026년 6월 3일 · 제9회 전국동시지방선거
        </span>
      </div>
    ),
    { ...size }
  );
}
