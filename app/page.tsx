"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/src/hooks/useBookmarks";
import {
  searchDistricts,
  SIDO_LIST,
  SIGUNGU_BY_SIDO,
  type District,
} from "@/src/data/districts";

const MILESTONES = [
  { date: "2026-05-14", label: "후보자 등록", sub: "5.14~15" },
  { date: "2026-05-17", label: "선거인명부 열람", sub: "5.17~19" },
  { date: "2026-05-21", label: "선거운동 시작", sub: "5.21~6.2" },
  { date: "2026-05-29", label: "사전투표", sub: "5.29~30 · 오전6시~오후6시" },
  { date: "2026-06-03", label: "선거일", sub: "오전6시~오후6시", highlight: true },
];

function ElectionTimeline() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 가장 가까운 다음 이벤트 인덱스
  const nextIdx = MILESTONES.findIndex((m) => new Date(m.date) >= today);

  return (
    <div>
      <p className="text-sm font-semibold mb-3" style={{ color: "var(--ink2)" }}>
        선거 일정
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {MILESTONES.map((m, i) => {
          const mDate = new Date(m.date);
          mDate.setHours(0, 0, 0, 0);
          const diffMs = mDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffMs / 86400000);
          const isPast = diffDays < 0;
          const isNext = i === nextIdx;
          const isHighlight = m.highlight;

          return (
            <div
              key={m.date}
              className="flex-shrink-0 flex flex-col gap-1.5 px-4 py-3"
              style={{
                minWidth: 130,
                borderRadius: "var(--radius)",
                background: isHighlight && !isPast
                  ? "var(--ink)"
                  : isNext
                  ? "var(--accent-bg)"
                  : isPast
                  ? "var(--line2)"
                  : "var(--white)",
                border: `1px solid ${isHighlight && !isPast ? "var(--ink)" : isNext ? "var(--accent-border)" : "var(--line)"}`,
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {/* D-day 배지 */}
              <span
                className="text-xs font-bold"
                style={{
                  color: isHighlight && !isPast
                    ? "rgba(255,255,255,0.7)"
                    : isNext
                    ? "var(--accent)"
                    : "var(--ink3)",
                }}
              >
                {isPast ? "완료" : diffDays === 0 ? "오늘" : `D-${diffDays}`}
              </span>

              {/* 이벤트명 */}
              <p
                className="text-sm font-bold leading-snug"
                style={{
                  color: isHighlight && !isPast
                    ? "var(--white)"
                    : "var(--ink)",
                }}
              >
                {m.label}
              </p>

              {/* 날짜 */}
              <p
                className="text-[11px] leading-snug"
                style={{
                  color: isHighlight && !isPast
                    ? "rgba(255,255,255,0.6)"
                    : "var(--ink3)",
                }}
              >
                {m.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookmarksSection() {
  const router = useRouter();
  const { bookmarks, remove } = useBookmarks();

  if (bookmarks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: "var(--ink2)" }}>
          저장한 후보
        </p>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--line2)", color: "var(--ink3)" }}>
          {bookmarks.length}명
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {bookmarks.map((b) => (
          <div
            key={b.huboid}
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: "var(--radius)" }}
          >
            {/* 기호 아바타 */}
            <div
              className="flex-shrink-0 flex flex-col items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--accent-bg)" }}
            >
              <span className="text-[9px]" style={{ color: "var(--ink3)" }}>기호</span>
              <span className="text-sm font-black leading-tight" style={{ color: "var(--ink)" }}>
                {b.giho}
              </span>
            </div>
            {/* 이름/정당 */}
            <button
              className="flex-1 text-left min-w-0"
              onClick={() => router.push(`/candidates/${b.huboid}`)}
            >
              <p className="text-sm font-bold truncate" style={{ color: "var(--ink)" }}>{b.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--ink3)" }}>{b.party}</p>
            </button>
            {/* 삭제 */}
            <button
              onClick={() => remove(b.huboid)}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full"
              style={{ background: "var(--bg-page)" }}
              aria-label="삭제"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<District[]>([]);
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(searchDistricts(query));
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectDistrict(d: District) {
    setQuery(`${d.sido} ${d.sigungu}`);
    setSuggestions([]);
    setShowDropdown(false);
    goToDistrict(d);
  }

  function goToDistrict(d: District) {
    router.push(
      `/ballot?sido=${encodeURIComponent(d.sido)}&sigungu=${encodeURIComponent(d.sigungu)}`
    );
  }

  function handleDropdownGo() {
    if (selectedSido && selectedSigungu) {
      goToDistrict({ sido: selectedSido, sigungu: selectedSigungu });
    }
  }

  const sigunguList = selectedSido ? (SIGUNGU_BY_SIDO[selectedSido] ?? []) : [];

  return (
    <main className="flex flex-col min-h-screen px-5" style={{ background: "var(--bg-page)" }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between pt-12 pb-8">
        <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
          수요<span style={{ color: "#E84040" }}>일</span>
        </span>
        <span className="text-sm" style={{ color: "var(--ink3)" }}>
          D-{Math.ceil((new Date("2026-06-03").getTime() - Date.now()) / 86400000)}
        </span>
      </header>

      <div className="flex flex-col gap-8 pb-12">
        {/* 타이틀 */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-4xl font-black leading-tight"
            style={{ color: "var(--ink)", fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            내 투표용지
            <br />
            확인하기
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink3)" }}>
            지역을 선택하면 후보자 정보를 볼 수 있어요
          </p>
        </div>

        {/* 저장한 후보 */}
        <BookmarksSection />

        {/* 선거 일정 타임라인 */}
        <ElectionTimeline />

        {/* 공약 성향 매칭 배너 */}
        <button
          onClick={() => router.push("/match")}
          className="w-full px-5 py-4 flex items-center gap-4 text-left"
          style={{
            background: "var(--ink)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--ink)",
          }}
        >
          <span className="text-xl">◎</span>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "var(--white)" }}>공약 성향 매칭 해보기</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>14가지 이슈로 나와 가까운 후보 찾기</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 검색창 */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium" style={{ color: "var(--ink2)" }}>
            검색으로 찾기
          </label>
          <div className="relative" ref={dropdownRef}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="강남, 수원, 해운대..."
              className="w-full h-14 px-5 text-base outline-none"
              style={{
                background: "var(--white)",
                border: "1.5px solid var(--line2)",
                borderRadius: "var(--radius)",
                color: "var(--ink)",
              }}
            />
            {showDropdown && suggestions.length > 0 && (
              <ul
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden"
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--line2)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                {suggestions.map((d, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left px-5 py-4 text-base transition-colors"
                      style={{
                        color: "var(--ink)",
                        borderBottom: i < suggestions.length - 1 ? "1px solid var(--line)" : "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-page)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => selectDistrict(d)}
                    >
                      <span style={{ color: "var(--ink3)" }}>{d.sido}</span>{" "}
                      <span className="font-medium">{d.sigungu}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "var(--line2)" }} />
          <span className="text-sm" style={{ color: "var(--ink3)" }}>또는</span>
          <div className="flex-1 h-px" style={{ background: "var(--line2)" }} />
        </div>

        {/* 드롭다운 */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium" style={{ color: "var(--ink2)" }}>
            목록에서 선택하기
          </label>
          <div className="flex flex-col gap-2">
            <select
              value={selectedSido}
              onChange={(e) => { setSelectedSido(e.target.value); setSelectedSigungu(""); }}
              className="w-full h-14 px-5 text-base outline-none appearance-none"
              style={{
                background: "var(--white)",
                border: "1.5px solid var(--line2)",
                borderRadius: 14,
                color: selectedSido ? "var(--ink)" : "var(--ink3)",
              }}
            >
              <option value="">시·도 선택</option>
              {SIDO_LIST.map((sido) => (
                <option key={sido} value={sido}>{sido}</option>
              ))}
            </select>
            <select
              value={selectedSigungu}
              onChange={(e) => setSelectedSigungu(e.target.value)}
              disabled={!selectedSido}
              className="w-full h-14 px-5 text-base outline-none appearance-none"
              style={{
                background: selectedSido ? "var(--white)" : "var(--bg-page)",
                border: "1.5px solid var(--line2)",
                borderRadius: 14,
                color: selectedSigungu ? "var(--ink)" : "var(--ink3)",
                opacity: selectedSido ? 1 : 0.5,
              }}
            >
              <option value="">시·군·구 선택</option>
              {sigunguList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleDropdownGo}
            disabled={!selectedSido || !selectedSigungu}
            className="w-full h-14 text-base font-semibold transition-opacity"
            style={{
              background: selectedSido && selectedSigungu ? "var(--ink)" : "var(--line2)",
              color: selectedSido && selectedSigungu ? "var(--white)" : "var(--ink3)",
              borderRadius: 99,
              opacity: selectedSido && selectedSigungu ? 1 : 0.6,
            }}
          >
            투표용지 보기
          </button>
        </div>
      </div>

      {/* 투표 안내 배너 */}
      <button
        onClick={() => router.push("/polling")}
        className="w-full px-5 py-4 flex items-center gap-4 text-left"
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--line)",
        }}
      >
        <span className="text-xl">🗳️</span>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>투표 안내</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink2)" }}>투표일, 사전투표, 준비물 확인</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="var(--ink2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 하단 */}
      <footer className="mt-auto pb-8 text-center">
        <p className="text-xs" style={{ color: "var(--ink3)" }}>
          한국의 선거는 언제나 수요일 · 2026.6.3
        </p>
      </footer>
    </main>
  );
}
