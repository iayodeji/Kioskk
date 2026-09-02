"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) return;

    // Connect this to your waitlist backend/API.
    console.log("Waitlist signup:", email);

    setSubmitted(true);
    setEmail("");
  }

  return (
    <main className="site">

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="brand" aria-label="Kioskk home">
          <Image
            src="/kioskk-logo.svg"
            alt="Kioskk"
            width={34}
            height={34}
            priority
          />
          <span>kioskk</span>
        </a>

        <a href="#waitlist" className="nav-link">
          Join waitlist <span>↗</span>
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-kicker">
          <span className="dot" />
          BUSINESS INFRASTRUCTURE FOR MODERN VENDORS
        </div>

        <h1>
          Your business.
          <br />
          <em>Finally in one place.</em>
        </h1>

        <p className="hero-copy">
          Your customers are on WhatsApp, Instagram, TikTok and everywhere
          else. Kioskk brings your storefront, orders, payments, customers
          and business together.
        </p>

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            required
          />

          <button type="submit">
            {submitted ? "You're on the list" : "Join the waitlist"}
            {!submitted && <span>↗</span>}
          </button>
        </form>

        <p className="form-note">
          Built for vendors who have outgrown the WhatsApp DM.
        </p>

        {/* PRODUCT SIGNAL */}
        <div className="hero-product">
          <div className="fake-window">
            <div className="window-top">
              <span>kioskk.me/your-business</span>
              <span>●</span>
            </div>

            <div className="store-preview">
              <div className="preview-sidebar">
                <div className="mini-logo">K</div>

                <div className="sidebar-line active" />
                <div className="sidebar-line" />
                <div className="sidebar-line" />
                <div className="sidebar-line" />
              </div>

              <div className="preview-main">
                <div className="preview-heading">
                  <div>
                    <small>GOOD FOOD, NO STRESS.</small>
                    <h3>Amara's Kitchen</h3>
                  </div>

                  <div className="preview-status">
                    ● Open
                  </div>
                </div>

                <div className="product-row">
                  <Product name="Jollof + Chicken" price="₦3,500" />
                  <Product name="Chicken Pasta" price="₦3,000" />
                  <Product name="Small Chops" price="₦2,500" />
                </div>
              </div>
            </div>
          </div>

          <div className="floating-note note-one">
            <span>ORDERS</span>
            <strong>24 today</strong>
          </div>

          <div className="floating-note note-two">
            <span>REVENUE</span>
            <strong>₦86,400</strong>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="statement-section">
        <div className="section-index">01</div>

        <div>
          <p className="section-eyebrow">THE PROBLEM</p>

          <h2>
            Your business isn't
            <br />
            <em>just your WhatsApp.</em>
          </h2>

          <p className="section-copy">
            But somehow, that's where everything ends up.
          </p>

          <div className="chaos">
            <span>WhatsApp</span>
            <span>Instagram</span>
            <span>Bank app</span>
            <span>Payment screenshots</span>
            <span>Notes</span>
            <span>Google Sheets</span>
            <span>DMs</span>
            <span>“Have you paid?”</span>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="solution-section">
        <div className="section-index">02</div>

        <div className="solution-content">
          <p className="section-eyebrow">KIOSKK</p>

          <h2>
            One place for
            <br />
            <em>the whole business.</em>
          </h2>

          <p className="section-copy">
            Create a storefront that actually feels like your brand.
            Take orders. Get paid. Keep track of customers. Understand your
            sales. Run campaigns. All without rebuilding the way you already
            sell.
          </p>

          <div className="system-grid">
            <SystemItem
              number="01"
              title="Storefront"
              text="A proper home for your business. Custom, mobile-first and yours."
            />

            <SystemItem
              number="02"
              title="Commerce"
              text="Orders, payments, invoices and inventory without the manual work."
            />

            <SystemItem
              number="03"
              title="Channels"
              text="WhatsApp, Instagram, Kioskk and everywhere your customers find you."
            />

            <SystemItem
              number="04"
              title="Intelligence"
              text="Know what sells, where customers come from and what to do next."
            />
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="channels-section">
        <div className="section-index">03</div>

        <div>
          <p className="section-eyebrow">SELL WHERE YOU ALREADY SELL</p>

          <h2>
            Your customers
            <br />
            <em>don't need to change.</em>
          </h2>

          <p className="section-copy">
            Kioskk fits underneath the channels you already use instead of
            forcing you to abandon them.
          </p>

          <div className="channel-board">
            <div className="channel">
              <span>WA</span>
              <strong>WhatsApp</strong>
              <small>Orders & conversations</small>
            </div>

            <div className="channel">
              <span>IG</span>
              <strong>Instagram</strong>
              <small>Discovery & social sales</small>
            </div>

            <div className="channel">
              <span>TK</span>
              <strong>TikTok</strong>
              <small>Discovery</small>
            </div>

            <div className="channel">
              <span>K</span>
              <strong>Kioskk</strong>
              <small>Store & checkout</small>
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section className="intelligence-section">
        <div className="section-index">04</div>

        <div className="intelligence-content">
          <p className="section-eyebrow">BUSINESS INTELLIGENCE</p>

          <h2>
            Don't just make
            <br />
            <em>money. Understand it.</em>
          </h2>

          <p className="section-copy">
            Kioskk turns your everyday business activity into information
            you can actually use.
          </p>

          <div className="insight-stack">
            <Insight
              label="CHANNEL"
              text="Instagram brought 43% of your new customers this week."
            />

            <Insight
              label="PRODUCT"
              text="Your black tees are selling 2× faster than last week."
            />

            <Insight
              label="CUSTOMERS"
              text="8 customers haven't ordered in 14 days. Want to reach them?"
            />

            <Insight
              label="TIMING"
              text="Thursday evenings are your strongest ordering period."
            />
          </div>
        </div>
      </section>

      {/* AI */}
      <section className="ai-section">
        <div className="ai-card">
          <div className="ai-label">
            <span className="dot" />
            KIOSKK AI
          </div>

          <h2>
            Your business can
            <br />
            <em>talk back.</em>
          </h2>

          <p>
            Ask what's happening, what is selling, or what you should do next.
            Kioskk turns your business data into answers.
          </p>

          <div className="chat-demo">
            <div className="chat-user">
              How did I do this week?
            </div>

            <div className="chat-ai">
              Revenue is up <strong>18%</strong>. Instagram brought the most
              new customers, but WhatsApp has your highest repeat-purchase
              rate.
            </div>

            <div className="chat-user">
              What should I push tomorrow?
            </div>
          </div>
        </div>
      </section>

      {/* BUYER */}
      <section className="buyer-section">
        <div className="section-index">05</div>

        <div>
          <p className="section-eyebrow">AND THEN THERE'S THE OTHER SIDE</p>

          <h2>
            Tell Kioskk what
            <br />
            <em>you want.</em>
          </h2>

          <p className="section-copy">
            “I need a plain black polo under ₦10k around UI.”
          </p>

          <div className="buyer-flow">
            <div>UNDERSTAND</div>
            <span>→</span>
            <div>FIND</div>
            <span>→</span>
            <div>COMPARE</div>
            <span>→</span>
            <div>BUY</div>
          </div>

          <p className="buyer-note">
            A more intelligent way to discover and buy from the businesses
            around you — without turning Kioskk into another generic
            marketplace.
          </p>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="final-cta" id="waitlist">
        <div className="final-mark">K</div>

        <p className="section-eyebrow">KIOSKK 2026</p>

        <h2>
          We're building the
          <br />
          <em>business layer.</em>
        </h2>

        <p>
          For the vendors already selling every day.
          <br />
          For the businesses that have outgrown the DM.
        </p>

        <form className="waitlist-form final-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            aria-label="Email address"
            required
          />

          <button type="submit">
            {submitted ? "You're on the list" : "Join the waitlist"}
            {!submitted && <span>↗</span>}
          </button>
        </form>

        <small>
          Early access. Product updates. No spam.
        </small>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <a href="/" className="brand">
          <Image
            src="/kioskk-logo.svg"
            alt="Kioskk"
            width={30}
            height={30}
          />
          <span>kioskk</span>
        </a>

        <span>© 2026 kioskk.me</span>

        <span>Built for businesses that are already moving.</span>
      </footer>
    </main>
  );
}


/* ------------------------------------------------ */
/* Small presentation components                    */
/* ------------------------------------------------ */

function Product({
  name,
  price,
}: {
  name: string;
  price: string;
}) {
  return (
    <div className="product">
      <div className="product-image" />

      <div className="product-info">
        <strong>{name}</strong>
        <span>{price}</span>
      </div>
    </div>
  );
}


function SystemItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="system-item">
      <span>{number}</span>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}


function Insight({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="insight">
      <span>{label}</span>
      <p>{text}</p>
      <b>↗</b>
    </div>
  );
}