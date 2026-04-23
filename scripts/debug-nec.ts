import { config } from "dotenv";
config({ path: ".env.local" });

const KEY = process.env.NEC_API_KEY!;

async function main() {
  const params = new URLSearchParams({
    serviceKey: KEY,
    pageNo: "1",
    numOfRows: "3",
    sgId: "20240410", // 2024 국회의원선거
    sgTypecode: "2",
    type: "json",
  });

  const url = `https://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPoelpcddRegistSttusInfoInqire?${params}`;
  console.log("URL:", url.slice(0, 120) + "...");

  const res = await fetch(url);
  console.log("status:", res.status);
  const text = await res.text();
  console.log("body:", text.slice(0, 500));
}

main().catch(console.error);
