import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: candidate } = await supabase
    .from("candidates")
    .select("name, party, symbol, job, age")
    .eq("external_id", id)
    .single();

  const name = candidate?.name ?? "후보자";
  const party = candidate?.party ?? "";
  const symbol = candidate?.symbol ?? "";
  const job = candidate?.job ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F2F2EF",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "auto" }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#111", letterSpacing: "-1px" }}>
            수요<span style={{ color: "#E84040" }}>일</span>
          </span>
          <span style={{ fontSize: 16, color: "#888", marginLeft: 4 }}>2026 지방선거</span>
        </div>

        {/* 후보 정보 */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 40 }}>
          {/* 기호 아바타 */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 32,
              background: "#B9D9A5",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, color: "#555", marginBottom: 2 }}>기호</span>
            <span style={{ fontSize: 52, fontWeight: 900, color: "#111", lineHeight: 1 }}>{symbol}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 22, color: "#555", fontWeight: 500 }}>{party}</span>
            <span style={{ fontSize: 88, fontWeight: 900, color: "#111", lineHeight: 1, letterSpacing: "-3px" }}>
              {name}
            </span>
            {job && (
              <span
                style={{
                  fontSize: 20,
                  color: "#111",
                  background: "#B9D9A5",
                  padding: "6px 16px",
                  borderRadius: 100,
                  alignSelf: "flex-start",
                  fontWeight: 600,
                }}
              >
                {job}
              </span>
            )}
          </div>
        </div>

        {/* 하단 안내 */}
        <div style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, color: "#888" }}>suyo-two.vercel.app에서 후보 정보를 확인하세요</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
