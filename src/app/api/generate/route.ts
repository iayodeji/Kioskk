import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { generateAiConfig } from "@/lib/ai/claude";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugifyBusinessName } from "@/lib/slug";

const requestSchema = z.object({
  businessName: z.string().min(1),
  ownerName: z.string().min(1),
  whatsapp: z.string().regex(/^\d+$/),
  category: z.string().min(1),
  location: z.string().min(1),
  currency: z.string().min(1),
  currencySymbol: z.string().min(1),
  items: z.array(z.object({ name: z.string().min(1), price: z.number().positive() })).min(1),
  pin: z.string().regex(/^\d{4,6}$/),
});

function withSlugSuffix(base: string, attempt: number) {
  if (attempt === 0) return base;
  const rand = crypto.getRandomValues(new Uint8Array(2));
  const hex = Array.from(rand)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${base}-${hex}`;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = requestSchema.parse(body);

    const baseSlug = slugifyBusinessName(parsed.businessName);
    if (!baseSlug) {
      return NextResponse.json({ error: "Business name must contain letters or numbers." }, { status: 400 });
    }

    const aiConfig = await generateAiConfig({
      businessName: parsed.businessName,
      ownerName: parsed.ownerName,
      category: parsed.category,
      location: parsed.location,
      currencySymbol: parsed.currencySymbol,
      items: parsed.items,
    });

    const pinHash = await bcrypt.hash(parsed.pin, 10);
    const supabase = createServerSupabase();

    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = withSlugSuffix(baseSlug, attempt);
      const { error } = await supabase.from("businesses").insert({
        slug,
        business_name: parsed.businessName,
        owner_name: parsed.ownerName,
        whatsapp: parsed.whatsapp,
        category: parsed.category,
        location: parsed.location,
        currency: parsed.currency,
        currency_symbol: parsed.currencySymbol,
        pin_hash: pinHash,
        items: parsed.items,
        ai_config: aiConfig,
      });

      if (!error) return NextResponse.json({ slug });
      if (!String(error.message || "").toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "That store link is taken. Try a slightly different business name." }, { status: 409 });
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid form submission." : err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

