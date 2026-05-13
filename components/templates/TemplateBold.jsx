"use client";
import React from 'react';
import { slugify, initials, formatPrice } from './utils';

export default function TemplateBold(props){
  const { storeName='Store', category='Store', location='', whatsappNumber='', currencySymbol='₦', tagline, products=[] } = props || {};
  const autoTag = tagline || `${category} in ${location}`;
  const featured = products.find(p=>p.featured) || products[0] || null;
  const waLink = `https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent(`Hi, I'd like to order from ${storeName}`)}`;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Inter:wght@300;400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{margin:0;background:#1a1a18;overflow-x:hidden;} .phone{width:100%;max-width:none;margin:0 auto;background:#FAFAF8;min-height:100vh;font-family:'DM Sans',sans-serif;color:#1a1a18;overflow:hidden;word-break:break-word;overflow-wrap:anywhere;} .hero-header{background:#C84B2F;padding:22px 22px 32px;position:relative;overflow:hidden;} .nav-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:12px;} .store-id{display:flex;align-items:center;gap:10px;min-width:0;} .avatar{width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;} .store-name{font-size:14px;font-weight:600;color:#fff;letter-spacing:-0.2px;overflow-wrap:anywhere;} .store-cat{font-size:10px;color:rgba(255,255,255,0.5);margin-top:1px;letter-spacing:0.3px;overflow-wrap:anywhere;} .chat-icon{width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;} .hero-label{font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:8px;overflow-wrap:anywhere;} .hero-h{font-size:36px;font-weight:700;color:#fff;line-height:1.0;letter-spacing:-1.5px;margin-bottom:6px;overflow-wrap:anywhere;} .hero-sub{font-size:13px;color:rgba(255,255,255,0.65);line-height:1.5;overflow-wrap:anywhere;} .stats{display:flex;background:#1a1a18;padding:14px 22px;flex-wrap:wrap;gap:10px;} .stat{flex:1 1 90px;text-align:center;min-width:0;} .stat-n{font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.5px;} .stat-l{font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.5px;margin-top:1px;} .stat-div{width:0.5px;background:rgba(255,255,255,0.08);margin:0;} .section{padding:20px 22px 0;} .feat-card{background:#1a1a18;border-radius:16px;padding:20px;margin-bottom:20px;position:relative;overflow:hidden;} .feat-badge{display:inline-block;font-size:9px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#C84B2F;background:rgba(200,75,47,0.12);padding:4px 9px;border-radius:100px;margin-bottom:10px;} .feat-name{font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.6px;margin-bottom:4px;overflow-wrap:anywhere;} .feat-desc{font-size:12px;color:rgba(255,255,255,0.4);line-height:1.5;margin-bottom:16px;overflow-wrap:anywhere;} .feat-row{display:flex;align-items:center;justify-content:space-between;gap:12px;} .feat-price{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.8px;white-space:nowrap;} .feat-btn{height:38px;padding:0 20px;background:#C84B2F;border:none;border-radius:9px;color:#fff;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;} .prod-list{padding:0 22px;} .prod-item{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #F0EEE8;gap:12px;} .prod-num{font-size:11px;font-weight:600;color:#D0CCC4;width:22px;flex-shrink:0;} .prod-info{flex:1;min-width:0;margin:0 10px;} .prod-name{font-size:14px;font-weight:600;color:#1a1a18;letter-spacing:-0.3px;overflow-wrap:anywhere;} .prod-tag{font-size:10px;color:#B0ABA0;margin-top:1px;overflow-wrap:anywhere;} .prod-right{display:flex;align-items:center;gap:10px;flex-shrink:0;} .prod-price{font-size:14px;font-weight:700;color:#1a1a18;letter-spacing:-0.4px;white-space:nowrap;} .add-sq{width:30px;height:30px;background:#C84B2F;border:none;border-radius:7px;color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1;font-weight:300;} .cta{padding:20px 22px 32px;} .cta-btn{width:100%;height:52px;background:#C84B2F;border:none;border-radius:13px;color:#fff;font-size:15px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:-0.3px;display:flex;align-items:center;justify-content:center;gap:8px;} .cta-sub{text-align:center;margin-top:10px;font-size:11px;color:#B0ABA0;letter-spacing:0.2px;overflow-wrap:anywhere;} .footer{padding:8px 22px 20px;display:flex;justify-content:center;gap:4px;flex-wrap:wrap;} .foot-t{font-size:10px;color:#D0CCC4;} .foot-l{font-size:10px;color:rgba(200,75,47,0.5);overflow-wrap:anywhere;} 
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html:css}} />
      <div className="phone">
        <div className="hero-header">
          <div className="nav-row">
            <div className="store-id">
              <div className="avatar">{initials(storeName)}</div>
              <div>
                <div className="store-name">{storeName}</div>
                <div className="store-cat">{category} · {location}</div>
              </div>
            </div>
            <div className="chat-icon">💬</div>
          </div>
          <div className="hero-label">✦ &nbsp;{autoTag}</div>
          <h1 className="hero-h">{storeName}</h1>
          <p className="hero-sub">{tagline || autoTag}</p>
        </div>

        <div className="stats">
          <div className="stat"><div className="stat-n">{Math.max(100, products.length * 10)}</div><div className="stat-l">Customers</div></div>
          <div className="stat-div" />
          <div className="stat"><div className="stat-n">Same day</div><div className="stat-l">Delivery</div></div>
          <div className="stat-div" />
          <div className="stat"><div className="stat-n">100%</div><div className="stat-l">Legit</div></div>
        </div>

        <div className="section">
          <div className="sec-header">
            <div className="sec-t">This week&apos;s special</div>
          </div>
          {featured && (
            <div className="feat-card">
              <div className="feat-badge">🔥 Top seller</div>
              <div className="feat-name">{featured.name}</div>
              <div className="feat-desc">{featured.description}</div>
              <div className="feat-row">
                <div className="feat-price">{formatPrice(currencySymbol, featured.price)}</div>
                <a href={waLink} target="_blank" rel="noreferrer"><button className="feat-btn">Order now</button></a>
              </div>
            </div>
          )}
        </div>

        <div className="section">
          <div className="sec-header">
            <div className="sec-t">All products</div>
          </div>
        </div>

        <div className="prod-list">
          {products.map((p,idx)=> (
            <div className="prod-item" key={idx}>
              <div className="prod-num">{String(idx+1).padStart(2,'0')}</div>
              <div className="prod-info">
                <div className="prod-name">{p.name}</div>
                <div className="prod-tag">{p.description}</div>
              </div>
              <div className="prod-right">
                <div className="prod-price">{formatPrice(currencySymbol,p.price)}</div>
                <a href={waLink} target="_blank" rel="noreferrer"><button className="add-sq">+</button></a>
              </div>
            </div>
          ))}
        </div>

        <div className="cta">
          <a href={waLink} target="_blank" rel="noreferrer"><button className="cta-btn">💬 Order on WhatsApp</button></a>
          <div className="cta-sub">{tagline || 'Fast delivery · Trusted'}</div>
        </div>

        <div className="footer">
          <div className="foot-t">Powered by&nbsp;</div>
          <div className="foot-l">kioskk.me/{slugify(storeName)}</div>
        </div>
      </div>
    </div>
  );
}
