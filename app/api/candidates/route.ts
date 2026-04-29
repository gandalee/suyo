import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const NEC_URL =
  "https://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sgTypecode = searchParams.get("sgTypecode") ?? "3";
  const sdName = searchParams.get("sdName") ?? "";
  const sggName = searchParams.get("sggName") ?? "";

  const API_KEY = process.env.NEC_API_KEY!;

  for (const sgId of ["20260603", "20220601"]) {
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      pageNo: "1",
      numOfRows: "1000",
      sgId,
      sgTypecode,
      ...(sdName && { sdName }),
      ...(sggName && { sggName }),
    });

    const res = await fetch(`${NEC_URL}?${params}`, { next: { revalidate: 3600 } });
    const text = await res.text();

    const totalMatch = text.match(/<totalCount>(\d+)<\/totalCount>/);
    const total = parseInt(totalMatch?.[1] ?? "0");

    if (total === 0) continue;

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

    // Supabase에서 photo_url 조회
    const huboids = items.map((i) => i.huboid).filter(Boolean);
    let photoMap: Record<string, string | null> = {};
    if (huboids.length > 0) {
      const { data: photos } = await supabase
        .from("candidates")
        .select("external_id, photo_url")
        .in("external_id", huboids);
      if (photos) {
        photoMap = Object.fromEntries(photos.map((p) => [p.external_id, p.photo_url]));
      }
    }

    // photo_url 병합
    const itemsWithPhoto = items.map((item) => ({
      ...item,
      photo_url: photoMap[item.huboid] ?? null,
    }));

    return NextResponse.json({ sgId, total, items: itemsWithPhoto });
  }

  return NextResponse.json({ sgId: null, total: 0, items: [] });
}
