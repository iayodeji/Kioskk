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
    } catch (err: any) {
      setError(err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: "var(--kk-bg)", minHeight: "100vh", color: "var(--kk-ink)" }}>
      <style>{`
        .page{max-width:390px;margin:0 auto;padding-bottom:92px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial}
        .card{background:#fff;border:0.5px solid rgba(0,0,0,0.08);border-radius:14px;margin:12px 12px;padding:12px;}
        .nav{display:flex;align-items:center;justify-content:space-between;padding:12px;margin:0 6px;border-bottom:0.5px solid rgba(0,0,0,0.07);position:sticky;top:0;background:var(--kk-bg);z-index:10}
        .logo{display:flex;align-items:center;gap:10px}
        .lm{width:28px;height:28px;background:#1a1a18;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#FAFAF8;font-size:11px;font-weight:600}
        .lt{font-size:13px;font-weight:500}
        .eyebrow{font-size:12px;font-weight:600;letter-spacing:1px;color:#B4B2A9;margin:10px 12px}
        .h1{font-size:26px;font-weight:300;line-height:1.15;margin:6px 12px}
        .h1 strong{font-weight:500}
        .sub{font-size:13px;color:#888780;margin:8px 12px}
        .link-banner{margin:12px;border-radius:10px;background:#1a1a18;color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}
        .link-label{font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px}
        .link-url{font-family:SF Mono,monospace;font-size:13px}
        .field{display:flex;flex-direction:column;margin-bottom:10px}
        .label{font-size:10px;color:#B4B2A9;margin-bottom:6px;font-weight:600}
        .input{height:44px;border-radius:9px;border:0.5px solid rgba(0,0,0,0.1);padding:0 12px;font-size:15px;background:var(--kk-card);outline:none}
        .product-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
        .product-name{flex:1}
        .product-price{width:88px}
        .remove-btn{width:36px;height:36px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.1);background:transparent;color:#B4B2A9}
        .add-btn{width:100%;height:40px;border-radius:9px;border:0.5px dashed rgba(0,0,0,0.15);background:transparent;color:#888780;font-weight:600}
        .pin-row{display:flex;gap:10px}
        .pin-box{width:52px;height:56px;border-radius:10px;border:0.5px solid rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;font-size:22px;background:var(--kk-card)}
        .mini-preview{margin:12px;border-radius:14px;overflow:hidden;border:0.5px solid rgba(0,0,0,0.08);}
        .mp-head{background:#1a1a18;color:#fff;padding:12px;display:flex;gap:8px;align-items:center}
        .mp-logo{width:34px;height:34px;background:#fff;color:#1a1a18;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700}
        .mp-body{background:#fff;padding:12px}
        .mp-item{display:flex;justify-content:space-between;padding:8px;background:var(--kk-bg);border-radius:8px;margin-bottom:8px;border:0.5px solid rgba(0,0,0,0.06)}
        .mp-order-btn{width:100%;height:36px;background:#1a1a18;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:500;margin-top:10px}
        .cta-fixed{position:fixed;left:0;right:0;bottom:0;padding:12px;background:linear-gradient(180deg,transparent,var(--kk-bg));display:flex;align-items:flex-end;justify-content:center}
        .cta-btn{width:calc(100% - 24px);height:52px;background:#1a1a18;color:#fff;border-radius:12px;border:none;font-size:15px;font-weight:600}

        /* Responsive adjustments (mobile-first) */
        @media (min-width: 640px) {
          .page{max-width:680px;padding-bottom:120px}
          .h1{font-size:32px}
          .card{margin:16px;padding:16px;border-radius:16px}
          .input{height:48px}
          .product-price{width:120px}
          .pin-box{width:56px;height:56px;font-size:24px}
        }

        @media (min-width: 1024px) {
          .page{max-width:980px}
          .nav{padding:18px;margin:0 18px}
          /* layout two-column on wide screens */
          .page{display:grid;grid-template-columns:1fr 360px;gap:20px}
          .mini-preview{margin:0;border-radius:12px;height:fit-content}
          .card{margin:18px;padding:18px}
          .h1{font-size:40px}
        }

      `}</style>

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
