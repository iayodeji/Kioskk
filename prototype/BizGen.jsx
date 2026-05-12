import { useState, useCallback, useRef, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const T = {
  bg:"#F7F4EF", ink:"#1A1208", card:"#FFFFFF",
  accent:"#E8450A", accentLight:"#FFF0EB",
  muted:"#8A7F72", border:"#E8E2D9",
  success:"#1A7A4A", successLight:"#E8F7EE",
  warn:"#B45309", warnLight:"#FEF3C7",
};

const DOMAIN = "kioskk.me";
const SUPER_PIN = "000000"; // ← your private PIN, Ini — change this

const CATEGORIES = [
  "Groceries & Provisions","Food & Snacks","Skincare & Beauty",
  "Fashion & Clothing","Stationery & Supplies","Electronics & Accessories",
  "Laundry & Cleaning","Tutoring & Services","Other",
];
const STATUS_LIST = ["Pending","Shopping","Delivered","Cancelled"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtNum = (n) => Number(n||0).toLocaleString();
const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const statusColor = (s) => ({Delivered:T.success,Shopping:T.warn,Cancelled:"#DC2626",Pending:T.muted}[s]||T.muted);
const statusBg    = (s) => ({Delivered:T.successLight,Shopping:T.warnLight,Cancelled:"#FEF2F2",Pending:T.accentLight}[s]||T.accentLight);
const buildWALink = (phone, msg) => `https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;

// ─── SHARED STORAGE ───────────────────────────────────────────────────────────
async function saveBusinessToShared(bizData) {
  try {
    const key = `biz_${slugify(bizData.businessName)}`;
    let record = {};
    try { const r = await window.storage.get(key,true); if(r) record = JSON.parse(r.value); } catch{}
    record.meta = {
      name:bizData.businessName, owner:bizData.ownerName,
      location:bizData.location, category:bizData.category,
      whatsapp:bizData.whatsapp, slug:slugify(bizData.businessName),
      createdAt: record.meta?.createdAt || new Date().toISOString(),
    };
    record.orders = record.orders||[];
    await window.storage.set(key, JSON.stringify(record), true);
    return key;
  } catch { return null; }
}

async function syncOrderToShared(bizKey, order) {
  try {
    let record = {};
    try { const r = await window.storage.get(bizKey,true); if(r) record = JSON.parse(r.value); } catch{}
    record.orders = [order,...(record.orders||[]).filter(o=>o.id!==order.id)];
    await window.storage.set(bizKey, JSON.stringify(record), true);
  } catch{}
}

async function getAllBusinesses() {
  try {
    const result = await window.storage.list("biz_",true);
    const keys = result?.keys||[];
    const all = await Promise.all(keys.map(async k => {
      try { const r = await window.storage.get(k,true); return r?{key:k,...JSON.parse(r.value)}:null; } catch{return null;}
    }));
    return all.filter(Boolean);
  } catch { return []; }
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Instrument+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${T.bg};font-family:'Instrument Sans',sans-serif;color:${T.ink};-webkit-tap-highlight-color:transparent;}
  ::selection{background:${T.accent};color:white;}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${T.bg};}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
  input,textarea,select{font-family:inherit;-webkit-appearance:none;appearance:none;}
  textarea{resize:vertical;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  .fu{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) both;}
  .fu2{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) .08s both;}
  .fu3{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) .16s both;}
  .spin{animation:spin .8s linear infinite;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;border:none;border-radius:8px;font-family:'Instrument Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;}
  .bp{background:${T.accent};color:white;padding:.75rem 1.4rem;font-size:.88rem;}
  .bp:hover:not(:disabled){background:#cc3b06;transform:translateY(-1px);box-shadow:0 4px 16px rgba(232,69,10,.28);}
  .bp:disabled{background:#ccc;cursor:not-allowed;}
  .bg{background:transparent;color:${T.ink};border:1.5px solid ${T.border};padding:.65rem 1.1rem;font-size:.82rem;}
  .bg:hover{border-color:${T.ink};}
  .bsm{padding:.35rem .75rem;font-size:.72rem;border-radius:5px;}
  .field{display:flex;flex-direction:column;gap:.35rem;}
  .lbl{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:${T.muted};}
  .inp{width:100%;background:white;border:1.5px solid ${T.border};border-radius:8px;padding:.68rem .9rem;font-size:.9rem;color:${T.ink};transition:border-color .15s;}
  .inp:focus{outline:none;border-color:${T.accent};box-shadow:0 0 0 3px rgba(232,69,10,.08);}
  .card{background:white;border:1px solid ${T.border};border-radius:12px;padding:1.4rem;}
  .tag{display:inline-flex;align-items:center;background:${T.accentLight};color:${T.accent};font-size:.68rem;font-weight:700;padding:.22rem .6rem;border-radius:99px;text-transform:uppercase;letter-spacing:.07em;}
`;

// ─── STABLE FIELD COMPONENT (fixes input collapse bug) ────────────────────────
const Field = ({ label, value, onChange, placeholder, type="text", rows, maxLength, style, inputStyle }) => {
  const cb = useCallback(e => onChange(e.target.value), [onChange]);
  return (
    <div className="field" style={style}>
      {label && <label className="lbl">{label}</label>}
      {type==="textarea"
        ? <textarea className="inp" rows={rows||3} placeholder={placeholder} value={value} onChange={cb} style={inputStyle}/>
        : <input className="inp" type={type} placeholder={placeholder} value={value} onChange={cb} maxLength={maxLength} style={inputStyle}/>
      }
    </div>
  );
};

// ─── SHAREABLE LINK CARD ──────────────────────────────────────────────────────
const ShareCard = ({ slug, primary }) => {
  const url = `${DOMAIN}/${slug}`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(`https://${url}`); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ background:`${primary}12`, border:`1.5px solid ${primary}33`, borderRadius:12, padding:"1.1rem 1.3rem" }}>
      <p style={{ fontSize:".7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".09em", color:primary, marginBottom:".5rem" }}>🔗 Your Store Link</p>
      <div style={{ display:"flex", alignItems:"center", gap:".6rem", flexWrap:"wrap" }}>
        <div style={{ flex:1, background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:".55rem .9rem", fontFamily:"monospace", fontSize:".88rem", color:T.ink, minWidth:0 }}>
          <span style={{ color:T.muted }}>https://</span><strong>{url}</strong>
        </div>
        <button className="btn bp bsm" onClick={copy} style={{ background:primary, flexShrink:0, padding:".55rem 1rem" }}>
          {copied?"✓ Copied!":"Copy Link"}
        </button>
      </div>
      <p style={{ color:T.muted, fontSize:".73rem", marginTop:".5rem" }}>
        Share this link on WhatsApp, Instagram bio, or as a QR code. Customers open it and order directly.
      </p>
    </div>
  );
};

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────
function SetupScreen({ onGenerate }) {
  const [biz, setBiz] = useState({
    businessName:"", ownerName:"", whatsapp:"", category:"",
    description:"", location:"", currency:"NGN", currencySymbol:"₦", pin:""
  });
  const [items, setItems]     = useState([{name:"",price:"",description:""}]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const setBizF  = useCallback((k) => (v) => setBiz(p=>({...p,[k]:v})), []);
  const setItemF = useCallback((i,k) => (v) => setItems(prev=>{const n=[...prev];n[i]={...n[i],[k]:v};return n;}), []);
  const addItem  = useCallback(()=>setItems(p=>[...p,{name:"",price:"",description:""}]),[]);
  const delItem  = useCallback((i)=>setItems(p=>p.filter((_,idx)=>idx!==i)),[]);

  const canSubmit = biz.businessName&&biz.ownerName&&biz.whatsapp&&biz.category&&biz.location&&biz.pin.length>=4&&items.some(it=>it.name&&it.price);
  const slug = slugify(biz.businessName||"your-store");

  const handleGenerate = async () => {
    setLoading(true); setError("");
    const filledItems = items.filter(i=>i.name&&i.price);
    const prompt = `Generate a micro-business storefront config. Return ONLY raw JSON, zero markdown.

Business: ${biz.businessName}
Owner: ${biz.ownerName}
Category: ${biz.category}
Description: ${biz.description||"Campus micro-business"}
Location: ${biz.location}
Currency: ${biz.currencySymbol}
Products: ${JSON.stringify(filledItems)}

JSON:
{
  "headline": "4-6 word tagline",
  "heroCopy": "2 compelling customer-facing sentences",
  "colorScheme": {"primary":"#hex","bg":"#hex"},
  "howItWorks": [
    {"step":"1","title":"Browse","desc":"one sentence"},
    {"step":"2","title":"Order","desc":"one sentence"},
    {"step":"3","title":"Receive","desc":"one sentence"}
  ],
  "orderInstructions": "1-2 sentences: what happens after order",
  "whatsappMessage": "Hi ${biz.ownerName}! I just placed an order on ${biz.businessName}.\\n\\nOrder ID: {{orderId}}\\nMy name: {{name}}\\nItems: {{items}}\\nTotal: {{total}}\\nDelivery to: {{hostel}}\\n\\nPlease confirm, thank you!",
  "ownerInsights": [
    {"label":"tip","value":"actionable growth tip"},
    {"label":"tip","value":"actionable growth tip"},
    {"label":"tip","value":"actionable growth tip"}
  ]
}

Match color to vibe: food=warm amber, beauty=blush rose, groceries=fresh green, fashion=deep navy.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error.message);
      const config = JSON.parse(data.content[0].text.replace(/```json|```/g,"").trim());
      const fullData = {...biz, items:filledItems, slug};
      await saveBusinessToShared(fullData);
      onGenerate(fullData, config);
    } catch(e) {
      setError("Generation failed — "+(e.message||"try again"));
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <style>{G}</style>
      {/* Nav */}
      <div style={{background:"white",borderBottom:`1px solid ${T.border}`,padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:".6rem"}}>
          <div style={{width:30,height:30,background:T.accent,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"white",fontSize:".62rem",fontWeight:800}}>KK</span>
          </div>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1rem"}}>kioskk.me</span>
          <span style={{color:T.muted,fontSize:".76rem"}}>— your store in 60 seconds</span>
        </div>
      </div>

      <div style={{maxWidth:620,margin:"0 auto",padding:"2.5rem 1.2rem 5rem"}}>
        <div className="fu" style={{marginBottom:"2rem"}}>
          <div className="tag" style={{marginBottom:".8rem"}}>✦ AI-Powered</div>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(2rem,5vw,2.8rem)",lineHeight:1.1,fontWeight:900,marginBottom:".7rem"}}>
            Your business.<br/><em style={{color:T.accent}}>Your store link.</em>
          </h1>
          <p style={{color:T.muted,fontSize:".9rem",lineHeight:1.7}}>
            Fill in your details and get a custom storefront at <strong>{DOMAIN}/{slug}</strong> — customers order directly, you manage everything from your dashboard.
          </p>
        </div>

        {/* Live slug preview */}
        {biz.businessName && (
          <div className="fu2" style={{background:T.accentLight,border:`1px solid ${T.accent}33`,borderRadius:10,padding:".75rem 1rem",marginBottom:"1.2rem",display:"flex",alignItems:"center",gap:".6rem"}}>
            <span style={{fontSize:".78rem",color:T.muted}}>Your link will be:</span>
            <span style={{fontFamily:"monospace",fontSize:".88rem",fontWeight:700,color:T.accent}}>https://{DOMAIN}/{slug}</span>
          </div>
        )}

        <div className="fu2" style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>

          {/* Business Info */}
          <div className="card">
            <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1rem",marginBottom:"1rem"}}>Business Info</p>
            <div style={{display:"flex",flexDirection:"column",gap:".9rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".8rem"}}>
                <Field label="Business Name" value={biz.businessName} onChange={setBizF("businessName")} placeholder="e.g. Olams Enterprise"/>
                <Field label="Your Name" value={biz.ownerName} onChange={setBizF("ownerName")} placeholder="e.g. Olaoluwa"/>
              </div>
              <Field label="WhatsApp Number (with country code)" value={biz.whatsapp} onChange={setBizF("whatsapp")} placeholder="e.g. 2348012345678"/>
              <div className="field">
                <label className="lbl">Category</label>
                <select className="inp" value={biz.category} onChange={e=>setBiz(p=>({...p,category:e.target.value}))}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Short Description (optional)" value={biz.description} onChange={setBizF("description")} placeholder="e.g. Monthly hostel groceries at UI"/>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:".8rem"}}>
                <Field label="Location / Campus" value={biz.location} onChange={setBizF("location")} placeholder="University of Ibadan"/>
                <Field label="Currency Code" value={biz.currency} onChange={setBizF("currency")} placeholder="NGN"/>
                <Field label="Symbol" value={biz.currencySymbol} onChange={setBizF("currencySymbol")} placeholder="₦"/>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="card">
            <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1rem",marginBottom:"1rem"}}>Products / Services</p>
            <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
              {items.map((item,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr auto",gap:".6rem",alignItems:"end"}}>
                  <Field label={i===0?"Item Name":undefined} value={item.name} onChange={setItemF(i,"name")} placeholder="e.g. Indomie (5 packs)"/>
                  <Field label={i===0?"Price":undefined} value={item.price} onChange={setItemF(i,"price")} placeholder="1500"/>
                  <button onClick={()=>delItem(i)} disabled={items.length===1}
                    style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:"1.3rem",paddingBottom:".1rem",lineHeight:1}}>×</button>
                </div>
              ))}
              <button className="btn bg bsm" onClick={addItem} style={{alignSelf:"flex-start"}}>+ Add Item</button>
            </div>
          </div>

          {/* PIN */}
          <div className="card">
            <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1rem",marginBottom:".4rem"}}>Dashboard PIN</p>
            <p style={{color:T.muted,fontSize:".8rem",marginBottom:".8rem",lineHeight:1.6}}>Only you can access the owner dashboard with this PIN.</p>
            <Field label="4–6 digit PIN" value={biz.pin} onChange={(v)=>setBiz(p=>({...p,pin:v.replace(/\D/g,"").slice(0,6)}))} type="password" placeholder="e.g. 1234" style={{maxWidth:180}}/>
          </div>

          {error && <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:".75rem 1rem",color:"#DC2626",fontSize:".82rem"}}>{error}</div>}

          <button className="btn bp" onClick={handleGenerate} disabled={!canSubmit||loading} style={{padding:"1rem",fontSize:".93rem",width:"100%",justifyContent:"center"}}>
            {loading
              ? <><div className="spin" style={{width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid white",borderRadius:"50%"}}/> Building your store...</>
              : "Generate My Store →"
            }
          </button>
          <p style={{textAlign:"center",color:T.muted,fontSize:".73rem"}}>~15 seconds · No account needed · Free</p>
        </div>
      </div>
    </div>
  );
}

// ─── STORE VIEW ───────────────────────────────────────────────────────────────
function StoreView({ bizData, aiConfig, cart, setCart, checkoutStep, setCheckoutStep, onOrderPlaced }) {
  const [cf, setCf] = useState({name:"",phone:"",hostel:"",notes:""});
  const setCfF = useCallback((k)=>(v)=>setCf(p=>({...p,[k]:v})),[]);
  const colors = aiConfig.colorScheme||{primary:T.accent,bg:T.bg};

  const entries    = Object.entries(cart);
  const cartTotal  = entries.reduce((s,[n,q])=>{const it=bizData.items.find(i=>i.name===n);return s+(it?Number(it.price)*q:0);},0);
  const cartCount  = entries.reduce((a,[,b])=>a+b,0);
  const addToCart  = useCallback((name)=>setCart(p=>({...p,[name]:(p[name]||0)+1})),[setCart]);
  const remFromCart= useCallback((name)=>setCart(p=>{const n={...p};n[name]>1?n[name]--:delete n[name];return n;}),[setCart]);

  const placeOrder = () => {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      id, date:new Date().toISOString(), customer:cf,
      items:entries.map(([name,qty])=>{const it=bizData.items.find(i=>i.name===name);return{name,qty,price:Number(it?.price||0),total:Number(it?.price||0)*qty};}),
      total:cartTotal, currency:bizData.currencySymbol, status:"Pending"
    };
    onOrderPlaced(order, cf, cartTotal, entries);
  };

  return (
    <div style={{minHeight:"100vh",background:colors.bg||T.bg,paddingBottom:80}}>
      {/* Hero */}
      <div style={{background:colors.primary,color:"white",padding:"2.8rem 1.5rem 2rem",textAlign:"center"}}>
        <p style={{fontSize:".7rem",fontWeight:600,textTransform:"uppercase",letterSpacing:".12em",opacity:.7,marginBottom:".5rem"}}>{bizData.location}</p>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(1.9rem,6vw,2.8rem)",fontWeight:900,lineHeight:1.1,marginBottom:".5rem"}}>{bizData.businessName}</h1>
        <p style={{opacity:.85,fontSize:".9rem",lineHeight:1.65,maxWidth:420,margin:"0 auto .8rem"}}>{aiConfig.heroCopy}</p>
        <p style={{opacity:.55,fontSize:".76rem",fontStyle:"italic",fontFamily:"'Fraunces',serif"}}>"{aiConfig.headline}"</p>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"0 1.1rem"}}>
        {/* How it works */}
        <div style={{padding:"1.5rem 0",borderBottom:`1px solid ${T.border}`}}>
          <p style={{fontSize:".66rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:T.muted,textAlign:"center",marginBottom:".8rem"}}>How it works</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".7rem"}}>
            {(aiConfig.howItWorks||[]).map((h,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:colors.primary,color:"white",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .4rem",fontSize:".75rem",fontWeight:700}}>{h.step}</div>
                <p style={{fontWeight:700,fontSize:".76rem",marginBottom:".12rem"}}>{h.title}</p>
                <p style={{color:T.muted,fontSize:".7rem",lineHeight:1.5}}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Browse */}
        {checkoutStep==="browse" && (
          <div style={{padding:"1.2rem 0"}}>
            <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.2rem",marginBottom:".85rem"}}>Order Now</p>
            <div style={{display:"flex",flexDirection:"column",gap:".65rem"}}>
              {bizData.items.map((item,i)=>(
                <div key={i} className="card" style={{padding:".85rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:".8rem"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:".87rem",marginBottom:".1rem"}}>{item.name}</p>
                    {item.description&&<p style={{color:T.muted,fontSize:".73rem"}}>{item.description}</p>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:".65rem",flexShrink:0}}>
                    <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:".95rem",color:colors.primary}}>{bizData.currencySymbol}{fmtNum(item.price)}</span>
                    {cart[item.name]?(
                      <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
                        <button onClick={()=>remFromCart(item.name)} style={{width:26,height:26,borderRadius:"50%",border:`1.5px solid ${colors.primary}`,background:"white",color:colors.primary,cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
                        <span style={{fontWeight:700,minWidth:16,textAlign:"center",fontSize:".88rem"}}>{cart[item.name]}</span>
                        <button onClick={()=>addToCart(item.name)} style={{width:26,height:26,borderRadius:"50%",background:colors.primary,border:"none",color:"white",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
                      </div>
                    ):(
                      <button onClick={()=>addToCart(item.name)} style={{background:colors.primary,color:"white",border:"none",borderRadius:6,padding:".36rem .8rem",fontSize:".76rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Add</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkout form */}
        {checkoutStep==="form" && (
          <div className="fu" style={{padding:"1.2rem 0"}}>
            <button onClick={()=>setCheckoutStep("browse")} style={{background:"none",border:"none",color:T.muted,fontSize:".78rem",cursor:"pointer",marginBottom:".9rem",display:"flex",alignItems:"center",gap:".3rem"}}>← Back</button>
            <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.2rem",marginBottom:".9rem"}}>Your Details</p>
            <div className="card" style={{marginBottom:"1rem"}}>
              {entries.map(([name,qty])=>{const it=bizData.items.find(i=>i.name===name);return(
                <div key={name} style={{display:"flex",justifyContent:"space-between",padding:".28rem 0",fontSize:".83rem"}}>
                  <span>{name} × {qty}</span>
                  <span style={{fontWeight:600}}>{bizData.currencySymbol}{fmtNum(Number(it?.price||0)*qty)}</span>
                </div>
              );})}
              <div style={{borderTop:`1px solid ${T.border}`,marginTop:".55rem",paddingTop:".55rem",display:"flex",justifyContent:"space-between",fontWeight:700}}>
                <span>Total</span><span style={{color:colors.primary}}>{bizData.currencySymbol}{fmtNum(cartTotal)}</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:".85rem"}}>
              <Field label="Full Name" value={cf.name} onChange={setCfF("name")} placeholder="Your full name"/>
              <Field label="WhatsApp Number" value={cf.phone} onChange={setCfF("phone")} placeholder="e.g. 08012345678"/>
              <Field label="Hostel / Delivery Address" value={cf.hostel} onChange={setCfF("hostel")} placeholder="e.g. Nnamdi Azikiwe, Room 204"/>
              <Field label="Notes (optional)" value={cf.notes} onChange={setCfF("notes")} type="textarea" rows={2} placeholder="Any special requests..."/>
              <div style={{background:T.warnLight,borderRadius:8,padding:".7rem .95rem",fontSize:".79rem",color:T.warn,lineHeight:1.6}}>📱 {aiConfig.orderInstructions}</div>
              <button className="btn bp" onClick={placeOrder} disabled={!cf.name||!cf.phone||!cf.hostel} style={{padding:"1rem",fontSize:".91rem",width:"100%",justifyContent:"center"}}>
                Place Order — {bizData.currencySymbol}{fmtNum(cartTotal)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart bar */}
      {checkoutStep==="browse" && cartCount>0 && (
        <div style={{position:"fixed",bottom:70,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 2.4rem)",maxWidth:530,background:T.ink,borderRadius:12,padding:".9rem 1.1rem",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:50,boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
          <div style={{color:"white"}}>
            <p style={{fontSize:".7rem",opacity:.7,marginBottom:".06rem"}}>{cartCount} item{cartCount>1?"s":""}</p>
            <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1rem"}}>{bizData.currencySymbol}{fmtNum(cartTotal)}</p>
          </div>
          <button onClick={()=>setCheckoutStep("form")} style={{background:colors.primary,color:"white",border:"none",borderRadius:8,padding:".62rem 1.1rem",fontFamily:"inherit",fontWeight:600,fontSize:".85rem",cursor:"pointer"}}>Checkout →</button>
        </div>
      )}
    </div>
  );
}

// ─── ORDER SUCCESS ─────────────────────────────────────────────────────────────
function OrderSuccess({ order, bizData, aiConfig, cf, cartTotal, entries, onReset }) {
  const colors = aiConfig.colorScheme||{primary:T.accent};
  const waMsg = (aiConfig.whatsappMessage||"Hi! Order placed.\nOrder ID: {{orderId}}\nName: {{name}}\nItems: {{items}}\nTotal: {{total}}\nDeliver to: {{hostel}}")
    .replace("{{orderId}}",order.id).replace("{{name}}",cf.name)
    .replace("{{items}}",entries.map(([n,q])=>`${n} ×${q}`).join(", "))
    .replace("{{total}}",`${bizData.currencySymbol}${fmtNum(cartTotal)}`)
    .replace("{{hostel}}",cf.hostel);
  const waLink = buildWALink(bizData.whatsapp, waMsg);

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem 1.2rem",paddingBottom:80}}>
      <div className="fu" style={{maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:T.successLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.1rem",fontSize:"1.8rem"}}>✓</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:"1.55rem",fontWeight:700,marginBottom:".35rem"}}>Order Placed! 🎉</h2>
        <p style={{color:T.muted,fontSize:".82rem",marginBottom:".2rem"}}>Order ID: <strong style={{color:T.ink}}>{order.id}</strong></p>
        <p style={{color:T.muted,fontSize:".82rem",marginBottom:"1.6rem"}}>Total: <strong style={{color:colors.primary}}>{bizData.currencySymbol}{fmtNum(cartTotal)}</strong></p>

        <div className="card" style={{textAlign:"left",marginBottom:"1.3rem"}}>
          <p style={{fontWeight:700,fontSize:".84rem",marginBottom:".45rem"}}>✅ One last step</p>
          <p style={{color:T.muted,fontSize:".81rem",lineHeight:1.65}}>
            Tap below to message <strong>{bizData.ownerName}</strong> on WhatsApp. Your full order is pre-typed — just hit <strong>Send</strong> to confirm!
          </p>
        </div>

        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem",background:"#25D366",color:"white",borderRadius:10,padding:".9rem 1.4rem",fontSize:".92rem",fontWeight:700,textDecoration:"none",marginBottom:".85rem",fontFamily:"'Instrument Sans',sans-serif",transition:"all .15s"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.857L.054 23.28a.75.75 0 00.917.997l5.652-1.48A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.92 0-3.72-.5-5.28-1.376l-.38-.22-3.937 1.03 1.05-3.832-.247-.394A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Confirm Order on WhatsApp
        </a>

        <button className="btn bg" onClick={onReset} style={{width:"100%",justifyContent:"center"}}>Order More Items</button>
      </div>
    </div>
  );
}

// ─── OWNER DASHBOARD ──────────────────────────────────────────────────────────
function DashView({ bizData, aiConfig, orders, setOrders, bizKey }) {
  const [pin, setPin]       = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinErr, setPinErr] = useState(false);
  const colors = aiConfig.colorScheme||{primary:T.accent};

  const tryUnlock = useCallback(()=>{
    if(pin===bizData.pin){setUnlocked(true);setPinErr(false);}else setPinErr(true);
  },[pin,bizData.pin]);

  const updateStatus = useCallback((id,status)=>{
    setOrders(prev=>{
      const updated=prev.map(o=>o.id===id?{...o,status}:o);
      if(bizKey) syncOrderToShared(bizKey,updated.find(o=>o.id===id));
      return updated;
    });
  },[setOrders,bizKey]);

  if(!unlocked) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",paddingBottom:80}}>
      <div className="card fu" style={{maxWidth:320,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:"2rem",marginBottom:".65rem"}}>🔐</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.3rem",marginBottom:".3rem"}}>Owner Dashboard</h2>
        <p style={{color:T.muted,fontSize:".78rem",marginBottom:"1.2rem"}}>Enter your PIN to manage orders</p>
        <input className="inp" type="password" placeholder="PIN" maxLength={6} value={pin}
          onChange={e=>{setPin(e.target.value.replace(/\D/g,""));setPinErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
          style={{textAlign:"center",letterSpacing:".3em",fontSize:"1.1rem",marginBottom:".65rem"}}/>
        {pinErr&&<p style={{color:"#DC2626",fontSize:".75rem",marginBottom:".6rem"}}>Wrong PIN</p>}
        <button className="btn bp" style={{width:"100%",justifyContent:"center"}} onClick={tryUnlock}>Unlock →</button>
      </div>
    </div>
  );

  const stats = {
    total:orders.length,
    revenue:orders.filter(o=>o.status!=="Cancelled").reduce((s,o)=>s+o.total,0),
    pending:orders.filter(o=>o.status==="Pending").length,
    delivered:orders.filter(o=>o.status==="Delivered").length,
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,paddingBottom:80}}>
      <div style={{background:"white",borderBottom:`1px solid ${T.border}`,padding:".85rem 1.3rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1rem"}}>{bizData.businessName}</p>
          <p style={{color:T.muted,fontSize:".72rem"}}>Welcome, {bizData.ownerName}</p>
        </div>
        <button onClick={()=>setUnlocked(false)} style={{background:"none",border:"none",color:T.muted,fontSize:".74rem",cursor:"pointer"}}>Lock</button>
      </div>

      <div style={{maxWidth:660,margin:"0 auto",padding:"1.2rem 1.1rem"}}>

        {/* Share card */}
        <div style={{marginBottom:"1.1rem"}}>
          <ShareCard slug={bizData.slug||slugify(bizData.businessName)} primary={colors.primary}/>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:".7rem",marginBottom:"1.1rem"}}>
          {[
            {label:"Total Orders",value:stats.total},
            {label:"Revenue",value:`${bizData.currencySymbol}${fmtNum(stats.revenue)}`,accent:true},
            {label:"Pending",value:stats.pending},
            {label:"Delivered",value:stats.delivered},
          ].map((s,i)=>(
            <div key={i} style={{background:s.accent?colors.primary:"white",border:s.accent?"none":`1px solid ${T.border}`,borderRadius:10,padding:".9rem 1.05rem"}}>
              <p style={{fontSize:".67rem",fontWeight:600,textTransform:"uppercase",letterSpacing:".08em",color:s.accent?"rgba(255,255,255,.7)":T.muted,marginBottom:".22rem"}}>{s.label}</p>
              <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.5rem",color:s.accent?"white":T.ink}}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        {aiConfig.ownerInsights?.length>0&&(
          <div className="card" style={{marginBottom:"1rem"}}>
            <p style={{fontWeight:700,fontSize:".82rem",marginBottom:".7rem"}}>💡 Growth Tips</p>
            {aiConfig.ownerInsights.map((tip,i)=>(
              <div key={i} style={{display:"flex",gap:".55rem",marginBottom:i<aiConfig.ownerInsights.length-1?".6rem":0}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:colors.primary,marginTop:5,flexShrink:0}}/>
                <div>
                  <p style={{fontWeight:600,fontSize:".78rem"}}>{tip.label}</p>
                  <p style={{color:T.muted,fontSize:".75rem",lineHeight:1.55}}>{tip.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.05rem",marginBottom:".7rem"}}>Orders ({orders.length})</p>
        {orders.length===0?(
          <div className="card" style={{textAlign:"center",padding:"2.5rem",color:T.muted}}>
            <p style={{fontSize:"1.4rem",marginBottom:".4rem"}}>📭</p>
            <p style={{fontSize:".82rem"}}>No orders yet — share your store link above!</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:".6rem"}}>
            {orders.map(order=>(
              <div key={order.id} className="card" style={{padding:".9rem 1.05rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:".6rem",marginBottom:".5rem"}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:".85rem"}}>{order.customer.name}</p>
                    <p style={{color:T.muted,fontSize:".72rem"}}>{order.customer.hostel} · {order.customer.phone}</p>
                    <p style={{color:T.muted,fontSize:".68rem"}}>{new Date(order.date).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:".95rem",marginBottom:".22rem"}}>{order.currency}{fmtNum(order.total)}</p>
                    <span style={{background:statusBg(order.status),color:statusColor(order.status),fontSize:".63rem",fontWeight:700,padding:".15rem .45rem",borderRadius:4,textTransform:"uppercase",letterSpacing:".05em"}}>{order.status}</span>
                  </div>
                </div>
                <p style={{fontSize:".74rem",color:T.muted,marginBottom:".5rem"}}>{order.items.map(i=>`${i.name} ×${i.qty}`).join(" · ")}</p>
                {order.customer.notes&&<p style={{fontSize:".72rem",color:T.muted,fontStyle:"italic",marginBottom:".5rem"}}>"{order.customer.notes}"</p>}
                <div style={{display:"flex",gap:".32rem",flexWrap:"wrap"}}>
                  {STATUS_LIST.map(s=>(
                    <button key={s} className="btn bsm" onClick={()=>updateStatus(order.id,s)}
                      style={{background:order.status===s?colors.primary:T.bg,color:order.status===s?"white":T.muted,border:`1px solid ${order.status===s?colors.primary:T.border}`}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
function SuperAdmin({ onExit }) {
  const [pin, setPin]         = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinErr, setPinErr]   = useState(false);
  const [businesses, setBiz]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const tryUnlock = useCallback(()=>{
    if(pin===SUPER_PIN){setUnlocked(true);loadAll();}else setPinErr(true);
  },[pin]);

  const loadAll = async()=>{setLoading(true);const all=await getAllBusinesses();setBiz(all);setLoading(false);};

  const totalRev    = businesses.reduce((s,b)=>s+(b.orders||[]).filter(o=>o.status!=="Cancelled").reduce((r,o)=>r+o.total,0),0);
  const totalOrders = businesses.reduce((s,b)=>s+(b.orders||[]).length,0);

  if(!unlocked) return (
    <div style={{minHeight:"100vh",background:"#090909",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <style>{G}</style>
      <div className="fu" style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,padding:"2.5rem",maxWidth:330,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:"2rem",marginBottom:".65rem"}}>👑</div>
        <h2 style={{fontFamily:"'Fraunces',serif",color:"white",fontWeight:700,fontSize:"1.35rem",marginBottom:".3rem"}}>kioskk Admin</h2>
        <p style={{color:"#555",fontSize:".78rem",marginBottom:"1.2rem"}}>Super-admin only</p>
        <input className="inp" type="password" placeholder="Admin PIN" maxLength={6} value={pin}
          onChange={e=>{setPin(e.target.value.replace(/\D/g,""));setPinErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
          style={{textAlign:"center",letterSpacing:".3em",fontSize:"1.1rem",marginBottom:".65rem",background:"#1a1a1a",border:"1.5px solid #2a2a2a",color:"white"}}/>
        {pinErr&&<p style={{color:"#f87171",fontSize:".75rem",marginBottom:".6rem"}}>Incorrect PIN</p>}
        <button className="btn bp" style={{width:"100%",justifyContent:"center"}} onClick={tryUnlock}>Access →</button>
        <button onClick={onExit} style={{background:"none",border:"none",color:"#444",fontSize:".74rem",cursor:"pointer",marginTop:".75rem",fontFamily:"inherit"}}>← Back to main</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#090909"}}>
      <style>{G}</style>
      <div style={{background:"#0f0f0f",borderBottom:"1px solid #1a1a1a",padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:".6rem"}}>
          <span style={{fontSize:"1.1rem"}}>👑</span>
          <span style={{fontFamily:"'Fraunces',serif",color:"white",fontWeight:700,fontSize:"1rem"}}>kioskk Admin</span>
          <span style={{background:T.accent,color:"white",fontSize:".6rem",fontWeight:700,padding:".14rem .48rem",borderRadius:99}}>SUPER</span>
        </div>
        <div style={{display:"flex",gap:".6rem"}}>
          <button onClick={loadAll} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888",borderRadius:6,padding:".38rem .85rem",fontSize:".73rem",cursor:"pointer",fontFamily:"inherit"}}>↻ Refresh</button>
          <button onClick={onExit} style={{background:"none",border:"none",color:"#444",fontSize:".73rem",cursor:"pointer",fontFamily:"inherit"}}>← Exit</button>
        </div>
      </div>

      <div style={{maxWidth:780,margin:"0 auto",padding:"1.5rem 1.2rem 4rem"}}>
        {/* Global stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".7rem",marginBottom:"1.5rem"}}>
          {[
            {icon:"🏪",label:"Businesses",value:businesses.length},
            {icon:"📦",label:"Total Orders",value:totalOrders},
            {icon:"💰",label:"Platform GMV",value:`₦${fmtNum(totalRev)}`},
          ].map((s,i)=>(
            <div key={i} style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:"1rem"}}>
              <p style={{fontSize:"1.15rem",marginBottom:".3rem"}}>{s.icon}</p>
              <p style={{fontSize:".63rem",fontWeight:600,textTransform:"uppercase",letterSpacing:".08em",color:"#444",marginBottom:".2rem"}}>{s.label}</p>
              <p style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:"1.4rem",color:"white"}}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading&&<p style={{color:"#444",fontSize:".82rem",textAlign:"center",padding:"2rem"}}>Loading...</p>}

        {!loading&&businesses.length===0&&(
          <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:"2.5rem",textAlign:"center"}}>
            <p style={{fontSize:"1.3rem",marginBottom:".4rem"}}>🏜️</p>
            <p style={{color:"#444",fontSize:".82rem"}}>No businesses yet</p>
          </div>
        )}

        {businesses.map(biz=>{
          const bizOrders=biz.orders||[];
          const rev=bizOrders.filter(o=>o.status!=="Cancelled").reduce((s,o)=>s+o.total,0);
          const isOpen=selected===biz.key;
          const slug=biz.meta?.slug||slugify(biz.meta?.name||"");
          return (
            <div key={biz.key} style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,marginBottom:".65rem",overflow:"hidden"}}>
              <div onClick={()=>setSelected(isOpen?null:biz.key)} style={{padding:"1rem 1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".2rem"}}>
                    <p style={{color:"white",fontWeight:700,fontSize:".9rem"}}>{biz.meta?.name}</p>
                    <span style={{background:"#1e1e1e",color:"#666",fontSize:".6rem",padding:".1rem .42rem",borderRadius:99}}>{biz.meta?.category}</span>
                  </div>
                  <p style={{color:"#555",fontSize:".72rem"}}>{biz.meta?.owner} · {biz.meta?.location}</p>
                  <p style={{color:"#E8450A",fontSize:".7rem",fontFamily:"monospace"}}>{DOMAIN}/{slug}</p>
                  {biz.meta?.whatsapp&&<p style={{color:"#25D366",fontSize:".68rem"}}>wa: +{biz.meta.whatsapp}</p>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <p style={{color:"white",fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:".98rem"}}>₦{fmtNum(rev)}</p>
                  <p style={{color:"#555",fontSize:".69rem"}}>{bizOrders.length} order{bizOrders.length!==1?"s":""}</p>
                  <p style={{color:"#333",fontSize:".63rem",marginTop:".2rem"}}>{isOpen?"▲":"▼"}</p>
                </div>
              </div>

              {isOpen&&(
                <div style={{borderTop:"1px solid #1a1a1a",padding:"1rem 1.2rem"}}>
                  {/* Share link in admin too */}
                  <div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:8,padding:".65rem .9rem",marginBottom:".8rem",display:"flex",alignItems:"center",gap:".5rem",flexWrap:"wrap"}}>
                    <span style={{color:"#555",fontSize:".72rem"}}>Store link:</span>
                    <span style={{fontFamily:"monospace",fontSize:".8rem",color:T.accent}}>https://{DOMAIN}/{slug}</span>
                  </div>
                  {bizOrders.length===0?(
                    <p style={{color:"#333",fontSize:".78rem",textAlign:"center",padding:"1rem"}}>No orders yet</p>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",gap:".45rem"}}>
                      {bizOrders.slice(0,10).map(order=>(
                        <div key={order.id} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:".7rem"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:".28rem"}}>
                            <div>
                              <p style={{color:"white",fontWeight:600,fontSize:".81rem"}}>{order.customer?.name}</p>
                              <p style={{color:"#444",fontSize:".68rem"}}>{order.customer?.hostel} · {order.id}</p>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <p style={{color:"white",fontWeight:700,fontSize:".83rem"}}>{order.currency}{fmtNum(order.total)}</p>
                              <span style={{background:statusBg(order.status),color:statusColor(order.status),fontSize:".58rem",fontWeight:700,padding:".1rem .38rem",borderRadius:3,textTransform:"uppercase"}}>{order.status}</span>
                            </div>
                          </div>
                          <p style={{color:"#333",fontSize:".68rem"}}>{(order.items||[]).map(i=>`${i.name} ×${i.qty}`).join(" · ")}</p>
                        </div>
                      ))}
                      {bizOrders.length>10&&<p style={{color:"#333",fontSize:".7rem",textAlign:"center"}}>+ {bizOrders.length-10} more orders</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── GENERATED APP SHELL ──────────────────────────────────────────────────────
function GeneratedApp({ bizData, aiConfig }) {
  const [view, setView]             = useState("store");
  const [cart, setCart]             = useState({});
  const [checkoutStep, setCheckoutStep] = useState("browse");
  const [doneOrder, setDoneOrder]   = useState(null);
  const [doneMeta, setDoneMeta]     = useState({cf:{},total:0,entries:[]});
  const [bizKey, setBizKey]         = useState(null);
  const [orders, setOrders]         = useState(()=>{try{return JSON.parse(localStorage.getItem(`k_orders_${bizData.slug}`)||"[]");}catch{return[];}});
  const colors = aiConfig.colorScheme||{primary:T.accent};

  useEffect(()=>{saveBusinessToShared(bizData).then(k=>setBizKey(k));},[]);

  const wrappedSetOrders = useCallback(updater=>{
    setOrders(prev=>{
      const next=typeof updater==="function"?updater(prev):updater;
      try{localStorage.setItem(`k_orders_${bizData.slug}`,JSON.stringify(next));}catch{}
      return next;
    });
  },[bizData.slug]);

  const handleOrderPlaced = useCallback((order,cf,cartTotal,entries)=>{
    wrappedSetOrders(prev=>[order,...prev]);
    if(bizKey) syncOrderToShared(bizKey,order);
    setDoneOrder(order); setDoneMeta({cf,total:cartTotal,entries});
    setCheckoutStep("done");
  },[wrappedSetOrders,bizKey]);

  const handleReset = useCallback(()=>{setCart({});setCheckoutStep("browse");setDoneOrder(null);},[]);

  const TABS=[{key:"store",label:"🛒 Store",sub:"Customer view"},{key:"dashboard",label:"📊 Dashboard",sub:"Owner only"}];

  return (
    <div>
      <style>{G}</style>
      {view==="store"&&checkoutStep!=="done"&&<StoreView bizData={bizData} aiConfig={aiConfig} cart={cart} setCart={setCart} checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} onOrderPlaced={handleOrderPlaced}/>}
      {view==="store"&&checkoutStep==="done"&&doneOrder&&<OrderSuccess order={doneOrder} bizData={bizData} aiConfig={aiConfig} cf={doneMeta.cf} cartTotal={doneMeta.total} entries={doneMeta.entries} onReset={handleReset}/>}
      {view==="dashboard"&&<DashView bizData={bizData} aiConfig={aiConfig} orders={orders} setOrders={wrappedSetOrders} bizKey={bizKey}/>}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:`1px solid ${T.border}`,display:"flex",zIndex:100}}>
        {TABS.map(tab=>(
          <button key={tab.key} onClick={()=>setView(tab.key)}
            style={{flex:1,padding:".62rem",background:"none",border:"none",cursor:"pointer",borderTop:`2px solid ${view===tab.key?colors.primary:"transparent"}`,transition:"all .15s"}}>
            <p style={{fontSize:".79rem",fontWeight:700,color:view===tab.key?colors.primary:T.muted}}>{tab.label}</p>
            <p style={{fontSize:".62rem",color:T.muted}}>{tab.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [stage, setStage]     = useState("setup");
  const [bizData, setBizData] = useState(null);
  const [aiConfig, setAiConfig] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const clicks = useRef(0);

  // Secret: tap top-left corner 5× to open admin
  const handleCornerTap = useCallback(()=>{
    clicks.current++;
    if(clicks.current>=5){clicks.current=0;setShowAdmin(true);}
  },[]);

  const handleGenerate = useCallback((data,config)=>{setBizData(data);setAiConfig(config);setStage("app");},[]);

  if(showAdmin) return <SuperAdmin onExit={()=>setShowAdmin(false)}/>;
  if(stage==="app") return <GeneratedApp bizData={bizData} aiConfig={aiConfig}/>;

  return (
    <div>
      <style>{G}</style>
      <div onClick={handleCornerTap} style={{position:"fixed",top:0,left:0,width:70,height:52,zIndex:999,cursor:"default"}}/>
      <SetupScreen onGenerate={handleGenerate}/>
    </div>
  );
}
