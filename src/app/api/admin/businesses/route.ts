import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const pin = req.headers.get("x-admin-pin") || "";
  const { adminPin } = getServerEnv();
  if (!pin || pin !== adminPin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServerSupabase();

  const { data: businesses, error: bizError } = await supabase
    .from("businesses")
    .select("id,slug,business_name,owner_name,location,whatsapp,created_at")
    .order("created_at", { ascending: false });

  if (bizError) return NextResponse.json({ error: bizError.message }, { status: 500 });

  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("business_id,order_ref,total,status,created_at,customer_name")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const byBiz = new Map<string, Array<(typeof orders)[number]>>();
  for (const o of orders ?? []) {
    const key = o.business_id as unknown as string;
    const arr = byBiz.get(key) ?? [];
    arr.push(o);
    byBiz.set(key, arr);
  }

  const list = (businesses ?? []).map((b) => {
    const bizOrders = byBiz.get(b.id) ?? [];
    const orderCount = bizOrders.length;
    const revenue = bizOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((s, o) => s + Number(o.total || 0), 0);

    return {
      ...b,
      orderCount,
      revenue,
      lastOrders: bizOrders.slice(0, 10),
    };
  });

  const totalBusinesses = list.length;
  const totalOrders = (orders ?? []).length;
  const totalGMV = (orders ?? [])
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + Number(o.total || 0), 0);

  return NextResponse.json(
    {
      stats: { totalBusinesses, totalOrders, totalGMV },
      businesses: list,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

