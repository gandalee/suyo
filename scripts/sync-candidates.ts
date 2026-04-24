/**
 * 선관위 API → Supabase candidates 전수 싱크
 * 실행: npx tsx scripts/sync-candidates.ts
 * 옵션: --sgId=20220601 (기본: 20260603)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NEC_URL =
  "https://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire";
const API_KEY = process.env.NEC_API_KEY!;

const sgId =
  process.argv.find((a) => a.startsWith("--sgId="))?.split("=")[1] ??
  "20260603";
const SG_TYPE_CODES = ["3", "4", "5", "6", "11"];

interface NecItem {
  huboid: string;
  giho: string;
  name: string;
  hanjaName: string;
  jdName: string;
  gender: string;
  age: string;
  job: string;
  edu: string;
  career1: string;
  career2: string;
  sggName: string;
  sdName: string;
  status: string;
}

async function fetchPage(
  sgTypecode: string,
  pageNo: number
): Promise<{ items: NecItem[]; total: number }> {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: String(pageNo),
    numOfRows: "100",
    sgId,
    sgTypecode,
  });

  const res = await fetch(`${NEC_URL}?${params}`);
  const text = await res.text();

  const totalMatch = text.match(/<totalCount>(\d+)<\/totalCount>/);
  const total = parseInt(totalMatch?.[1] ?? "0");

  const items: NecItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const block = match[1];
    const obj: Record<string, string> = {};
    const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(block)) !== null) {
      obj[tagMatch[1]] = tagMatch[2].trim();
    }
    items.push(obj as unknown as NecItem);
  }

  return { items, total };
}

async function fetchAll(sgTypecode: string): Promise<NecItem[]> {
  const { items: first, total } = await fetchPage(sgTypecode, 1);
  if (total === 0) return [];

  const totalPages = Math.ceil(total / 100);
  const all = [...first];

  for (let page = 2; page <= totalPages; page++) {
    const { items } = await fetchPage(sgTypecode, page);
    all.push(...items);
    await new Promise((r) => setTimeout(r, 200));
  }

  return all;
}

async function getOrCreateElection(
  sgTypecode: string,
  sdName: string
): Promise<number> {
  // 조회
  const { data: existing } = await supabase
    .from("elections")
    .select("id")
    .eq("sg_id", sgId)
    .eq("sg_type_code", sgTypecode)
    .eq("sido", sdName)
    .single();

  if (existing) return existing.id;

  const typeNames: Record<string, string> = {
    "3": `${sdName} 시도지사`,
    "4": `구시군의장`,
    "5": `시도의원`,
    "6": `구시군의원`,
    "11": `${sdName} 교육감`,
  };

  const { data: inserted, error } = await supabase
    .from("elections")
    .insert({
      sg_id: sgId,
      sg_type_code: sgTypecode,
      name: typeNames[sgTypecode] ?? sgTypecode,
      election_date: sgId === "20260603" ? "2026-06-03" : "2022-06-01",
      sido: sdName,
    })
    .select("id")
    .single();

  if (error) throw error;
  return inserted!.id;
}

async function upsertCandidate(item: NecItem, electionId: number) {
  const { data: upserted, error } = await supabase
    .from("candidates")
    .upsert(
      {
        election_id: electionId,
        external_id: item.huboid,
        symbol: item.giho,
        name: item.name,
        name_hanja: item.hanjaName || null,
        age: item.age ? parseInt(item.age) : null,
        gender: item.gender === "남" ? "M" : "F",
        party: item.jdName || null,
        party_label: item.jdName || null,
        job: item.job || null,
        status: item.status === "사퇴" ? "withdrawn" : "active",
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "election_id,external_id" }
    )
    .select("id")
    .single();

  if (error) throw error;

  const candidateId = upserted!.id;

  // 학력·경력 (삭제 후 재삽입)
  await supabase.from("candidate_history").delete().eq("candidate_id", candidateId);

  const historyItems = [
    item.edu ? { candidate_id: candidateId, kind: "education", detail: item.edu, display_order: 0 } : null,
    item.career1 ? { candidate_id: candidateId, kind: "career", detail: item.career1, display_order: 0 } : null,
    item.career2 ? { candidate_id: candidateId, kind: "career", detail: item.career2, display_order: 1 } : null,
  ].filter(Boolean);

  if (historyItems.length > 0) {
    await supabase.from("candidate_history").insert(historyItems).throwOnError();
  }
}

async function main() {
  console.log(`\n=== 선관위 싱크 시작 (sgId: ${sgId}) ===\n`);

  // 연결 테스트
  const { error: pingError } = await supabase.from("elections").select("id").limit(1);
  if (pingError) throw new Error(`Supabase 연결 실패: ${pingError.message}`);
  console.log("✓ Supabase 연결 OK\n");

  let totalSynced = 0;

  for (const sgTypecode of SG_TYPE_CODES) {
    process.stdout.write(`[sgTypecode=${sgTypecode}] 수집 중...`);
    const items = await fetchAll(sgTypecode);
    console.log(` ${items.length}명`);

    if (items.length === 0) continue;

    // sido별 그룹핑
    const bySido = items.reduce<Record<string, NecItem[]>>((acc, item) => {
      const sido = item.sdName || item.sggName;
      if (!acc[sido]) acc[sido] = [];
      acc[sido].push(item);
      return acc;
    }, {});

    for (const [sido, sidoItems] of Object.entries(bySido)) {
      const electionId = await getOrCreateElection(sgTypecode, sido);
      for (const item of sidoItems) {
        await upsertCandidate(item, electionId);
        process.stdout.write(".");
      }
    }

    totalSynced += items.length;
    console.log();
  }

  console.log(`\n✓ 총 ${totalSynced}명 싱크 완료`);
}

main().catch((e) => {
  console.error("\n싱크 실패:", e.message);
  process.exit(1);
});
