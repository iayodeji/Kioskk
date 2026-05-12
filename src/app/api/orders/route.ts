import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabase } from "@/lib/supabase/server";
import { generateOrderRef } from "@/lib/orders/orderRef";

const requestSchema = z.object({
  slug: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().regex(/^\d+$/),
  deliveryAddress: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(z.object({ name: z.string().min(1), qty: z.number().int().positive() })).min(1),
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = requestSchema.parse(body);

    const supabase = createServerSupabase();
    const { data: biz, error: bizError } = await supabase
      .from("businesses")
      .select("id,currency_symbol,items")
      .eq("slug", parsed.slug)
      .maybeSingle();

    if (bizError) return NextResponse.json({ error: bizError.message }, { status: 500 });
    if (!biz) return NextResponse.json({ error: "Business not found." }, { status: 404 });

    const menuItems = Array.isArray(biz.items) ? (biz.items as Array<{ name?: unknown; price?: unknown }>) : [];
    const priceMap = new Map<string, number>();
    for (const it of menuItems) {
      if (typeof it.name === "string" && typeof it.price === "number") priceMap.set(it.name, it.price);
    }

    const normalized = parsed.items.map((it) => {
      const price = priceMap.get(it.name) ?? 0;
      const total = price * it.qty;
      return { name: it.name, qty: it.qty, price, total };
    });
    const total = normalized.reduce((s, it) => s + it.total, 0);
    if (total <= 0) return NextResponse.json({ error: "Invalid order items." }, { status: 400 });

    const orderRef = generateOrderRef();
    const { data: created, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        business_id: biz.id,
        customer_name: parsed.customerName,
        customer_phone: parsed.customerPhone,
        delivery_address: parsed.deliveryAddress,
        notes: parsed.notes ?? null,
        items: normalized,
        total,
        status: "Pending",
      })
      .select("id,order_ref,total,status,created_at")
      .single();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
    return NextResponse.json({ order: created, currencySymbol: biz.currency_symbol }, { status: 201 });
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid order." : err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

