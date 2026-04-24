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
    return <EmptyState emoji="📋" text="공약 정보가 아직 없어요" sub="선관위 공약 데이터 연동 후 업데이트돼요" />;
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

function CareerTab({ history }: { history: CandidateData["history"] }) {
  const education = history.filter((h) => h.kind === "education");
  const career = history.filter((h) => h.kind === "career");

  if (history.length === 0) {
    return <EmptyState emoji="💼" text="경력 정보가 없어요" sub="" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {education.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink3)" }}>학력</h3>
          <div className="flex flex-col gap-2">
            {education.map((e, i) => (
              <div key={i} className="flex gap-3 px-5 py-4 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                <span className="text-base">🎓</span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{e.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {career.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink3)" }}>경력</h3>
          <div className="flex flex-col gap-2">
            {career.map((c, i) => (
              <div key={i} className="flex gap-3 px-5 py-4 rounded-2xl" style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                <span className="text-base">💼</span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{c.detail}</p>
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
    return <EmptyState emoji="🏦" text="재산·병역 정보가 없어요" sub="info.nec.go.kr 크롤링 연동 후 업데이트돼요" />;
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
    return <EmptyState emoji="⚖️" text="전과·소송 정보가 없어요" sub="info.nec.go.kr 크롤링 연동 후 업데이트돼요" />;
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

const LEAN_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  neutral: { label: "공영·통신", color: "#333", bg: "#F0F0F0" },
  conservative: { label: "보수", color: "#1a3a7a", bg: "#E8EEF8" },
  progressive: { label: "진보", color: "#7a1a1a", bg: "#F8E8E8" },
};

function MediaTab({ news }: { news: CandidateData["news"] }) {
  if (news.length === 0) {
    return <EmptyState emoji="📰" text="관련 뉴스가 없어요" sub="네이버 뉴스 API 연동 후 업데이트돼요" />;
  }
  const grouped = news.reduce<Record<string, typeof news>>((acc, item) => {
    const key = item.lean || "neutral";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {(["neutral", "conservative", "progressive"] as const).map((lean) => {
        const items = grouped[lean];
        if (!items?.length) return null;
        const meta = LEAN_LABEL[lean];
        return (
          <section key={lean}>
            <span className="text-xs px-2 py-1 rounded-full inline-block mb-3 font-medium"
              style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            <div className="flex flex-col gap-2">
              {items.map((n) => (
                <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col gap-1 px-4 py-4 rounded-2xl"
                  style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
                  <p className="text-sm font-medium leading-snug" style={{ color: "var(--ink)" }}>{n.title}</p>
                  <p className="text-xs" style={{ color: "var(--ink3)" }}>
                    {n.source} · {n.published_at ? new Date(n.published_at).toLocaleDateString("ko") : ""}
                  </p>
                </a>
              ))}
            </div>
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{ background: "var(--bg-page)", color: "var(--ink2)" }}>
                {String(c.name ?? "")[0]}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: "var(--ink)" }}>{String(c.name ?? "")}</span>
                  <span className="text-sm px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--bg-page)", color: "var(--ink2)" }}>
                    기호 {String(c.symbol ?? "")}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink2)" }}>{String(c.party ?? "")}</p>
                <p className="text-sm" style={{ color: "var(--ink3)" }}>
                  {String(c.gender === "M" ? "남" : "여")} · {String(c.age ?? "")}세 · {String(c.job ?? "")}
                </p>
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
            {activeTab === "career" && <CareerTab history={data?.history ?? []} />}
            {activeTab === "assets" && <AssetsTab disclosure={data?.disclosure ?? null} />}
            {activeTab === "criminal" && <CriminalTab disclosure={data?.disclosure ?? null} />}
            {activeTab === "media" && <MediaTab news={data?.news ?? []} />}
          </div>
        </>
      )}
    </main>
  );
}
