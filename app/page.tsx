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
  const nextIdx = MILESTONES.findIndex((m) => new Date(m.date) >= today);

  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--ink3)" }}>
        선거 일정
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
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
              className="flex-shrink-0 flex flex-col gap-1 px-3 py-3"
              style={{
                minWidth: 110,
                background: isHighlight && !isPast ? "var(--ink)" : "var(--white)",
                border: `1px solid ${isHighlight && !isPast ? "var(--ink)" : "var(--line2)"}`,
                borderLeft: isNext ? "3px solid var(--accent)" : undefined,
                opacity: isPast ? 0.45 : 1,
              }}
            >
              <span
                className="text-[10px] font-bold tracking-wide"
                style={{
                  color: isHighlight && !isPast ? "rgba(255,255,255,0.6)" : isNext ? "var(--accent)" : "var(--ink3)",
                }}
              >
                {isPast ? "완료" : diffDays === 0 ? "오늘" : `D-${diffDays}`}
              </span>
              <p
                className="text-xs font-bold leading-snug"
                style={{ color: isHighlight && !isPast ? "var(--white)" : "var(--ink)" }}
              >
                {m.label}
              </p>
              <p
                className="text-[10px] leading-snug"
                style={{ color: isHighlight && !isPast ? "rgba(255,255,255,0.5)" : "var(--ink3)" }}
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
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink3)" }}>
          저장한 후보
        </p>
        <span className="text-[10px] px-2 py-0.5" style={{ background: "var(--line2)", color: "var(--ink3)" }}>
          {bookmarks.length}명
        </span>
      </div>
      <div className="flex flex-col">
        {bookmarks.map((b, i) => (
          <div
            key={b.huboid}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: "var(--white)",
              border: "1px solid var(--line2)",
              borderTop: i > 0 ? "none" : "1px solid var(--line2)",
            }}
          >
            <div
              className="flex-shrink-0 flex flex-col items-center justify-center"
              style={{ width: 36, height: 36, background: "var(--bg-page)", border: "1px solid var(--line2)" }}
            >
              <span className="text-[8px]" style={{ color: "var(--ink3)" }}>기호</span>
              <span className="text-sm font-black leading-tight" style={{ color: "var(--ink)" }}>{b.giho}</span>
            </div>
            <button className="flex-1 text-left min-w-0" onClick={() => router.push(`/candidates/${b.huboid}`)}>
              <p className="text-sm font-bold truncate" style={{ color: "var(--ink)" }}>{b.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--ink3)" }}>{b.party}</p>
            </button>
            <button
              onClick={() => remove(b.huboid)}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center"
              style={{ background: "var(--bg-page)" }}
              aria-label="삭제"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" />
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
    router.push(`/ballot?sido=${encodeURIComponent(d.sido)}&sigungu=${encodeURIComponent(d.sigungu)}`);
  }

  function handleDropdownGo() {
    if (selectedSido && selectedSigungu) {
      goToDistrict({ sido: selectedSido, sigungu: selectedSigungu });
    }
  }

  const sigunguList = selectedSido ? (SIGUNGU_BY_SIDO[selectedSido] ?? []) : [];
  const dday = Math.ceil((new Date("2026-06-03").getTime() - Date.now()) / 86400000);

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>

      {/* 상단 로고 영역 */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--line2)" }}>
        <div className="flex items-baseline justify-between px-5 pt-12 pb-3">
          <span
            className="font-black"
            style={{ fontSize: 32, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}
          >
            수요<span style={{ color: "var(--accent)" }}>일</span>
          </span>
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--ink3)" }}>
            2026 · 6 · 3
          </span>
        </div>
        {/* 포인트 바 */}
        <div style={{ height: 3, background: "var(--accent)", width: 36, margin: "0 20px 14px" }} />
      </div>

      <div className="flex flex-col gap-7 px-5 py-7 pb-12">

        {/* 타이틀 */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--ink3)" }}>
            Step 1
          </p>
          <h1
            className="font-black leading-tight"
            style={{ fontSize: 26, letterSpacing: "-0.03em", color: "var(--ink)", fontFamily: "var(--font-serif)" }}
          >
            내가 사는 지역을<br />알려주세요
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink2)", lineHeight: 1.6 }}>
            지역을 선택하면 6월 3일 투표용지의<br />후보 전원을 정리해 드립니다.
          </p>
        </div>

        {/* 검색창 */}
        <div className="flex flex-col gap-0" ref={dropdownRef}>
          <div
            className="relative flex items-center gap-3 px-4"
            style={{
              height: 52,
              background: "var(--white)",
              border: "1.5px solid var(--ink)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="4.5" stroke="var(--ink3)" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="강남구, 수원시, 해운대구..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--ink)" }}
            />
            {query && (
              <button onClick={() => { setQuery(""); setSuggestions([]); }} style={{ color: "var(--ink3)", fontSize: 16, lineHeight: 1 }}>×</button>
            )}
          </div>
          {showDropdown && suggestions.length > 0 && (
            <ul
              className="z-10 overflow-hidden"
              style={{
                background: "var(--white)",
                border: "1px solid var(--line2)",
                borderTop: "none",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              {suggestions.map((d, i) => (
                <li key={i}>
                  <button
                    className="w-full text-left px-5 py-3 text-sm"
                    style={{
                      color: "var(--ink)",
                      borderBottom: i < suggestions.length - 1 ? "1px solid var(--line)" : "none",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-page)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => selectDistrict(d)}
                  >
                    <span style={{ color: "var(--ink3)" }}>{d.sido}</span>{" "}
                    <span className="font-semibold">{d.sigungu}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "var(--line2)" }} />
          <span className="text-xs" style={{ color: "var(--ink3)", letterSpacing: "0.08em" }}>또는 직접 선택</span>
          <div className="flex-1 h-px" style={{ background: "var(--line2)" }} />
        </div>

        {/* 드롭다운 — 가로 나란히 */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink3)" }}>시·도</label>
              <select
                value={selectedSido}
                onChange={(e) => { setSelectedSido(e.target.value); setSelectedSigungu(""); }}
                className="w-full px-3 text-sm outline-none appearance-none"
                style={{
                  height: 44,
                  background: "var(--white)",
                  border: selectedSido ? "1.5px solid var(--ink)" : "1px solid var(--line2)",
                  color: selectedSido ? "var(--ink)" : "var(--ink3)",
                  fontWeight: selectedSido ? 600 : 400,
                }}
              >
                <option value="">선택</option>
                {SIDO_LIST.map((sido) => (
                  <option key={sido} value={sido}>{sido}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink3)" }}>시·군·구</label>
              <select
                value={selectedSigungu}
                onChange={(e) => setSelectedSigungu(e.target.value)}
                disabled={!selectedSido}
                className="w-full px-3 text-sm outline-none appearance-none"
                style={{
                  height: 44,
                  background: selectedSido ? "var(--white)" : "var(--bg-page)",
                  border: selectedSigungu ? "1.5px solid var(--ink)" : "1px solid var(--line2)",
                  color: selectedSigungu ? "var(--ink)" : "var(--ink3)",
                  fontWeight: selectedSigungu ? 600 : 400,
                  opacity: selectedSido ? 1 : 0.5,
                }}
              >
                <option value="">선택</option>
                {sigunguList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleDropdownGo}
            disabled={!selectedSido || !selectedSigungu}
            className="w-full font-bold text-sm"
            style={{
              height: 52,
              background: selectedSido && selectedSigungu ? "var(--ink)" : "var(--line2)",
              color: selectedSido && selectedSigungu ? "var(--white)" : "var(--ink3)",
              borderRadius: 99,
              opacity: selectedSido && selectedSigungu ? 1 : 0.6,
              letterSpacing: "0.02em",
            }}
          >
            내 투표용지 보기 →
          </button>
        </div>

        {/* 저장한 후보 */}
        <BookmarksSection />

        {/* 선거 일정 타임라인 */}
        <ElectionTimeline />

        {/* 공약 성향 매칭 배너 */}
        <button
          onClick={() => router.push("/match")}
          className="w-full px-5 py-4 flex items-center gap-4 text-left"
          style={{ background: "var(--ink)", border: "1px solid var(--ink)" }}
        >
          <span style={{ fontSize: 18 }}>◎</span>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "var(--white)" }}>공약 성향 매칭 해보기</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>14가지 이슈로 나와 가까운 후보 찾기</p>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>›</span>
        </button>

        {/* 투표 안내 */}
        <button
          onClick={() => router.push("/polling")}
          className="w-full px-5 py-4 flex items-center gap-4 text-left"
          style={{ background: "var(--white)", border: "1px solid var(--line2)" }}
        >
          <span style={{ fontSize: 16 }}>🗳️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>투표 안내</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>투표일, 사전투표, 준비물 확인</p>
          </div>
          <span style={{ color: "var(--ink3)", fontSize: 14 }}>›</span>
        </button>

      </div>

      {/* 하단 */}
      <footer className="mt-auto pb-8 text-center">
        <p className="text-[11px]" style={{ color: "var(--ink3)", letterSpacing: "0.06em" }}>
          한국의 선거는 언제나 수요일 · 2026.6.3 · D-{dday}
        </p>
      </footer>
    </main>
  );
}
