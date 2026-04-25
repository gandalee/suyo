"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SAMPLE_ISSUES, SAMPLE_STANCES, type Stance } from "@/src/data/issues/sample";

type UserStances = Record<number, Stance>;
type RankedCandidate = (typeof SAMPLE_STANCES)[number] & { score: number };

function scoreMatch(userStances: UserStances): RankedCandidate[] {
  return SAMPLE_STANCES.map((candidate): RankedCandidate => {
    let total = 0;
    let points = 0;

    SAMPLE_ISSUES.forEach((issue) => {
      const user = userStances[issue.id];
      const cand = candidate.stances[issue.id];
      if (!user || !cand) return;
      total += 1;
      if (user === cand) {
        points += 1;
      } else if (user === "neutral" || cand === "neutral") {
        points += 0.5;
      }
    });

    return { ...candidate, score: total > 0 ? Math.round((points / total) * 100) : 0 };
  }).sort((a, b) => b.score - a.score);
}

const STANCE_LABEL: Record<Stance, { label: string; short: string }> = {
  agree:    { label: "동의",    short: "찬" },
  neutral:  { label: "중립",   short: "중" },
  disagree: { label: "반대",   short: "반" },
};

const STANCE_COLOR: Record<Stance, { fg: string; bg: string }> = {
  agree:    { fg: "var(--ok-ink)",  bg: "var(--ok-bg)" },
  neutral:  { fg: "var(--ink3)",    bg: "var(--line2)" },
  disagree: { fg: "var(--ink3)",    bg: "var(--line2)" },
};

function matchColor(pct: number) {
  if (pct >= 70) return { bar: "var(--ok-ink)", bg: "var(--ok-bg)", text: "var(--ok-ink)" };
  if (pct >= 40) return { bar: "var(--green-dark)", bg: "var(--green)", text: "var(--ink)" };
  return { bar: "var(--ink3)", bg: "var(--line2)", text: "var(--ink3)" };
}

