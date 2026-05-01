export type Stance = "agree" | "neutral" | "disagree";

export interface Issue {
  id: number;
  statement: string;
  topic: string;
}

export interface CandidateStance {
  candidateName: string;
  party: string;
  symbol: string;
  huboid?: string;
  stances: Record<number, Stance>;
}

// 2026 지방선거 공약 성향 질문 — 논쟁적 트레이드오프 중심
export const SAMPLE_ISSUES: Issue[] = [
  {
    id: 1,
    statement: "낡은 동네를 허물고 고층 아파트로 재개발하는 게 도시재생 사업보다 낫다",
    topic: "도시개발",
  },
  {
    id: 2,
    statement: "상가 임대료 상한선을 법으로 강제해 젠트리피케이션을 막아야 한다",
    topic: "임대·상권",
  },
  {
    id: 3,
    statement: "도심 차로를 줄이고 자전거·보행 전용 도로를 대폭 늘려야 한다",
    topic: "교통",
  },
  {
    id: 4,
    statement: "범죄 예방을 위해 CCTV를 전면 확대하는 것이 사생활 침해보다 중요하다",
    topic: "안전·프라이버시",
  },
  {
    id: 5,
    statement: "대형마트 의무휴업일을 폐지해 소비자 편의를 높여야 한다",
    topic: "소비·상권",
  },
  {
    id: 6,
    statement: "청년에게 현금 월세 지원보다 창업·취업 인프라 투자가 더 효과적이다",
    topic: "청년·주거",
  },
  {
    id: 7,
    statement: "외국인 주민도 내국인과 동등한 지역 복지 서비스를 받아야 한다",
    topic: "다문화·복지",
  },
  {
    id: 8,
    statement: "지역 경제 활성화를 위해 공장·사업장 환경 규제를 일부 완화할 수 있다",
    topic: "환경·경제",
  },
  {
    id: 9,
    statement: "노인 무임승차 혜택을 축소해 대중교통 적자를 줄여야 한다",
    topic: "세대·교통",
  },
  {
    id: 10,
    statement: "공공임대주택을 내 동네에 더 짓는 데 찬성한다",
    topic: "주거·부동산",
  },
  {
    id: 11,
    statement: "어린이보호구역 내 주정차를 전면 금지해야 한다 (주민 불편 감수)",
    topic: "안전·교통",
  },
  {
    id: 12,
    statement: "지하철·버스 요금 인상 대신 세금으로 대중교통 적자를 메워야 한다",
    topic: "교통·재정",
  },
  {
    id: 13,
    statement: "음식점·유흥업소의 심야 영업시간 제한을 없애야 한다",
    topic: "야간경제",
  },
  {
    id: 14,
    statement: "구 지역화폐(지역사랑상품권)를 대폭 확대해야 한다",
    topic: "지역경제",
  },
];

// 샘플 후보 입장 (5월 15일 이후 실제 데이터로 대체 예정)
export const SAMPLE_STANCES: CandidateStance[] = [];
