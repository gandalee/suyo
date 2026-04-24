import { NextRequest, NextResponse } from "next/server";

const NEC_URL =
  "https://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sgTypecode = searchParams.get("sgTypecode") ?? "3";

  const API_KEY = process.env.NEC_API_KEY!;

  // 2026 먼저 시도, 없으면 2022 fallback
  for (const sgId of ["20260603", "20220601"]) {
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      pageNo: "1",
      numOfRows: "100",
      sgId,
      sgTypecode,
    });

    const res = await fetch(`${NEC_URL}?${params}`, { next: { revalidate: 3600 } });
    const text = await res.text();

    const totalMatch = text.match(/<totalCount>(\d+)<\/totalCount>/);
    const total = parseInt(totalMatch?.[1] ?? "0");

    if (total === 0) continue;

    // XML → JSON 파싱
    const items: Record<string, string>[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(text)) !== null) {
      const block = itemMatch[1];
      const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
      let tagMatch;
      const obj: Record<string, string> = {};
      while ((tagMatch = tagRegex.exec(block)) !== null) {
        obj[tagMatch[1]] = tagMatch[2].trim();
      }
      items.push(obj);
    }

    return NextResponse.json({ sgId, total, items });
  }

  return NextResponse.json({ sgId: null, total: 0, items: [] });
}
