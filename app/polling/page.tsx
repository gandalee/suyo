"use client";

import { useRouter } from "next/navigation";

const ITEMS = [
  {
    icon: "🗓️",
    title: "선거일",
    lines: ["2026년 6월 3일 (수)", "오전 6시 ~ 오후 6시"],
  },
  {
    icon: "📋",
    title: "사전투표",
    lines: ["5월 29일(금) ~ 30일(토)", "오전 6시 ~ 오후 6시", "전국 어디서나 가능"],
  },
  {
    icon: "🪪",
    title: "투표 시 준비물",
    lines: ["주민등록증, 운전면허증, 여권", "모바일 신분증도 가능", "만 18세 이상 대한민국 국민"],
  },
  {
    icon: "📍",
    title: "투표소",
    lines: ["주민등록 주소지 관할 투표소", "사전투표는 전국 어디서나"],
  },
];

const LINKS = [
  {
    label: "내 투표소 찾기",
    desc: "주소로 투표소 위치 확인",
    url: "https://www.nec.go.kr/portal/main.do",
    primary: true,
  },
  {
    label: "사전투표소 찾기",
    desc: "전국 사전투표소 위치",
    url: "https://www.nec.go.kr/portal/main.do",
    primary: false,
  },
  {
    label: "선거인 명부 확인",
    desc: "내가 투표권이 있는지 확인",
    url: "https://www.nec.go.kr/portal/main.do",
    primary: false,
  },
];

export default function PollingPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
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
        <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>투표 안내</h1>
      </header>

      <div className="flex flex-col gap-5 px-5 py-6">
        {/* 기본 정보 카드들 */}
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex gap-4 px-5 py-4 rounded-2xl"
            style={{ background: "var(--white)", border: "1px solid var(--line)" }}
          >
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{item.title}</p>
              {item.lines.map((line, i) => (
                <p key={i} className="text-sm" style={{ color: i === 0 ? "var(--ink)" : "var(--ink3)" }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--line2)" }} />
          <span className="text-xs" style={{ color: "var(--ink3)" }}>공식 서비스 바로가기</span>
          <div className="flex-1 h-px" style={{ background: "var(--line2)" }} />
        </div>

        {/* 외부 링크 버튼들 */}
        <div className="flex flex-col gap-3">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-4 rounded-2xl"
              style={{
                background: link.primary ? "var(--ink)" : "var(--white)",
                border: `1px solid ${link.primary ? "var(--ink)" : "var(--line)"}`,
              }}
            >
              <div>
                <p className="text-base font-semibold" style={{ color: link.primary ? "var(--white)" : "var(--ink)" }}>
                  {link.label}
                </p>
                <p className="text-sm mt-0.5" style={{ color: link.primary ? "rgba(255,255,255,0.6)" : "var(--ink3)" }}>
                  {link.desc}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
                <path
                  d="M7 4L12 9L7 14"
                  stroke={link.primary ? "rgba(255,255,255,0.6)" : "var(--ink3)"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ))}
        </div>

        {/* 안내 */}
        <div className="px-4 py-4 rounded-2xl" style={{ background: "var(--ok-bg)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--ok-ink)" }}>투표소 안내</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ok-ink)" }}>
            정확한 투표소 위치는 5월 등록 마감 후 선관위 공식 홈페이지에서 확인할 수 있어요.
          </p>
        </div>
      </div>
    </main>
  );
}
