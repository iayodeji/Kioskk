import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyOwnerToken } from "@/lib/auth/jwt";
import { createServerSupabase } from "@/lib/supabase/server";

const patchSchema = z.object({
  status: z.enum(["Pending", "Shopping", "Delivered", "Cancelled"]),
});

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);
  return match?.[1] ?? null;
}

// GET /api/orders/:businessId
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: "Missing token." }, { status: 401 });

    const claims = verifyOwnerToken(token);
    if (claims.businessId !== resolvedParams.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,order_ref,customer_name,customer_phone,delivery_address,notes,items,total,status,created_at",
      )
      .eq("business_id", claims.businessId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ orders: data ?? [] }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// PATCH /api/orders/:orderId
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: "Missing token." }, { status: 401 });

    const claims = verifyOwnerToken(token);
    const body: unknown = await req.json();
    const parsed = patchSchema.parse(body);

    const supabase = createServerSupabase();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,business_id")
      .eq("id", resolvedParams.id)
      .maybeSingle();

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.business_id !== claims.businessId) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const { data: updated, error } = await supabase
      .from("orders")
      .update({ status: parsed.status })
      .eq("id", resolvedParams.id)
      .select("id,status")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ order: updated });
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid request." : err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
