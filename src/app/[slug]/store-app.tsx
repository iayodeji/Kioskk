"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { digitsOnly } from "@/lib/phone";
import { getDomain } from "@/lib/env";
import { TemplateBold, TemplateCream, TemplateLuxury, TemplateMinimal, TemplateNoir } from "../../../components/templates";

type Business = {
  id: string;
  slug: string;
  business_name?: string;
  store_name?: string;
  owner_name: string;
  whatsapp?: string;
  whatsapp_number?: string;
  category: string;
  location: string;
  currency?: string;
  currency_code?: string;
  currency_symbol: string;
  tagline?: string;
  items?: unknown;
  products?: unknown;
  ai_config?: unknown;
};

type MenuItem = { name: string; price: number };

type AiConfig = {
  headline: string;
  heroCopy: string;
  colorScheme: { primary: string; bg: string };
  howItWorks: Array<{ step: string; title: string; desc: string }>;
  orderInstructions: string;
  whatsappMessage: string;
  ownerInsights: Array<{ label: string; value: string }>;
};

type OrderRow = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes: string | null;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  total: number;
  status: "Pending" | "Shopping" | "Delivered" | "Cancelled";
  created_at: string;
};

function isMenuItem(v: unknown): v is MenuItem {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { name?: unknown }).name === "string" &&
    typeof (v as { price?: unknown }).price === "number"
  );
}

function isAiConfig(v: unknown): v is AiConfig {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { headline?: unknown }).headline === "string" &&
    typeof (v as { heroCopy?: unknown }).heroCopy === "string" &&
    typeof (v as { colorScheme?: unknown }).colorScheme === "object"
  );
}

function formatMoney(amount: number, symbol: string) {
  const n = Number(amount || 0);
  return `${symbol}${n.toLocaleString()}`;
}

function fillWhatsAppTemplate(
  template: string,
  data: { orderId: string; name: string; items: string; total: string; hostel: string },
) {
  return template
    .replaceAll("{{orderId}}", data.orderId)
    .replaceAll("{{name}}", data.name)
    .replaceAll("{{items}}", data.items)
    .replaceAll("{{total}}", data.total)
    .replaceAll("{{hostel}}", data.hostel);
}

