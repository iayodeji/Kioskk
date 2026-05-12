import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signOwnerToken } from "@/lib/auth/jwt";
import { createServerSupabase } from "@/lib/supabase/server";

const requestSchema = z.object({
  slug: z.string().min(1),
  pin: z.string().regex(/^\d{4,6}$/),
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = requestSchema.parse(body);

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,pin_hash")
      .eq("slug", parsed.slug)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Business not found." }, { status: 404 });

    const ok = await bcrypt.compare(parsed.pin, data.pin_hash);
    if (!ok) return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });

    const token = signOwnerToken({ businessId: data.id, slug: data.slug });
    return NextResponse.json({ token, businessId: data.id });
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid request." : err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

