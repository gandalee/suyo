"use client";

import { Suspense, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SAMPLE_ISSUES, type Stance } from "@/src/data/issues/sample";
import CandidateAvatar from "@/components/CandidateAvatar";

type UserStances = Record<number, Stance>;

const STANCE_LABEL: Record<Stance, { short: string; color: string; bg: string }> = {
  agree:    { short: "찬성", color: "var(--ok-ink)",  bg: "var(--ok-bg)" },
  neutral:  { short: "중립", color: "var(--ink3)",    bg: "var(--line2)" },
  disagree: { short: "반대", color: "var(--bad-ink)", bg: "#FEF0F0" },
};

interface Candidate {
  huboid: string;
  giho: string;
  name: string;
  party: string;
  photo_url?: string | null;
  sdName?: string;
  sggName?: string;
  jdName?: string;
}

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("s");
  const sido = params.get("sido") ?? "";
  const sigungu = params.get("sigungu") ?? "";

  const userStances: UserStances = useMemo(() => {
    if (!raw) return {};
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return {};
    }
  }, [raw]);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sido || !sigungu) return;
    setLoading(true);
    // 시도지사(sgTypecode=2), 교육감(sgTypecode=7), 구청장(sgTypecode=4) 등 복수 타입 조회
    // 여기서는 구·시·군의 장(4)을 기본으로 조회
    const qs = new URLSearchParams({
      sdName: sido,
      sggName: sigungu,
      sgTypecode: "4",
    });
    fetch(`/api/candidates?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const items: Candidate[] = (data.items ?? []).map((item: Record<string, string | null>) => ({
          huboid: String(item.huboid ?? ""),
          giho: String(item.giho ?? ""),
          name: String(item.name ?? ""),
          party: String(item.jdName ?? ""),  // NEC API: jdName = 소속정당명
          photo_url: item.photo_url ? String(item.photo_url) : null,
          sdName: String(item.sdName ?? ""),
          sggName: String(item.sggName ?? ""),
          jdName: String(item.jdName ?? ""),
        }));
        setCandidates(items);
      })
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, [sido, sigungu]);

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
    <main
      className="flex flex-col min-h-screen pb-10"
      style={{ background: "var(--bg-page)" }}
    >
      {/* 헤더 */}
      <header className="px-5 pt-12 pb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm mb-6"
          style={{ color: "var(--ink3)" }}
        >
          ← 홈으로
        </button>
        <p
          className="text-[10px] font-bold tracking-widest uppercase mb-1"
          style={{ color: "var(--ink3)" }}
        >
          공약 성향 매칭
        </p>
        <h1
          className="font-black leading-tight"
          style={{
            fontSize: 24,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            fontFamily: "var(--font-serif)",
          }}
        >
          나의 공약 성향 결과
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink3)" }}>
          {total}개 중 {answered}개 입장 표명
          {sido && sigungu && (
            <span style={{ color: "var(--accent)" }}>
              {" "}· {sido} {sigungu}
            </span>
          )}
        </p>
      </header>

      {/* 투표 추천 아님 경고 */}
      <div
        className="mx-5 mb-5 px-4 py-3"
        style={{
          background: "#FFF8E7",
          border: "1px solid #E8C96C",
        }}
      >
        <p className="text-xs font-bold mb-0.5" style={{ color: "#7A5C0A" }}>
          투표 추천이 아닙니다
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#7A5C0A" }}>
          공약 성향은 참고 자료입니다. 후보의 인물·경력·뉴스를 함께 살펴보고
          스스로 판단해 주세요.
        </p>
      </div>

      {/* ── 내 지역구 후보 섹션 ── */}
      {(sido && sigungu) && (
        <section className="px-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-base font-bold"
              style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
            >
              {sigungu} 후보
            </h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5"
              style={{
                background: "var(--accent-bg)",
                color: "var(--accent)",
                border: "1px solid var(--accent-border)",
              }}
            >
              분석 준비중
            </span>
          </div>

          {/* 업데이트 예정 안내 */}
          <div
            className="px-4 py-3 mb-4"
            style={{
              background: "var(--line2)",
              border: "1px solid var(--line)",
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "var(--ink2)" }}>
              🗓️ <b>5월 15일 후보 등록 완료 후</b> 각 후보의 공약 입장이 분석돼
              내 성향과 얼마나 일치하는지 확인할 수 있어요.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10">
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "var(--line2)",
                  borderTopColor: "var(--accent)",
                }}
              />
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div
              className="px-4 py-6 text-center"
              style={{ border: "1px solid var(--line2)" }}
            >
              <p className="text-sm" style={{ color: "var(--ink3)" }}>
                후보 등록 전이에요.
                <br />
                5월 15일 이후 확인해 주세요.
              </p>
              <button
                onClick={() =>
                  router.push(
                    `/candidates?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}`
                  )
                }
                className="mt-3 text-xs font-semibold px-4 py-2"
                style={{
                  background: "var(--ink)",
                  color: "var(--white)",
                  borderRadius: 99,
                }}
              >
                후보 목록 보기
              </button>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <div className="flex flex-col">
              {candidates.map((c, idx) => (
                <button
                  key={c.huboid || idx}
                  onClick={() =>
                    c.huboid
                      ? router.push(`/candidates/${c.huboid}`)
                      : undefined
                  }
                  className="flex items-center gap-4 px-4 py-4 text-left w-full"
                  style={{
                    background: "var(--white)",
                    borderTop: idx === 0 ? "1px solid var(--line)" : undefined,
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {/* 아바타 */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <CandidateAvatar
                      name={c.name}
                      photoUrl={c.photo_url}
                      size={44}
                    />
                    {c.giho && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "var(--ink)",
                          color: "var(--white)",
                          fontSize: 9,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {c.giho}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-base truncate"
                      style={{ color: "var(--ink)" }}
                    >
                      {c.name}
                    </p>
                    <p className="text-sm truncate" style={{ color: "var(--ink3)" }}>
                      {c.party}
                    </p>
                  </div>

                  {/* 분석 준비중 */}
                  <span
                    className="text-[10px] font-bold flex-shrink-0 px-2 py-1"
                    style={{
                      background: "var(--line2)",
                      color: "var(--ink3)",
                    }}
                  >
                    분석 예정
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 지역 미선택 시 안내 */}
      {(!sido || !sigungu) && (
        <section className="px-5 mb-8">
          <div
            className="px-4 py-5"
            style={{ border: "1px solid var(--line2)" }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
              지역구를 선택하면 내 후보를 확인할 수 있어요
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--ink3)" }}>
              5월 15일 이후 공약 분석도 제공돼요.
            </p>
            <button
              onClick={() => router.push("/match")}
              className="text-xs font-bold px-4 py-2"
              style={{
                background: "var(--ink)",
                color: "var(--white)",
                borderRadius: 99,
              }}
            >
              지역 선택하고 다시 하기
            </button>
          </div>
        </section>
      )}

      {/* ── 내 공약 성향 요약 ── */}
      <section className="px-5 mb-8">
        <h2
          className="text-base font-bold mb-3"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          내가 응답한 공약 성향
        </h2>
        <div className="flex flex-col">
          {SAMPLE_ISSUES.map((issue, idx) => {
            const userS = userStances[issue.id];
            const stanceStyle = userS ? STANCE_LABEL[userS] : null;

            return (
              <div
                key={issue.id}
                className="flex items-start gap-3 px-0 py-3"
                style={{
                  borderTop: idx === 0 ? "1px solid var(--line)" : undefined,
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase mr-2"
                    style={{ color: "var(--ink3)" }}
                  >
                    {issue.topic}
                  </span>
                  <p
                    className="text-sm leading-snug mt-0.5"
                    style={{ color: "var(--ink)" }}
                  >
                    {issue.statement}
                  </p>
                </div>
                {stanceStyle ? (
                  <span
                    className="text-xs font-bold px-2 py-1 flex-shrink-0"
                    style={{
                      background: stanceStyle.bg,
                      color: stanceStyle.color,
                    }}
                  >
                    {stanceStyle.short}
                  </span>
                ) : (
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "var(--ink3)" }}
                  >
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 하단 버튼 */}
      <div className="px-5 flex flex-col gap-2">
        <button
          onClick={handleShare}
          className="w-full font-bold text-sm"
          style={{
            height: 52,
            background: "var(--ink)",
            color: "var(--white)",
            borderRadius: 99,
          }}
        >
          결과 공유하기 🔗
        </button>
        <button
          onClick={() => router.push("/candidates")}
          className="w-full font-bold text-sm"
          style={{
            height: 52,
            background: "var(--white)",
            color: "var(--ink)",
            borderRadius: 99,
            border: "1.5px solid var(--line)",
          }}
        >
          후보 전체 보기
        </button>
        <button
          onClick={() => router.push("/match")}
          className="w-full h-10 text-sm"
          style={{ color: "var(--ink3)" }}
        >
          다시 해보기
        </button>
      </div>

      <p
        className="text-center text-xs mt-6 px-5"
        style={{ color: "var(--ink3)", lineHeight: 1.7 }}
      >
        ※ 공약 분석은 2026년 5월 15일 후보 등록 완료 후 업데이트돼요.
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
            style={{
              borderColor: "var(--line2)",
              borderTopColor: "var(--accent)",
            }}
          />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
