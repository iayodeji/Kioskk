"use client";
import React from 'react';
import { slugify, formatPrice } from './utils';

export default function TemplateLuxury(props){
  const { storeName='Store', category='Store', location='', whatsappNumber='', currencySymbol='₦', tagline, products=[] } = props || {};
  const autoTag = tagline || `${category} in ${location}`;
  const featured = products.find(p=>p.featured) || products[0] || null;
  const waLink = `https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent(`Hi, I&apos;d like to order from ${storeName}`)}`;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{margin:0;background:#2a2520;overflow-x:hidden;} .phone{width:100%;max-width:none;margin:0 auto;background:#FAF8F5;min-height:100vh;font-family:'Inter',sans-serif;color:#1a1a18;word-break:break-word;overflow-wrap:anywhere;} .topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:0.5px solid rgba(0,0,0,0.06);gap:12px;} .store-wordmark{font-family:'DM Serif Display',serif;font-size:20px;color:#1a1a18;letter-spacing:0.5px;overflow-wrap:anywhere;} .topbar-right{display:flex;align-items:center;gap:10px;flex-shrink:0;} .live-badge{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:#888;border:0.5px solid rgba(0,0,0,0.1);padding:4px 9px;border-radius:100px;} .hero{background:#1a1a18;padding:40px 22px 36px;position:relative;overflow:hidden;} .hero-cat{font-size:9px;font-weight:400;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:16px;overflow-wrap:anywhere;} .hero-h{font-family:'DM Serif Display',serif;font-size:38px;font-weight:400;color:#FAF8F5;line-height:1.05;letter-spacing:-0.5px;margin-bottom:14px;overflow-wrap:anywhere;} .hero-h em{font-style:italic;color:rgba(200,75,47,0.9);} .hero-divider{width:32px;height:0.5px;background:rgba(255,255,255,0.15);margin-bottom:14px;} .hero-sub{font-size:12px;color:rgba(255,255,255,0.35);line-height:1.7;letter-spacing:0.2px;overflow-wrap:anywhere;} .featured-wrap{padding:0 22px;margin-top:-1px;} .feat-card{background:#fff;border:0.5px solid rgba(0,0,0,0.08);border-radius:0 0 16px 16px;padding:20px;} .feat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;gap:12px;} .feat-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#C84B2F;font-weight:500;} .feat-price{font-family:'DM Serif Display',serif;font-size:26px;color:#1a1a18;white-space:nowrap;} .feat-name{font-size:17px;font-weight:500;color:#1a1a18;letter-spacing:-0.4px;margin-bottom:4px;overflow-wrap:anywhere;} .feat-desc{font-size:12px;color:#888;line-height:1.6;margin-bottom:16px;overflow-wrap:anywhere;} .feat-btn{width:100%;height:44px;background:#1a1a18;border:none;border-radius:10px;color:#FAF8F5;font-size:13px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;letter-spacing:-0.1px;} .prod-section{padding:28px 22px 0;} .prod-section-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#B8B0A4;margin-bottom:20px;display:flex;align-items:center;gap:12px;} .prod-editorial{display:flex;align-items:baseline;justify-content:space-between;padding:16px 0;border-bottom:0.5px solid rgba(0,0,0,0.06);cursor:pointer;gap:12px;} .prod-ed-left{flex:1;min-width:0;} .prod-ed-name{font-family:'DM Serif Display',serif;font-size:18px;color:#1a1a18;letter-spacing:-0.2px;margin-bottom:2px;overflow-wrap:anywhere;} .prod-ed-desc{font-size:11px;color:#B8B0A4;letter-spacing:0.2px;overflow-wrap:anywhere;} .prod-ed-right{display:flex;align-items:center;gap:12px;flex-shrink:0;} .prod-ed-price{font-size:15px;font-weight:500;color:#1a1a18;letter-spacing:-0.4px;white-space:nowrap;} .prod-ed-arrow{font-size:16px;color:#D0C8C0;} .trust{margin:24px 22px;background:#F2EDE8;border-radius:14px;padding:20px;} .trust-quote{font-family:'DM Serif Display',serif;font-size:16px;font-style:italic;color:#1a1a18;line-height:1.5;margin-bottom:8px;overflow-wrap:anywhere;} .trust-attr{font-size:10px;color:#B8B0A4;letter-spacing:0.5px;} .cta{padding:4px 22px 32px;} .cta-btn{width:100%;height:50px;background:#1a1a18;border:none;border-radius:12px;color:#FAF8F5;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-0.2px;} .cta-sub{text-align:center;margin-top:10px;font-size:11px;color:#B8B0A4;letter-spacing:0.3px;overflow-wrap:anywhere;} .footer{padding:12px 22px 24px;display:flex;justify-content:space-between;border-top:0.5px solid rgba(0,0,0,0.06);gap:12px;flex-wrap:wrap;} .foot-l{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#C8C0B8;} .foot-r{font-size:9px;color:rgba(200,75,47,0.4);letter-spacing:1px;text-transform:uppercase;overflow-wrap:anywhere;}
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html:css}} />
      <div className="phone">
        <div className="topbar">
          <div className="store-wordmark">{storeName}</div>
          <div className="topbar-right">
            <div className="live-badge"><div className="live-dot" style={{width:5,height:5,borderRadius:'50%',background:'#4CAF50'}}></div>Open</div>
            <div className="chat-lnk">Chat</div>
          </div>
        </div>

        <div className="hero">
          <div className="hero-cat">{category}</div>
          <h1 className="hero-h">{storeName}</h1>
          <div className="hero-divider" />
          <p className="hero-sub">{tagline || autoTag}</p>
        </div>

        {featured && (
          <div className="featured-wrap">
            <div className="feat-card">
              <div className="feat-top">
                <div className="feat-label">✦ &nbsp;Featured piece</div>
                <div className="feat-price">{formatPrice(currencySymbol, featured.price)}</div>
              </div>
              <div className="feat-name">{featured.name}</div>
              <div className="feat-desc">{featured.description}</div>
              <a href={waLink} target="_blank" rel="noreferrer"><button className="feat-btn">Order on WhatsApp</button></a>
            </div>
          </div>
        )}

        <div className="prod-section">
          <div className="prod-section-label">All pieces</div>
          {products.map((p,idx)=> (
            <div className="prod-editorial" key={idx}>
              <div className="prod-ed-left">
                <div className="prod-ed-name">{p.name}</div>
                <div className="prod-ed-desc">{p.description}</div>
              </div>
              <div className="prod-ed-right">
                <div className="prod-ed-price">{formatPrice(currencySymbol,p.price)}</div>
                <div className="prod-ed-arrow">→</div>
              </div>
            </div>
          ))}
        </div>

        <div className="trust">
          <div className="trust-quote">{`\u201c${tagline || 'Loved by customers across campuses.'}\u201d`}</div>
          <div className="trust-attr">— Verified buyer</div>
        </div>

        <div className="cta">
          <a href={waLink} target="_blank" rel="noreferrer"><button className="cta-btn">💬 Order on WhatsApp</button></a>
          <div className="cta-sub">{tagline || 'Handmade to order · Ships in 24–48h'}</div>
        </div>

        <div className="footer">
          <div className="foot-l">Powered by {storeName}</div>
          <div className="foot-r">kioskk.me/{slugify(storeName)}</div>
        </div>
      </div>
    </div>
  );
}
