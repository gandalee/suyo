CREATE TABLE "candidate_disclosure" (
	"candidate_id" integer PRIMARY KEY NOT NULL,
	"assets_total" bigint,
	"assets_breakdown" jsonb,
	"tax_paid_5y" bigint,
	"tax_delinquent" bigint DEFAULT 0,
	"military" text,
	"criminal" jsonb,
	"lawsuits" jsonb,
	"crawled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "candidate_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"kind" varchar(20) NOT NULL,
	"period" varchar(50),
	"detail" text,
	"display_order" integer
);
--> statement-breakpoint
CREATE TABLE "candidate_news" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"source" varchar(50) NOT NULL,
	"tier" smallint NOT NULL,
	"lean" varchar(10),
	"title" text NOT NULL,
	"url" text NOT NULL,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "candidate_news_url_unique" UNIQUE("candidate_id","url")
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"election_id" integer,
	"external_id" varchar(50),
	"symbol" varchar(10),
	"name" varchar(50) NOT NULL,
	"name_hanja" varchar(50),
	"age" integer,
	"gender" varchar(1),
	"party" varchar(50),
	"party_label" varchar(50),
	"one_liner" text,
	"photo_url" text,
	"job" text,
	"status" varchar(20) DEFAULT 'active',
	"registered_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	CONSTRAINT "candidates_election_external_unique" UNIQUE("election_id","external_id")
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"sido" varchar(30) NOT NULL,
	"sigungu" varchar(50) NOT NULL,
	"election_id" integer
);
--> statement-breakpoint
CREATE TABLE "elections" (
	"id" serial PRIMARY KEY NOT NULL,
	"sg_id" varchar(20) NOT NULL,
	"sg_type_code" varchar(5) NOT NULL,
	"name" varchar(100) NOT NULL,
	"election_date" date NOT NULL,
	"sido" varchar(30),
	"sigungu" varchar(50),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pledges" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"category" varchar(50),
	"title" text NOT NULL,
	"detail" text,
	"tags" text[],
	"display_order" integer
);
--> statement-breakpoint
ALTER TABLE "candidate_disclosure" ADD CONSTRAINT "candidate_disclosure_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_history" ADD CONSTRAINT "candidate_history_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_news" ADD CONSTRAINT "candidate_news_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidate_news_published_idx" ON "candidate_news" USING btree ("candidate_id","published_at");--> statement-breakpoint
CREATE INDEX "candidates_election_id_idx" ON "candidates" USING btree ("election_id");--> statement-breakpoint
CREATE INDEX "candidates_status_idx" ON "candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "districts_sido_sigungu_idx" ON "districts" USING btree ("sido","sigungu");