const RANK_STYLE: Record<number, { label: string; color: string; bg: string; border: string }> = {
  0: { label: "1위", color: "#92610A", bg: "#FFF8E7", border: "#C8960C" }, // 금
  1: { label: "2위", color: "#555",    bg: "#F4F4F4", border: "#AAAAAA" }, // 은
  2: { label: "3위", color: "#7a4820", bg: "#FDF3EC", border: "#C07840" }, // 동
};

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("s");

  const userStances: UserStances = useMemo(() => {
    if (!raw) return {};
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return {};
    }
  }, [raw]);

  const ranked = useMemo(() => scoreMatch(userStances), [userStances]);
  const total = SAMPLE_ISSUES.length;
  const answered = Object.values(userStances).filter((s) => s !== "neutral").length;

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "수요 | 나의 공약 성향", url });
    } else {
      navigator.clipboard.writeText(url).then(() => alert("링크가 복사됐어요!"));
    }
  }

  return (
    <main className="flex flex-col min-h-screen px-5 pb-10" style={{ background: "var(--bg-page)" }}>
      {/* 헤더 */}
      <header className="flex items-center gap-3 pt-12 pb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
          style={{ background: "var(--white)", border: "1px solid var(--line2)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9L11 4" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>나의 공약 성향 결과</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            {total}개 중 {answered}개 응답 · 2022 종로구청장 기준 샘플
          </p>
        </div>
      </header>

      {/* 투표 추천 아님 경고 */}
      <div className="mb-4 px-4 py-3 rounded-2xl" style={{ background: "#FFF8E7", border: "1px solid #C8960C" }}>
        <p className="text-xs font-semibold mb-0.5" style={{ color: "#92610A" }}>투표 추천이 아닙니다</p>
        <p className="text-xs leading-relaxed" style={{ color: "#92610A" }}>
          공약 일치율은 참고 자료입니다. 후보의 인물·경력·뉴스를 함께 살펴보고 스스로 판단해 주세요.
        </p>
      </div>

      {/* 매칭 결과 */}
      <section className="flex flex-col gap-4 mb-8">
        {ranked.map((candidate, idx) => {
          const pct = candidate.score;
          const colors = matchColor(pct);
          const rank = RANK_STYLE[idx];

          return (
            <div
              key={candidate.candidateName}
              className="p-5 rounded-2xl"
              style={{
                background: rank?.bg ?? "var(--white)",
                border: `2px solid ${rank?.border ?? "var(--line)"}`,
              }}
            >
              {/* 순위 배지 */}
              <div className="flex items-center justify-between mb-3">
                {rank && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: rank.border, color: "var(--white)" }}
                  >
                    {rank.label}
                  </span>
                )}
                {!rank && <span />}
                {/* 후보 상세 보기 링크 — huboid가 없으면 버튼 숨김 */}
                {candidate.huboid && (
                  <button
                    onClick={() => router.push(`/candidates/${candidate.huboid}`)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1"
                    style={{ background: "var(--white)", border: "1px solid var(--line2)", color: "var(--ink2)" }}
                  >
                    후보 상세 보기
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
                    >
                      기호 {candidate.symbol}
                    </span>
                    <span className="text-base font-bold" style={{ color: "var(--ink)" }}>
                      {candidate.candidateName}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink3)" }}>{candidate.party}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-3xl font-black" style={{ color: rank?.color ?? colors.text }}>{pct}</span>
                  <span className="text-base font-semibold" style={{ color: rank?.color ?? colors.text }}>%</span>
                </div>
              </div>

              {/* 프로그레스 바 */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--line2)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: rank?.border ?? colors.bar }}
                />
              </div>

              {/* 이슈별 일치 */}
              <div className="mt-4 flex flex-col gap-2">
                {SAMPLE_ISSUES.map((issue) => {
                  const userS = userStances[issue.id];
                  const candS = candidate.stances[issue.id];
                  const matchType =
                    userS === candS
                      ? "same"
                      : userS === "neutral" || candS === "neutral"
                      ? "partial"
                      : "diff";
                  const dotColor =
                    matchType === "same"
                      ? "var(--ok-ink)"
                      : matchType === "partial"
                      ? "var(--ink3)"
                      : "var(--bad-ink)";
                  const dotIcon = matchType === "same" ? "●" : matchType === "partial" ? "◐" : "○";

                  return (
                    <div key={issue.id} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: dotColor }}>
                        {dotIcon}
                      </span>
                      <p className="text-xs leading-snug flex-1" style={{ color: "var(--ink2)" }}>
                        {issue.statement}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {userS && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: STANCE_COLOR[userS].bg, color: STANCE_COLOR[userS].fg }}
                          >
                            나 {STANCE_LABEL[userS].short}
                          </span>
                        )}
                        {candS && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: STANCE_COLOR[candS].bg, color: STANCE_COLOR[candS].fg }}
                          >
                            후보 {STANCE_LABEL[candS].short}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* 범례 */}
      <div className="flex gap-4 mb-6 px-1">
        {[
          { icon: "●", color: "var(--ok-ink)", label: "일치" },
          { icon: "◐", color: "var(--ink3)", label: "한쪽 중립" },
          { icon: "○", color: "var(--bad-ink)", label: "불일치" },
        ].map(({ icon, color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color }}>{icon}</span>
            <span className="text-xs" style={{ color: "var(--ink3)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleShare}
          className="w-full h-14 text-base font-semibold"
          style={{ background: "var(--ink)", color: "var(--white)", borderRadius: 99 }}
        >
          결과 공유하기 🔗
        </button>
        <button
          onClick={() => router.push("/match")}
          className="w-full h-10 text-sm"
          style={{ color: "var(--ink3)" }}
        >
          다시 해보기
        </button>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--ink3)" }}>
        ※ 2022 종로구청장 선거 공약 기반 샘플입니다.
        <br />
        2026년 후보 등록 후 실제 데이터로 업데이트돼요.
      </p>
    </main>
  );
}

export default function MatchResultPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center min-h-screen"
          style={{ background: "var(--bg-page)" }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--green-dark)", borderTopColor: "transparent" }}
          />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
