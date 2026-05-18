"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import CandidateAvatar from "@/components/CandidateAvatar";

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
  photo_url?: string | null;
}

// ── 후보 카드 ─────────────────────────────────────

function CandidateCard({
  c,
  selected,
  onToggle,
}: {
  c: Candidate;
  selected: boolean;
  onToggle: (c: Candidate) => void;
}) {
  const router = useRouter();
  return (
    <div
      className="flex items-center gap-4 px-5 py-5 cursor-pointer active:opacity-70 transition-opacity"
      onClick={() => router.push(`/candidates/${c.huboid}`)}
      style={{
        background: selected ? "var(--accent-bg)" : "var(--white)",
        border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
        borderRadius: 20,
      }}
    >
      {/* 아바타 */}
      <div className="flex-shrink-0 relative">
        <CandidateAvatar name={c.name} photoUrl={c.photo_url} size={52} />
        {/* 기호 배지 */}
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--ink)",
            color: "var(--white)",
            fontSize: 10,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--white)",
          }}
        >
          {c.giho}
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
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
              style={{ background: selected ? "rgba(255,255,255,0.6)" : "var(--accent-bg)", color: "var(--ink)" }}
            >
              {c.job}
            </span>
          )}
        </div>

        {c.career1 && (
          <p className="text-xs mt-1.5 truncate" style={{ color: "var(--ink3)" }}>
            {c.career1}
          </p>
        )}
      </div>

      {/* + / ✓ 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(c);
        }}
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          background: selected ? "var(--ink)" : "var(--bg-page)",
          border: `1.5px solid ${selected ? "var(--ink)" : "var(--line2)"}`,
        }}
        aria-label={selected ? "비교 해제" : "비교 추가"}
      >
        {selected ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2.5V11.5M2.5 7H11.5" stroke="var(--ink3)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── 비교 바텀시트 ─────────────────────────────────────

function CompareSheet({ pair, onClose }: { pair: [Candidate, Candidate]; onClose: () => void }) {
  const [a, b] = pair;
  const rows: { label: string; va: string; vb: string }[] = [
    { label: "정당", va: a.jdName || "-", vb: b.jdName || "-" },
    { label: "나이", va: a.age ? `${a.age}세` : "-", vb: b.age ? `${b.age}세` : "-" },
    { label: "성별", va: a.gender === "남" ? "남성" : a.gender === "여" ? "여성" : "-", vb: b.gender === "남" ? "남성" : b.gender === "여" ? "여성" : "-" },
    { label: "직업", va: a.job || "-", vb: b.job || "-" },
    { label: "최종 학력", va: a.edu || "-", vb: b.edu || "-" },
    { label: "주요 경력", va: a.career1 || "-", vb: b.career1 || "-" },
    { label: "2번째 경력", va: a.career2 || "-", vb: b.career2 || "-" },
  ].filter((r) => r.va !== "-" || r.vb !== "-");

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />
      {/* 시트 */}
      <div
        className="fixed bottom-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: "var(--white)",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 430,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--line2)" }} />
        </div>

        {/* 헤더: 두 후보 이름 — 각각 50% */}
        <div className="grid grid-cols-2 flex-shrink-0" style={{ borderBottom: "1px solid var(--line)" }}>
          {[a, b].map((c, ci) => (
            <div
              key={c.huboid}
              className="flex flex-col items-center py-4 gap-1"
              style={{ borderLeft: ci === 1 ? "1px solid var(--line)" : "none" }}
            >
              <div
                className="flex flex-col items-center justify-center w-10 h-10 rounded-xl mb-0.5"
                style={{ background: "var(--accent-bg)" }}
              >
                <span className="text-[10px]" style={{ color: "var(--ink3)" }}>기호</span>
                <span className="text-sm font-black leading-tight" style={{ color: "var(--ink)" }}>{c.giho}</span>
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{c.name}</p>
              <p className="text-[11px]" style={{ color: "var(--ink3)" }}>{c.jdName}</p>
            </div>
          ))}
        </div>

        {/* 비교 행들 — 스크롤 영역 */}
        <div className="overflow-y-auto flex-1">
          {rows.map((row) => (
            <div key={row.label} style={{ borderBottom: "1px solid var(--line)" }}>
              {/* 라벨 행 — 전체 폭 */}
              <div className="px-4 py-1.5" style={{ background: "var(--bg-page)" }}>
                <span className="text-[11px] font-semibold" style={{ color: "var(--ink3)" }}>{row.label}</span>
              </div>
              {/* 값 행 — 50% / 50% */}
              <div className="grid grid-cols-2">
                {[row.va, row.vb].map((v, ci) => (
                  <div
                    key={ci}
                    className="px-4 py-3"
                    style={{ borderLeft: ci === 1 ? "1px solid var(--line)" : "none" }}
                  >
                    <p className="text-sm leading-snug" style={{ color: "var(--ink)" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 닫기 버튼 */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid var(--line)" }}>
          <button
            onClick={onClose}
            className="w-full h-12 text-sm font-medium rounded-2xl"
            style={{ background: "var(--bg-page)", color: "var(--ink2)" }}
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
}

// ── 메인 컨텐츠 ─────────────────────────────────────

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

  // 비교 모드
  const [compareList, setCompareList] = useState<Candidate[]>([]);
  const [showSheet, setShowSheet] = useState(false);

  const toggleCompare = useCallback((c: Candidate) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.huboid === c.huboid);
      if (exists) return prev.filter((p) => p.huboid !== c.huboid);
      if (prev.length >= 2) return prev; // 최대 2명
      return [...prev, c];
    });
  }, []);

  useEffect(() => {
    const isWide = ["3", "11", "5"].includes(type);
    const qs = new URLSearchParams({ sgTypecode: type });
    if (sido) qs.set("sdName", sido);
    if (sigungu && !isWide) qs.set("sggName", sigungu);

    fetch(`/api/candidates?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setSgId(data.sgId);
        const keyword = isWide ? sido : sigungu || sido;
        const filtered = keyword
          ? data.items.filter((c: Candidate) => c.sggName?.includes(isWide ? sido : sigungu || sido))
          : data.items;
        setCandidates(filtered);
      })
      .finally(() => setLoading(false));
  }, [type, sido, sigungu]);

  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-page)", paddingBottom: compareList.length > 0 ? 96 : 0 }}
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
            <path d="M11 14L6 9L11 4" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--ink3)" }}>
            {sido} {sigungu}
          </p>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {name} 후보
          </h1>
        </div>
        {compareList.length > 0 && (
          <button
            onClick={() => setCompareList([])}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: "var(--line2)", color: "var(--ink3)" }}
          >
            선택 초기화
          </button>
        )}
      </header>

      {/* 2022 데이터 안내 */}
      {sgId === "20220601" && (
        <div className="px-5 pt-4">
          <div className="px-4 py-3 rounded-2xl" style={{ background: "var(--ok-bg)" }}>
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--ok-ink)" }}>2022년 데이터</p>
            <p className="text-sm" style={{ color: "var(--ok-ink)" }}>
              2026년 후보는 5/15 등록 마감 후 업데이트돼요.
            </p>
          </div>
        </div>
      )}

      {/* 비교 힌트 */}
      {!loading && candidates.length > 1 && compareList.length === 0 && (
        <div className="px-5 pt-4">
          <p className="text-xs" style={{ color: "var(--ink3)" }}>
            + 버튼으로 최대 2명을 골라 나란히 비교해보세요
          </p>
        </div>
      )}

      {/* 후보 목록 */}
      <section className="flex flex-col px-5 py-5 gap-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
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
              <CandidateCard
                key={c.huboid}
                c={c}
                selected={compareList.some((p) => p.huboid === c.huboid)}
                onToggle={toggleCompare}
              />
            ))}
          </>
        )}
      </section>

      {/* 하단 비교 바 */}
      {compareList.length > 0 && (
        <div
          className="fixed bottom-0 z-30 flex items-center justify-between px-5 py-4 gap-3"
          style={{
            background: "var(--ink)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            width: "100%",
            maxWidth: 430,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {/* 선택된 후보 이름 */}
          <div className="flex items-center gap-2 min-w-0">
            {compareList.map((c) => (
              <span
                key={c.huboid}
                className="text-sm font-semibold truncate"
                style={{ color: "var(--white)" }}
              >
                {c.name}
              </span>
            ))}
            {compareList.length === 1 && (
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                · 1명 더 선택하세요
              </span>
            )}
          </div>
          {/* 나란히 보기 */}
          <button
            onClick={() => compareList.length === 2 && setShowSheet(true)}
            disabled={compareList.length < 2}
            className="flex-shrink-0 px-5 h-11 rounded-2xl text-sm font-semibold flex items-center gap-1.5 transition-opacity"
            style={{
              background: compareList.length === 2 ? "var(--accent-bg)" : "rgba(255,255,255,0.15)",
              color: compareList.length === 2 ? "var(--ink)" : "rgba(255,255,255,0.4)",
              opacity: compareList.length === 2 ? 1 : 0.7,
            }}
          >
            나란히 보기
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 2.5L9 6L5.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* 바텀시트 */}
      {showSheet && compareList.length === 2 && (
        <CompareSheet
          pair={compareList as [Candidate, Candidate]}
          onClose={() => setShowSheet(false)}
        />
      )}
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
