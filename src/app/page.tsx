export default function Home() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;1,300&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
*{box-sizing:border-box;margin:0;padding:0;}
.r{font-family:'Inter',sans-serif;background:#FAFAF8;color:#1a1a18;}
.nav{display:flex;align-items:center;justify-content:space-between;padding:18px 48px;border-bottom:0.5px solid rgba(0,0,0,0.07);}
.logo{display:flex;align-items:center;gap:10px;}
.lm{width:30px;height:30px;background:#1a1a18;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#FAFAF8;font-size:11px;font-weight:600;letter-spacing:0.3px;}
.lt{font-size:14px;font-weight:500;letter-spacing:-0.2px;}
.nav-cta{height:34px;padding:0 16px;background:#1a1a18;color:#FAFAF8;border:none;border-radius:8px;font-size:12px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:-0.1px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;}

.hero{padding:96px 48px 80px;max-width:860px;margin:0 auto;text-align:center;}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:#888780;margin-bottom:28px;}
.eline{width:18px;height:0.5px;background:#888780;}
.h1{font-size:52px;font-weight:300;line-height:1.1;letter-spacing:-2.5px;color:#1a1a18;margin-bottom:20px;}
.h1 strong{font-weight:500;}
.h1 em{font-style:italic;color:#888780;font-weight:300;}
.hero-sub{font-size:16px;color:#888780;font-weight:400;line-height:1.65;max-width:480px;margin:0 auto 40px;letter-spacing:-0.2px;}
.hero-sub strong{color:#1a1a18;font-weight:500;}
.hero-btns{display:flex;align-items:center;justify-content:center;gap:12px;}
.btn-primary{height:48px;padding:0 28px;background:#1a1a18;color:#FAFAF8;border:none;border-radius:10px;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:-0.2px;display:inline-flex;align-items:center;gap:8px;}
.btn-ghost{height:48px;padding:0 20px;background:none;color:#888780;border:0.5px solid rgba(0,0,0,0.15);border-radius:10px;font-size:13px;font-weight:400;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:-0.1px;}

.pain{padding:0 48px 80px;max-width:860px;margin:0 auto;}
.pain-label{font-size:10px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:#B4B2A9;margin-bottom:20px;display:flex;align-items:center;gap:10px;}
.pain-label::after{content:'';flex:1;height:0.5px;background:rgba(0,0,0,0.08);}
.pain-quote{font-size:22px;font-weight:300;line-height:1.5;letter-spacing:-0.8px;color:#1a1a18;border-left:2px solid #1a1a18;padding-left:24px;margin-bottom:12px;}
.pain-attr{font-size:12px;color:#B4B2A9;padding-left:26px;letter-spacing:0.2px;}

.features{padding:0 48px 80px;max-width:860px;margin:0 auto;}
.section-head{margin-bottom:40px;}
.section-label{font-size:10px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:#B4B2A9;margin-bottom:10px;display:flex;align-items:center;gap:10px;}
.section-label::after{content:'';flex:1;height:0.5px;background:rgba(0,0,0,0.08);}
.section-h2{font-size:30px;font-weight:300;letter-spacing:-1px;color:#1a1a18;line-height:1.2;}
.section-h2 strong{font-weight:500;}
.feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(0,0,0,0.07);border:0.5px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;}
.feat-cell{background:#FAFAF8;padding:28px 28px 32px;}
.feat-icon{width:36px;height:36px;border-radius:8px;border:0.5px solid rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;color:#1a1a18;}
.feat-title{font-size:15px;font-weight:500;letter-spacing:-0.3px;margin-bottom:6px;}
.feat-body{font-size:13px;color:#888780;line-height:1.6;letter-spacing:-0.1px;}
.feat-pill{display:inline-block;font-size:10px;font-weight:500;background:#1a1a18;color:#FAFAF8;padding:3px 9px;border-radius:100px;margin-top:10px;letter-spacing:0.3px;}

.how{padding:0 48px 80px;max-width:860px;margin:0 auto;}
.steps{display:flex;flex-direction:column;gap:0;}
.step{display:flex;gap:24px;padding:28px 0;border-bottom:0.5px solid rgba(0,0,0,0.07);}
.step:last-child{border-bottom:none;}
.step-num{font-size:11px;font-weight:500;color:#B4B2A9;width:28px;flex-shrink:0;padding-top:2px;letter-spacing:0.5px;}
.step-t{font-size:16px;font-weight:500;letter-spacing:-0.4px;margin-bottom:4px;}
.step-d{font-size:13px;color:#888780;line-height:1.6;}

.proof{padding:0 48px 80px;max-width:860px;margin:0 auto;}
.proof-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.proof-card{background:#fff;border:0.5px solid rgba(0,0,0,0.08);border-radius:12px;padding:20px;}
.proof-name{font-size:12px;font-weight:500;margin-bottom:2px;letter-spacing:-0.1px;}
.proof-biz{font-size:11px;color:#B4B2A9;margin-bottom:12px;letter-spacing:0.1px;}
.proof-text{font-size:13px;color:#444441;line-height:1.6;letter-spacing:-0.1px;}

.cta-section{padding:0 48px 80px;max-width:860px;margin:0 auto;}
.cta-box{background:#1a1a18;border-radius:20px;padding:56px 48px;text-align:center;}
.cta-h{font-size:36px;font-weight:300;letter-spacing:-1.5px;color:#FAFAF8;line-height:1.15;margin-bottom:12px;}
.cta-h strong{font-weight:500;}
.cta-h em{font-style:italic;color:rgba(255,255,255,0.4);}
.cta-sub{font-size:14px;color:rgba(255,255,255,0.45);margin-bottom:32px;line-height:1.6;}
.cta-btn{height:50px;padding:0 32px;background:#FAFAF8;color:#1a1a18;border:none;border-radius:10px;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:8px;}
.cta-meta{margin-top:16px;font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:0.3px;}

.footer{padding:32px 48px;border-top:0.5px solid rgba(0,0,0,0.07);display:flex;justify-content:space-between;align-items:center;}
.foot-txt{font-size:12px;color:#B4B2A9;}
.foot-tag{font-size:11px;color:#D3D1C7;letter-spacing:0.3px;}

.stat-row{display:flex;align-items:center;justify-content:center;gap:40px;padding:32px 0 64px;border-bottom:0.5px solid rgba(0,0,0,0.07);margin-bottom:64px;}
.stat{text-align:center;}
.stat-n{font-size:26px;font-weight:300;letter-spacing:-1px;color:#1a1a18;}
.stat-l{font-size:11px;color:#B4B2A9;letter-spacing:0.3px;margin-top:2px;}
.stat-div{width:0.5px;height:30px;background:rgba(0,0,0,0.1);}`}</style>
      <div className="r">
        <nav className="nav">
          <div className="logo">
            <div className="lm">KK</div>
            <span className="lt">kioskk.me</span>
          </div>
          <a className="nav-cta" href="/create">Create your store →</a>
        </nav>

        <div className="hero">
          <div className="eyebrow"><div className="eline" />Built for student vendors<div className="eline" /></div>
          <h1 className="h1">
            Stop managing your<br />
            business <em>by hand.</em><br />
            <strong>Your store. In 60 seconds.</strong>
          </h1>
          <p className="hero-sub">
            You have <strong>products to sell.</strong> Not messages to reply, orders to track, or catalogues to type out every morning. Kioskk handles all of it.
          </p>
          <div className="hero-btns">
            <a className="btn-primary" href="/create">Build my store free <i className="ti ti-arrow-right" aria-hidden="true" /></a>
            <a className="btn-ghost" href="#how-it-works">See how it works</a>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px" }}>
          <div className="stat-row">
            <div className="stat">
              <div className="stat-n">60s</div>
              <div className="stat-l">to go live</div>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <div className="stat-n">0 apps</div>
              <div className="stat-l">to download</div>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <div className="stat-n">₦0</div>
              <div className="stat-l">to start</div>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <div className="stat-n">1 link</div>
              <div className="stat-l">shares everything</div>
            </div>
          </div>
        </div>

        <div className="pain">
          <div className="pain-label">The problem</div>
          <p className="pain-quote">"I spent more time taking orders on WhatsApp than actually running my business."</p>
          <p className="pain-attr">— Every campus vendor, ever.</p>
        </div>

        <div className="features">
          <div className="section-head">
            <div className="section-label">What kioskk does</div>
            <h2 className="section-h2">Everything your business needs.<br /><strong>Nothing you don't.</strong></h2>
          </div>
          <div className="feat-grid">
            <div className="feat-cell">
              <div className="feat-icon"><i className="ti ti-layout-list" style={{ fontSize: 18 }} aria-hidden="true" /></div>
              <div className="feat-title">Your catalogue, online</div>
              <div className="feat-body">One link. Every product, price, and description — always up to date. Share it once, everywhere.</div>
              <span className="feat-pill">No more typing lists</span>
            </div>
            <div className="feat-cell">
              <div className="feat-icon"><i className="ti ti-device-mobile-message" style={{ fontSize: 18 }} aria-hidden="true" /></div>
              <div className="feat-title">Orders without the back-and-forth</div>
              <div className="feat-body">Customers order directly from your storefront. You get notified. No 47-message WhatsApp thread required.</div>
              <span className="feat-pill">Auto order management</span>
            </div>
            <div className="feat-cell">
              <div className="feat-icon"><i className="ti ti-file-invoice" style={{ fontSize: 18 }} aria-hidden="true" /></div>
              <div className="feat-title">Invoices, automatically</div>
              <div className="feat-body">Every order generates a clean invoice. Your customers look professional. So do you.</div>
              <span className="feat-pill">Instant invoicing</span>
            </div>
            <div className="feat-cell">
              <div className="feat-icon"><i className="ti ti-chart-bar" style={{ fontSize: 18 }} aria-hidden="true" /></div>
              <div className="feat-title">Know your numbers</div>
              <div className="feat-body">Sales dashboard in your pocket. See what's selling, what isn't, and what to do next.</div>
              <span className="feat-pill">Business dashboard</span>
            </div>
          </div>
        </div>

        <div className="how" id="how-it-works">
          <div className="section-head">
            <div className="section-label">How it works</div>
            <h2 className="section-h2">Three steps.<br /><strong>Then you're open for business.</strong></h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-content">
                <div className="step-t">Tell us about your business</div>
                <div className="step-d">Name, category, what you sell, your WhatsApp — takes under a minute. No account needed.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-content">
                <div className="step-t">AI builds your storefront</div>
                <div className="step-d">In about 15 seconds, a fully designed store is generated at kioskk.me/your-name. Logo, catalogue, order flow — all of it.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-content">
                <div className="step-t">Share your link. Start selling.</div>
                <div className="step-d">Drop it in your WhatsApp bio, Instagram, or just send it to your first customer. You're a real business now.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="proof">
          <div className="section-head">
            <div className="section-label">Real vendors. Real results.</div>
          </div>
          <div className="proof-grid">
            <div className="proof-card">
              <div className="proof-name">Amara O.</div>
              <div className="proof-biz">Food vendor · UI campus</div>
              <div className="proof-text">"I used to wake up to 30 unread messages. Now I wake up to orders. Big difference."</div>
            </div>
            <div className="proof-card">
              <div className="proof-name">Seun A.</div>
              <div className="proof-biz">Accessories · UNILAG</div>
              <div className="proof-text">"My customers take me more seriously now. I have an actual store, not just a WhatsApp number."</div>
            </div>
            <div className="proof-card">
              <div className="proof-name">Kemi B.</div>
              <div className="proof-biz">Thrift & fashion · OAU</div>
              <div className="proof-text">"Set it up in the library between classes. By evening I had my first order through the link."</div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-box">
            <div className="cta-h">
              Your business deserves<br />
              better than a <em>WhatsApp thread.</em><br />
              <strong>Start free. Right now.</strong>
            </div>
            <p className="cta-sub">No downloads. No credit card. No technical knowledge required.<br />Just your business, live on the internet in 60 seconds.</p>
            <a className="cta-btn" href="/create">Build my store <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" /></a>
            <div className="cta-meta">Free forever for your first store · kioskk.me</div>
          </div>
        </div>

        <footer className="footer">
          <div className="logo">
            <div className="lm">KK</div>
            <span className="lt">kioskk.me</span>
          </div>
          <div className="foot-tag">YOUR STORE IN 60 SECONDS</div>
          <div className="foot-txt">Built for Africa's next million vendors.</div>
        </footer>
      </div>
    </>
  );
}