"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function CandidatesContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sido = params.get("sido") ?? "";
  const sigungu = params.get("sigungu") ?? "";
  const name = params.get("name") ?? "";

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
            {sido} {sigungu}
          </p>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {name} 후보
          </h1>
        </div>
      </header>

      {/* 준비 중 */}
      <section className="flex flex-col items-center justify-center flex-1 px-5 gap-4 pb-20">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "var(--line)" }}
        >
          📋
        </div>
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
            후보자 등록 대기 중
          </p>
          <p
            className="text-sm mt-1 leading-relaxed"
            style={{ color: "var(--ink3)" }}
          >
            5월 15일 등록 마감 후<br />
            후보자 정보가 업데이트돼요
          </p>
        </div>
        <div
          className="px-4 py-3 rounded-2xl text-sm text-center"
          style={{ background: "var(--ok-bg)", color: "var(--ok-ink)" }}
        >
          D-{Math.ceil((new Date("2026-05-15").getTime() - Date.now()) / 86400000)}일 후 오픈
        </div>
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
