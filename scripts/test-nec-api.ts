import { config } from "dotenv";
config({ path: ".env.local" });

const API_KEY = process.env.NEC_API_KEY!;
const BASE_URL =
  "https://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire";

// sgTypecode: 3=시도지사, 4=구시군의장, 5=시도의원, 6=구시군의원, 11=교육감
async function fetchCandidates(
  sgId: string,
  sgTypeCode: string,
  numOfRows = 3
) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: "1",
    numOfRows: String(numOfRows),
    sgId,
    sgTypecode: sgTypeCode,
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  const text = await res.text();

  const totalMatch = text.match(/<totalCount>(\d+)<\/totalCount>/);
  const total = totalMatch?.[1] ?? "0";

  const nameMatches = [...text.matchAll(/<name>([^<]+)<\/name>/g)];
  const names = nameMatches.map((m) => m[1]).join(", ");

  console.log(
    `sgId=${sgId} sgTypecode=${sgTypeCode}: 총 ${total}명 | 샘플: ${names || "없음"}`
  );
}

async function main() {
  console.log("=== 선관위 API 테스트 ===\n");

  // 2022 지방선거 (데이터 검증용)
  await fetchCandidates("20220601", "3"); // 시도지사
  await fetchCandidates("20220601", "11"); // 교육감

  console.log();

  // 2026 지방선거 (후보 등록 마감 5/15 이후 데이터 생김)
  await fetchCandidates("20260603", "3");
  await fetchCandidates("20260603", "4");
  await fetchCandidates("20260603", "11");
}

main().catch(console.error);
