"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Candidate {
  huboid: string;
  giho: string;
  name: string;
  jdName: string;
  gender: string;
  age: string;
  job: string;
  edu: string;
  career1: string;
  career2: string;
  sggName: string;
  status: string;
}

function CandidateCard({ c }: { c: Candidate }) {
  const router = useRouter();
  return (
    <div
      className="flex items-center gap-4 px-5 py-5 cursor-pointer active:opacity-70 transition-opacity"
      onClick={() => router.push(`/candidates/${c.huboid}`)}
      style={{
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 20,
      }}
    >
      {/* 아바타 — 기호 번호 */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0"
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "var(--bg-page)",
        }}
      >
        <span className="text-[10px]" style={{ color: "var(--ink3)" }}>기호</span>
        <span className="text-xl font-black leading-tight" style={{ color: "var(--ink)" }}>
          {c.giho}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        {/* 이름 + 정당 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold" style={{ color: "var(--ink)" }}>
            {c.name}
          </span>
          {c.status === "사퇴" && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: "var(--line2)", color: "var(--ink3)" }}
            >
              사퇴
            </span>
          )}
        </div>
        <p className="text-sm mt-0.5" style={{ color: "var(--ink3)" }}>
          {c.jdName}
        </p>

        {/* 스펙 태그 */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {c.age && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
            >
              {c.age}세
            </span>
          )}
          {c.gender && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
            >
              {c.gender === "남" ? "남" : "여"}
            </span>
          )}
          {c.job && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-[140px]"
              style={{ background: "var(--green)", color: "var(--ink)" }}
            >
              {c.job}
            </span>
          )}
        </div>

        {/* 주요 경력 한 줄 */}
        {c.career1 && (
          <p className="text-xs mt-1.5 truncate" style={{ color: "var(--ink3)" }}>
            {c.career1}
          </p>
        )}
      </div>

      {/* 화살표 */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
        <path d="M6 3L11 8L6 13" stroke="var(--line2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function CandidatesContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sido = params.get("sido") ?? "";
  const sigungu = params.get("sigungu") ?? "";
  const type = params.get("type") ?? "3";
  const name = params.get("name") ?? "";

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sgId, setSgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams({ sgTypecode: type });
    if (sido) qs.set("sdName", sido);
    if (sigungu) qs.set("sggName", sigungu);

    fetch(`/api/candidates?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setSgId(data.sgId);
        // API 필터가 안 먹을 경우 클라이언트 보조 필터 (sigungu 우선)
        const keyword = sigungu || sido;
        const filtered = keyword
          ? data.items.filter((c: Candidate) => c.sggName?.includes(sigungu || sido))
          : data.items;
        setCandidates(filtered);
      })
      .finally(() => setLoading(false));
  }, [type, sido, sigungu]);

  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-page)" }}
    >
      {/* 헤더 */}
      <header
        className="flex items-center gap-3 px-5 pt-12 pb-5"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
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
            {sido} {sigungu}
          </p>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {name} 후보
          </h1>
        </div>
      </header>

      {/* 2022 데이터 안내 */}
      {sgId === "20220601" && (
        <div className="px-5 pt-4">
          <div
            className="flex gap-2 px-4 py-3 rounded-2xl"
            style={{ background: "var(--ok-bg)" }}
          >
            <span>📅</span>
            <p className="text-sm" style={{ color: "var(--ok-ink)" }}>
              2026년 후보는 5/15 등록 마감 후 업데이트돼요.
              지금은 2022년 데이터예요.
            </p>
          </div>
        </div>
      )}

      {/* 후보 목록 */}
      <section className="flex flex-col px-5 py-5 gap-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--green-dark)", borderTopColor: "transparent" }}
            />
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-2">
            <p className="text-base font-medium" style={{ color: "var(--ink)" }}>
              후보자 정보가 없어요
            </p>
            <p className="text-sm" style={{ color: "var(--ink3)" }}>
              5월 15일 등록 마감 후 업데이트돼요
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm" style={{ color: "var(--ink3)" }}>
              총 {candidates.length}명 · 기호순
            </p>
            {candidates.map((c) => (
              <CandidateCard key={c.huboid} c={c} />
            ))}
          </>
        )}
      </section>
    </main>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense>
      <CandidatesContent />
    </Suspense>
  );
}
