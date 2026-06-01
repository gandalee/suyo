"use client";

import Link from "next/link";
import { useState } from "react";

const STATS = [
  { value: "6,756명", label: "등록 후보자" },
  { value: "AI 분석", label: "공약 자동 요약" },
  { value: "5종", label: "투표용지 미리보기" },
  { value: "무료", label: "로그인 없이" },
];

const FEATURES = [
  {
    emoji: "🗳️",
    title: "내 지역 투표용지 미리보기",
    desc: "주소를 입력하면 6월 3일 내가 받게 될 투표용지 종류와 후보자 목록을 한눈에 확인할 수 있어요.",
    accent: false,
  },
  {
    emoji: "🤖",
    title: "AI 공약 분석",
    desc: "후보자 등록 공약을 AI가 읽고 핵심 입장을 요약해요. 길고 복잡한 공약을 짧고 명확하게.",
    accent: true,
  },
  {
    emoji: "📰",
    title: "언론 편향 나란히 비교",
    desc: "같은 후보를 보수·진보 언론이 어떻게 다르게 보도했는지 나란히 비교할 수 있어요.",
    accent: false,
  },
  {
    emoji: "🧭",
    title: "성향 매칭",
    desc: "주요 이슈에 대한 내 생각을 입력하면 가장 가까운 후보를 찾아드려요.",
    accent: false,
  },
];

