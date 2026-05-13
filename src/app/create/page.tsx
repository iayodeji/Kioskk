"use client";

import Image from "next/image";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { getDomain } from "@/lib/env";
import { digitsOnly } from "@/lib/phone";
import generateSlug from '../../../lib/slugify';
import StorePreview from '../../../components/templates/StorePreview';

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

type PreviewProduct = {
  name: string;
  price: number;
};

type PreviewData = {
  storeName: string;
  category: string;
  location: string;
  whatsappNumber: string;
  currencySymbol: string;
  products: PreviewProduct[];
  tagline?: string;
  templateId: string;
};

function createItemDraft(): ItemDraft {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return { id: crypto.randomUUID(), name: "", price: "" };
  }
  return { id: String(Date.now()) + Math.random().toString(16).slice(2), name: "", price: "" };
}

function validatePrice(price: string): boolean {
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  const value = Number(cleaned);
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
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (idx: number, value: string) => {
    const ch = value.replace(/[^0-9]/g, '').slice(-1);
    setPin((p) => {
      const arr = p.split('').slice(0, 4);
      arr[idx] = ch;
      return arr.join('');
    });
    if (ch && idx < 3) {
      pinRefs.current[idx + 1]?.focus();
    }
  };

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      pinRefs.current[idx - 1]?.focus();
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState("Share");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState('noir');
  const [userSelectedTemplate, setUserSelectedTemplate] = useState(false);

  const shareableUrl = useMemo(() => {
    const base = /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
    return `${base}/${slug || "your-store"}`;
  }, [domain, slug]);

  const slugDebounceRef = useRef<number | null>(null);
  const previewDebounceRef = useRef<number | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData>(() => ({
    storeName: '',
    category: '',
    location: '',
    whatsappNumber: '',
    currencySymbol: '₦',
    products: [],
    templateId: 'noir',
  }));

  useEffect(() => {
    // live slug generation with 300ms debounce
    if (!businessName) {
      setSlug('');
      return;
    }
    if (slugDebounceRef.current) window.clearTimeout(slugDebounceRef.current);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    slugDebounceRef.current = window.setTimeout(async () => {
      try {
        const s = await generateSlug(businessName);
        setSlug(s);
      } catch {
        setSlug('');
      }
    }, 300);
    return () => { if (slugDebounceRef.current) window.clearTimeout(slugDebounceRef.current); };
  }, [businessName]);

  // Debounce preview updates (300ms)
  useEffect(() => {
    if (previewDebounceRef.current) window.clearTimeout(previewDebounceRef.current);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    previewDebounceRef.current = window.setTimeout(() => {
      setPreviewData({
        storeName: businessName || 'Your store',
        category: category || 'Store',
        location: location || '',
        whatsappNumber: digitsOnly(whatsapp) || '',
        currencySymbol: currencySymbol || '₦',
        products: items.map((it) => ({ name: it.name || 'Product', price: Number(it.price) || 0 })),
        templateId,
      });
    }, 300);
    return () => { if (previewDebounceRef.current) window.clearTimeout(previewDebounceRef.current); };
  }, [businessName, category, location, whatsapp, currencySymbol, items, templateId]);

  const canSubmit = !!businessName && !!ownerName && /^\d{4}$/.test(pin) && items.length > 0 && items.every((it) => it.name && validatePrice(it.price));

  // category -> suggested template mapping
  const suggestionMap: Record<string, string> = useMemo(
    () => ({
      'Food & Snacks': 'noir',
      'Fashion & Clothing': 'cream',
      'Skincare & Beauty': 'bold',
      'Electronics & Accessories': 'minimal',
      'Handmade & Jewellery': 'luxury',
    }),
    []
  );

  useEffect(() => {
    if (!userSelectedTemplate && category) {
      const suggestion = suggestionMap[category] || 'minimal';
      setTemplateId(suggestion);
    }
  }, [category, userSelectedTemplate, suggestionMap]);

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please complete the form, set a 4-digit PIN and add valid product prices.");
      return;
    }
    setLoading(true);
    try {
      const payload: {
        businessName: string;
        ownerName: string;
        whatsapp: string;
        category: string;
        location: string;
        currency: string;
        currencySymbol: string;
        items: { name: string; price: number }[];
        templateId: string;
        tagline: string;
        pin: string;
      } = {
        businessName,
        ownerName,
        whatsapp: digitsOnly(whatsapp),
        category: category || "Other",
        location,
        currency,
        currencySymbol,
        items: items.map((it) => ({ name: it.name.trim(), price: Number(String(it.price).replace(/[^0-9.]/g, '')) })),
        templateId,
        tagline: `${(category || 'Other')} on ${location} campus`,
        pin: '',
      };

      // normalize and hash PIN with Web Crypto (SHA-256 hex)
      const pinDigits = String(pin).replace(/[^0-9]/g, '').slice(0, 4);
      if (!/^\d{4}$/.test(pinDigits)) {
        throw new Error('PIN must be 4 digits.');
      }
      const enc = new TextEncoder();
      const pinBytes = enc.encode(pinDigits);
      const hashBuffer = await crypto.subtle.digest('SHA-256', pinBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // attach hashed pin and computed tagline if none
      payload.pin = hashHex;

      const res = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData?.error || "Failed to create store");
      const resultingSlug = responseData.slug;
      if (resultingSlug) router.push(`/${resultingSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleShareStore() {
    try {
      const title = `${businessName || "My store"} on kioskk.me`;
      const text = "Check out my storefront and order directly here:";

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, text, url: shareableUrl });
        setShareLabel("Shared");
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareableUrl);
        setShareLabel("Copied");
      }
    } catch {
      // User canceled native share, or clipboard permission failed.
    } finally {
      window.setTimeout(() => setShareLabel("Share"), 1400);
    }
  }

  return (
    <main style={{ background: "var(--kk-bg)", minHeight: "100vh", color: "var(--kk-ink)" }}>
      <div className="page">
        <nav className="nav">
          <div className="logo">
            <Image className="brand-logo brand-logo--compact" src="/kioskk-logo.svg" alt="kioskk.me" width={32} height={32} />
          </div>
        </nav>

        <div className="create-shell">
          <section className="create-main">
            <div className="eyebrow">New storefront</div>
            <h1 className="h1">Tell us about your<br /><strong>business.</strong></h1>
            <p className="sub">Under 60 seconds. No account needed.</p>

            <div className="link-banner" aria-hidden={false}>
              <div>
                <div className="link-label">Your store will live at</div>
                <div className="link-url">kioskk.me/{slug || 'your-store'}</div>
              </div>
              <button type="button" className="link-share-btn" onClick={handleShareStore}>
                <i className="ti ti-share" aria-hidden="true" />
                {shareLabel}
              </button>
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
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Choose a template</div>
            <div style={{ marginBottom: 8, color: '#888780' }}>Pick a look for your store. We suggest one based on your category.</div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
              {[
                { id: 'noir', name: 'Noir', desc: 'Dark & bold' },
                { id: 'cream', name: 'Cream', desc: 'Warm & editorial' },
                { id: 'minimal', name: 'Minimal', desc: 'Clean & simple' },
                { id: 'bold', name: 'Bold', desc: 'Vibrant & loud' },
                { id: 'luxury', name: 'Luxury', desc: 'Premium & quiet' },
              ].map((t) => (
                <button key={t.id} type="button" onClick={() => { setTemplateId(t.id); setUserSelectedTemplate(true); }} className="template-card" style={{ minWidth: 120, padding: 12, borderRadius: 8, border: templateId === t.id ? '2px solid #000' : '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dashboard access</div>
            <div style={{ marginBottom: 8, color: '#888780' }}>Set a 4-digit PIN for your private dashboard.</div>
<div className="pin-row">
               {[0,1,2,3].map((idx) => (
                 <input key={idx} ref={el => { pinRefs.current[idx] = el; }} inputMode="numeric" maxLength={1} value={pin[idx] ?? ''} onChange={(e) => handlePinChange(idx, e.target.value)} onKeyDown={(e) => handlePinKeyDown(idx, e)} className={`pin-box`} style={{ textAlign: 'center' }} />
               ))}
             </div>
          </div>

          {error && <div style={{ margin: 12, color: 'red', background: '#fff', padding: 12, borderRadius: 10 }}>{error}</div>}
            </form>

            <div className="cta-fixed">
              <button className="cta-btn" onClick={() => { if(!loading) { const el = document.querySelector('form'); if(el) el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); } }}>{loading ? 'Generating…' : '✦ Generate my storefront'}</button>
            </div>
          </section>

          <aside className="mini-preview">
            <div style={{padding:12}}>
              <StorePreview
                templateId={previewData.templateId}
                storeName={previewData.storeName}
                category={previewData.category}
                location={previewData.location}
                whatsappNumber={previewData.whatsappNumber}
                currencySymbol={previewData.currencySymbol}
                tagline={previewData.tagline}
                products={previewData.products}
              />
              <div style={{ textAlign: 'center', marginTop: 8, color: '#B4B2A9', fontSize: 12 }}>{domain}/{slug || 'your-store'}</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
