"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

interface NewsItem {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  source: string;
  lean: string | null;
  label: string | null;
}

interface NewsResponse {
  candidateName: string;
  items: NewsItem[];
}

const LEAN_LABEL: Record<
  string,
  { label: string; color: string; bg: string; outlets: string }
> = {
  neutral: {
    label: "공영·통신",
    color: "var(--ink2)",
    bg: "var(--bg-page)",
    outlets:
      "KBS·MBC·SBS·YTN·연합뉴스·뉴스1·뉴시스·이데일리·머니투데이·헤럴드경제·서울신문 등",
  },
  conservative: {
    label: "보수 언론",
    color: "#1a3a7a",
    bg: "#EEF2FF",
    outlets:
      "조선일보·중앙일보·동아일보·TV조선·채널A·MBN·문화일보·한국경제·매일경제·서울경제·국민일보 등",
  },
  progressive: {
    label: "진보 언론",
    color: "#7a1a1a",
    bg: "#FFF0F0",
    outlets:
      "한겨레·경향신문·오마이뉴스·한국일보·프레시안·노컷뉴스·미디어오늘·시사IN 등",
  },
  other: {
    label: "기타 언론",
    color: "var(--ink3)",
    bg: "var(--white)",
    outlets: "위 분류에 포함되지 않은 언론사",
  },
};

function NewsCard({ n }: { n: NewsItem }) {
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-1 px-3 py-3 rounded-xl"
      style={{ background: "var(--white)", border: "1px solid var(--line)" }}
    >
      <p
        className="text-xs font-medium leading-snug"
        style={{ color: "var(--ink)" }}
      >
        {n.title}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--ink3)" }}>
        {n.label || n.source} ·{" "}
        {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("ko") : ""}
      </p>
    </a>
  );
}

function LeanColumn({
  lean,
  items,
}: {
  lean: "conservative" | "progressive";
  items: NewsItem[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [showOutlets, setShowOutlets] = useState(false);
  const meta = LEAN_LABEL[lean];
  const INITIAL = 5;
  const visible = expanded ? items : items.slice(0, INITIAL);

  return (
    <div
      className="flex flex-col gap-2 flex-1 min-w-0 p-3 rounded-2xl"
      style={{ background: meta.bg }}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-bold" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.08)", color: meta.color }}
        >
          {items.length}
        </span>
        <button
          onClick={() => setShowOutlets((p) => !p)}
          className="ml-auto text-[10px]"
          style={{ color: meta.color, opacity: 0.7 }}
        >
          {showOutlets ? "닫기" : "기준"}
        </button>
      </div>
      {showOutlets && (
        <p
          className="text-[10px] leading-relaxed"
          style={{ color: meta.color, opacity: 0.8 }}
        >
          {meta.outlets}
        </p>
      )}
      {visible.map((n, i) => (
        <NewsCard key={i} n={n} />
      ))}
      {items.length > INITIAL && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-[10px] py-1 font-medium"
          style={{ color: meta.color, opacity: 0.8 }}
        >
          {expanded ? "접기" : `${items.length - INITIAL}건 더 보기`}
        </button>
      )}
    </div>
  );
}

