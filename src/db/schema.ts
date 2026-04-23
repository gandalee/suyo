import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  smallint,
  bigint,
  boolean,
  date,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  sgId: varchar("sg_id", { length: 20 }).notNull(),
  sgTypeCode: varchar("sg_type_code", { length: 5 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  electionDate: date("election_date").notNull(),
  sido: varchar("sido", { length: 30 }),
  sigungu: varchar("sigungu", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const candidates = pgTable(
  "candidates",
  {
    id: serial("id").primaryKey(),
    electionId: integer("election_id").references(() => elections.id),
    externalId: varchar("external_id", { length: 50 }),
    symbol: varchar("symbol", { length: 10 }),
    name: varchar("name", { length: 50 }).notNull(),
    nameHanja: varchar("name_hanja", { length: 50 }),
    age: integer("age"),
    gender: varchar("gender", { length: 1 }),
    party: varchar("party", { length: 50 }),
    partyLabel: varchar("party_label", { length: 50 }),
    oneLiner: text("one_liner"),
    photoUrl: text("photo_url"),
    job: text("job"),
    status: varchar("status", { length: 20 }).default("active"),
    registeredAt: timestamp("registered_at", { withTimezone: true }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  },
  (t) => [
    index("candidates_election_id_idx").on(t.electionId),
    index("candidates_status_idx").on(t.status),
    unique("candidates_election_external_unique").on(t.electionId, t.externalId),
  ]
);

export const candidateHistory = pgTable("candidate_history", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").references(() => candidates.id, {
    onDelete: "cascade",
  }),
  kind: varchar("kind", { length: 20 }).notNull(),
  period: varchar("period", { length: 50 }),
  detail: text("detail"),
  displayOrder: integer("display_order"),
});

export const pledges = pgTable("pledges", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").references(() => candidates.id, {
    onDelete: "cascade",
  }),
  category: varchar("category", { length: 50 }),
  title: text("title").notNull(),
  detail: text("detail"),
  tags: text("tags").array(),
  displayOrder: integer("display_order"),
});

export const candidateDisclosure = pgTable("candidate_disclosure", {
  candidateId: integer("candidate_id")
    .primaryKey()
    .references(() => candidates.id, { onDelete: "cascade" }),
  assetsTotal: bigint("assets_total", { mode: "number" }),
  assetsBreakdown: jsonb("assets_breakdown"),
  taxPaid5y: bigint("tax_paid_5y", { mode: "number" }),
  taxDelinquent: bigint("tax_delinquent", { mode: "number" }).default(0),
  military: text("military"),
  criminal: jsonb("criminal"),
  lawsuits: jsonb("lawsuits"),
  crawledAt: timestamp("crawled_at", { withTimezone: true }),
});

export const candidateNews = pgTable(
  "candidate_news",
  {
    id: serial("id").primaryKey(),
    candidateId: integer("candidate_id").references(() => candidates.id, {
      onDelete: "cascade",
    }),
    source: varchar("source", { length: 50 }).notNull(),
    tier: smallint("tier").notNull(),
    lean: varchar("lean", { length: 10 }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("candidate_news_published_idx").on(t.candidateId, t.publishedAt),
    unique("candidate_news_url_unique").on(t.candidateId, t.url),
  ]
);

export const districts = pgTable(
  "districts",
  {
    id: serial("id").primaryKey(),
    sido: varchar("sido", { length: 30 }).notNull(),
    sigungu: varchar("sigungu", { length: 50 }).notNull(),
    electionId: integer("election_id").references(() => elections.id),
  },
  (t) => [index("districts_sido_sigungu_idx").on(t.sido, t.sigungu)]
);
