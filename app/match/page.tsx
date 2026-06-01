"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_ISSUES, type Stance } from "@/src/data/issues/sample";
import { SIDO_LIST, SIGUNGU_BY_SIDO } from "@/src/data/districts";

type UserStances = Record<number, Stance>;
type Step = "district" | "quiz";

const DISTRICT_KEY = "suyo_district";

export default function MatchPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("district");
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [current, setCurrent] = useState(0);
  const [stances, setStances] = useState<UserStances>({});
  const [selected, setSelected] = useState<Stance | null>(null);

  // localStorage에서 이전 지역 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISTRICT_KEY);
      if (saved) {
        const { sido: s, sigungu: sg } = JSON.parse(saved);
        if (s) setSido(s);
        if (sg) setSigungu(sg);
      }
    } catch {}
  }, []);

  const issue = SAMPLE_ISSUES[current];
  const total = SAMPLE_ISSUES.length;
  const progress = (current / total) * 100;
  const sigunguList = sido ? (SIGUNGU_BY_SIDO[sido] ?? []) : [];

  function handleDistrictNext() {
    // 지역 저장
    if (sido && sigungu) {
      localStorage.setItem(DISTRICT_KEY, JSON.stringify({ sido, sigungu }));
    }
    setStep("quiz");
  }

  function goToResult(finalStances: UserStances) {
    const encoded = encodeURIComponent(JSON.stringify(finalStances));
    const params = new URLSearchParams({ s: encoded });
    if (sido) params.set("sido", sido);
    if (sigungu) params.set("sigungu", sigungu);
    router.push(`/match/result?${params.toString()}`);
  }

  function handleNext(stance?: Stance) {
    const s = stance ?? selected;
    if (!s) return;
    const next = { ...stances, [issue.id]: s };
    setStances(next);
    setSelected(null);
    if (current + 1 >= total) {
      goToResult(next);
    } else {
      setCurrent(current + 1);
    }
  }

  function handleSkip() {
    const next = { ...stances, [issue.id]: "neutral" as Stance };
    setStances(next);
    setSelected(null);
    if (current + 1 >= total) {
      goToResult(next);
    } else {
      setCurrent(current + 1);
    }
  }

  const BUTTONS: { stance: Stance; label: string; mark: string; color: string; activeBg: string }[] = [
    { stance: "agree",    label: "동의해요",        mark: "찬", color: "var(--ok-ink)",  activeBg: "var(--ok-bg)" },
    { stance: "neutral",  label: "잘 모르겠어요",   mark: "중", color: "var(--ink2)",    activeBg: "var(--line)" },
    { stance: "disagree", label: "동의하지 않아요",  mark: "반", color: "var(--ink2)",    activeBg: "var(--line)" },
  ];

  // ── Step 0: 지역 선택 ──────────────────────────────
  if (step === "district") {
    return (
      <main className="flex flex-col min-h-screen px-5" style={{ background: "var(--white)" }}>
        <header className="pt-12 pb-6">
          <button onClick={() => router.back()} className="text-sm mb-6" style={{ color: "var(--ink3)" }}>
            ← 뒤로
          </button>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "var(--ink3)" }}>
            공약 성향 매칭
          </p>
          <h1 className="font-black leading-tight" style={{ fontSize: 26, letterSpacing: "-0.03em", color: "var(--ink)", fontFamily: "var(--font-serif)" }}>
            내 지역구를<br />먼저 알려주세요
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink2)", lineHeight: 1.6 }}>
            매칭 결과에서 내 지역 후보를 바로 확인할 수 있어요.
          </p>
        </header>

        <div className="flex flex-col gap-3 flex-1">
          {/* 시도 */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink3)" }}>시·도</label>
            <select
              value={sido}
              onChange={(e) => { setSido(e.target.value); setSigungu(""); }}
              className="w-full px-4 text-sm outline-none appearance-none"
              style={{
                height: 52,
                background: "var(--white)",
                border: sido ? "1.5px solid var(--ink)" : "1px solid var(--line2)",
                color: sido ? "var(--ink)" : "var(--ink3)",
                fontWeight: sido ? 600 : 400,
              }}
            >
              <option value="">선택하세요</option>
              {SIDO_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* 시군구 */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink3)" }}>시·군·구</label>
            <select
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido}
              className="w-full px-4 text-sm outline-none appearance-none"
              style={{
                height: 52,
                background: sido ? "var(--white)" : "var(--bg-page)",
                border: sigungu ? "1.5px solid var(--ink)" : "1px solid var(--line2)",
                color: sigungu ? "var(--ink)" : "var(--ink3)",
                fontWeight: sigungu ? 600 : 400,
                opacity: sido ? 1 : 0.5,
              }}
            >
              <option value="">선택하세요</option>
              {sigunguList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* 안내 박스 */}
          <div className="px-4 py-3 mt-2" style={{ background: "var(--line2)", border: "1px solid var(--line)" }}>
            <p className="text-xs" style={{ color: "var(--ink2)", lineHeight: 1.6 }}>
              🗓️ <b>5월 15일 후보 등록 완료 후</b> 내 지역구 후보들의 공약 입장 분석이 업데이트돼요. 지금은 결과에서 후보 목록을 먼저 확인할 수 있어요.
            </p>
          </div>
        </div>

        <div className="pb-10 flex flex-col gap-2 mt-6">
          <button
            onClick={handleDistrictNext}
            disabled={!sido || !sigungu}
            className="w-full font-bold text-sm"
            style={{
              height: 52,
              background: sido && sigungu ? "var(--ink)" : "var(--line2)",
              color: sido && sigungu ? "var(--white)" : "var(--ink3)",
              borderRadius: 99,
              opacity: sido && sigungu ? 1 : 0.6,
            }}
          >
            매칭 시작하기 →
          </button>
          <button
            onClick={() => setStep("quiz")}
            className="w-full h-10 text-sm"
            style={{ color: "var(--ink3)" }}
          >
            지역 없이 시작하기
          </button>
        </div>
      </main>
    );
  }

  // ── Step 1+: 퀴즈 ──────────────────────────────────
  return (
    <main className="flex flex-col min-h-screen px-5" style={{ background: "var(--white)" }}>
      <header className="pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink3)" }}>
              공약 성향 매칭
            </p>
            {(sido && sigungu) && (
              <p className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>
                {sido} {sigungu}
              </p>
            )}
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--ink3)" }}>{current + 1} / {total}</span>
        </div>
        {/* 프로그레스 바 */}
        <div className="h-0.5 overflow-hidden" style={{ background: "var(--line2)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--ink)" }}
          />
        </div>
      </header>

      <section className="flex-1 flex flex-col justify-center gap-8 pb-10">
        <div>
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-3 py-1"
            style={{ background: "var(--line2)", color: "var(--ink2)" }}
          >
            {issue.topic}
          </span>
          <h2
            className="font-bold leading-snug mt-4"
            style={{ fontSize: 20, letterSpacing: "-0.02em", color: "var(--ink)", fontFamily: "var(--font-serif)" }}
          >
            {issue.statement}
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--ink3)" }}>
            이 정책에 대해 어떻게 생각하세요?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {BUTTONS.map((btn) => {
            const isSelected = selected === btn.stance;
            return (
              <button
                key={btn.stance}
                onClick={() => {
                  setSelected(btn.stance);
                  setTimeout(() => handleNext(btn.stance), 420);
                }}
                className="flex items-center gap-4 px-5 py-4 text-left transition-all"
                style={{
                  background: isSelected ? btn.activeBg : "var(--white)",
                  border: `1.5px solid ${isSelected ? btn.color : "var(--line2)"}`,
                  color: isSelected ? btn.color : "var(--ink2)",
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: isSelected ? btn.color : "var(--line2)",
                    color: isSelected ? "var(--white)" : "var(--ink3)",
                  }}
                >
                  {btn.mark}
                </span>
                <span className="text-base font-medium">{btn.label}</span>
                {isSelected && (
                  <span className="ml-auto text-sm">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="pb-10 flex flex-col gap-2">
        <button
          onClick={() => handleNext()}
          disabled={!selected}
          className="w-full font-bold text-sm"
          style={{
            height: 52,
            background: selected ? "var(--ink)" : "var(--line2)",
            color: selected ? "var(--white)" : "var(--ink3)",
            borderRadius: 99,
            opacity: selected ? 1 : 0.6,
          }}
        >
          {current + 1 >= total ? "결과 보기" : "다음 →"}
        </button>
        <button
          onClick={handleSkip}
          className="w-full h-10 text-sm"
          style={{ color: "var(--ink3)" }}
        >
          건너뛰기
        </button>
      </div>
    </main>
  );
}
