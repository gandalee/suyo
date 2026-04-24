"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  searchDistricts,
  SIDO_LIST,
  SIGUNGU_BY_SIDO,
  type District,
} from "@/src/data/districts";

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
            className="text-4xl font-black leading-tight tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            내 투표용지
            <br />
            확인하기
          </h1>
          <p className="text-base mt-1" style={{ color: "var(--ink3)" }}>
            지역을 선택하면 후보자 정보를 볼 수 있어요
          </p>
        </div>

        {/* 공약 성향 매칭 배너 — 검색보다 위로 */}
        <button
          onClick={() => router.push("/match")}
          className="w-full px-5 py-4 flex items-center gap-4 text-left"
          style={{
            background: "var(--green)",
            borderRadius: 16,
            border: "1px solid var(--green-dark)",
          }}
        >
          <span className="text-xl">◎</span>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>공약 성향 매칭 해보기</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink2)" }}>14가지 이슈로 나와 가까운 후보 찾기</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="var(--ink2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
                borderRadius: 14,
                color: "var(--ink)",
              }}
            />
            {showDropdown && suggestions.length > 0 && (
              <ul
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden"
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--line2)",
                  borderRadius: 14,
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

      {/* 하단 */}
      <footer className="mt-auto pb-8 text-center">
        <p className="text-xs" style={{ color: "var(--ink3)" }}>
          한국의 선거는 언제나 수요일 · 2026.6.3
        </p>
      </footer>
    </main>
  );
}
