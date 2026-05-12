"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getDomain } from "@/lib/env";
import { digitsOnly } from "@/lib/phone";
import { slugifyBusinessName } from "@/lib/slug";

const CATEGORIES = [
  "Groceries & Provisions",
  "Food & Snacks",
  "Skincare & Beauty",
  "Fashion & Clothing",
  "Stationery & Supplies",
  "Electronics & Accessories",
  "Laundry & Cleaning",
  "Tutoring & Services",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

type ItemDraft = {
  id: string;
  name: string;
  price: string;
};

function createItemDraft(): ItemDraft {
  return { id: crypto.randomUUID(), name: "", price: "" };
}

function validatePin(pin: string): string | null {
  if (!/^\d{4,6}$/.test(pin)) return "Dashboard PIN must be 4–6 digits.";
  return null;
}

function validatePrice(price: string): boolean {
  const value = Number(price);
  return Number.isFinite(value) && value > 0;
}

export default function CreatePage() {
  const router = useRouter();
  const domain = useMemo(() => getDomain(), []);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [location, setLocation] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [currencySymbol, setCurrencySymbol] = useState("₦");
  const [pin, setPin] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([createItemDraft()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugifyBusinessName(businessName), [businessName]);
  const canSubmit = useMemo(() => {
    if (!businessName.trim()) return false;
    if (!ownerName.trim()) return false;
    if (digitsOnly(whatsapp).length < 8) return false;
    if (!category) return false;
    if (!location.trim()) return false;
    if (!currency.trim()) return false;
    if (!currencySymbol.trim()) return false;
    if (!items.some((item) => item.name.trim() && validatePrice(item.price))) return false;
    if (validatePin(pin)) return false;
    return true;
  }, [businessName, ownerName, whatsapp, category, location, currency, currencySymbol, items, pin]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const pinError = validatePin(pin);
    if (pinError) {
      setError(pinError);
      return;
    }

    const cleanedItems = items
      .filter((item) => item.name.trim() && validatePrice(item.price))
      .map((item) => ({ name: item.name.trim(), price: Number(item.price) }));

    if (cleanedItems.length < 1) {
      setError("Add at least 1 product (name + price).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
          whatsapp: digitsOnly(whatsapp),
          category,
          location: location.trim(),
          currency: currency.trim().toUpperCase(),
          currencySymbol: currencySymbol.trim(),
          items: cleanedItems,
          pin,
        }),
      });

      const data = (await response.json()) as { slug?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Failed to generate store.");
      if (!data.slug) throw new Error("Missing slug from server response.");
      router.push(`/${data.slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--kk-bg)] text-[var(--kk-ink)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-6 md:px-8 md:py-8">
        <header className="flex items-center justify-between border-b border-[var(--kk-border)] pb-4">
          <a href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--kk-ink)] text-[11px] font-semibold text-[var(--kk-bg)]">
              KK
            </div>
            <div>
              <div className="text-[15px] font-medium tracking-[-0.02em]">kioskk.me</div>
              <div className="text-[12px] text-[var(--kk-muted)]">Your store in 60 seconds</div>
            </div>
          </a>
          <a
            href="/"
            className="rounded-lg border border-[var(--kk-border)] px-4 py-2 text-[12px] font-medium text-[var(--kk-ink)]"
          >
            Back to landing
          </a>
        </header>

        <section className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--kk-border)] bg-white px-4 py-2 text-[12px] text-[var(--kk-muted)]">
            <span className="text-[var(--kk-ink)]">✦</span> Create your store
          </div>
          <h1 className="text-[42px] leading-[1.05] tracking-[-0.04em] font-light md:text-[56px]">
            Build your storefront.<br />
            <span className="font-medium">Sell from one link.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--kk-muted)]">
            Fill this in once and Kioskk will generate your store at {domain}/{slug || "your-slug"}.
          </p>
        </section>

        <form onSubmit={submit} className="grid gap-6 rounded-3xl border border-[var(--kk-border)] bg-white p-6 md:p-8">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Business name</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Kemi's Kitchen"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Your name</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Kemi"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">WhatsApp number</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="2348012345678"
                inputMode="numeric"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Category</span>
              <select
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | "")}
              >
                <option value="">Choose a category</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Location</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="University of Lagos"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Currency code</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="NGN"
                maxLength={3}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Currency symbol</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₦"
                maxLength={4}
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Dashboard PIN</span>
              <input
                className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                type="password"
                maxLength={6}
              />
            </label>
          </section>

          <section className="grid gap-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--kk-muted)]">Products</div>
                <div className="text-[13px] text-[var(--kk-muted)]">Add at least one product with a valid price.</div>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, createItemDraft()])}
                className="rounded-lg border border-[var(--kk-border)] px-4 py-2 text-[12px] font-medium"
              >
                Add product
              </button>
            </div>

            <div className="grid gap-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                  <input
                    className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                    value={item.name}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, name: e.target.value } : current,
                        ),
                      )
                    }
                    placeholder={`Product ${index + 1}`}
                  />
                  <input
                    className="rounded-xl border border-[var(--kk-border)] px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-ink),transparent_90%)]"
                    value={item.price}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((current, currentIndex) =>
                          currentIndex === index ? { ...current, price: e.target.value } : current,
                        ),
                      )
                    }
                    placeholder="2500"
                    inputMode="decimal"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                    disabled={items.length === 1}
                    className="rounded-lg border border-[var(--kk-border)] px-4 py-2 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-800">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--kk-ink)] px-5 py-3 font-medium text-[var(--kk-bg)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating store..." : "Generate store"}
            </button>
            <div className="text-[12px] text-[var(--kk-muted)]">
              You’ll be sent to the generated storefront after this step.
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
