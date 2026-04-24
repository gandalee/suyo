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
  stances: Record<number, Stance>; // issueId → stance
}

// 2022 종로구청장 기준 샘플 이슈
export const SAMPLE_ISSUES: Issue[] = [
  { id: 1, statement: "버스·지하철 등 대중교통 노선을 더 늘려야 한다", topic: "교통" },
  { id: 2, statement: "청년 창업을 위한 구 차원의 지원센터를 설립해야 한다", topic: "청년·경제" },
  { id: 3, statement: "어르신 복지 예산을 현재보다 늘려야 한다", topic: "복지" },
  { id: 4, statement: "CCTV를 더 설치해 안전을 강화해야 한다", topic: "안전" },
  { id: 5, statement: "공영주차장을 더 만들어 주차 문제를 해결해야 한다", topic: "교통" },
  { id: 6, statement: "지역 전통시장 지원을 강화해야 한다", topic: "경제" },
  { id: 7, statement: "구립 어린이집을 더 늘려야 한다", topic: "보육" },
  { id: 8, statement: "도심 녹지와 공원을 더 만들어야 한다", topic: "환경" },
  { id: 9, statement: "청년 월세 지원금을 구 차원에서 지급해야 한다", topic: "청년·주거" },
  { id: 10, statement: "낡은 골목·건물 재생을 위한 도시재생 사업을 확대해야 한다", topic: "도시재생" },
  { id: 11, statement: "외국인 관광객 유치를 위한 투자를 늘려야 한다", topic: "관광" },
  { id: 12, statement: "지역 문화·예술 지원 예산을 확대해야 한다", topic: "문화" },
  { id: 13, statement: "장애인 편의시설을 대폭 늘려야 한다", topic: "복지" },
  { id: 14, statement: "디지털 행정 전환으로 구청 민원 서비스를 혁신해야 한다", topic: "행정" },
];

// 2022 종로구청장 후보 입장 (공약 기반 추정 샘플)
export const SAMPLE_STANCES: CandidateStance[] = [
  {
    candidateName: "정문헌",
    party: "국민의힘",
    symbol: "1",
    stances: {
      1: "neutral", 2: "agree", 3: "agree", 4: "agree",
      5: "agree", 6: "agree", 7: "neutral", 8: "neutral",
      9: "neutral", 10: "neutral", 11: "agree", 12: "neutral",
      13: "agree", 14: "agree",
    },
  },
  {
    candidateName: "김영종",
    party: "더불어민주당",
    symbol: "2",
    stances: {
      1: "agree", 2: "agree", 3: "agree", 4: "neutral",
      5: "neutral", 6: "agree", 7: "agree", 8: "agree",
      9: "agree", 10: "agree", 11: "neutral", 12: "agree",
      13: "agree", 14: "neutral",
    },
  },
  {
    candidateName: "이상국",
    party: "정의당",
    symbol: "3",
    stances: {
      1: "agree", 2: "neutral", 3: "agree", 4: "disagree",
      5: "disagree", 6: "agree", 7: "agree", 8: "agree",
      9: "agree", 10: "agree", 11: "disagree", 12: "agree",
      13: "agree", 14: "neutral",
    },
  },
];
