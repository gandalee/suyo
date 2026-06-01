"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const ELECTION_TYPES = [
  { code: "3",  name: "시·도지사",    desc: "광역단체장" },
  { code: "11", name: "교육감",       desc: "교육행정 수장" },
  { code: "4",  name: "구·시·군의장", desc: "기초단체장" },
  { code: "5",  name: "시·도의원",    desc: "광역의회의원" },
  { code: "6",  name: "구·시·군의원", desc: "기초의회의원" },
];

interface CandidateChip {
  huboid: string;
  giho: string;
  name: string;
  jdName: string;
  status: string;
}

// 선거 종류별 카드: 후보 칩 포함
function ElectionCard({
  election,
  idx,
  sido,
  sigungu,
  onClick,
}: {
  election: { code: string; name: string; desc: string };
  idx: number;
  sido: string;
  sigungu: string;
  onClick: () => void;
}) {
  const [chips, setChips] = useState<CandidateChip[]>([]);
  const [chipLoading, setChipLoading] = useState(true);

  useEffect(() => {
    const isWide = ["3", "11", "5"].includes(election.code);
    const qs = new URLSearchParams({ sgTypecode: election.code });
    if (sido) qs.set("sdName", sido);
    if (sigungu && !isWide) qs.set("sggName", sigungu);

    fetch(`/api/candidates?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const items: CandidateChip[] = data.items ?? [];
        // 시도의원(5)은 sggName이 "동작구제1선거구" 형태 → sigungu로 필터
        const keyword =
          election.code === "5" ? sigungu
          : isWide ? sido
          : sigungu || sido;
        const filtered = keyword
          ? items.filter((c) => (c as unknown as { sggName: string }).sggName?.includes(keyword))
          : items;
        setChips(filtered.slice(0, 8)); // 칩은 최대 8개까지 미리보기
      })
      .catch(() => setChips([]))
      .finally(() => setChipLoading(false));
  }, [election.code, sido, sigungu]);

  return (
    <button
      onClick={onClick}
      className="flex flex-col w-full text-left transition-opacity active:opacity-70"
      style={{
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* 선거 종류 행 */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-4">
          <span
            className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full flex-shrink-0"
            style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
          >
            {idx + 1}
          </span>
          <div>
            <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
              {election.name}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--ink3)" }}>
              {election.desc}
            </p>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
          <path d="M7 4L12 9L7 14" stroke="var(--ink3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 후보 칩 가로 스크롤 */}
      {chipLoading ? (
        <div
          className="flex items-center gap-2 px-5 py-4 overflow-hidden"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-7 rounded-full animate-pulse"
              style={{ width: 64, background: "var(--line2)" }}
            />
          ))}
        </div>
      ) : chips.length > 0 ? (
        <div
          className="flex items-center gap-2 px-5 py-4 overflow-x-auto"
          style={{ borderTop: "1px solid var(--line)" }}
          onClick={(e) => e.stopPropagation()} // 칩 스크롤 시 카드 클릭 방지 안함 — 그냥 통과
        >
          {chips.map((c) => (
            <span
              key={c.huboid}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-medium"
              style={{
                background: c.status === "사퇴" ? "var(--line2)" : "var(--bg-page)",
                color: c.status === "사퇴" ? "var(--ink3)" : "var(--ink2)",
                border: "1px solid var(--line)",
                textDecoration: c.status === "사퇴" ? "line-through" : "none",
              }}
            >
              <span className="font-bold" style={{ color: c.status === "사퇴" ? "var(--ink3)" : "var(--ink)" }}>
                {c.giho}
              </span>
              {c.name}
            </span>
          ))}
          {/* "n명 전체" 힌트 */}
        </div>
      ) : (
        <div
          className="px-5 pb-4"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <p className="text-xs mt-3" style={{ color: "var(--ink3)" }}>
            5월 15일 후보 등록 마감 후 표시돼요
          </p>
        </div>
      )}
    </button>
  );
}

function BallotContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sido = params.get("sido") ?? "";
  const sigungu = params.get("sigungu") ?? "";

  const isSejong = sido === "세종특별자치시";
  const isMetro =
    sido.includes("특별시") ||
    sido.includes("광역시") ||
    sido.includes("특별자치시");

  const elections = ELECTION_TYPES.filter((e) => {
    if (isSejong && (e.code === "4" || e.code === "6")) return false;
    return true;
  }).map((e) => {
    if (e.code === "4" && isMetro) return { ...e, name: "구청장·군수" };
    if (e.code === "5" && isMetro) return { ...e, name: "시·도의원" };
    return e;
  });

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* 헤더 */}
      <header
        className="flex items-center gap-3 px-5 pt-12 pb-6"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: "var(--white)", border: "1px solid var(--line2)" }}
          aria-label="뒤로"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9L11 4" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p className="text-xs" style={{ color: "var(--ink3)" }}>{sido}</p>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {sigungu} 투표용지
          </h1>
        </div>
      </header>

      {/* 선거 목록 */}
      <section className="flex flex-col px-5 py-6 gap-3">
        <p className="text-sm mb-1" style={{ color: "var(--ink3)" }}>
          2026.6.3 · 투표용지 {elections.length}장
        </p>

        {elections.map((election, i) => (
          <ElectionCard
            key={election.code}
            election={election}
            idx={i}
            sido={sido}
            sigungu={sigungu}
            onClick={() =>
              router.push(
                `/candidates?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}&type=${election.code}&name=${encodeURIComponent(election.name)}`
              )
            }
          />
        ))}
      </section>

      {/* 안내 */}
      <div className="px-5 mt-2">
        <div className="px-4 py-4 rounded-2xl" style={{ background: "var(--ok-bg)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--ok-ink)" }}>안내</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ok-ink)" }}>
            2026년 6월 3일 지방선거 후보자 정보예요. 공약·성향 분석은 후보 이름을 눌러 확인하세요.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BallotPage() {
  return (
    <Suspense>
      <BallotContent />
    </Suspense>
  );
}
