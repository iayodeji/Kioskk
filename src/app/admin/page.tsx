"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { getDomain } from "@/lib/env";
import { digitsOnly } from "@/lib/phone";

type AdminBusiness = {
  id: string;
  slug: string;
  business_name: string;
  owner_name: string;
  location: string;
  whatsapp: string;
  created_at: string;
  orderCount: number;
  revenue: number;
  lastOrders: Array<{
    order_ref: string;
    total: number;
    status: string;
    created_at: string;
    customer_name: string;
  }>;
};

type AdminResponse = {
  stats: { totalBusinesses: number; totalOrders: number; totalGMV: number };
  businesses: AdminBusiness[];
};

function formatMoney(amount: number) {
  const n = Number(amount || 0);
  return n.toLocaleString();
}

export default function AdminPage() {
  const domain = useMemo(() => getDomain(), []);
  const [pin, setPin] = useState("");
  const [data, setData] = useState<AdminResponse | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (overridePin?: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/businesses", {
        headers: { "x-admin-pin": overridePin ?? pin },
      });
      const json = (await res.json()) as Partial<AdminResponse> & { error?: string };
      if (!res.ok) throw new Error(json.error || "Unauthorized.");
      if (!json.stats || !json.businesses) throw new Error("Invalid server response.");
      setData(json as AdminResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setData(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-10 border-b border-[var(--kk-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Image className="brand-logo brand-logo--compact" src="/kioskk-logo.svg" alt="kioskk.me" width={32} height={32} />
            <div>
              <div className="font-[var(--font-serif)] text-[16px] font-bold leading-tight">
                kioskk.me admin
              </div>
              <div className="text-[12px] text-[var(--kk-muted)]">{domain}</div>
            </div>
          </div>
          {data && (
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--kk-border)] bg-white px-4 py-2 font-semibold text-[var(--kk-ink)] transition hover:border-[var(--kk-ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-20 pt-10">
        {!data ? (
          <section className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
            <div className="font-[var(--font-serif)] text-[18px] font-bold">Enter admin PIN</div>
            <div className="mt-2 text-[13px] text-[var(--kk-muted)]">
              This route is for the platform owner only.
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--kk-muted)]">
                  PIN
                </span>
                <input
                  className="rounded-xl border border-[var(--kk-border)] bg-white px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-accent),transparent_88%)]"
                  value={pin}
                  onChange={(e) => setPin(digitsOnly(e.target.value))}
                  placeholder="••••••"
                  type="password"
                  inputMode="numeric"
                />
              </label>
              <button
                type="button"
                disabled={loading || !pin.trim()}
                onClick={() => load(pin)}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--kk-accent)] px-5 py-3 font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(232,69,10,.18)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Checking…" : "Unlock"}
              </button>
            </div>
            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-800">
                {error}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Total businesses</div>
                <div className="mt-1 font-[var(--font-serif)] text-[26px] font-black">
                  {data.stats.totalBusinesses}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Total orders</div>
                <div className="mt-1 font-[var(--font-serif)] text-[26px] font-black">
                  {data.stats.totalOrders}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Platform GMV</div>
                <div className="mt-1 font-[var(--font-serif)] text-[26px] font-black">
                  {formatMoney(data.stats.totalGMV)}
                </div>
              </div>
            </section>

            <section className="mt-6 flex flex-col gap-3">
              {data.businesses.map((b) => (
                <div key={b.id} className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-[var(--font-serif)] text-[18px] font-bold">
                        {b.business_name}
                      </div>
                      <div className="mt-1 text-[13px] text-[var(--kk-muted)]">
                        Owner: {b.owner_name} • {b.location}
                      </div>
                      <div className="mt-1 text-[13px] text-[var(--kk-muted)]">
                        <a className="font-mono font-semibold text-[var(--kk-accent)]" href={`/${b.slug}`}>
                          {domain}/{b.slug}
                        </a>{" "}
                        • WA: {b.whatsapp}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-[var(--kk-muted)]">Orders</div>
                      <div className="font-[var(--font-serif)] text-[22px] font-black">{b.orderCount}</div>
                      <div className="mt-2 text-[12px] text-[var(--kk-muted)]">Revenue</div>
                      <div className="font-[var(--font-serif)] text-[18px] font-black">
                        {formatMoney(b.revenue)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => ({ ...p, [b.id]: !p[b.id] }))}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--kk-border)] bg-white px-4 py-2 font-semibold text-[var(--kk-ink)] transition hover:border-[var(--kk-ink)]"
                    >
                      {expanded[b.id] ? "Hide orders" : "Show last 10 orders"}
                    </button>
                  </div>

                  {expanded[b.id] && (
                    <div className="mt-4 flex flex-col gap-2">
                      {b.lastOrders.length === 0 ? (
                        <div className="rounded-2xl border border-[var(--kk-border)] bg-white px-5 py-6 text-[13px] text-[var(--kk-muted)]">
                          No orders yet.
                        </div>
                      ) : (
                        b.lastOrders.map((o) => (
                          <div
                            key={o.order_ref}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--kk-border)] bg-white px-5 py-4"
                          >
                            <div>
                              <div className="font-semibold">{o.order_ref}</div>
                              <div className="mt-1 text-[12px] text-[var(--kk-muted)]">
                                {o.customer_name} • {new Date(o.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[12px] text-[var(--kk-muted)]">{o.status}</div>
                              <div className="font-[var(--font-serif)] text-[16px] font-black">
                                {formatMoney(o.total)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

