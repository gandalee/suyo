/**
 * 선관위 공약 API → Claude Haiku → Supabase candidate_stances 분석 싱크
 *
 * 실행: npx tsx scripts/analyze-pledges.ts
 * 옵션:
 *   --sgTypecode=3    시도지사(기본: 3,4)
 *   --limit=50        최대 처리 후보 수 (기본: 제한 없음)
 *   --dry-run         DB 저장 없이 결과만 출력
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// ── 설정 ──────────────────────────────────────────────
const sgId = "20260603";
const SG_TYPES = process.argv.find((a) => a.startsWith("--sgTypecode="))
  ? [process.argv.find((a) => a.startsWith("--sgTypecode="))!.split("=")[1]]
  : ["3", "4"]; // 시도지사 + 구·시·군의 장
const LIMIT = parseInt(
  process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "9999"
);
const DRY_RUN = process.argv.includes("--dry-run");

const NEC_BASE = "https://apis.data.go.kr/9760000";
const API_KEY = process.env.NEC_API_KEY!;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 14개 이슈 ─────────────────────────────────────────
const ISSUES = [
  { id: 1, statement: "낡은 동네를 허물고 고층 아파트로 재개발하는 게 도시재생 사업보다 낫다", topic: "도시개발" },
  { id: 2, statement: "상가 임대료 상한선을 법으로 강제해 젠트리피케이션을 막아야 한다", topic: "임대·상권" },
  { id: 3, statement: "도심 차로를 줄이고 자전거·보행 전용 도로를 대폭 늘려야 한다", topic: "교통" },
  { id: 4, statement: "범죄 예방을 위해 CCTV를 전면 확대하는 것이 사생활 침해보다 중요하다", topic: "안전·프라이버시" },
  { id: 5, statement: "대형마트 의무휴업일을 폐지해 소비자 편의를 높여야 한다", topic: "소비·상권" },
  { id: 6, statement: "청년에게 현금 월세 지원보다 창업·취업 인프라 투자가 더 효과적이다", topic: "청년·주거" },
  { id: 7, statement: "외국인 주민도 내국인과 동등한 지역 복지 서비스를 받아야 한다", topic: "다문화·복지" },
  { id: 8, statement: "지역 경제 활성화를 위해 공장·사업장 환경 규제를 일부 완화할 수 있다", topic: "환경·경제" },
  { id: 9, statement: "노인 무임승차 혜택을 축소해 대중교통 적자를 줄여야 한다", topic: "세대·교통" },
  { id: 10, statement: "공공임대주택을 내 동네에 더 짓는 데 찬성한다", topic: "주거·부동산" },
  { id: 11, statement: "어린이보호구역 내 주정차를 전면 금지해야 한다 (주민 불편 감수)", topic: "안전·교통" },
  { id: 12, statement: "지하철·버스 요금 인상 대신 세금으로 대중교통 적자를 메워야 한다", topic: "교통·재정" },
  { id: 13, statement: "음식점·유흥업소의 심야 영업시간 제한을 없애야 한다", topic: "야간경제" },
  { id: 14, statement: "구 지역화폐(지역사랑상품권)를 대폭 확대해야 한다", topic: "지역경제" },
];

// ── NEC API 유틸 ───────────────────────────────────────
function parseXml(text: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(text))) {
    const obj: Record<string, string> = {};
    const tr = /<(\w+)>([^<]*)<\/\1>/g;
    let t;
    while ((t = tr.exec(m[1]))) obj[t[1]] = t[2].trim();
    items.push(obj);
  }
  return items;
}

async function fetchCandidates(sgTypecode: string) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: "1",
    numOfRows: "1000",
    sgId,
    sgTypecode,
  });
  const res = await fetch(
    `${NEC_BASE}/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire?${params}`
  );
  return parseXml(await res.text());
}

async function fetchPledges(cnddtId: string, sgTypecode: string) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: "1",
    numOfRows: "50",
    sgId,
    sgTypecode,
    cnddtId,
  });
  const res = await fetch(
    `${NEC_BASE}/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire?${params}`
  );
  const text = await res.text();

  // 공약 필드 추출 (prmsTitle1~5, prmmCont1~5)
  const pledges: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const titleMatch = text.match(new RegExp(`<prmsTitle${i}>([^<]+)<\\/prmsTitle${i}>`));
    const contMatch = text.match(new RegExp(`<prmmCont${i}>([^<]*)<\\/prmmCont${i}>`));
    if (titleMatch) {
      pledges.push(
        [titleMatch[1].trim(), contMatch?.[1]?.trim()].filter(Boolean).join(": ")
      );
    }
  }
  return pledges;
}

// ── Claude 분석 ────────────────────────────────────────
async function analyzePledges(
  name: string,
  party: string,
  pledges: string[]
): Promise<Record<number, "agree" | "neutral" | "disagree"> | null> {
  const pledgeText = pledges
    .map((p, i) => `${i + 1}. ${p}`)
    .join("\n");

  const issueText = ISSUES.map(
    (iss) => `${iss.id}. [${iss.topic}] ${iss.statement}`
  ).join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `다음은 ${name} (${party}) 후보의 공약입니다:

${pledgeText}

아래 14개 정책 이슈에 대해 이 후보의 공약 내용을 바탕으로 입장을 분석해주세요.
공약에 명확한 근거가 있으면 agree 또는 disagree, 관련 내용이 없거나 불명확하면 neutral로 판단하세요.

이슈 목록:
${issueText}

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"1":"agree","2":"neutral","3":"disagree",...}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  try {
    return JSON.parse(raw);
  } catch {
    // JSON 파싱 실패 시 중괄호 추출 재시도
    const jsonMatch = raw.match(/\{[^}]+\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  }
}

// ── 메인 ──────────────────────────────────────────────
async function main() {
  console.log(`\n=== 공약 분석 시작 (sgId: ${sgId}, 타입: ${SG_TYPES.join(",")}) ===\n`);
  if (DRY_RUN) console.log("⚠️  DRY RUN 모드 — DB 저장 안 함\n");

  let totalProcessed = 0;
  let totalSaved = 0;
  let totalSkipped = 0;

  for (const sgTypecode of SG_TYPES) {
    console.log(`[sgTypecode=${sgTypecode}] 후보 목록 조회 중...`);
    const candidates = await fetchCandidates(sgTypecode);
    const typeName = sgTypecode === "3" ? "시·도지사" : "구·시·군의 장";
    console.log(`  → ${typeName} ${candidates.length}명\n`);

    const targets = candidates.slice(0, LIMIT - totalProcessed);

    for (const c of targets) {
      if (totalProcessed >= LIMIT) break;
      totalProcessed++;

      process.stdout.write(`  [${totalProcessed}] ${c.name} (${c.jdName}) `);

      // 공약 조회
      const pledges = await fetchPledges(c.huboid, sgTypecode);
      if (pledges.length === 0) {
        console.log("— 공약 없음, 건너뜀");
        totalSkipped++;
        continue;
      }

      // Claude 분석
      try {
        const stances = await analyzePledges(c.name, c.jdName, pledges);
        if (!stances) {
          console.log("— 분석 실패");
          totalSkipped++;
          continue;
        }

        console.log(`— ${pledges.length}개 공약 → 분석 완료`);

        if (!DRY_RUN) {
          // Supabase upsert
          const rows = Object.entries(stances).map(([issueId, stance]) => ({
            external_id: c.huboid,
            election_id: sgId,
            issue_id: parseInt(issueId),
            stance,
            source: "ai_analysis",
          }));
          const { error } = await supabase
            .from("candidate_stances")
            .upsert(rows, { onConflict: "external_id,election_id,issue_id" });
          if (error) console.error(`    ⚠ DB 오류: ${error.message}`);
          else totalSaved++;
        } else {
          // dry-run 시 결과 출력
          console.log("    입장:", stances);
          totalSaved++;
        }
      } catch (err) {
        console.log(`— 오류: ${(err as Error).message}`);
        totalSkipped++;
      }

      // API rate limit 방지
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\n=== 완료 ===`);
  console.log(`  처리: ${totalProcessed}명`);
  console.log(`  저장: ${totalSaved}명`);
  console.log(`  건너뜀: ${totalSkipped}명`);
}

main().catch(console.error);
