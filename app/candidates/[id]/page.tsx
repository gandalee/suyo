"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useBookmarks } from "@/src/hooks/useBookmarks";
import CandidateAvatar from "@/components/CandidateAvatar";

const TABS = [
  { key: "media", label: "뉴스 비교" },
  { key: "career", label: "경력" },
  { key: "pledge", label: "공약" },
  { key: "assets", label: "재산·병역" },
  { key: "criminal", label: "전과·소송" },
];

interface CandidateData {
  candidate: Record<string, string | number | null>;
  history: Array<{ kind: string; detail: string; period?: string; display_order: number }>;
  pledges: Array<{ title: string; detail: string; category: string }>;
  disclosure: Record<string, unknown> | null;
  news: Array<{ id: number; source: string; lean: string; title: string; url: string; published_at: string }>;
}

// ── 공유 버튼 컴포넌트 ─────────────────────────────────
function ShareButton({ id, name }: { id: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `https://suyo.kr/compare/${id}`;
    const title = `${name} 후보 언론 비교 | suyo.kr`;
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <>
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
      {copied && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
          style={{ background: "var(--ink)", color: "var(--white)", zIndex: 50 }}
        >
          링크가 복사됐어요!
        </div>
      )}
    </>
  );
}

// ── 탭별 컴포넌트 ─────────────────────────────────────

interface PledgeReviewData {
  articles: Array<{ title: string; description: string; url: string; pubDate: string }>;
}

function PledgeReviewSection({ candidateId }: { candidateId: string }) {
  const [data, setData] = useState<PledgeReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/pledge-review/${candidateId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const INITIAL = 3;
  const articles = data?.articles ?? [];
  const visible = expanded ? articles : articles.slice(0, INITIAL);

  return (
    <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--line)" }}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--ink3)" }}>
          공약 관련 뉴스
        </h3>
        {/* TODO: Anthropic API 키 추가 후 AI 요약 기능 활성화 */}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 px-4 py-4 rounded-2xl"
          style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
          <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "var(--ink3)" }}>뉴스 불러오는 중...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="px-4 py-4 rounded-2xl"
          style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
          <p className="text-sm" style={{ color: "var(--ink3)" }}>관련 뉴스가 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl flex flex-col gap-1"
              style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
              <p className="text-sm font-medium leading-snug" style={{ color: "var(--ink)" }}>{a.title}</p>
              {a.description && (
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--ink3)" }}>{a.description}</p>
              )}
              <p className="text-[10px] mt-0.5" style={{ color: "var(--ink3)" }}>
                {a.pubDate ? new Date(a.pubDate).toLocaleDateString("ko") : ""}
              </p>
            </a>
          ))}
          {articles.length > INITIAL && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="w-full py-2.5 text-sm font-medium"
              style={{ color: "var(--ink3)", borderTop: "1px solid var(--line)" }}
            >
              {expanded ? "접기" : `${articles.length - INITIAL}건 더 보기`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// 선관위 공약 원문 파싱 렌더러
// □ = 섹션 / ○ = 항목 / - = 세부항목
function PledgeDetail({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/ /g, " ").trim())
    .filter(Boolean);

  type Node =
    | { type: "section"; text: string }
    | { type: "item"; text: string }
    | { type: "sub"; text: string }
    | { type: "para"; text: string };

  const nodes: Node[] = lines.map((line) => {
    if (/^□/.test(line))  return { type: "section", text: line.replace(/^□\s*/, "") };
    if (/^○/.test(line))  return { type: "item",    text: line.replace(/^○\s*/, "") };
    if (/^[-•·]/.test(line)) return { type: "sub",  text: line.replace(/^[-•·]\s*/, "") };
    return { type: "para", text: line };
  });

  return (
    <div className="flex flex-col gap-2">
      {nodes.map((node, i) => {
        if (node.type === "section") return (
          <div key={i} className="mt-3 first:mt-0 pb-1" style={{ borderBottom: "1px solid var(--line2)" }}>
            <p className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--ink3)" }}>
              {node.text}
            </p>
          </div>
        );
        if (node.type === "item") return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: "var(--ink)" }} />
            <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--ink)" }}>{node.text}</p>
          </div>
        );
        if (node.type === "sub") return (
          <div key={i} className="flex gap-2 pl-4">
            <span className="flex-shrink-0 text-xs mt-0.5" style={{ color: "var(--ink3)" }}>–</span>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink2)" }}>{node.text}</p>
          </div>
        );
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--ink2)" }}>{node.text}</p>
        );
      })}
    </div>
  );
}

