export type MediaLean = "neutral" | "conservative" | "progressive";

export interface OutletMeta {
  lean: MediaLean;
  tier: 1 | 2 | 3;
  label: string;
}

// 언론사명 → 분류 매핑 (네이버 뉴스 otherapist 필드 기준)
export const OUTLET_MAP: Record<string, OutletMeta> = {
  // 공영·통신
  연합뉴스: { lean: "neutral", tier: 1, label: "공영·통신" },
  KBS: { lean: "neutral", tier: 1, label: "공영·통신" },
  MBC: { lean: "neutral", tier: 1, label: "공영·통신" },
  SBS: { lean: "neutral", tier: 1, label: "공영·통신" },
  YTN: { lean: "neutral", tier: 1, label: "공영·통신" },
  "연합뉴스TV": { lean: "neutral", tier: 1, label: "공영·통신" },
  EBS: { lean: "neutral", tier: 1, label: "공영·통신" },

  // 보수
  조선일보: { lean: "conservative", tier: 2, label: "보수" },
  중앙일보: { lean: "conservative", tier: 2, label: "보수" },
  동아일보: { lean: "conservative", tier: 2, label: "보수" },
  문화일보: { lean: "conservative", tier: 2, label: "보수" },
  "TV조선": { lean: "conservative", tier: 2, label: "보수" },
  "채널A": { lean: "conservative", tier: 2, label: "보수" },
  MBN: { lean: "conservative", tier: 2, label: "보수" },
  국민일보: { lean: "conservative", tier: 2, label: "보수" },
  세계일보: { lean: "conservative", tier: 2, label: "보수" },

  // 진보
  한겨레: { lean: "progressive", tier: 3, label: "진보" },
  경향신문: { lean: "progressive", tier: 3, label: "진보" },
  오마이뉴스: { lean: "progressive", tier: 3, label: "진보" },
  프레시안: { lean: "progressive", tier: 3, label: "진보" },
  미디어오늘: { lean: "progressive", tier: 3, label: "진보" },
  "한국일보": { lean: "progressive", tier: 3, label: "진보" },
};

export function classifyOutlet(officeName: string): OutletMeta | null {
  // 정확 매칭
  if (OUTLET_MAP[officeName]) return OUTLET_MAP[officeName];

  // 부분 매칭 (예: "KBS뉴스" → "KBS")
  for (const [key, meta] of Object.entries(OUTLET_MAP)) {
    if (officeName.includes(key) || key.includes(officeName)) return meta;
  }

  return null;
}