function waLink(phone: string, message: string) {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(message)}`;
}

function getTemplateComponent(templateId: string) {
  switch ((templateId || "").toLowerCase()) {
    case "cream":
      return TemplateCream;
    case "minimal":
      return TemplateMinimal;
    case "bold":
      return TemplateBold;
    case "luxury":
      return TemplateLuxury;
    case "noir":
    default:
      return TemplateNoir;
  }
}

function StatusPill({ status }: { status: OrderRow["status"] }) {
  const styles =
    status === "Delivered"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "Shopping"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : status === "Cancelled"
          ? "bg-red-50 text-red-800 border-red-200"
          : "bg-[color:color-mix(in_oklab,var(--kk-accent),transparent_92%)] text-[var(--kk-ink)] border-[color:color-mix(in_oklab,var(--kk-accent),transparent_80%)]";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--kk-accent)] px-5 py-3 font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(232,69,10,.18)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-[var(--kk-border)] bg-white px-4 py-2 font-semibold text-[var(--kk-ink)] transition hover:border-[var(--kk-ink)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export default function StoreApp({ business }: { business: Business }) {
  const searchParams = useSearchParams();
  const domain = useMemo(() => getDomain(), []);
  const storeName = business.store_name ?? business.business_name ?? 'Store';
  const whatsapp = business.whatsapp_number ?? business.whatsapp ?? '';
  const selectedTemplateId = String((business as { template_id?: string }).template_id || 'noir');
  const [view, setView] = useState<"store" | "dashboard">("store");
  const [cart, setCart] = useState<Record<string, number>>({});

  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");

  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderRef: string;
    total: number;
    waUrl: string;
  } | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [pin, setPin] = useState("");
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);

  const config: AiConfig = useMemo(() => {
    if (isAiConfig(business.ai_config)) return business.ai_config;
    return {
      headline: "Your new favorite plug",
      heroCopy: "Browse our menu and place your order in minutes. Fast replies on WhatsApp.",
      colorScheme: { primary: "var(--kk-accent)" as unknown as string, bg: "#F7F4EF" },
      howItWorks: [
        { step: "1", title: "Browse", desc: "Pick what you want from the menu." },
        { step: "2", title: "Order", desc: "Checkout with your WhatsApp number." },
        { step: "3", title: "Receive", desc: "Confirm on WhatsApp and get delivered." },
      ],
      orderInstructions: "After checkout, confirm your order on WhatsApp.",
      whatsappMessage:
        "Hi! I just placed an order.\\n\\nOrder ID: {{orderId}}\\nMy name: {{name}}\\nItems: {{items}}\\nTotal: {{total}}\\nDelivery to: {{hostel}}",
      ownerInsights: [
        { label: "tip", value: "Offer a daily deal to increase repeat orders." },
        { label: "tip", value: "Post your store link in your WhatsApp status." },
        { label: "tip", value: "Bundle bestsellers to increase order value." },
      ],
    };
  }, [business.ai_config]);

  const menu: MenuItem[] = useMemo(() => {
    const raw = Array.isArray(business.products) ? business.products : Array.isArray(business.items) ? business.items : [];
    return raw.filter(isMenuItem);
  }, [business.products, business.items]);

  const TemplateComponent = useMemo(() => getTemplateComponent(selectedTemplateId), [selectedTemplateId]);

  const templateProducts = useMemo(
    () =>
      menu.map((item, index) => ({
        name: item.name,
        price: item.price,
        description: index === 0 ? `Featured ${business.category.toLowerCase()} item` : "",
        featured: index === 0,
      })),
    [business.category, menu],
  );

  useEffect(() => {
    const initialView = searchParams.get("view");
    if (initialView === "dashboard") setView("dashboard");
  }, [searchParams]);

  useEffect(() => {
    try {
      const key = `kioskk_owner_token_${business.slug}`;
      const existing = localStorage.getItem(key);
      if (existing) setOwnerToken(existing);
    } catch {}
  }, [business.slug]);

  const cartEntries = useMemo(() => {
    const entries: Array<{ name: string; qty: number; price: number; total: number }> = [];
    for (const [name, qty] of Object.entries(cart)) {
      if (!qty) continue;
      const item = menu.find((m) => m.name === name);
      if (!item) continue;
      entries.push({ name, qty, price: item.price, total: item.price * qty });
    }
    return entries;
  }, [cart, menu]);

  const cartTotal = useMemo(() => cartEntries.reduce((s, it) => s + it.total, 0), [cartEntries]);
  const cartCount = useMemo(() => cartEntries.reduce((s, it) => s + it.qty, 0), [cartEntries]);

  const shareUrl = `https://${domain}/${business.slug}`;

  const setActiveView = (next: "store" | "dashboard") => {
    setView(next);
    try {
      const url = new URL(window.location.href);
      if (next === "dashboard") url.searchParams.set("view", "dashboard");
      else url.searchParams.delete("view");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    } catch {}
  };

  const addToCart = (name: string) => {
    setCart((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
  };
  const decFromCart = (name: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const n = (next[name] ?? 0) - 1;
      if (n <= 0) delete next[name];
      else next[name] = n;
      return next;
    });
  };

  const placeOrder = async () => {
    setStoreError(null);
    if (cartEntries.length < 1) {
      setStoreError("Add at least 1 item to your cart.");
      return;
    }
    if (!checkoutName.trim()) {
      setStoreError("Enter your name.");
      return;
    }
    if (digitsOnly(checkoutPhone).length < 8) {
      setStoreError("Enter a valid WhatsApp number.");
      return;
    }
    if (!checkoutAddress.trim()) {
      setStoreError("Enter your hostel / delivery address.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: business.slug,
          customerName: checkoutName.trim(),
          customerPhone: digitsOnly(checkoutPhone),
          deliveryAddress: checkoutAddress.trim(),
          notes: checkoutNotes.trim() ? checkoutNotes.trim() : undefined,
          items: cartEntries.map((it) => ({ name: it.name, qty: it.qty })),
        }),
      });
      const data = (await res.json()) as { order?: { order_ref: string; total: number }; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to place order.");
      if (!data.order) throw new Error("Missing order response.");

      const itemsText = cartEntries.map((it) => `${it.name} x${it.qty}`).join(", ");
      const totalText = formatMoney(data.order.total, business.currency_symbol);
      const message = fillWhatsAppTemplate(config.whatsappMessage, {
        orderId: data.order.order_ref,
        name: checkoutName.trim(),
        items: itemsText,
        total: totalText,
        hostel: checkoutAddress.trim(),
      });
      const url = waLink(whatsapp, message);

      setOrderSuccess({ orderRef: data.order.order_ref, total: data.order.total, waUrl: url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setStoreError(message);
    } finally {
      setPlacing(false);
    }
  };

  const verifyPin = async () => {
    setDashError(null);
    if (!/^\d{4,6}$/.test(pin)) {
      setDashError("PIN must be 4–6 digits.");
      return;
    }
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: business.slug, pin }),
      });
      const data = (await res.json()) as { token?: string; businessId?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to verify PIN.");
      if (!data.token || !data.businessId) throw new Error("Missing auth response.");

      setOwnerToken(data.token);
      try {
        localStorage.setItem(`kioskk_owner_token_${business.slug}`, data.token);
      } catch {}
      await loadOrders(data.token, data.businessId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setDashError(message);
    }
  };

  const loadOrders = async (token: string, businessId: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/${businessId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { orders?: OrderRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setDashError(message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateStatus = async (orderId: string, status: OrderRow["status"]) => {
    if (!ownerToken) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to update order.");

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setDashError(message);
    }
  };

  const dashboardStats = useMemo(() => {
    const nonCancelled = orders.filter((o) => o.status !== "Cancelled");
    const revenue = nonCancelled.reduce((s, o) => s + Number(o.total || 0), 0);
    const pending = orders.filter((o) => o.status === "Pending").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    return {
      totalOrders: orders.length,
      revenue,
      pending,
      delivered,
    };
  }, [orders]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {}
  };

  const storeTemplate = (
    <div className="mx-auto w-full max-w-[1440px] px-0 py-0 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="overflow-hidden bg-white lg:rounded-[32px] lg:border lg:border-[var(--kk-border)] lg:shadow-[0_20px_60px_rgba(15,23,42,.08)]">
        <TemplateComponent
          storeName={storeName}
          ownerName={business.owner_name}
          category={business.category}
          location={business.location}
          whatsappNumber={whatsapp}
          currencySymbol={business.currency_symbol}
          tagline={business.tagline}
          products={templateProducts}
        />
      </div>
    </div>
  );

  const isStoreView = view === "store";

  if (isStoreView) {
    return <div className="min-h-screen" style={{ background: config.colorScheme.bg }}>{storeTemplate}</div>;
  }

  return (
    <div className="min-h-full" style={{ background: config.colorScheme.bg }}>
      <div className="mx-auto max-w-3xl px-5 pb-32 pt-8">
        {!ownerToken ? (
          <section className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
            <div className="font-[var(--font-serif)] text-[18px] font-bold">Owner Dashboard</div>
            <div className="mt-2 text-[13px] text-[var(--kk-muted)]">Enter your PIN to unlock.</div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-2">
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--kk-muted)]">
                  PIN
                </span>
                <input
                  className="rounded-xl border border-[var(--kk-border)] bg-white px-4 py-3 text-[15px] outline-none focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--kk-accent),transparent_88%)]"
                  value={pin}
                  onChange={(e) => setPin(digitsOnly(e.target.value).slice(0, 6))}
                  placeholder="••••"
                  type="password"
                  inputMode="numeric"
                />
              </label>
              <PrimaryButton onClick={verifyPin}>Unlock</PrimaryButton>
            </div>
            {dashError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-800">
                {dashError}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-[var(--kk-border)] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-[var(--font-serif)] text-[18px] font-bold">Share your link</div>
                  <div className="mt-1 font-mono text-[13px] font-semibold text-[var(--kk-muted)]">
                    {shareUrl}
                  </div>
                </div>
                <GhostButton onClick={copyShareLink}>Copy Link</GhostButton>
              </div>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Total Orders</div>
                <div className="mt-1 font-[var(--font-serif)] text-[22px] font-black">
                  {dashboardStats.totalOrders}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Revenue</div>
                <div className="mt-1 font-[var(--font-serif)] text-[22px] font-black">
                  {formatMoney(dashboardStats.revenue, business.currency_symbol)}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Pending</div>
                <div className="mt-1 font-[var(--font-serif)] text-[22px] font-black">{dashboardStats.pending}</div>
              </div>
              <div className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                <div className="text-[12px] text-[var(--kk-muted)]">Delivered</div>
                <div className="mt-1 font-[var(--font-serif)] text-[22px] font-black">
                  {dashboardStats.delivered}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[var(--kk-border)] bg-white p-6">
              <div className="font-[var(--font-serif)] text-[18px] font-bold">AI growth tips</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {config.ownerInsights.map((t, idx) => (
                  <div key={idx} className="rounded-2xl border border-[var(--kk-border)] bg-white p-4">
                    <div className="text-[12px] font-semibold text-[var(--kk-muted)]">Tip</div>
                    <div className="mt-1 text-[13px] leading-6">{t.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-[var(--kk-border)] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-[var(--font-serif)] text-[18px] font-bold">Orders</div>
                <GhostButton
                  onClick={() => {
                    if (!ownerToken) return;
                    loadOrders(ownerToken, business.id);
                  }}
                  disabled={loadingOrders}
                >
                  {loadingOrders ? "Loading…" : "Refresh"}
                </GhostButton>
              </div>

              {dashError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] text-red-800">
                  {dashError}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--kk-border)] bg-white px-5 py-6 text-[13px] text-[var(--kk-muted)]">
                    No orders yet.
                  </div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-2xl border border-[var(--kk-border)] bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{o.order_ref}</div>
                          <div className="mt-1 text-[13px] text-[var(--kk-muted)]">
                            {o.customer_name} • {o.delivery_address}
                          </div>
                          <div className="mt-1 text-[13px] text-[var(--kk-muted)]">
                            Total: {formatMoney(Number(o.total || 0), business.currency_symbol)}
                          </div>
                        </div>
                        <StatusPill status={o.status} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <GhostButton onClick={() => updateStatus(o.id, "Shopping")}>Shopping</GhostButton>
                        <GhostButton onClick={() => updateStatus(o.id, "Delivered")}>Delivered</GhostButton>
                        <GhostButton onClick={() => updateStatus(o.id, "Cancelled")}>Cancel</GhostButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {isStoreView && cartEntries.length > 0 && !orderSuccess && (
        <div className="fixed left-0 right-0 z-20" style={{ bottom: 70 }}>
          <div className="mx-auto max-w-3xl px-5">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--kk-border)] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,.08)]">
              <div>
                <div className="text-[12px] text-[var(--kk-muted)]">{cartCount} item(s)</div>
                <div className="font-[var(--font-serif)] text-[18px] font-black">
                  {formatMoney(cartTotal, business.currency_symbol)}
                </div>
              </div>
              <GhostButton
                onClick={() => {
                  const el = document.querySelector("#checkout") as HTMLElement | null;
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Checkout
              </GhostButton>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--kk-border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-5 py-4">
          <button
            type="button"
            onClick={() => setActiveView("store")}
            className={`text-[13px] font-semibold ${isStoreView ? "text-[var(--kk-accent)]" : "text-[var(--kk-muted)]"}`}
          >
            Store
          </button>
          <button
            type="button"
            onClick={() => setActiveView("dashboard")}
            className={`text-[13px] font-semibold ${view === "dashboard" ? "text-[var(--kk-accent)]" : "text-[var(--kk-muted)]"}`}
          >
            Dashboard
          </button>
        </div>
      </nav>
    </div>
  );
}
