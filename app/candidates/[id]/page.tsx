"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

const TABS = [
  { key: "pledge", label: "공약" },
  { key: "career", label: "경력" },
  { key: "assets", label: "재산·병역" },
  { key: "criminal", label: "전과·소송" },
  { key: "media", label: "미디어렌즈" },
];

interface CandidateData {
  candidate: Record<string, string | number | null>;
  history: Array<{ kind: string; detail: string; period?: string; display_order: number }>;
  pledges: Array<{ title: string; detail: string; category: string }>;
  disclosure: Record<string, unknown> | null;
  news: Array<{ id: number; source: string; lean: string; title: string; url: string; published_at: string }>;
}

// ── 탭별 컴포넌트 ─────────────────────────────────────

function PledgeTab({ pledges }: { pledges: CandidateData["pledges"] }) {
  if (pledges.length === 0) {
    return <EmptyState emoji="📋" text="공약 정보가 아직 없어요" sub="5월 15일 후보 등록 마감 후 업데이트돼요" />;
  }
  return (
    <div className="flex flex-col gap-3">
      {pledges.map((p, i) => (
        <div key={i} className="p-5 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
          {p.category && <span className="text-xs px-2 py-1 rounded-full mb-2 inline-block" style={{ background: "var(--ok-bg)", color: "var(--ok-ink)" }}>{p.category}</span>}
          <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>{p.title}</p>
          {p.detail && <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink2)" }}>{p.detail}</p>}
        </div>
      ))}
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

function CriminalTab({ disclosure }: { disclosure: CandidateData["disclosure"] }) {
  if (!disclosure) {
    return <EmptyState emoji="⚖️" text="전과·소송 정보가 없어요" sub="5월 15일 후보 등록 마감 후 업데이트돼요" />;
  }
  const d = disclosure as Record<string, unknown>;
  const hasCriminal = Boolean(d.criminal && JSON.stringify(d.criminal) !== "[]");
  return (
    <div className="flex flex-col gap-3">
      <div className="p-5 rounded-2xl" style={{ background: hasCriminal ? "var(--bad-bg)" : "var(--ok-bg)", border: "1px solid var(--line)" }}>
        <p className="text-sm font-semibold" style={{ color: hasCriminal ? "var(--bad-ink)" : "var(--ok-ink)" }}>
          {hasCriminal ? "전과 기록 있음" : "전과 없음"}
        </p>
        {hasCriminal && (
          <pre className="text-xs mt-2 whitespace-pre-wrap" style={{ color: "var(--bad-ink)" }}>
            {JSON.stringify(d.criminal as object, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

const LEAN_LABEL: Record<string, { label: string; color: string; outlets: string }> = {
  neutral:      { label: "공영·통신", color: "var(--ink2)", outlets: "KBS·MBC·SBS·YTN·연합뉴스·뉴스1·뉴시스·이데일리·머니투데이·헤럴드경제·서울신문 등" },
  conservative: { label: "보수",     color: "#1a3a7a",     outlets: "조선일보·중앙일보·동아일보·TV조선·채널A·MBN·문화일보·한국경제·매일경제·서울경제·국민일보 등" },
  progressive:  { label: "진보",     color: "#7a1a1a",     outlets: "한겨레·경향신문·오마이뉴스·한국일보·프레시안·노컷뉴스·미디어오늘·시사IN 등" },
  other:        { label: "기타 언론", color: "var(--ink3)", outlets: "위 분류에 포함되지 않은 언론사" },
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

function MediaTab({ candidateId }: { candidateId: string }) {
  const [news, setNews] = useState<NaverNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [showOutlets, setShowOutlets] = useState<Record<string, boolean>>({});

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
          style={{ borderColor: "var(--green-dark)", borderTopColor: "transparent" }} />
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

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs" style={{ color: "var(--ink3)" }}>
        같은 후보를 언론사별로 어떻게 다르게 보도하는지 비교해요
      </p>
      {(["neutral", "conservative", "progressive", "other"] as const).map((lean) => {
        const items = grouped[lean];
        if (!items?.length) return null;
        const meta = LEAN_LABEL[lean];
        const expanded = showMore[lean];
        const visible = expanded ? items : items.slice(0, INITIAL_COUNT);

        return (
          <section key={lean}>
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--line2)", color: "var(--ink3)" }}>{items.length}</span>
              <button
                onClick={() => setShowOutlets((p) => ({ ...p, [lean]: !p[lean] }))}
                className="text-xs ml-auto"
                style={{ color: "var(--ink3)" }}
              >
                {showOutlets[lean] ? "닫기" : "분류 기준"}
              </button>
            </div>

            {/* 언론사 분류 기준 */}
            {showOutlets[lean] && (
              <p className="text-xs mb-3 leading-relaxed px-1" style={{ color: "var(--ink3)" }}>
                {meta.outlets}
              </p>
            )}

            {/* 기사 목록 */}
            <div className="flex flex-col gap-2">
              {visible.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col gap-1 px-4 py-4 rounded-2xl"
                  style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                  <p className="text-sm font-medium leading-snug" style={{ color: "var(--ink)" }}>{n.title}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--ink3)" }}>
                    {n.label || n.source} · {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("ko") : ""}
                  </p>
                </a>
              ))}
            </div>

            {/* 더 보기 */}
            {items.length > INITIAL_COUNT && (
              <button
                onClick={() => setShowMore((p) => ({ ...p, [lean]: !p[lean] }))}
                className="w-full mt-2 py-3 text-sm font-medium"
                style={{ color: "var(--ink3)", borderTop: "1px solid var(--line)" }}
              >
                {expanded ? "접기" : `${items.length - INITIAL_COUNT}건 더 보기`}
              </button>
            )}
          </section>
        );
      })}
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
  const [activeTab, setActiveTab] = useState("pledge");
  const [data, setData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div>
          <p className="text-xs" style={{ color: "var(--ink3)" }}>{String(c?.party ?? "")}</p>
          <h1 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {loading ? "불러오는 중..." : String(c?.name ?? "")}
          </h1>
        </div>
      </header>

      {!loading && c && (
        <>
          {/* 후보자 프로필 */}
          <section className="px-5 py-6" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
            <div className="flex items-center gap-4">
              {/* 아바타 */}
              <div
                className="flex-shrink-0 flex flex-col items-center justify-center"
                style={{ width: 72, height: 72, borderRadius: 20, background: "var(--green)" }}
              >
                <span className="text-3xl font-black leading-none" style={{ color: "var(--ink)" }}>
                  {String(c.name ?? "")[0]}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: "var(--ink2)" }}>
                  기호 {String(c.symbol ?? "")}
                </span>
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
                      style={{ background: "var(--green)", color: "var(--ink)" }}>
                      {String(c.job)}
                    </span>
                  )}
                </div>
              </div>
            </div>
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
            {activeTab === "pledge" && <PledgeTab pledges={data?.pledges ?? []} />}
            {activeTab === "career" && <CareerTab history={data?.history ?? []} candidate={data?.candidate ?? {}} />}
            {activeTab === "assets" && <AssetsTab disclosure={data?.disclosure ?? null} />}
            {activeTab === "criminal" && <CriminalTab disclosure={data?.disclosure ?? null} />}
            {activeTab === "media" && <MediaTab candidateId={id} />}
          </div>
        </>
      )}
    </main>
  );
}
