import { NextResponse } from "next/server";

import { createAnonServerSupabase } from "@/lib/supabase/anonServer";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const supabase = createAnonServerSupabase();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id,slug,business_name,owner_name,whatsapp,category,location,currency,currency_symbol,items,ai_config,created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ business: data }, { headers: { "cache-control": "no-store" } });
}

