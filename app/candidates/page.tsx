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
      className="flex flex-col gap-3 px-5 py-5 cursor-pointer active:opacity-70 transition-opacity"
      onClick={() => router.push(`/candidates/${c.huboid}`)}
      style={{
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 16,
      }}
    >
      {/* 상단: 기호 + 이름 + 정당 */}
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-9 h-9 text-sm font-bold rounded-full flex-shrink-0"
          style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
        >
          {c.giho}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: "var(--ink)" }}>
              {c.name}
            </span>
            <span className="text-sm" style={{ color: "var(--ink3)" }}>
              {c.gender === "남" ? "남" : "여"} · {c.age}세
            </span>
          </div>
          <span className="text-sm" style={{ color: "var(--ink2)" }}>
            {c.jdName}
          </span>
        </div>
        {c.status === "사퇴" && (
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: "var(--bad-bg)", color: "var(--bad-ink)" }}
          >
            사퇴
          </span>
        )}
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: "var(--line)" }} />

      {/* 직업 + 경력 */}
      <div className="flex flex-col gap-1.5">
        {c.job && (
          <p className="text-sm" style={{ color: "var(--ink2)" }}>
            {c.job}
          </p>
        )}
        {c.career1 && (
          <p className="text-sm" style={{ color: "var(--ink3)" }}>
            {c.career1}
          </p>
        )}
        {c.career2 && (
          <p className="text-sm" style={{ color: "var(--ink3)" }}>
            {c.career2}
          </p>
        )}
      </div>
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
    fetch(`/api/candidates?sgTypecode=${type}`)
      .then((r) => r.json())
      .then((data) => {
        setSgId(data.sgId);
        // 지역 필터링 (sido 기준)
        const filtered = data.items.filter((c: Candidate) =>
          c.sggName?.includes(sido.replace("특별시", "").replace("광역시", "").replace("특별자치시", "").replace("특별자치도", "").replace("도", ""))
        );
        setCandidates(filtered.length > 0 ? filtered : data.items.slice(0, 20));
      })
      .finally(() => setLoading(false));
  }, [type, sido]);

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
