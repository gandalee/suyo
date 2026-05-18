"use client";

import { Suspense, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SAMPLE_ISSUES, type Stance } from "@/src/data/issues/sample";
import CandidateAvatar from "@/components/CandidateAvatar";
import { SIDO_LIST, SIGUNGU_BY_SIDO } from "@/src/data/districts";

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
  type: "governor" | "mayor"; // 시도지사 | 구시군의장
}

interface CandidateGroup {
  label: string;
  items: Candidate[];
}

type CandidateStances = Record<string, Record<number, Stance>>; // huboid → issueId → stance

function calcScore(
  userStances: Record<number, Stance>,
  candStances: Record<number, string>
): number | null {
  if (!candStances || Object.keys(candStances).length === 0) return null;
  let total = 0;
  let points = 0;
  SAMPLE_ISSUES.forEach((issue) => {
    const user = userStances[issue.id];
    const cand = candStances[issue.id] as Stance | undefined;
    if (!user || !cand) return;
    total += 1;
    if (user === cand) points += 1;
    else if (user === "neutral" || cand === "neutral") points += 0.5;
  });
  return total > 0 ? Math.round((points / total) * 100) : null;
}

function scoreColor(pct: number) {
  if (pct >= 70) return { bar: "#3e6e2a", text: "#3e6e2a", bg: "#EAF5E4" };
  if (pct >= 40) return { bar: "var(--ink2)", text: "var(--ink2)", bg: "var(--line2)" };
  return { bar: "var(--bad-ink)", text: "var(--bad-ink)", bg: "#FEF0F0" };
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

  const [groups, setGroups] = useState<CandidateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [stancesMap, setStancesMap] = useState<CandidateStances>({});

  // 지역구 인라인 편집
  const [isEditingDistrict, setIsEditingDistrict] = useState(false);
  const [editSido, setEditSido] = useState(sido);
  const [editSigungu, setEditSigungu] = useState(sigungu);
  const editSigunguList = editSido ? (SIGUNGU_BY_SIDO[editSido] ?? []) : [];

  function applyDistrict() {
    if (!editSido || !editSigungu) return;
    // localStorage 저장
    try {
      localStorage.setItem("suyo_district", JSON.stringify({ sido: editSido, sigungu: editSigungu }));
    } catch {}
    // URL 업데이트 (s 파라미터 유지)
    const next = new URLSearchParams();
    if (raw) next.set("s", raw);
    next.set("sido", editSido);
    next.set("sigungu", editSigungu);
    router.replace(`/match/result?${next.toString()}`);
    setIsEditingDistrict(false);
  }

  useEffect(() => {
    if (!sido || !sigungu) return;
    setLoading(true);

    function parseItems(data: { items?: Record<string, string | null>[] }, type: Candidate["type"]): Candidate[] {
      return (data.items ?? []).map((item) => ({
        huboid: String(item.huboid ?? ""),
        giho: String(item.giho ?? ""),
        name: String(item.name ?? ""),
        party: String(item.jdName ?? ""),
        photo_url: item.photo_url ? String(item.photo_url) : null,
        sdName: String(item.sdName ?? ""),
        sggName: String(item.sggName ?? ""),
        jdName: String(item.jdName ?? ""),
        type,
      }));
    }

    // 시도지사(3) + 구·시·군의 장(4) 병렬 조회
    const qsGovernor = new URLSearchParams({ sdName: sido, sgTypecode: "3" });
    const qsMayor = new URLSearchParams({ sdName: sido, sggName: sigungu, sgTypecode: "4" });

    Promise.all([
      fetch(`/api/candidates?${qsGovernor}`).then((r) => r.json()),
      fetch(`/api/candidates?${qsMayor}`).then((r) => r.json()),
    ])
      .then(async ([govData, mayorData]) => {
        const governors = parseItems(govData, "governor");
        const mayors = parseItems(mayorData, "mayor");

        const result: CandidateGroup[] = [];
        if (governors.length > 0) result.push({ label: `${sido}지사 / 시장`, items: governors });
        if (mayors.length > 0) result.push({ label: `${sigungu} 구청장 / 시장 / 군수`, items: mayors });
        setGroups(result);

        // stances 조회
        const allHuboids = [...governors, ...mayors].map((c) => c.huboid).filter(Boolean);
        if (allHuboids.length > 0) {
          const sq = new URLSearchParams({ huboids: allHuboids.join(",") });
          const sd = await fetch(`/api/stances?${sq}`).then((r) => r.json());
          setStancesMap(sd.stances ?? {});
        }
      })
      .catch(() => setGroups([]))
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
      {/* ── 지역구 설정 바 ── */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        {!isEditingDistrict ? (
          <button
            onClick={() => {
              setEditSido(sido);
              setEditSigungu(sigungu);
              setIsEditingDistrict(true);
            }}
            className="w-full flex items-center gap-2 px-5"
            style={{ height: 44 }}
          >
            {/* 핀 아이콘 */}
            <svg width="13" height="16" viewBox="0 0 13 16" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M6.5 0C3.74 0 1.5 2.24 1.5 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
                fill={sido && sigungu ? "var(--accent)" : "var(--ink3)"}
              />
            </svg>
            <span
              className="text-sm font-semibold"
              style={{ color: sido && sigungu ? "var(--ink)" : "var(--ink3)" }}
            >
              {sido && sigungu ? `${sido} ${sigungu}` : "내 지역구 설정하기"}
            </span>
            <span className="ml-auto text-xs" style={{ color: "var(--ink3)" }}>
              변경 ›
            </span>
          </button>
        ) : (
          <div className="px-5 py-3 flex flex-col gap-2">
            {/* 시도 + 시군구 드롭다운 */}
            <div className="flex gap-2">
              <select
                value={editSido}
                onChange={(e) => { setEditSido(e.target.value); setEditSigungu(""); }}
                className="flex-1 px-3 text-sm outline-none appearance-none"
                style={{
                  height: 40,
                  border: editSido ? "1.5px solid var(--ink)" : "1px solid var(--line2)",
                  background: "var(--white)",
                  color: editSido ? "var(--ink)" : "var(--ink3)",
                  fontWeight: editSido ? 600 : 400,
                }}
              >
                <option value="">시·도 선택</option>
                {SIDO_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={editSigungu}
                onChange={(e) => setEditSigungu(e.target.value)}
                disabled={!editSido}
                className="flex-1 px-3 text-sm outline-none appearance-none"
                style={{
                  height: 40,
                  border: editSigungu ? "1.5px solid var(--ink)" : "1px solid var(--line2)",
                  background: editSido ? "var(--white)" : "var(--line2)",
                  color: editSigungu ? "var(--ink)" : "var(--ink3)",
                  fontWeight: editSigungu ? 600 : 400,
                  opacity: editSido ? 1 : 0.5,
                }}
              >
                <option value="">시·군·구 선택</option>
                {editSigunguList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={applyDistrict}
                disabled={!editSido || !editSigungu}
                className="flex-1 text-sm font-bold"
                style={{
                  height: 36,
                  background: editSido && editSigungu ? "var(--ink)" : "var(--line2)",
                  color: editSido && editSigungu ? "var(--white)" : "var(--ink3)",
                  borderRadius: 99,
                  opacity: editSido && editSigungu ? 1 : 0.6,
                }}
              >
                적용
              </button>
              <button
                onClick={() => setIsEditingDistrict(false)}
                className="px-4 text-sm"
                style={{ color: "var(--ink3)" }}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

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
          {/* 공약 분석 예정 안내 */}
          <div
            className="px-4 py-3 mb-5"
            style={{ background: "var(--line2)", border: "1px solid var(--line)" }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "var(--ink2)" }}>
              🗓️ <b>5월 21일 선거운동 시작 후</b> 각 후보의 공약이 분석돼
              내 성향과의 일치율을 확인할 수 있어요.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--line2)", borderTopColor: "var(--accent)" }} />
            </div>
          )}

          {!loading && groups.length === 0 && (
            <div className="px-4 py-6 text-center" style={{ border: "1px solid var(--line2)" }}>
              <p className="text-sm" style={{ color: "var(--ink3)" }}>
                후보 정보를 불러올 수 없어요.
              </p>
              <button
                onClick={() => router.push(`/candidates?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}`)}
                className="mt-3 text-xs font-semibold px-4 py-2"
                style={{ background: "var(--ink)", color: "var(--white)", borderRadius: 99 }}
              >
                후보 목록 보기
              </button>
            </div>
          )}

          {!loading && groups.map((group) => {
            // 점수 계산 후 정렬
            const scored = group.items.map((c) => ({
              ...c,
              score: calcScore(userStances, stancesMap[c.huboid] ?? {}),
            })).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

            const hasAnyScore = scored.some((c) => c.score !== null);

            return (
              <div key={group.label} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "var(--ink3)" }}>
                    {group.label}
                  </p>
                  {!hasAnyScore && (
                    <span className="text-[10px] font-bold px-2 py-0.5"
                      style={{ background: "var(--line2)", color: "var(--ink3)" }}>
                      분석 예정
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  {scored.map((c, idx) => {
                    const colors = c.score !== null ? scoreColor(c.score) : null;
                    return (
                      <button
                        key={c.huboid || idx}
                        onClick={() => c.huboid ? router.push(`/candidates/${c.huboid}`) : undefined}
                        className="flex items-center gap-4 px-4 py-4 text-left w-full"
                        style={{
                          background: c.score !== null && idx === 0 ? colors!.bg : "var(--white)",
                          borderTop: idx === 0 ? "1px solid var(--line)" : undefined,
                          borderBottom: "1px solid var(--line)",
                        }}
                      >
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <CandidateAvatar name={c.name} photoUrl={c.photo_url} size={44} />
                          {c.giho && (
                            <span style={{
                              position: "absolute", bottom: -2, right: -2,
                              width: 18, height: 18, borderRadius: "50%",
                              background: "var(--ink)", color: "var(--white)",
                              fontSize: 9, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {c.giho}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base truncate" style={{ color: "var(--ink)" }}>
                            {c.name}
                          </p>
                          <p className="text-sm truncate" style={{ color: "var(--ink3)" }}>
                            {c.party}
                          </p>
                          {/* 점수 있을 때 프로그레스 바 */}
                          {c.score !== null && (
                            <div className="mt-2 h-1 w-full overflow-hidden" style={{ background: "var(--line2)" }}>
                              <div
                                className="h-full transition-all duration-500"
                                style={{ width: `${c.score}%`, background: colors!.bar }}
                              />
                            </div>
                          )}
                        </div>
                        {/* 점수 표시 */}
                        {c.score !== null ? (
                          <div className="flex-shrink-0 text-right">
                            <span className="text-xl font-black" style={{ color: colors!.text }}>
                              {c.score}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: colors!.text }}>%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] flex-shrink-0 px-2 py-1"
                            style={{ background: "var(--line2)", color: "var(--ink3)" }}>
                            분석 예정
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
