"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_ISSUES, SAMPLE_STANCES, type Stance } from "@/src/data/issues/sample";

type UserStances = Record<number, Stance>;

export default function MatchPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [stances, setStances] = useState<UserStances>({});
  const [selected, setSelected] = useState<Stance | null>(null);

  const issue = SAMPLE_ISSUES[current];
  const total = SAMPLE_ISSUES.length;
  const progress = (current / total) * 100;

  function handleSelect(stance: Stance) {
    setSelected(stance);
  }

  function handleNext() {
    if (!selected) return;
    const next = { ...stances, [issue.id]: selected };
    setStances(next);
    setSelected(null);

    if (current + 1 >= total) {
      // 완료 → 결과 페이지
      const encoded = encodeURIComponent(JSON.stringify(next));
      router.push(`/match/result?s=${encoded}`);
    } else {
      setCurrent(current + 1);
    }
  }

  function handleSkip() {
    const next = { ...stances, [issue.id]: "neutral" as Stance };
    setStances(next);
    setSelected(null);
    if (current + 1 >= total) {
      const encoded = encodeURIComponent(JSON.stringify(next));
      router.push(`/match/result?s=${encoded}`);
    } else {
      setCurrent(current + 1);
    }
  }

  const BUTTONS: { stance: Stance; label: string; mark: string; color: string; bg: string; activeBg: string }[] = [
    { stance: "agree",    label: "동의해요",      mark: "찬", color: "var(--ok-ink)",  bg: "var(--white)", activeBg: "var(--ok-bg)" },
    { stance: "neutral",  label: "잘 모르겠어요", mark: "중", color: "var(--ink2)",    bg: "var(--white)", activeBg: "var(--line)" },
    { stance: "disagree", label: "동의하지 않아요", mark: "반", color: "var(--ink2)",  bg: "var(--white)", activeBg: "var(--line)" },
  ];

  return (
    <main className="flex flex-col min-h-screen px-5" style={{ background: "var(--bg-page)" }}>
      {/* 헤더 */}
      <header className="pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold" style={{ color: "var(--ink)" }}>공약 성향 매칭</span>
          <span className="text-sm" style={{ color: "var(--ink3)" }}>{current + 1} / {total}</span>
        </div>
        {/* 프로그레스 바 */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line2)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--green-dark)" }}
          />
        </div>
      </header>

      {/* 이슈 카드 */}
      <section className="flex-1 flex flex-col justify-center gap-8 pb-10">
        <div>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: "var(--green)", color: "var(--ink)" }}
          >
            {issue.topic}
          </span>
          <h2
            className="text-xl font-bold leading-snug mt-4"
            style={{ color: "var(--ink)" }}
          >
            {issue.statement}
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--ink3)" }}>
            이 정책에 대해 어떻게 생각하세요?
          </p>
        </div>

        {/* 선택 버튼 */}
        <div className="flex flex-col gap-3">
          {BUTTONS.map((btn) => {
            const isSelected = selected === btn.stance;
            return (
              <button
                key={btn.stance}
                onClick={() => handleSelect(btn.stance)}
                className="flex items-center gap-4 px-5 py-4 text-left transition-all"
                style={{
                  background: isSelected ? btn.activeBg : btn.bg,
                  border: `2px solid ${isSelected ? btn.color : "var(--line2)"}`,
                  borderRadius: 16,
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
                  <span className="ml-auto w-4 h-4 rounded-full flex-shrink-0" style={{ background: btn.color }} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 하단 버튼 */}
      <div className="pb-10 flex flex-col gap-2">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full h-14 text-base font-semibold transition-opacity"
          style={{
            background: selected ? "var(--ink)" : "var(--line2)",
            color: selected ? "var(--white)" : "var(--ink3)",
            borderRadius: 99,
            opacity: selected ? 1 : 0.5,
          }}
        >
          {current + 1 >= total ? "결과 보기" : "다음"}
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
