"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const ELECTION_TYPES = [
  { code: "3", name: "시·도지사", desc: "광역단체장" },
  { code: "11", name: "교육감", desc: "교육행정 수장" },
  { code: "4", name: "구·시·군의장", desc: "기초단체장" },
  { code: "5", name: "시·도의원", desc: "광역의회의원" },
  { code: "6", name: "구·시·군의원", desc: "기초의회의원" },
];

function BallotContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sido = params.get("sido") ?? "";
  const sigungu = params.get("sigungu") ?? "";

  // 세종시는 기초단체 없음
  const isSejong = sido === "세종특별자치시";
  // 광역시·특별시는 구시군의장 명칭이 다름
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
    <main
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-page)" }}
    >
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
            <path
              d="M11 14L6 9L11 4"
              stroke="var(--ink)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          <p className="text-xs" style={{ color: "var(--ink3)" }}>
            {sido}
          </p>
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
          <button
            key={election.code}
            onClick={() =>
              router.push(
                `/candidates?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}&type=${election.code}&name=${encodeURIComponent(election.name)}`
              )
            }
            className="flex items-center justify-between w-full px-5 py-5 text-left transition-opacity active:opacity-70"
            style={{
              background: "var(--white)",
              border: "1px solid var(--line)",
              borderRadius: 16,
            }}
          >
            <div className="flex items-center gap-4">
              {/* 기호 번호 */}
              <span
                className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full flex-shrink-0"
                style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
              >
                {i + 1}
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
            {/* 화살표 */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 4L12 9L7 14"
                stroke="var(--ink3)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </section>

      {/* 안내 */}
      <div className="px-5 mt-2">
        <div
          className="px-4 py-4 rounded-2xl"
          style={{ background: "var(--ok-bg)" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--ok-ink)" }}>안내</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ok-ink)" }}>
            후보자 정보는 5월 15일 등록 마감 이후 업데이트돼요. 그 전까지는 2022년
            선거 데이터로 확인할 수 있어요.
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
