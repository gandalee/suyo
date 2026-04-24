import { NextRequest, NextResponse } from "next/server";
import { classifyOutlet } from "@/src/data/media-outlets";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NAVER_API = "https://openapi.naver.com/v1/search/news.json";

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
  office?: string;
}

function stripHtml(str: string) {
  return str.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#039;/g, "'");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  // 후보자 이름 조회
  const { data: candidate } = await supabase
    .from("candidates")
    .select("name, party")
    .eq("external_id", candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query = `${candidate.name} 선거`;

  const res = await fetch(
    `${NAVER_API}?query=${encodeURIComponent(query)}&display=40&sort=date`,
    {
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
      },
      next: { revalidate: 1800 }, // 30분 캐시
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Naver API error" }, { status: 500 });
  }

  const data = await res.json();
  const items: NaverNewsItem[] = data.items ?? [];

  // 언론사 분류 + 필터링
  const classified = items
    .map((item) => {
      // 언론사명은 originallink 도메인에서 추출
      const domain = (() => {
        try { return new URL(item.originallink).hostname; } catch { return ""; }
      })();

      // 네이버 뉴스 제목에서 언론사 힌트 추출 시도
      const titleClean = stripHtml(item.title);
      const meta = classifyOutlet(domain) ??
        Object.entries(require("@/src/data/media-outlets").OUTLET_MAP).find(
          ([key]) => item.originallink.includes(key) || domain.includes(key)
        )?.[1] as ReturnType<typeof classifyOutlet>;

      return {
        title: titleClean,
        url: item.originallink || item.link,
        description: stripHtml(item.description),
        publishedAt: item.pubDate,
        source: domain,
        lean: meta?.lean ?? null,
        tier: meta?.tier ?? null,
        label: meta?.label ?? null,
      };
    })
    .filter((item) => item.lean !== null) // 분류된 것만
    .slice(0, 30);

  return NextResponse.json({
    candidateName: candidate.name,
    items: classified,
  });
}
