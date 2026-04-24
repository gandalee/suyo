import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 후보자 기본 정보
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("external_id", id)
    .single();

  if (error || !candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 학력·경력
  const { data: history } = await supabase
    .from("candidate_history")
    .select("*")
    .eq("candidate_id", candidate.id)
    .order("display_order");

  // 공약
  const { data: pledges } = await supabase
    .from("pledges")
    .select("*")
    .eq("candidate_id", candidate.id)
    .order("display_order");

  // 재산·병역·전과
  const { data: disclosure } = await supabase
    .from("candidate_disclosure")
    .select("*")
    .eq("candidate_id", candidate.id)
    .single();

  // 뉴스 (최근 10건)
  const { data: news } = await supabase
    .from("candidate_news")
    .select("*")
    .eq("candidate_id", candidate.id)
    .order("published_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    candidate,
    history: history ?? [],
    pledges: pledges ?? [],
    disclosure: disclosure ?? null,
    news: news ?? [],
  });
}
