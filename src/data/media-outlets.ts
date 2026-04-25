export type MediaLean = "neutral" | "conservative" | "progressive";

export interface OutletMeta {
  lean: MediaLean;
  tier: 1 | 2 | 3;
  label: string;
}

export const OUTLET_MAP: Record<string, OutletMeta> = {
  // 공영·통신 — 한국어명
  연합뉴스: { lean: "neutral", tier: 1, label: "공영·통신" },
  KBS: { lean: "neutral", tier: 1, label: "공영·통신" },
  MBC: { lean: "neutral", tier: 1, label: "공영·통신" },
  SBS: { lean: "neutral", tier: 1, label: "공영·통신" },
  YTN: { lean: "neutral", tier: 1, label: "공영·통신" },
  "연합뉴스TV": { lean: "neutral", tier: 1, label: "공영·통신" },
  EBS: { lean: "neutral", tier: 1, label: "공영·통신" },

  // 보수 — 한국어명
  조선일보: { lean: "conservative", tier: 2, label: "보수" },
  중앙일보: { lean: "conservative", tier: 2, label: "보수" },
  동아일보: { lean: "conservative", tier: 2, label: "보수" },
  문화일보: { lean: "conservative", tier: 2, label: "보수" },
  "TV조선": { lean: "conservative", tier: 2, label: "보수" },
  "채널A": { lean: "conservative", tier: 2, label: "보수" },
  MBN: { lean: "conservative", tier: 2, label: "보수" },
  국민일보: { lean: "conservative", tier: 2, label: "보수" },
  세계일보: { lean: "conservative", tier: 2, label: "보수" },

  // 진보 — 한국어명
  한겨레: { lean: "progressive", tier: 3, label: "진보" },
  경향신문: { lean: "progressive", tier: 3, label: "진보" },
  오마이뉴스: { lean: "progressive", tier: 3, label: "진보" },
  프레시안: { lean: "progressive", tier: 3, label: "진보" },
  미디어오늘: { lean: "progressive", tier: 3, label: "진보" },
  한국일보: { lean: "progressive", tier: 3, label: "진보" },
};

// 도메인 → 분류 매핑 (네이버 뉴스 originallink 기준)
const DOMAIN_MAP: Record<string, OutletMeta> = {
  // 공영·통신
  "yna.co.kr":          { lean: "neutral", tier: 1, label: "연합뉴스" },
  "yonhapnews.co.kr":   { lean: "neutral", tier: 1, label: "연합뉴스" },
  "kbs.co.kr":          { lean: "neutral", tier: 1, label: "KBS" },
  "imnews.imbc.com":    { lean: "neutral", tier: 1, label: "MBC" },
  "mbc.co.kr":          { lean: "neutral", tier: 1, label: "MBC" },
  "sbs.co.kr":          { lean: "neutral", tier: 1, label: "SBS" },
  "sbsnews.co.kr":      { lean: "neutral", tier: 1, label: "SBS" },
  "ytn.co.kr":          { lean: "neutral", tier: 1, label: "YTN" },
  "ebs.co.kr":          { lean: "neutral", tier: 1, label: "EBS" },
  "news1.kr":           { lean: "neutral", tier: 1, label: "뉴스1" },
  "newsis.com":         { lean: "neutral", tier: 1, label: "뉴시스" },
  "edaily.co.kr":       { lean: "neutral", tier: 1, label: "이데일리" },
  "mt.co.kr":           { lean: "neutral", tier: 1, label: "머니투데이" },
  "heraldcorp.com":     { lean: "neutral", tier: 1, label: "헤럴드경제" },
  "seoul.co.kr":        { lean: "neutral", tier: 1, label: "서울신문" },
  "kukinews.com":       { lean: "neutral", tier: 1, label: "쿠키뉴스" },

  // 보수
  "chosun.com":         { lean: "conservative", tier: 2, label: "조선일보" },
  "joongang.co.kr":     { lean: "conservative", tier: 2, label: "중앙일보" },
  "joins.com":          { lean: "conservative", tier: 2, label: "중앙일보" },
  "donga.com":          { lean: "conservative", tier: 2, label: "동아일보" },
  "munhwa.com":         { lean: "conservative", tier: 2, label: "문화일보" },
  "tvchosun.com":       { lean: "conservative", tier: 2, label: "TV조선" },
  "ichannela.com":      { lean: "conservative", tier: 2, label: "채널A" },
  "mbn.co.kr":          { lean: "conservative", tier: 2, label: "MBN" },
  "kmib.co.kr":         { lean: "conservative", tier: 2, label: "국민일보" },
  "segye.com":          { lean: "conservative", tier: 2, label: "세계일보" },
  "hankyung.com":       { lean: "conservative", tier: 2, label: "한국경제" },
  "mk.co.kr":           { lean: "conservative", tier: 2, label: "매일경제" },
  "sedaily.com":        { lean: "conservative", tier: 2, label: "서울경제" },

  // 진보
  "hani.co.kr":         { lean: "progressive", tier: 3, label: "한겨레" },
  "khan.co.kr":         { lean: "progressive", tier: 3, label: "경향신문" },
  "ohmynews.com":       { lean: "progressive", tier: 3, label: "오마이뉴스" },
  "pressian.com":       { lean: "progressive", tier: 3, label: "프레시안" },
  "mediatoday.co.kr":   { lean: "progressive", tier: 3, label: "미디어오늘" },
  "hankookilbo.com":    { lean: "progressive", tier: 3, label: "한국일보" },
  "nocutnews.co.kr":    { lean: "progressive", tier: 3, label: "노컷뉴스" },
  "sisain.co.kr":       { lean: "progressive", tier: 3, label: "시사IN" },
};

export function classifyOutlet(input: string): OutletMeta | null {
  if (!input) return null;

  // 도메인 매핑 우선 (www. 제거 후 매칭)
  const normalized = input.replace(/^www\./, "");
  if (DOMAIN_MAP[normalized]) return DOMAIN_MAP[normalized];

  // 도메인의 부모 도메인도 시도 (news.kbs.co.kr → kbs.co.kr)
  const parts = normalized.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (DOMAIN_MAP[parent]) return DOMAIN_MAP[parent];
  }

  // 한국어 이름 매칭 (fallback)
  if (OUTLET_MAP[input]) return OUTLET_MAP[input];
  for (const [key, meta] of Object.entries(OUTLET_MAP)) {
    if (input.includes(key) || key.includes(input)) return meta;
  }

  return null;
}