export default function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<NewsResponse | null>(null);
  const [candidateMeta, setCandidateMeta] = useState<{
    name: string;
    party: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [neutralExpanded, setNeutralExpanded] = useState(false);
  const [neutralOutlets, setNeutralOutlets] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/candidate/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.candidate) {
          setCandidateMeta({
            name: String(d.candidate.name ?? ""),
            party: String(d.candidate.party ?? ""),
          });
        }
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    const url = `https://suyo.kr/compare/${id}`;
    const title = candidateMeta
      ? `${candidateMeta.name} 후보 언론 비교 | suyo.kr`
      : "후보 언론 비교 | suyo.kr";
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const items = data?.items ?? [];
  const INITIAL_NEUTRAL = 5;

  const grouped = items.reduce<Record<string, NewsItem[]>>((acc, item) => {
    const key = item.lean || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const neutral = grouped.neutral ?? [];
  const conservative = grouped.conservative ?? [];
  const progressive = grouped.progressive ?? [];
  const neutralVisible = neutralExpanded
    ? neutral
    : neutral.slice(0, INITIAL_NEUTRAL);

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
        <div className="flex-1">
          {candidateMeta && (
            <p className="text-xs" style={{ color: "var(--ink3)" }}>
              {candidateMeta.party}
            </p>
          )}
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {candidateMeta ? `${candidateMeta.name} 후보` : "언론 비교"}
          </h1>
        </div>
        {/* 공유하기 버튼 */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
          style={{ background: "var(--white)", border: "1px solid var(--line2)" }}
          aria-label="공유하기"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="var(--accent)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2V10M8 2L5 5M8 2L11 5"
                stroke="var(--ink)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 11V13H13V11"
                stroke="var(--ink)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </header>

      <div className="px-5 py-6 flex flex-col gap-5">
        {/* 설명 텍스트 */}
        <div>
          <p
            className="text-base font-semibold"
            style={{ color: "var(--ink)" }}
          >
            같은 후보, 언론은 이렇게 다르게 봅니다
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--ink3)" }}>
            보수·진보·공영 언론의 보도를 나란히 비교해보세요
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{
                borderColor: "var(--accent)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex flex-col items-center py-16 gap-3"
            style={{ color: "var(--ink3)" }}
          >
            <span className="text-4xl">📰</span>
            <p className="text-base font-medium" style={{ color: "var(--ink)" }}>
              관련 뉴스가 없어요
            </p>
            <p className="text-sm" style={{ color: "var(--ink3)" }}>
              네이버 뉴스 기준으로 표시해요
            </p>
          </div>
        ) : (
          <>
            {/* 공영·통신 — 전체 폭 */}
            {neutral.length > 0 && (
              <section
                className="p-4 rounded-2xl"
                style={{
                  background: LEAN_LABEL.neutral.bg,
                  border: "1px solid var(--line)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-sm font-bold"
                    style={{ color: LEAN_LABEL.neutral.color }}
                  >
                    공영·통신
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.08)",
                      color: LEAN_LABEL.neutral.color,
                    }}
                  >
                    {neutral.length}
                  </span>
                  <button
                    onClick={() => setNeutralOutlets((p) => !p)}
                    className="ml-auto text-xs"
                    style={{ color: "var(--ink3)" }}
                  >
                    {neutralOutlets ? "닫기" : "분류 기준"}
                  </button>
                </div>
                {neutralOutlets && (
                  <p
                    className="text-xs mb-3 leading-relaxed"
                    style={{ color: "var(--ink3)" }}
                  >
                    {LEAN_LABEL.neutral.outlets}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {neutralVisible.map((n, i) => (
                    <a
                      key={i}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 px-4 py-3 rounded-xl"
                      style={{
                        background: "var(--white)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <p
                        className="text-sm font-medium leading-snug"
                        style={{ color: "var(--ink)" }}
                      >
                        {n.title}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--ink3)" }}
                      >
                        {n.label || n.source} ·{" "}
                        {n.publishedAt
                          ? new Date(n.publishedAt).toLocaleDateString("ko")
                          : ""}
                      </p>
                    </a>
                  ))}
                </div>
                {neutral.length > INITIAL_NEUTRAL && (
                  <button
                    onClick={() => setNeutralExpanded((p) => !p)}
                    className="w-full mt-2 py-2 text-sm font-medium"
                    style={{
                      color: "var(--ink3)",
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    {neutralExpanded
                      ? "접기"
                      : `${neutral.length - INITIAL_NEUTRAL}건 더 보기`}
                  </button>
                )}
              </section>
            )}

            {/* 보수 / 진보 — 2열 나란히 */}
            {(conservative.length > 0 || progressive.length > 0) && (
              <div className="flex gap-3">
                {conservative.length > 0 && (
                  <LeanColumn lean="conservative" items={conservative} />
                )}
                {progressive.length > 0 && (
                  <LeanColumn lean="progressive" items={progressive} />
                )}
              </div>
            )}

            {/* 미디어 리터러시 안내 */}
            <div
              className="px-4 py-4 rounded-2xl"
              style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#92400E" }}
              >
                미디어 리터러시
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#78350F" }}
              >
                같은 사실도 언론에 따라 다르게 보도됩니다. Suyo는 어느 쪽이
                옳다고 판단하지 않습니다. 다양한 시각을 비교하며 스스로 판단해
                보세요.
              </p>
            </div>
          </>
        )}
      </div>

      {/* 복사 완료 토스트 */}
      {copied && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
          style={{
            background: "var(--ink)",
            color: "var(--white)",
            zIndex: 50,
          }}
        >
          링크가 복사됐어요!
        </div>
      )}
    </main>
  );
}
