import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabase } from '../../../../lib/supabase';
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
  pin: z.string().regex(/^[0-9a-f]{64}$/),
  templateId: z.string().optional(),
  tagline: z.string().optional(),
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

    const pinHash = parsed.pin;
    const supabase = createServerSupabase();

    // Try base, then append -2, -3 on conflicts
    for (let attempt = 0; attempt < 6; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const tagline = parsed.tagline && parsed.tagline.length ? parsed.tagline : `${parsed.category} on ${parsed.location} campus`;
      const { error } = await supabase.from("stores").insert({
        slug,
        store_name: parsed.businessName,
        owner_name: parsed.ownerName,
        whatsapp_number: parsed.whatsapp,
        category: parsed.category,
        location: parsed.location,
        currency_symbol: parsed.currencySymbol,
        currency_code: parsed.currency,
        template_id: parsed.templateId || 'noir',
        tagline,
        dashboard_pin: pinHash,
        products: parsed.items,
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

