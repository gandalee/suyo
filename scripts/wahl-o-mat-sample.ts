/**
 * Wahl-O-Mat 샘플: 2022 종로구 후보 공약 → 이슈 추출
 * 실행: npx tsx scripts/wahl-o-mat-sample.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";

const NEC_BASE = "https://apis.data.go.kr/9760000";
const API_KEY = process.env.NEC_API_KEY!;

function parseXmlItems(text: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const obj: Record<string, string> = {};
    const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(match[1])) !== null) {
      obj[tagMatch[1]] = tagMatch[2].trim();
    }
    items.push(obj);
  }
  return items;
}

async function fetchCandidates() {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: "1",
    numOfRows: "100",
    sgId: "20220601",
    sgTypecode: "4", // 구시군의장
  });

  const res = await fetch(
    `${NEC_BASE}/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire?${params}`
  );
  const text = await res.text();
  const all = parseXmlItems(text);

  // 종로구만 필터
  return all.filter((c) => c.sggName?.includes("종로"));
}

async function fetchPledges(huboid: string) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: "1",
    numOfRows: "50",
    sgId: "20220601",
    sgTypecode: "4",
    huboid,
  });

  const res = await fetch(
    `${NEC_BASE}/PoelcddVotePromiseInfoInqireService/getPoelcddVotePromiseInfoInqire?${params}`
  );
  const text = await res.text();
  return parseXmlItems(text);
}

async function main() {
  console.log("=== 2022 종로구청장 후보 조회 ===\n");

  const candidates = await fetchCandidates();
  console.log(`종로구청장 후보: ${candidates.length}명`);
  candidates.forEach((c) => console.log(`  기호${c.giho} ${c.name} (${c.jdName})`));

  console.log("\n=== 공약 수집 ===\n");

  const pledgeData: { name: string; party: string; pledges: string[] }[] = [];

  for (const c of candidates) {
    const pledges = await fetchPledges(c.huboid);
    const pledgeTexts = pledges
      .map((p) => [p.realmName, p.goalName, p.promiseContent].filter(Boolean).join(" - "))
      .filter(Boolean);

    console.log(`${c.name} (${c.jdName}): ${pledges.length}개 공약`);
    pledgeTexts.slice(0, 3).forEach((p) => console.log(`  · ${p.slice(0, 60)}...`));

    pledgeData.push({
      name: c.name,
      party: c.jdName,
      pledges: pledgeTexts,
    });
  }

  if (pledgeData.every((c) => c.pledges.length === 0)) {
    console.log("\n⚠️  선관위 공약 API 데이터 없음 → 샘플 공약으로 대체\n");

    // 실제 종로구청장 공약 기반 샘플
    pledgeData[0] = {
      name: candidates[0]?.name ?? "후보A",
      party: candidates[0]?.jdName ?? "더불어민주당",
      pledges: [
        "경복궁 주변 한옥마을 관광 활성화로 지역경제 살리기",
        "창신·숭인 지역 도시재생 뉴딜사업 완성",
        "종로 청년 창업 허브 설립, 스타트업 지원",
        "어르신 무료 급식소 3개소 확대",
        "종로 도심 공원 및 녹지 확충",
        "세종대로~종로 버스전용차로 연장",
        "노인 복지관 리모델링 및 서비스 강화",
        "CCTV 500대 추가 설치로 안전한 종로",
      ],
    };
    pledgeData[1] = {
      name: candidates[1]?.name ?? "후보B",
      party: candidates[1]?.jdName ?? "국민의힘",
      pledges: [
        "청계천 수변문화공간 조성으로 관광객 유치",
        "종로 전통시장 현대화 및 온라인 플랫폼 지원",
        "낙원상가 복합문화공간 리뉴얼",
        "어르신 스마트기기 교육센터 설립",
        "주차난 해소를 위한 공영주차장 확충",
        "종로 구립어린이집 추가 설립",
        "청년 월세 지원금 확대",
        "가로등 LED 교체 및 방범시설 강화",
      ],
    };
  }

  console.log("\n=== Claude API로 이슈 추출 ===\n");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `다음은 2022년 서울특별시 종로구청장 선거 후보들의 공약입니다.

${pledgeData.map((c) => `【${c.name} / ${c.party}】\n${c.pledges.map((p, i) => `${i + 1}. ${p}`).join("\n")}`).join("\n\n")}

위 공약들을 분석해서 유권자가 찬성/중립/반대를 선택할 수 있는 정책 이슈 8개를 추출해주세요.

규칙:
- 여러 후보가 공통으로 언급한 주제 우선
- Suyo는 중립적이므로 특정 정당·후보에 유리하지 않게
- 각 이슈는 구체적이고 이해하기 쉬운 한 문장
- 찬성하면 특정 방향, 반대하면 반대 방향이 명확해야 함

JSON 형식으로만 답하세요:
{
  "issues": [
    {
      "id": 1,
      "statement": "종로구에 청년 창업 공간을 새로 만들어야 한다",
      "topic": "청년·경제"
    }
  ]
}`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") return;

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.log("JSON 파싱 실패:", content.text);
    return;
  }

  const result = JSON.parse(jsonMatch[0]);

  console.log("추출된 이슈:\n");
  result.issues.forEach((issue: { id: number; statement: string; topic: string }) => {
    console.log(`${issue.id}. [${issue.topic}] ${issue.statement}`);
  });

  console.log("\n=== 완료 ===");
}

main().catch(console.error);
