/**
 * 서울시장 3인 공약 성향 수동 분석 결과 → Supabase 저장
 * 실행: npx tsx scripts/seed-seoul-stances.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Stance = "agree" | "neutral" | "disagree";

const DATA: { huboid: string; name: string; stances: Record<number, Stance> }[] = [
  {
    huboid: "100162984",
    name: "오세훈 (국민의힘)",
    stances: {
      1: "agree",    // 재개발 > 도시재생 (신속통합기획)
      2: "disagree", // 임대료 상한제 (보수 성향, 규제 반대)
      3: "neutral",  // 차로 축소 (자전거 인프라 확충하나 차로 축소 명시 없음)
      4: "agree",    // CCTV 확대 (안전 강조)
      5: "neutral",  // 대형마트 휴업 폐지 (명시 없음)
      6: "agree",    // 청년 인프라 > 현금 (SH 주택 공급 중심)
      7: "neutral",  // 외국인 복지 (명시 없음)
      8: "neutral",  // 환경규제 완화 (명시 없음)
      9: "disagree", // 무임승차 축소 (70세 이상 버스 무료 확대 기조)
      10: "agree",   // 공공임대 확대 (SH 매입 8000채)
      11: "neutral", // 어린이보호구역 (명시 없음)
      12: "agree",   // 세금으로 교통 적자 (20조 교통 공약)
      13: "neutral", // 심야 영업 (명시 없음)
      14: "neutral", // 지역화폐 (명시 없음)
    },
  },
  {
    huboid: "100157144",
    name: "정원오 (더불어민주당)",
    stances: {
      1: "agree",    // 재개발 (착착개발, 36만호 공급)
      2: "neutral",  // 임대료 상한제 (임차인 보호 언급하나 상한제 명시 없음)
      3: "neutral",  // 차로 축소 (명시 없음)
      4: "neutral",  // CCTV (명시 없음)
      5: "neutral",  // 대형마트 휴업 (명시 없음)
      6: "disagree", // 청년 현금지원 < 인프라 (청년 월세 현금지원 명시)
      7: "neutral",  // 외국인 복지 (명시 없음)
      8: "neutral",  // 환경규제 완화 (명시 없음)
      9: "neutral",  // 무임승차 (명시 없음)
      10: "agree",   // 공공임대 확대
      11: "neutral", // 어린이보호구역 (명시 없음)
      12: "agree",   // 세금으로 교통 적자 (30분 통근 공약, 버스 재편)
      13: "neutral", // 심야 영업 (명시 없음)
      14: "agree",   // 지역화폐 (지역경제 활성화 기조)
    },
  },
  {
    huboid: "100162720",
    name: "권영국 (정의당)",
    stances: {
      1: "disagree", // 재개발 > 도시재생 (도시재생 우선, 세입자 보호)
      2: "agree",    // 임대료 상한제 (명시적 지지)
      3: "agree",    // 차로 축소, 보행로 확대 (명시)
      4: "disagree", // CCTV > 프라이버시 (시민 감시 반대 성향)
      5: "disagree", // 대형마트 휴업 폐지 (소상공인 보호, 유지 기조)
      6: "disagree", // 청년 현금지원 < 인프라 (공공책임제, 현금 지원 찬성)
      7: "agree",    // 외국인 동등 복지 (명시)
      8: "disagree", // 환경규제 완화 (강화 기조, 태양광·일회용품 금지)
      9: "disagree", // 무임승차 축소 (공공교통 무료화 방향)
      10: "agree",   // 공공임대 확대 (명시)
      11: "agree",   // 어린이보호구역 전면 금지 (안전 우선)
      12: "agree",   // 세금으로 교통 적자 (공공교통 무료화)
      13: "neutral", // 심야 영업 (명시 없음)
      14: "agree",   // 지역화폐 확대 (지역경제 강조)
    },
  },
];

async function main() {
  console.log("\n=== 서울시장 성향 데이터 저장 ===\n");

  for (const c of DATA) {
    const rows = Object.entries(c.stances).map(([issueId, stance]) => ({
      external_id: c.huboid,
      election_id: "20260603",
      issue_id: parseInt(issueId),
      stance,
      source: "manual",
      confidence: 0.8,
    }));

    const { error } = await supabase
      .from("candidate_stances")
      .upsert(rows, { onConflict: "external_id,election_id,issue_id" });

    if (error) console.error(`${c.name} 오류:`, error.message);
    else console.log(`✓ ${c.name} — ${rows.length}개 저장`);
  }

  console.log("\n=== 완료 ===");
}

main().catch(console.error);
