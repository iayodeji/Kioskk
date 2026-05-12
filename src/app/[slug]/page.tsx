import { notFound } from "next/navigation";

import { createAnonServerSupabase } from "@/lib/supabase/anonServer";

import StoreApp from "./store-app";

type BusinessRow = {
  id: string;
  slug: string;
  business_name: string;
  owner_name: string;
  whatsapp: string;
  category: string;
  location: string;
  currency: string;
  currency_symbol: string;
  items: unknown;
  ai_config: unknown;
  created_at: string;
};

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const supabase = createAnonServerSupabase();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id,slug,business_name,owner_name,whatsapp,category,location,currency,currency_symbol,items,ai_config,created_at",
    )
    .eq("slug", resolvedParams.slug)
    .maybeSingle<BusinessRow>();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  return <StoreApp business={data} />;
}
