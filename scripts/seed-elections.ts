/**
 * 2026 지방선거 elections 테이블 시드
 * 실행: npx tsx scripts/seed-elections.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { elections } from "../src/db/schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const ELECTIONS_2026 = [
  // 시도지사 (17개)
  { sgTypeCode: "3", name: "서울특별시장", sido: "서울특별시", sigungu: null },
  { sgTypeCode: "3", name: "부산광역시장", sido: "부산광역시", sigungu: null },
  { sgTypeCode: "3", name: "대구광역시장", sido: "대구광역시", sigungu: null },
  { sgTypeCode: "3", name: "인천광역시장", sido: "인천광역시", sigungu: null },
  { sgTypeCode: "3", name: "광주광역시장", sido: "광주광역시", sigungu: null },
  { sgTypeCode: "3", name: "대전광역시장", sido: "대전광역시", sigungu: null },
  { sgTypeCode: "3", name: "울산광역시장", sido: "울산광역시", sigungu: null },
  { sgTypeCode: "3", name: "세종특별자치시장", sido: "세종특별자치시", sigungu: null },
  { sgTypeCode: "3", name: "경기도지사", sido: "경기도", sigungu: null },
  { sgTypeCode: "3", name: "강원특별자치도지사", sido: "강원특별자치도", sigungu: null },
  { sgTypeCode: "3", name: "충청북도지사", sido: "충청북도", sigungu: null },
  { sgTypeCode: "3", name: "충청남도지사", sido: "충청남도", sigungu: null },
  { sgTypeCode: "3", name: "전북특별자치도지사", sido: "전북특별자치도", sigungu: null },
  { sgTypeCode: "3", name: "전라남도지사", sido: "전라남도", sigungu: null },
  { sgTypeCode: "3", name: "경상북도지사", sido: "경상북도", sigungu: null },
  { sgTypeCode: "3", name: "경상남도지사", sido: "경상남도", sigungu: null },
  { sgTypeCode: "3", name: "제주특별자치도지사", sido: "제주특별자치도", sigungu: null },
  // 교육감 (17개)
  { sgTypeCode: "11", name: "서울특별시교육감", sido: "서울특별시", sigungu: null },
  { sgTypeCode: "11", name: "부산광역시교육감", sido: "부산광역시", sigungu: null },
  { sgTypeCode: "11", name: "대구광역시교육감", sido: "대구광역시", sigungu: null },
  { sgTypeCode: "11", name: "인천광역시교육감", sido: "인천광역시", sigungu: null },
  { sgTypeCode: "11", name: "광주광역시교육감", sido: "광주광역시", sigungu: null },
  { sgTypeCode: "11", name: "대전광역시교육감", sido: "대전광역시", sigungu: null },
  { sgTypeCode: "11", name: "울산광역시교육감", sido: "울산광역시", sigungu: null },
  { sgTypeCode: "11", name: "세종특별자치시교육감", sido: "세종특별자치시", sigungu: null },
  { sgTypeCode: "11", name: "경기도교육감", sido: "경기도", sigungu: null },
  { sgTypeCode: "11", name: "강원특별자치도교육감", sido: "강원특별자치도", sigungu: null },
  { sgTypeCode: "11", name: "충청북도교육감", sido: "충청북도", sigungu: null },
  { sgTypeCode: "11", name: "충청남도교육감", sido: "충청남도", sigungu: null },
  { sgTypeCode: "11", name: "전북특별자치도교육감", sido: "전북특별자치도", sigungu: null },
  { sgTypeCode: "11", name: "전라남도교육감", sido: "전라남도", sigungu: null },
  { sgTypeCode: "11", name: "경상북도교육감", sido: "경상북도", sigungu: null },
  { sgTypeCode: "11", name: "경상남도교육감", sido: "경상남도", sigungu: null },
  { sgTypeCode: "11", name: "제주특별자치도교육감", sido: "제주특별자치도", sigungu: null },
];

async function main() {
  console.log("elections 시드 시작...");

  for (const e of ELECTIONS_2026) {
    await db
      .insert(elections)
      .values({
        sgId: "20260603",
        sgTypeCode: e.sgTypeCode,
        name: e.name,
        electionDate: "2026-06-03",
        sido: e.sido,
        sigungu: e.sigungu ?? undefined,
      })
      .onConflictDoNothing();
    process.stdout.write(".");
  }

  console.log(`\n✓ ${ELECTIONS_2026.length}개 선거 시드 완료`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