const STEPS = [
  {
    num: "01",
    title: "지역 선택",
    desc: "시·도와 시·군·구를 선택하면 내 투표용지 구성이 나와요.",
  },
  {
    num: "02",
    title: "후보자 탐색",
    desc: "선거 종류를 고르면 내 지역 후보자 전체 목록과 AI 분석 결과를 볼 수 있어요.",
  },
  {
    num: "03",
    title: "현명한 선택",
    desc: "공약·언론 보도·성향 매칭을 종합해 내 한 표를 결정하세요.",
  },
];

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("https://suyo.kr").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main
      className="flex flex-col min-h-screen overflow-x-hidden"
      style={{ background: "var(--bg-page)", fontFamily: "var(--font-sans)" }}
    >
      {/* ── 헤더 ── */}
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span
            className="font-black"
            style={{ fontSize: 22, letterSpacing: "-0.04em", color: "var(--ink)" }}
          >
            수요<span style={{ color: "var(--accent)" }}>일</span>
          </span>
          <span className="text-xs" style={{ color: "var(--ink3)" }}>suyo.kr</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          시작하기
        </Link>
      </header>

      {/* ── 히어로 ── */}
      <section
        className="relative flex flex-col items-center text-center px-6 py-20 overflow-hidden"
        style={{ background: "#1A1815" }}
      >
        {/* 배경 원 */}
        <div
          className="absolute"
          style={{
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,57,43,0.18) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        {/* D-Day 뱃지 */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(192,57,43,0.25)", color: "#f5a99a", border: "1px solid rgba(192,57,43,0.4)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#C0392B" }}
          />
          2026년 6월 3일 지방선거
        </span>

        <h1
          className="font-black leading-tight mb-4"
          style={{ fontSize: "clamp(32px, 8vw, 56px)", color: "#FFFFFF", letterSpacing: "-0.03em" }}
        >
          내 한 표,<br />
          <span style={{ color: "#C0392B" }}>제대로</span> 행사하세요
        </h1>
        <p
          className="max-w-xs leading-relaxed mb-10"
          style={{ color: "#9A9088", fontSize: 16 }}
        >
          AI가 후보자 공약을 분석하고,<br />
          언론 편향까지 비교해드려요.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base"
          style={{ background: "#C0392B", color: "#fff", letterSpacing: "-0.01em" }}
        >
          내 지역 후보 보기
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 4L12 9L7 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* 통계 */}
        <div
          className="grid grid-cols-2 gap-3 mt-14 w-full max-w-sm"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span
                className="font-black mb-1"
                style={{ fontSize: 20, color: "#fff", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 12, color: "#9A9088" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 기능 소개 ── */}
      <section className="px-5 py-14">
        <p className="text-xs font-semibold tracking-widest mb-2 text-center" style={{ color: "var(--accent)" }}>
          FEATURES
        </p>
        <h2
          className="text-2xl font-black text-center mb-10"
          style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}
        >
          한 곳에서 모두 확인하세요
        </h2>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 p-5 rounded-2xl"
              style={{
                background: f.accent ? "var(--accent)" : "var(--bg-page)",
                border: f.accent ? "none" : "1px solid var(--line)",
              }}
            >
              <span className="text-2xl flex-shrink-0">{f.emoji}</span>
              <div>
                <p
                  className="font-bold text-base mb-1"
                  style={{ color: f.accent ? "#fff" : "var(--ink)" }}
                >
                  {f.title}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: f.accent ? "rgba(255,255,255,0.8)" : "var(--ink3)" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 사용 방법 ── */}
      <section
        className="px-5 py-14"
        style={{ background: "#1A1815" }}
      >
        <p className="text-xs font-semibold tracking-widest mb-2 text-center" style={{ color: "var(--accent)" }}>
          HOW IT WORKS
        </p>
        <h2
          className="text-2xl font-black text-center mb-10"
          style={{ color: "#fff", letterSpacing: "-0.03em" }}
        >
          3단계로 끝나요
        </h2>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex gap-4 items-start">
              {/* 선 */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full font-black text-sm flex-shrink-0"
                  style={{
                    background: i === 0 ? "#C0392B" : "rgba(255,255,255,0.1)",
                    color: i === 0 ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {s.num}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className="w-px mt-2 mb-0"
                    style={{ height: 24, background: "rgba(255,255,255,0.12)" }}
                  />
                )}
              </div>
              <div className="pb-4">
                <p className="font-bold text-base mb-1" style={{ color: "#fff" }}>{s.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#9A9088" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 공유 배너 ── */}
      <section className="px-5 py-14">
        <div
          className="flex flex-col items-center text-center p-8 rounded-3xl max-w-md mx-auto"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}
        >
          <span className="text-3xl mb-4">📣</span>
          <h3
            className="font-black text-xl mb-2"
            style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}
          >
            주변에 알려주세요
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--ink3)" }}>
            선거 정보가 필요한 친구, 가족에게<br />suyo.kr을 공유해주세요.
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                링크 복사됨!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="5" width="8" height="8" rx="2" stroke="#fff" strokeWidth="1.5" />
                  <path d="M3 11V3h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                suyo.kr 링크 복사
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── 앱 화면 프리뷰 모형 ── */}
      <section
        className="px-5 py-14 overflow-hidden"
        style={{ background: "#F5F0E8" }}
      >
        <p className="text-xs font-semibold tracking-widest mb-2 text-center" style={{ color: "var(--accent)" }}>
          PREVIEW
        </p>
        <h2
          className="text-2xl font-black text-center mb-10"
          style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}
        >
          이렇게 생겼어요
        </h2>

        {/* 폰 목업 */}
        <div className="flex justify-center">
          <div
            className="relative"
            style={{
              width: 260,
              height: 520,
              background: "#1A1815",
              borderRadius: 36,
              boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
              overflow: "hidden",
              border: "6px solid #2a2520",
            }}
          >
            {/* 노치 */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: 12, width: 80, height: 24, background: "#1A1815", borderRadius: 12, zIndex: 10 }}
            />

            {/* 화면 내용 */}
            <div className="absolute inset-0 flex flex-col pt-16 px-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p style={{ fontSize: 9, color: "#9A9088" }}>서울특별시 · 동작구</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>동작구 투표용지</p>
                </div>
              </div>
              <p style={{ fontSize: 9, color: "#9A9088", marginBottom: 8 }}>2026.6.3 · 투표용지 5장</p>

              {/* 카드들 */}
              {[
                { num: 1, name: "서울시장", sub: "광역단체장", chips: ["1 오세훈", "2 홍길동"] },
                { num: 2, name: "교육감", sub: "교육행정 수장", chips: ["1 조희연"] },
                { num: 3, name: "구청장", sub: "기초단체장", chips: ["1 박일하", "2 이재명"] },
              ].map((card) => (
                <div
                  key={card.num}
                  className="mb-2 rounded-xl overflow-hidden"
                  style={{ background: "#fff" }}
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center justify-center rounded-full font-bold"
                        style={{ width: 20, height: 20, fontSize: 9, background: "#F5F0E8", color: "#4A4640" }}
                      >
                        {card.num}
                      </span>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#1A1815" }}>{card.name}</p>
                        <p style={{ fontSize: 9, color: "#9A9088" }}>{card.sub}</p>
                      </div>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M4 2L7 5L4 8" stroke="#9A9088" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex gap-1 px-3 pb-2.5">
                    {card.chips.map((c) => (
                      <span
                        key={c}
                        style={{
                          fontSize: 8,
                          padding: "2px 6px",
                          borderRadius: 20,
                          background: "#F5F0E8",
                          color: "#4A4640",
                          border: "1px solid #EAE5DB",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 ── */}
      <section
        className="flex flex-col items-center text-center px-6 py-20"
        style={{ background: "#1A1815" }}
      >
        <h2
          className="font-black leading-tight mb-4"
          style={{ fontSize: "clamp(28px, 7vw, 44px)", color: "#fff", letterSpacing: "-0.03em" }}
        >
          지금 확인하세요,<br />
          <span style={{ color: "#C0392B" }}>6월 3일</span>이 옵니다
        </h2>
        <p className="mb-10 text-sm" style={{ color: "#9A9088" }}>
          로그인 없이, 무료로, 지금 바로
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base"
          style={{ background: "#C0392B", color: "#fff", letterSpacing: "-0.01em" }}
        >
          내 지역 후보 보기
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 4L12 9L7 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </section>

      {/* ── 푸터 ── */}
      <footer
        className="flex flex-col items-center gap-2 py-8 px-5"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <span
          className="font-black text-base"
          style={{ letterSpacing: "-0.04em", color: "var(--ink)" }}
        >
          수요<span style={{ color: "var(--accent)" }}>일</span>
        </span>
        <p className="text-xs text-center" style={{ color: "var(--ink3)" }}>
          2026 지방선거 유권자 결정 지원 서비스<br />
          후보자 정보 출처: 중앙선거관리위원회
        </p>
        <Link href="/" className="text-xs" style={{ color: "var(--ink3)", textDecoration: "underline" }}>
          suyo.kr
        </Link>
      </footer>
    </main>
  );
}
