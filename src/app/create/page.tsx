"use client";

import React, { useMemo, useState } from "react";
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
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return { id: crypto.randomUUID(), name: "", price: "" };
  }
  return { id: String(Date.now()) + Math.random().toString(16).slice(2), name: "", price: "" };
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
  const [items, setItems] = useState<ItemDraft[]>(() => [createItemDraft()]);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugifyBusinessName(businessName || ""), [businessName]);

  const canSubmit = !!businessName && !!ownerName && /^\d{4,6}$/.test(pin) && items.length > 0 && items.every((it) => it.name && validatePrice(it.price));

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please complete the form, set a 4-digit PIN and add valid product prices.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        businessName,
        ownerName,
        whatsapp: digitsOnly(whatsapp),
        category: category || "Other",
        location,
        currency,
        currencySymbol,
        items: items.map((it) => ({ name: it.name, price: Number(it.price) })),
        pin,
      };

      const res = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create store");
      const resultingSlug = data.slug;
      if (resultingSlug) router.push(`/${resultingSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: "var(--kk-bg)", minHeight: "100vh", color: "var(--kk-ink)" }}>
      <div className="page">
        <nav className="nav">
          <div className="logo"><div className="lm">KK</div><div className="lt">kioskk.me</div></div>
          <div style={{ fontSize: 11, color: '#B4B2A9', background: '#EEECEA', padding: '6px 10px', borderRadius: 999 }}>✦ AI</div>
        </nav>

        <div className="eyebrow">New storefront</div>
        <h1 className="h1">Tell us about your<br /><strong>business.</strong></h1>
        <p className="sub">Under 60 seconds. No account needed.</p>

        <div className="link-banner" aria-hidden={false}>
          <div>
            <div className="link-label">Your store will live at</div>
            <div className="link-url">kioskk.me/{slug || 'your-store'}</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: 8, background: '#4CAF50' }} />
        </div>

        <form onSubmit={submit} style={{ padding: '0 6px 60px' }}>
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Business info</div>
            <div className="field">
              <label className="label">Business name</label>
              <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Olam's Enterprise" />
            </div>
            <div className="field">
              <label className="label">Owner name</label>
              <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Ola" />
            </div>
            <div className="field">
              <label className="label">WhatsApp number</label>
              <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="2348012345678" inputMode="numeric" />
            </div>
            <div className="field">
              <label className="label">Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                <option value="">Choose category</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="field">
              <label className="label">Location / campus</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="UI" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }} className="field">
                <label className="label">Currency</label>
                <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </div>
              <div style={{ width: 88 }} className="field">
                <label className="label">Symbol</label>
                <input className="input" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Products</div>
            <div style={{ marginBottom: 8, color: '#888780' }}>Add at least one product with a price.</div>
            {items.map((item, i) => (
              <div key={item.id} className="product-row">
                <input className="input product-name" value={item.name} onChange={(e) => setItems(prev => prev.map((p, idx) => idx === i ? { ...p, name: e.target.value } : p))} placeholder={`Product ${i+1}`} />
                <input className="input product-price" value={item.price} onChange={(e) => setItems(prev => prev.map((p, idx) => idx === i ? { ...p, price: e.target.value } : p))} placeholder="0" inputMode="decimal" />
                <button type="button" className="remove-btn" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} aria-label="Remove">×</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={() => setItems(prev => [...prev, createItemDraft()])}>＋ Add product</button>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dashboard access</div>
            <div style={{ marginBottom: 8, color: '#888780' }}>Set a 4-digit PIN for your private dashboard.</div>
            <div className="pin-row">
              {[0,1,2,3].map((idx) => (
                <input key={idx} inputMode="numeric" maxLength={1} value={pin[idx] ?? ''} onChange={(e) => {
                  const ch = e.target.value.replace(/[^0-9]/g,'').slice(-1);
                  setPin((p) => {
                    const arr = p.split('').slice(0,4);
                    arr[idx] = ch;
                    return arr.join('');
                  });
                }} className={`pin-box`} style={{ textAlign: 'center' }} />
              ))}
            </div>
          </div>

          {error && <div style={{ margin: 12, color: 'red', background: '#fff', padding: 12, borderRadius: 10 }}>{error}</div>}
        </form>

        <div className="mini-preview">
          <div className="mp-head">
            <div className="mp-logo">{(businessName && businessName[0]?.toUpperCase()) || 'KK'}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{businessName || "Your store"}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{(category || '').toUpperCase()} · {location}</div>
            </div>
          </div>
          <div className="mp-body">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', marginBottom: 8, color: '#B4B2A9' }}>Menu</div>
            {items.filter(it=>it.name).map((it, idx) => (
              <div key={idx} className="mp-item"><div style={{fontWeight:500}}>{it.name}</div><div>{currencySymbol}{it.price}</div></div>
            ))}
            <button className="mp-order-btn">Order via WhatsApp</button>
            <div style={{ textAlign: 'center', marginTop: 8, color: '#B4B2A9', fontSize: 12 }}>{domain}/{slug || 'your-store'}</div>
          </div>
        </div>

        <div className="cta-fixed">
          <button className="cta-btn" onClick={() => { if(!loading) { const el = document.querySelector('form'); if(el) el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); } }}>{loading ? 'Generating…' : '✦ Generate my storefront'}</button>
        </div>
      </div>
    </main>
  );
}
