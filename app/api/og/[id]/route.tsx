import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

interface NewsItem {
  title: string;
  lean: string | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 후보 정보 조회
  const { data: candidate } = await supabase
    .from("candidates")
    .select("name, party, job")
    .eq("external_id", id)
    .single();

  const name = candidate?.name ?? "후보";
  const party = candidate?.party ?? "";
  const region = candidate?.job ?? "";

  // 뉴스 헤드라인 조회 (내부 API fetch)
  let conservativeHeadlines: string[] = [];
  let progressiveHeadlines: string[] = [];

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `https://${req.headers.get("host") ?? "suyo.kr"}`;
    const newsRes = await fetch(`${baseUrl}/api/news/${id}`, {
      next: { revalidate: 3600 },
    });
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      const items: NewsItem[] = newsData.items ?? [];
      conservativeHeadlines = items
        .filter((n) => n.lean === "conservative")
        .slice(0, 2)
        .map((n) => n.title);
      progressiveHeadlines = items
        .filter((n) => n.lean === "progressive")
        .slice(0, 2)
        .map((n) => n.title);
    }
  } catch {
    // 뉴스 없어도 이미지는 생성
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#1a1a1a",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단: 로고 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#C0392B",
              letterSpacing: "-0.5px",
            }}
          >
            SUYO.KR
          </span>
          <span style={{ fontSize: "16px", color: "#888", marginLeft: "12px" }}>
            언론 비교
          </span>
        </div>

        {/* 후보 이름 + 정당·지역 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            {name}
          </span>
          <span style={{ fontSize: "20px", color: "#aaaaaa" }}>
            {party}
            {region ? ` · ${region}` : ""}
          </span>
        </div>

        {/* 구분선 + 설명 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{ width: "32px", height: "2px", background: "#C0392B" }}
          />
          <span style={{ fontSize: "16px", color: "#cccccc" }}>
            언론은 이렇게 본다
          </span>
        </div>

        {/* 보수 / 진보 박스 */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flex: 1,
          }}
        >
          {/* 보수 */}
          <div
            style={{
              flex: 1,
              background: "#1a2a50",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#7ea8e5",
                marginBottom: "4px",
              }}
            >
              보수 언론
            </span>
            {conservativeHeadlines.length > 0 ? (
              conservativeHeadlines.map((h, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "13px",
                    color: "#d0d8f0",
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {h.length > 60 ? h.slice(0, 57) + "..." : h}
                </p>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "#6688aa", margin: 0 }}>
                관련 기사 없음
              </p>
            )}
          </div>

          {/* 진보 */}
          <div
            style={{
              flex: 1,
              background: "#501a1a",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#e58a8a",
                marginBottom: "4px",
              }}
            >
              진보 언론
            </span>
            {progressiveHeadlines.length > 0 ? (
              progressiveHeadlines.map((h, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "13px",
                    color: "#f0d0d0",
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {h.length > 60 ? h.slice(0, 57) + "..." : h}
                </p>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "#aa6666", margin: 0 }}>
                관련 기사 없음
              </p>
            )}
          </div>
        </div>

        {/* 하단 */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "15px", color: "#666666" }}>
            suyo.kr에서 내 지역 후보 비교하기
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  // 캐시 헤더 설정
  imageResponse.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  return imageResponse;
}
