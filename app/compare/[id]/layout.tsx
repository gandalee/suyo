import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { data: candidate } = await supabase
    .from("candidates")
    .select("name, party")
    .eq("external_id", id)
    .single();

  const name = candidate?.name ?? "후보";
  const party = candidate?.party ?? "";

  return {
    title: `${name} 후보 언론 비교 | suyo.kr`,
    description: `${name}(${party}) 후보를 보수·진보·공영 언론이 어떻게 다르게 보도하는지 비교해보세요.`,
    openGraph: {
      title: `${name} 후보 언론 비교 | suyo.kr`,
      description: `같은 후보, 언론은 이렇게 다르게 봅니다`,
      images: [`https://suyo.kr/api/og/${id}`],
      url: `https://suyo.kr/compare/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} 후보 언론 비교 | suyo.kr`,
      images: [`https://suyo.kr/api/og/${id}`],
    },
  };
}

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
