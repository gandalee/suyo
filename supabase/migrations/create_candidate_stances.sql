-- 후보 공약 성향 테이블
-- suyo.kr AI 공약 분석 결과 저장

CREATE TABLE IF NOT EXISTS public.candidate_stances (
  id            SERIAL PRIMARY KEY,
  external_id   TEXT NOT NULL,          -- candidates.external_id (huboid)
  election_id   TEXT NOT NULL DEFAULT '20260603',
  issue_id      INTEGER NOT NULL,        -- SAMPLE_ISSUES id (1~14)
  stance        TEXT NOT NULL CHECK (stance IN ('agree', 'neutral', 'disagree')),
  confidence    FLOAT DEFAULT 0.8,       -- AI 신뢰도 (0~1)
  source        TEXT DEFAULT 'ai_analysis',  -- 'ai_analysis' | 'manual'
  analyzed_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (external_id, election_id, issue_id)
);

CREATE INDEX IF NOT EXISTS idx_stances_external_id
  ON public.candidate_stances (external_id);

CREATE INDEX IF NOT EXISTS idx_stances_election_issue
  ON public.candidate_stances (election_id, issue_id);
