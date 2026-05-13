import Link from "next/link";

export default function Home() {
  const stats = [
    { number: "60s", label: "to go live" },
    { number: "0 apps", label: "to download" },
    { number: "₦0", label: "to start" },
    { number: "1 link", label: "shares everything" },
  ];
  const testimonials = [
    {
      name: "Amara O.",
      business: "Food vendor · UI campus",
      text: "I used to wake up to 30 unread messages. Now I wake up to orders. Big difference.",
    },
    {
      name: "Seun A.",
      business: "Accessories · UNILAG",
      text: "My customers take me more seriously now. I have an actual store, not just a WhatsApp number.",
    },
    {
      name: "Kemi B.",
      business: "Thrift & fashion · OAU",
      text: "Set it up in the library between classes. By evening I had my first order through the link.",
    },
  ];

  return (
    <>
      <div className="r">
        <nav className="nav">
          <div className="logo">
            <img className="brand-logo" src="/kioskk-logo.svg" alt="kioskk.me" />
          </div>
          <Link className="nav-cta" href="/create">Create your store →</Link>
        </nav>

        <div className="hero">
          <div className="eyebrow"><div className="eline" />Built for vendors<div className="eline" /></div>
          <h1 className="h1">
            Stop managing your<br />
            business <em>by hand.</em><br />
            <strong>Your store. In 60 seconds.</strong>
          </h1>
          <p className="hero-sub">
            You have <strong>products to sell.</strong> Not messages to reply, orders to track, or catalogues to type out every morning. Kioskk handles all of it.
          </p>
          <div className="hero-btns">
            <Link className="btn-primary" href="/create">Build my store free <i className="ti ti-arrow-right" aria-hidden="true" /></Link>
            <a className="btn-ghost" href="#how-it-works">See how it works</a>
          </div>
        </div>

        <div className="stats-wrap">
          <div className="stats-marquee">
            <div className="stats-track">
              <div className="stat-row">
                {stats.map((item, index) => (
                  <div className="stat-unit" key={`primary-${item.number}`}>
                    <div className="stat">
                      <div className="stat-n">{item.number}</div>
                      <div className="stat-l">{item.label}</div>
                    </div>
                    {index < stats.length - 1 ? <div className="stat-div" /> : null}
                  </div>
                ))}
              </div>

              <div className="stat-row stat-row--dup" aria-hidden="true">
                {stats.map((item, index) => (
                  <div className="stat-unit" key={`copy-${item.number}`}>
                    <div className="stat">
                      <div className="stat-n">{item.number}</div>
                      <div className="stat-l">{item.label}</div>
                    </div>
                    {index < stats.length - 1 ? <div className="stat-div" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pain">
          <div className="pain-label">The problem</div>
          <p className="pain-quote">I spent more time taking orders on WhatsApp than actually running my business.</p>
          <p className="pain-attr">— Every campus vendor, ever.</p>
        </div>

        <div className="features">
          <div className="section-head">
            <div className="section-label">What kioskk does</div>
            <h2 className="section-h2">Everything your business needs.<br /><strong>Nothing you don&#39;t.</strong></h2>
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
              <div className="feat-body">Sales dashboard in your pocket. See what&#39;s selling, what isn&#39;t, and what to do next.</div>
              <span className="feat-pill">Business dashboard</span>
            </div>
          </div>
        </div>

        <div className="how" id="how-it-works">
          <div className="section-head">
            <div className="section-label">How it works</div>
            <h2 className="section-h2">Three steps.<br /><strong>Then you are open for business.</strong></h2>
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
                <div className="step-d">Drop it in your WhatsApp bio, Instagram, or just send it to your first customer. You are a real business now.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="proof">
          <div className="section-head">
            <div className="section-label">Real vendors. Real results.</div>
          </div>
          <div className="proof-track">
            <div className="proof-grid">
              {testimonials.map((item) => (
                <div className="proof-card" key={`primary-${item.name}`}>
                  <div className="proof-name">{item.name}</div>
                  <div className="proof-biz">{item.business}</div>
                  <div className="proof-text">{item.text}</div>
                </div>
              ))}
            </div>

            <div className="proof-grid proof-grid--dup" aria-hidden="true">
              {testimonials.map((item) => (
                <div className="proof-card" key={`copy-${item.name}`}>
                  <div className="proof-name">{item.name}</div>
                  <div className="proof-biz">{item.business}</div>
                  <div className="proof-text">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-box">
            <p className="cta-line"><strong>Launch your store in 60 seconds.</strong> One clean link for products, orders, and invoices.</p>
            <Link className="cta-btn" href="/create">Build my store <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" /></Link>
          </div>
        </div>

        <footer className="footer">
          <div className="logo">
            <img className="brand-logo" src="/kioskk-logo.svg" alt="kioskk.me" />
          </div>
          <div className="foot-tag">© 2026 kioskk.me</div>
          <div className="foot-txt">Built for Africa&#39;s next million vendors.</div>
        </footer>
      </div>
    </>
  );
}