"use client";

import { useMemo, useState, useTransition } from "react";
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

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: "text" | "tel" | "password";
  maxLength?: number;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--kk-muted)]">
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-[var(--kk-border)] bg-white px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-accent),transparent_88%)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        maxLength={maxLength}
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  children: React.ReactNode;
};

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--kk-muted)]">
        {label}
      </span>
      <select
        className="w-full rounded-xl border border-[var(--kk-border)] bg-white px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-accent),transparent_88%)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function Button({
  children,
  disabled,
  onClick,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:translate-y-[0px] disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[var(--kk-accent)] text-white px-5 py-3 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(232,69,10,.18)]"
      : "border border-[var(--kk-border)] bg-transparent text-[var(--kk-ink)] px-4 py-2 hover:border-[var(--kk-ink)]";

  return (
    <button type={type} className={`${base} ${styles}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <div
      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
      aria-label="Loading"
    />
  );
}

function createItemDraft(): ItemDraft {
  return { id: crypto.randomUUID(), name: "", price: "" };
}

function validatePin(pin: string): string | null {
  if (!/^\d{4,6}$/.test(pin)) return "Dashboard PIN must be 4–6 digits.";
  return null;
}

function validatePrice(price: string): boolean {
  const n = Number(price);
  return Number.isFinite(n) && n > 0;
}

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
    if (!items.some((it) => it.name.trim() && validatePrice(it.price))) return false;
    if (validatePin(pin)) return false;
    return true;
  }, [businessName, ownerName, whatsapp, category, location, currency, currencySymbol, items, pin]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pinError = validatePin(pin);
    if (pinError) {
      setError(pinError);
      return;
    }

    const cleanedItems = items
      .filter((it) => it.name.trim() && validatePrice(it.price))
      .map((it) => ({ name: it.name.trim(), price: Number(it.price) }));

    if (cleanedItems.length < 1) {
      setError("Add at least 1 product (name + price).");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/generate", {
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

        const data = (await res.json()) as { slug?: string; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to generate store.");
        if (!data.slug) throw new Error("Missing slug from server response.");
        router.push(`/${data.slug}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      }
    });
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-[var(--kk-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--kk-accent)] text-[11px] font-extrabold text-white">
              KK
            </div>
            <div>
              <div className="font-[var(--font-serif)] text-[16px] font-bold leading-tight">
                kioskk.me
              </div>
              <div className="text-[12px] text-[var(--kk-muted)]">Your store in 60 seconds</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--kk-border)] bg-white px-4 py-2 text-[12px] text-[var(--kk-muted)]">
            <span className="font-semibold text-[var(--kk-accent)]">✦</span> AI-powered storefront generator
          </div>
          <h1 className="font-[var(--font-serif)] text-[40px] leading-[1.05] font-black tracking-[-0.02em]">
            Your business.
            <br />
            <span className="text-[var(--kk-accent)]">Your store link.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--kk-muted)]">
            Fill in your details and get a custom storefront at{" "}
            <span className="font-mono font-semibold text-[var(--kk-ink)]">
              https://{domain}/{slug || "your-slug"}
            </span>
            .
          </p>
        </div>

        {slug && (
          <div className="mb-6 rounded-2xl border border-[color:color-mix(in_oklab,var(--kk-accent),transparent_70%)] bg-[color:color-mix(in_oklab,var(--kk-accent),transparent_92%)] px-5 py-4">
            <div className="text-[12px] text-[var(--kk-muted)]">Your link will be</div>
            <div className="mt-1 font-mono text-[14px] font-semibold text-[var(--kk-accent)]">
              https://{domain}/{slug}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <section className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
            <div className="mb-5 font-[var(--font-serif)] text-[18px] font-bold">
              Business Info
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Business Name"
                value={businessName}
                onChange={setBusinessName}
                placeholder="e.g. Olam's Enterprise"
              />
              <TextField
                label="Owner Name"
                value={ownerName}
                onChange={setOwnerName}
                placeholder="e.g. Olaoluwa"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="WhatsApp Number"
                value={whatsapp}
                onChange={(v) => setWhatsapp(digitsOnly(v))}
                placeholder="e.g. 2348012345678"
                type="tel"
                maxLength={20}
              />
              <SelectField label="Category" value={category} onChange={(v) => setCategory(v as Category)}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                label="Location / Campus"
                value={location}
                onChange={setLocation}
                placeholder="e.g. University of Ibadan"
              />
              <TextField
                label="Currency Code"
                value={currency}
                onChange={setCurrency}
                placeholder="e.g. NGN"
                maxLength={6}
              />
              <TextField
                label="Currency Symbol"
                value={currencySymbol}
                onChange={setCurrencySymbol}
                placeholder="e.g. ₦"
                maxLength={4}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
            <div className="mb-2 font-[var(--font-serif)] text-[18px] font-bold">Products</div>
            <div className="text-[13px] text-[var(--kk-muted)]">Add at least 1 item (name + price).</div>

            <div className="mt-5 flex flex-col gap-3">
              {items.map((it, idx) => (
                <div key={it.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
                  <TextField
                    label={idx === 0 ? "Product Name" : " "}
                    value={it.name}
                    onChange={(v) =>
                      setItems((prev) =>
                        prev.map((p) => (p.id === it.id ? { ...p, name: v } : p)),
                      )
                    }
                    placeholder="e.g. Indomie pack"
                  />
                  <TextField
                    label={idx === 0 ? `Price (${currencySymbol})` : " "}
                    value={it.price}
                    onChange={(v) =>
                      setItems((prev) =>
                        prev.map((p) => (p.id === it.id ? { ...p, price: v } : p)),
                      )
                    }
                    placeholder="e.g. 1500"
                    type="tel"
                    maxLength={12}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      disabled={items.length <= 1}
                      onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Button variant="ghost" onClick={() => setItems((prev) => [...prev, createItemDraft()])}>
                + Add another product
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
            <div className="mb-5 font-[var(--font-serif)] text-[18px] font-bold">Owner Dashboard</div>
            <TextField
              label="Dashboard PIN (4–6 digits)"
              value={pin}
              onChange={(v) => setPin(digitsOnly(v).slice(0, 6))}
              placeholder="e.g. 1234"
              type="password"
              maxLength={6}
            />
            <div className="mt-2 text-[12px] text-[var(--kk-muted)]">
              This protects your private dashboard at{" "}
              <span className="font-mono">/{slug || "your-slug"}?view=dashboard</span>.
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button type="submit" disabled={!canSubmit || isPending} variant="primary">
              {isPending ? (
                <>
                  <Spinner /> Building your store…
                </>
              ) : (
                "Generate my storefront"
              )}
            </Button>
            <div className="text-[12px] text-[var(--kk-muted)]">~15s AI generation</div>
          </div>
        </form>
      </main>
    </div>
  );
}
