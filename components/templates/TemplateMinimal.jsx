"use client";
import React from 'react';
import { slugify, initials, formatPrice } from './utils';

export default function TemplateMinimal(props){
  const { storeName='Store', category='Store', location='', whatsappNumber='', currencySymbol='₦', tagline, products=[] } = props || {};
  const autoTag = tagline || `${category} in ${location}`;
  const featured = products.find(p=>p.featured) || products[0] || null;
  const others = products.filter(p=> p !== featured);
  const waLink = `https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent(`Hi, I&apos;d like to order from ${storeName}`)}`;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{margin:0;background:#E5E5E5;overflow-x:hidden;} .phone{width:100%;max-width:none;margin:0 auto;background:#fff;min-height:100vh;font-family:'Inter',sans-serif;color:#1a1a18;word-break:break-word;overflow-wrap:anywhere;} .header{padding:20px 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F0F0F0;gap:12px;} .logo-row{display:flex;align-items:center;gap:10px;min-width:0;} .avatar{width:36px;height:36px;border-radius:9px;background:#1a1a18;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#fff;flex-shrink:0;} .store-name{font-size:15px;font-weight:600;color:#1a1a18;letter-spacing:-0.3px;overflow-wrap:anywhere;} .store-loc{font-size:11px;color:#B0B0B0;letter-spacing:0.2px;overflow-wrap:anywhere;} .chat-btn{height:34px;padding:0 14px;background:#F5F5F5;border:none;border-radius:8px;font-size:12px;font-weight:500;color:#1a1a18;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;gap:5px;flex-shrink:0;} .hero{padding:28px 22px 20px;} .open-row{display:flex;align-items:center;gap:6px;margin-bottom:14px;} .open-dot{width:6px;height:6px;border-radius:50%;background:#4CAF50;} .open-txt{font-size:11px;color:#888;letter-spacing:0.2px;} .hero-h{font-size:30px;font-weight:300;letter-spacing:-1.5px;line-height:1.1;color:#1a1a18;margin-bottom:6px;overflow-wrap:anywhere;} .hero-h strong{font-weight:600;} .hero-sub{font-size:13px;color:#888;line-height:1.6;overflow-wrap:anywhere;} .search{margin:0 22px 24px;height:42px;background:#F7F7F7;border-radius:10px;display:flex;align-items:center;padding:0 14px;gap:8px;} .grid-label{font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#C0C0C0;padding:0 22px;margin-bottom:12px;} .product-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;padding:0 22px;margin-bottom:24px;} .prod-card{background:#F9F9F9;border-radius:14px;padding:16px;position:relative;min-width:0;} .prod-card-name{font-size:13px;font-weight:500;color:#1a1a18;letter-spacing:-0.2px;margin-bottom:3px;overflow-wrap:anywhere;} .prod-card-desc{font-size:11px;color:#B0B0B0;line-height:1.4;margin-bottom:12px;overflow-wrap:anywhere;} .prod-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;} .prod-card-price{font-size:14px;font-weight:600;color:#1a1a18;letter-spacing:-0.4px;white-space:nowrap;} .prod-card-add{width:28px;height:28px;border-radius:7px;background:#1a1a18;border:none;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1;flex-shrink:0;} .prod-card.featured{background:#1a1a18;grid-column:1 / -1;} .prod-card.featured .prod-card-name{color:#fff;font-size:15px;} .prod-card.featured .prod-card-desc{color:rgba(255,255,255,0.4);} .prod-card.featured .prod-card-price{color:#fff;font-size:18px;} .prod-card.featured .prod-card-add{background:#fff;color:#1a1a18;} .best-tag{display:inline-block;font-size:9px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:#C84B2F;margin-bottom:8px;} .info-row{display:flex;gap:8px;padding:0 22px;margin-bottom:24px;flex-wrap:wrap;} .info-chip{flex:1 1 120px;background:#F7F7F7;border-radius:10px;padding:12px;text-align:center;} .info-chip-val{font-size:13px;font-weight:600;color:#1a1a18;letter-spacing:-0.3px;} .info-chip-label{font-size:10px;color:#C0C0C0;margin-top:2px;letter-spacing:0.2px;} .cta{margin:0 22px 32px;} .cta-btn{width:100%;height:50px;background:#1a1a18;border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:-0.2px;display:flex;align-items:center;justify-content:center;gap:8px;} .cta-sub{text-align:center;margin-top:10px;font-size:11px;color:#C0C0C0;overflow-wrap:anywhere;} .footer{padding:12px 22px 24px;display:flex;align-items:center;justify-content:center;gap:4px;border-top:1px solid #F5F5F5;flex-wrap:wrap;} .foot-txt{font-size:10px;color:#D0D0D0;} .foot-link{font-size:10px;color:#C84B2F;opacity:0.5;overflow-wrap:anywhere;}
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html:css}} />
      <div className="phone">
        <div className="header">
          <div className="logo-row">
            <div className="avatar">{initials(storeName)}</div>
            <div>
              <div className="store-name">{storeName}</div>
              <div className="store-loc">{category} · {location}</div>
            </div>
          </div>
          <button className="chat-btn">💬 Chat</button>
        </div>

        <div className="hero">
          <div className="open-row">
            <div className="open-dot" />
            <div className="open-txt">Open · Usually replies in minutes</div>
          </div>
          <h1 className="hero-h">{storeName}</h1>
          <p className="hero-sub">{tagline || autoTag}</p>
        </div>

        <div className="search">
          <div className="search-icon">🔍</div>
          <div className="search-txt">Search products...</div>
        </div>

        <div className="info-row">
          <div className="info-chip">
            <div className="info-chip-val">Same day</div>
            <div className="info-chip-label">Delivery</div>
          </div>
          <div className="info-chip">
            <div className="info-chip-val">Verified</div>
            <div className="info-chip-label">Seller</div>
          </div>
          <div className="info-chip">
            <div className="info-chip-val">{products.length}</div>
            <div className="info-chip-label">Products</div>
          </div>
        </div>

        <div className="grid-label">Products</div>
        <div className="product-grid">
          {featured ? (
            <div className="prod-card featured">
              <div className="best-tag">⚡ Best seller</div>
              <div className="prod-card-name">{featured.name}</div>
              <div className="prod-card-desc">{featured.description}</div>
              <div className="prod-card-bottom">
                <div className="prod-card-price">{formatPrice(currencySymbol, featured.price)}</div>
                <a href={waLink} target="_blank" rel="noreferrer"><button className="prod-card-add">+</button></a>
              </div>
            </div>
          ) : null}

          {others.map((p,idx)=> (
            <div className="prod-card" key={idx}>
              <div className="prod-card-name">{p.name}</div>
              <div className="prod-card-desc">{p.description}</div>
              <div className="prod-card-bottom">
                <div className="prod-card-price">{formatPrice(currencySymbol,p.price)}</div>
                <a href={waLink} target="_blank" rel="noreferrer"><button className="prod-card-add">+</button></a>
              </div>
            </div>
          ))}
        </div>

        <div className="cta">
          <a href={waLink} target="_blank" rel="noreferrer"><button className="cta-btn">💬 Order on WhatsApp</button></a>
          <div className="cta-sub">Fast replies · Secure payment · Campus delivery</div>
        </div>

        <div className="footer">
          <div className="foot-txt">Powered by&nbsp;</div>
          <div className="foot-link">kioskk.me/{slugify(storeName)}</div>
        </div>
      </div>
    </div>
  );
}