function PledgeTab({ pledges, candidateId }: { pledges: CandidateData["pledges"]; candidateId: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {/* 공약 목록 */}
      {pledges.length > 0 ? (
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--ink3)" }}>등록 공약</h3>
          {pledges.map((p, i) => {
            const isOpen = expanded === i;
            const hasDetail = !!p.detail?.trim();
            return (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                {/* 공약 제목 행 */}
                <button
                  className="w-full flex items-start gap-3 p-5 text-left"
                  onClick={() => hasDetail && setExpanded(isOpen ? null : i)}
                >
                  <div className="flex-1 min-w-0">
                    {p.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full mb-2 inline-block font-medium"
                        style={{ background: "var(--ok-bg)", color: "var(--ok-ink)" }}>
                        {p.category}
                      </span>
                    )}
                    <p className="text-base font-bold leading-snug" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>
                      {p.title}
                    </p>
                  </div>
                  {hasDetail && (
                    <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: "var(--ink3)" }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  )}
                </button>

                {/* 펼쳐진 상세 내용 */}
                {isOpen && hasDetail && (
                  <div className="px-5 pb-5 pt-0" style={{ borderTop: "1px solid var(--line)" }}>
                    <div className="pt-4">
                      <PledgeDetail text={p.detail} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-2">
          <EmptyState emoji="📋" text="등록 공약이 없어요" sub="" />
        </div>
      )}

      {/* 언론이 본 공약 이행 */}
      <PledgeReviewSection candidateId={candidateId} />
    </div>
  );
}

function CareerTab({ history, candidate }: { history: CandidateData["history"]; candidate: CandidateData["candidate"] }) {
  const education = history.filter((h) => h.kind === "education");
  const career = history.filter((h) => h.kind === "career");

  // DB에 상세 경력이 없으면 candidates 테이블의 요약 필드 사용
  const fallbackEdu = candidate.edu ? [String(candidate.edu)] : [];
  const fallbackCareer = [candidate.career1, candidate.career2].filter(Boolean).map(String);

  const eduItems = education.length > 0 ? education.map((e) => e.detail) : fallbackEdu;
  const careerItems = career.length > 0 ? career.map((c) => c.detail) : fallbackCareer;

  if (eduItems.length === 0 && careerItems.length === 0) {
    return <EmptyState emoji="💼" text="경력 정보가 없어요" sub="" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {eduItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink3)" }}>학력</h3>
          <div className="flex flex-col gap-2">
            {eduItems.map((text, i) => (
              <div key={i} className="px-5 py-4 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {careerItems.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink3)" }}>경력</h3>
          <div className="flex flex-col gap-2">
            {careerItems.map((text, i) => (
              <div key={i} className="px-5 py-4 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AssetsTab({ disclosure }: { disclosure: CandidateData["disclosure"] }) {
  if (!disclosure) {
    return <EmptyState emoji="🏦" text="재산·병역 정보가 없어요" sub="5월 15일 후보 등록 마감 후 업데이트돼요" />;
  }
  const d = disclosure as Record<string, unknown>;
  return (
    <div className="flex flex-col gap-3">
      {d.assets_total != null && (
        <div className="p-5 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
          <p className="text-sm" style={{ color: "var(--ink3)" }}>총 재산</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--ink)" }}>
            {Number(d.assets_total).toLocaleString()}만원
          </p>
        </div>
      )}
      {d.military != null && (
        <div className="p-5 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
          <p className="text-sm" style={{ color: "var(--ink3)" }}>병역</p>
          <p className="text-base mt-1" style={{ color: "var(--ink)" }}>{String(d.military)}</p>
        </div>
      )}
    </div>
  );
}

function CriminalTab({ disclosure, huboid }: { disclosure: CandidateData["disclosure"]; huboid: string }) {
  const necUrl = `https://info.nec.go.kr/electioninfo/candidate_detail_info.xhtml?electionId=0020260603&huboId=${huboid}`;

  if (!disclosure) {
    return (
      <div className="flex flex-col gap-3">
        <EmptyState emoji="⚖️" text="전과·소송 정보가 없어요" sub="5월 15일 후보 등록 마감 후 업데이트돼요" />
        <a href={necUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
          style={{ background: "var(--white)", border: "1px solid var(--line)", color: "var(--ink2)" }}>
          선관위에서 확인하기 →
        </a>
      </div>
    );
  }
  const d = disclosure as Record<string, unknown>;
  const criminal = String(d.criminal ?? "");
  const hasCriminal = criminal !== "없음" && criminal !== "" && criminal !== "null";
  return (
    <div className="flex flex-col gap-3">
      <div className="p-5 rounded-2xl" style={{ background: hasCriminal ? "var(--bad-bg)" : "var(--ok-bg)", border: "1px solid var(--line)" }}>
        <p className="text-sm" style={{ color: "var(--ink3)" }}>전과기록</p>
        <p className="text-lg font-bold mt-1" style={{ color: hasCriminal ? "var(--bad-ink)" : "var(--ok-ink)" }}>
          {criminal || "없음"}
        </p>
      </div>
      <a href={necUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
        style={{ background: "var(--white)", border: "1px solid var(--line)", color: "var(--ink2)" }}>
        선관위에서 상세 내용 확인하기 →
      </a>
    </div>
  );
}

const LEAN_LABEL: Record<string, { label: string; color: string; bg: string; outlets: string }> = {
  neutral:      { label: "공영·통신", color: "var(--ink2)",  bg: "var(--bg-page)",  outlets: "KBS·MBC·SBS·YTN·연합뉴스·뉴스1·뉴시스·이데일리·머니투데이·헤럴드경제·서울신문 등" },
  conservative: { label: "보수",      color: "#1a3a7a",      bg: "#EEF2FF",         outlets: "조선일보·중앙일보·동아일보·TV조선·채널A·MBN·문화일보·한국경제·매일경제·서울경제·국민일보 등" },
  progressive:  { label: "진보",      color: "#7a1a1a",      bg: "#FFF0F0",         outlets: "한겨레·경향신문·오마이뉴스·한국일보·프레시안·노컷뉴스·미디어오늘·시사IN 등" },
  other:        { label: "기타 언론", color: "var(--ink3)",  bg: "var(--white)",    outlets: "위 분류에 포함되지 않은 언론사" },
};

interface NaverNewsItem {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  source: string;
  lean: string;
  label: string;
}

const INITIAL_COUNT = 5;

function NewsCard({ n }: { n: NaverNewsItem }) {
  return (
    <a href={n.url} target="_blank" rel="noopener noreferrer"
      className="flex flex-col gap-1 px-3 py-3 rounded-xl"
      style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
      <p className="text-xs font-medium leading-snug" style={{ color: "var(--ink)" }}>{n.title}</p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--ink3)" }}>
        {n.label || n.source} · {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("ko") : ""}
      </p>
    </a>
  );
}

function LeanColumn({
  lean, items,
}: {
  lean: "conservative" | "progressive";
  items: NaverNewsItem[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [showOutlets, setShowOutlets] = useState(false);
  const meta = LEAN_LABEL[lean];
  const visible = expanded ? items : items.slice(0, INITIAL_COUNT);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0 p-3 rounded-2xl" style={{ background: meta.bg }}>
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.08)", color: meta.color }}>{items.length}</span>
        <button onClick={() => setShowOutlets((p) => !p)} className="ml-auto text-[10px]" style={{ color: meta.color, opacity: 0.7 }}>
          {showOutlets ? "닫기" : "기준"}
        </button>
      </div>
      {showOutlets && (
        <p className="text-[10px] leading-relaxed" style={{ color: meta.color, opacity: 0.8 }}>{meta.outlets}</p>
      )}
      {/* 기사 */}
      {visible.map((n, i) => <NewsCard key={i} n={n} />)}
      {items.length > INITIAL_COUNT && (
        <button onClick={() => setExpanded((p) => !p)} className="text-[10px] py-1 font-medium" style={{ color: meta.color, opacity: 0.8 }}>
          {expanded ? "접기" : `${items.length - INITIAL_COUNT}건 더 보기`}
        </button>
      )}
    </div>
  );
}

function MediaTab({ candidateId }: { candidateId: string }) {
  const [news, setNews] = useState<NaverNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [neutralExpanded, setNeutralExpanded] = useState(false);
  const [neutralOutlets, setNeutralOutlets] = useState(false);
  const [otherExpanded, setOtherExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/news/${candidateId}`)
      .then((r) => r.json())
      .then((d) => setNews(d.items ?? []))
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (news.length === 0) {
    return <EmptyState emoji="📰" text="관련 뉴스가 없어요" sub="네이버 뉴스 기준으로 표시해요" />;
  }

  const grouped = news.reduce<Record<string, NaverNewsItem[]>>((acc, item) => {
    const key = item.lean || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const neutral = grouped.neutral ?? [];
  const conservative = grouped.conservative ?? [];
  const progressive = grouped.progressive ?? [];
  const other = grouped.other ?? [];
  const neutralVisible = neutralExpanded ? neutral : neutral.slice(0, INITIAL_COUNT);
  const otherVisible = otherExpanded ? other : other.slice(0, INITIAL_COUNT);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs" style={{ color: "var(--ink3)" }}>
        같은 후보를 언론사별로 어떻게 다르게 보도하는지 비교해요
      </p>

      {/* 보수 / 진보 — 최상단 2열 */}
      {(conservative.length > 0 || progressive.length > 0) && (
        <div className="flex gap-3">
          {conservative.length > 0 && <LeanColumn lean="conservative" items={conservative} />}
          {progressive.length > 0 && <LeanColumn lean="progressive" items={progressive} />}
        </div>
      )}

      {/* 공영·통신 */}
      {neutral.length > 0 && (
        <section className="p-4 rounded-2xl" style={{ background: LEAN_LABEL.neutral.bg, border: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold" style={{ color: LEAN_LABEL.neutral.color }}>공영·통신</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--line2)", color: "var(--ink3)" }}>{neutral.length}</span>
            <button onClick={() => setNeutralOutlets((p) => !p)} className="ml-auto text-xs" style={{ color: "var(--ink3)" }}>
              {neutralOutlets ? "닫기" : "분류 기준"}
            </button>
          </div>
          {neutralOutlets && (
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--ink3)" }}>{LEAN_LABEL.neutral.outlets}</p>
          )}
          <div className="flex flex-col gap-2">
            {neutralVisible.map((n, i) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-1 px-4 py-3 rounded-xl"
                style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--ink)" }}>{n.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
                  {n.label || n.source} · {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("ko") : ""}
                </p>
              </a>
            ))}
          </div>
          {neutral.length > INITIAL_COUNT && (
            <button onClick={() => setNeutralExpanded((p) => !p)}
              className="w-full mt-2 py-2 text-sm font-medium"
              style={{ color: "var(--ink3)", borderTop: "1px solid var(--line)" }}>
              {neutralExpanded ? "접기" : `${neutral.length - INITIAL_COUNT}건 더 보기`}
            </button>
          )}
        </section>
      )}

      {/* 기타 언론 */}
      {other.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold" style={{ color: "var(--ink3)" }}>기타 언론</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--line2)", color: "var(--ink3)" }}>{other.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {otherVisible.map((n, i) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-1 px-4 py-3 rounded-xl"
                style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--ink)" }}>{n.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
                  {n.label || n.source} · {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("ko") : ""}
                </p>
              </a>
            ))}
          </div>
          {other.length > INITIAL_COUNT && (
            <button onClick={() => setOtherExpanded((p) => !p)}
              className="w-full mt-2 py-2 text-sm font-medium"
              style={{ color: "var(--ink3)", borderTop: "1px solid var(--line)" }}>
              {otherExpanded ? "접기" : `${other.length - INITIAL_COUNT}건 더 보기`}
            </button>
          )}
        </section>
      )}

      {/* 전체 비교 보기 버튼 */}
      <a
        href={`/compare/${candidateId}`}
        className="flex items-center justify-center w-full py-3 rounded-2xl text-sm font-semibold"
        style={{ background: "var(--ink)", color: "var(--white)" }}
      >
        전체 비교 보기 →
      </a>

      {/* 미디어 리터러시 안내 */}
      <div className="px-4 py-4 rounded-2xl" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "#92400E" }}>미디어 리터러시</p>
        <p className="text-xs leading-relaxed" style={{ color: "#78350F" }}>
          같은 사실도 언론에 따라 다르게 보도됩니다. Suyo는 어느 쪽이 옳다고 판단하지 않습니다. 다양한 시각을 비교하며 스스로 판단해 보세요.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ emoji, text, sub }: { emoji: string; text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <span className="text-4xl">{emoji}</span>
      <p className="text-base font-medium text-center" style={{ color: "var(--ink)" }}>{text}</p>
      {sub && <p className="text-sm text-center" style={{ color: "var(--ink3)" }}>{sub}</p>}
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("media");
  const [data, setData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggle } = useBookmarks();

  useEffect(() => {
    fetch(`/api/candidate/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  const c = data?.candidate;

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-5"
        style={{ borderBottom: "1px solid var(--line)" }}>
        <button onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
          style={{ background: "var(--white)", border: "1px solid var(--line2)" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9L11 4" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--ink3)" }}>{String(c?.party ?? "")}</p>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {loading ? "불러오는 중..." : String(c?.name ?? "")}
          </h1>
        </div>
        {/* 북마크 버튼 */}
        {!loading && c && (
          <button
            onClick={() => toggle({
              huboid: id,
              name: String(c.name ?? ""),
              party: String(c.party ?? ""),
              giho: String(c.symbol ?? ""),
              sggName: String(c.sgg_name ?? c.party ?? ""),
              electionName: "",
            })}
            className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
            style={{
              background: isBookmarked(id) ? "var(--ink)" : "var(--white)",
              border: `1px solid ${isBookmarked(id) ? "var(--ink)" : "var(--line2)"}`,
            }}
            aria-label={isBookmarked(id) ? "북마크 해제" : "북마크 저장"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 2.5C3 2.22386 3.22386 2 3.5 2H12.5C12.7761 2 13 2.22386 13 2.5V14L8 11L3 14V2.5Z"
                fill={isBookmarked(id) ? "white" : "none"}
                stroke={isBookmarked(id) ? "white" : "var(--ink3)"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {/* 공유하기 버튼 */}
        {!loading && c && (
          <ShareButton id={id} name={String(c.name ?? "")} />
        )}
      </header>

      {!loading && c && (
        <>
          {/* 후보자 프로필 */}
          <section className="px-5 py-6" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
            <div className="flex items-center gap-4">
              {/* 아바타 */}
              <div className="flex-shrink-0 relative">
                <CandidateAvatar name={String(c.name ?? "")} photoUrl={c.photo_url ? String(c.photo_url) : null} size={72} />
                <div style={{
                  position: "absolute", bottom: -2, right: -2,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--ink)", color: "var(--white)",
                  fontSize: 10, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1.5px solid var(--white)",
                }}>
                  {String(c.symbol ?? "")}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-xl font-bold" style={{ color: "var(--ink)" }}>{String(c.name ?? "")}</span>
                <p className="text-sm" style={{ color: "var(--ink2)" }}>{String(c.party ?? "")}</p>
                {/* 스펙 태그 */}
                <div className="flex gap-1.5 flex-wrap">
                  {c.age && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--bg-page)", color: "var(--ink2)" }}>
                      {String(c.age)}세
                    </span>
                  )}
                  {c.gender && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--bg-page)", color: "var(--ink2)" }}>
                      {c.gender === "M" ? "남" : "여"}
                    </span>
                  )}
                  {c.job && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--accent-bg)", color: "var(--ink)" }}>
                      {String(c.job)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 공유 버튼 (compare 페이지 URL 공유) */}
            <button
              onClick={() => {
                const url = `https://suyo.kr/compare/${id}`;
                const text = `${String(c.name)} 후보 언론 비교 | suyo.kr`;
                if (navigator.share) {
                  navigator.share({ title: text, url });
                } else {
                  navigator.clipboard.writeText(url).then(() => alert("링크가 복사됐어요!"));
                }
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium self-start"
              style={{ background: "var(--bg-page)", color: "var(--ink2)", border: "1px solid var(--line)" }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="12" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="12" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="3" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10.5 3.5L4.5 6.5M4.5 8.5L10.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              공유하기
            </button>
          </section>

          {/* 탭 */}
          <div className="flex overflow-x-auto px-5 pt-4 pb-0 gap-1"
            style={{ borderBottom: "1px solid var(--line)" }}>
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab.key ? "var(--ink)" : "var(--ink3)",
                  borderBottom: activeTab === tab.key ? "2px solid var(--ink)" : "2px solid transparent",
                  marginBottom: -1,
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="px-5 py-6 flex-1">
            {activeTab === "pledge" && <PledgeTab pledges={data?.pledges ?? []} candidateId={id} />}
            {activeTab === "career" && <CareerTab history={data?.history ?? []} candidate={data?.candidate ?? {}} />}
            {activeTab === "assets" && <AssetsTab disclosure={data?.disclosure ?? null} />}
            {activeTab === "criminal" && <CriminalTab disclosure={data?.disclosure ?? null} huboid={id} />}
            {activeTab === "media" && <MediaTab candidateId={id} />}
          </div>
        </>
      )}
    </main>
  );
}
