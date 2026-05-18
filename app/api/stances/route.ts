import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const huboids = searchParams.get("huboids")?.split(",").filter(Boolean) ?? [];
  const electionId = searchParams.get("electionId") ?? "20260603";

  if (huboids.length === 0) {
    return NextResponse.json({ stances: {} });
  }

  const { data, error } = await supabase
    .from("candidate_stances")
    .select("external_id, issue_id, stance")
    .in("external_id", huboids)
    .eq("election_id", electionId);

  if (error) {
    return NextResponse.json({ stances: {} }, { status: 500 });
  }

  // { huboid: { issueId: stance } } 형태로 변환
  const stances: Record<string, Record<number, string>> = {};
  for (const row of data ?? []) {
    if (!stances[row.external_id]) stances[row.external_id] = {};
    stances[row.external_id][row.issue_id] = row.stance;
  }

  return NextResponse.json({ stances });
}
