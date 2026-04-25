import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NAVER_API = "https://openapi.naver.com/v1/search/news.json";

function stripHtml(str: string) {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  const { data: candidate } = await supabase
    .from("candidates")
    .select("name, party")
    .eq("external_id", candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query = `"${candidate.name}" 공약`;
  const res = await fetch(
    `${NAVER_API}?query=${encodeURIComponent(query)}&display=20&sort=date`,
    {
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Naver API error" }, { status: 500 });
  }

  const data = await res.json();
  const items = ((data.items ?? []) as Array<{
    title: string;
    originallink: string;
    link: string;
    description: string;
    pubDate: string;
  }>)
    .map((item) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description),
      url: item.originallink || item.link,
      pubDate: item.pubDate,
    }))
    .filter((item) => item.title.includes(candidate.name))
    .slice(0, 10);

  return NextResponse.json({
    candidateName: candidate.name,
    articles: items,
  });
}
