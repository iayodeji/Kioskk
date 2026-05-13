"use client";
import React from 'react';
import { slugify, initials, formatPrice } from './utils';

export default function TemplateNoir(props){
  const {
    storeName = 'Store', ownerName, category='Store', location='', whatsappNumber='', currencySymbol='₦', tagline, products=[]
  } = props || {};

  const autoTag = tagline || `${category} in ${location}`;
  const featured = products.find(p=>p.featured) || products[0] || null;
  const others = products.filter(p=> p !== featured);
  const waLink = `https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent(`Hi, I'd like to order from ${storeName}`)}`;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{margin:0;background:#111;overflow-x:hidden;}
  .phone{width:100%;max-width:none;margin:0 auto;background:#0D0D0D;min-height:100vh;font-family:'DM Sans',sans-serif;color:#fff;word-break:break-word;overflow-wrap:anywhere;}
  /* header + rest (kept as in original) */
  .header{padding:0;background:#0D0D0D;border-bottom:0.5px solid rgba(255,255,255,0.06);} .header-top{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 16px;} .store-identity{display:flex;align-items:center;gap:12px;} .store-avatar{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#C84B2F,#FF8C69);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fff;letter-spacing:-0.5px;flex-shrink:0;} .store-name{font-size:16px;font-weight:600;letter-spacing:-0.4px;color:#fff;} .store-meta{font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:0.3px;margin-top:1px;} .header-action{width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:18px;} .status-bar{display:flex;align-items:center;gap:6px;padding:10px 20px;background:rgba(200,75,47,0.08);border-bottom:0.5px solid rgba(200,75,47,0.15);} .status-dot{width:6px;height:6px;border-radius:50%;background:#4CAF50;} .status-text{font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:0.3px;} .hero{padding:28px 20px 24px;} .hero-tag{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;} .hero-h{font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;line-height:1.1;letter-spacing:-0.5px;color:#fff;margin-bottom:6px;} .hero-h em{font-style:italic;color:#C84B2F;} .hero-sub{font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;} .cats{display:flex;gap:8px;padding:0 20px 20px;overflow-x:auto;scrollbar-width:none;} .cats::-webkit-scrollbar{display:none;} .cat{flex-shrink:0;height:30px;padding:0 14px;border-radius:100px;font-size:11px;font-weight:500;letter-spacing:0.2px;display:flex;align-items:center;cursor:pointer;} .cat.active{background:#C84B2F;color:#fff;} .cat.inactive{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);border:0.5px solid rgba(255,255,255,0.08);} .products{padding:0 20px;} .prod-label{font-size:9px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.2);margin-bottom:14px;} .product-card{background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;} .prod-name{font-size:15px;font-weight:500;color:#fff;letter-spacing:-0.3px;margin-bottom:3px;} .prod-desc{font-size:12px;color:rgba(255,255,255,0.3);line-height:1.4;} .prod-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;} .prod-price{font-size:16px;font-weight:600;color:#fff;letter-spacing:-0.5px;} .add-btn{width:32px;height:32px;border-radius:8px;background:#C84B2F;border:none;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1;} .featured{margin:0 20px 16px;background:linear-gradient(135deg,rgba(200,75,47,0.15),rgba(200,75,47,0.05));border:0.5px solid rgba(200,75,47,0.2);border-radius:16px;padding:20px;} .feat-tag{font-size:9px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#C84B2F;margin-bottom:8px;} .feat-name{font-size:18px;font-weight:600;color:#fff;letter-spacing:-0.5px;margin-bottom:4px;} .feat-desc{font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:14px;line-height:1.5;} .feat-bottom{display:flex;align-items:center;justify-content:space-between;} .feat-price{font-size:20px;font-weight:600;color:#fff;} .feat-btn{height:36px;padding:0 18px;background:#C84B2F;border:none;border-radius:9px;color:#fff;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;} .order-cta{margin:20px;background:#fff;border-radius:14px;padding:18px;display:flex;align-items:center;justify-content:space-between;} .order-cta-t{font-size:14px;font-weight:600;color:#0D0D0D;letter-spacing:-0.3px;} .order-cta-s{font-size:11px;color:#888;margin-top:2px;} .wa-btn{height:40px;padding:0 18px;background:#0D0D0D;border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;} .footer{padding:20px;text-align:center;border-top:0.5px solid rgba(255,255,255,0.05);margin-top:10px;} .footer-txt{font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:0.5px;} .footer-link{font-size:10px;color:rgba(200,75,47,0.5);letter-spacing:0.3px;margin-top:3px;}
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html:css}} />
      <div className="phone">
        <div className="header">
          <div className="header-top">
            <div className="store-identity">
              <div className="store-avatar">{initials(storeName)}</div>
              <div>
                <div className="store-name">{storeName}</div>
                <div className="store-meta">{category.toUpperCase()} · {location.toUpperCase()}</div>
              </div>
            </div>
            <div className="header-action">💬</div>
          </div>
          <div className="status-bar">
            <div className="status-dot" />
            <div className="status-text">Open now · Orders via <strong>WhatsApp</strong></div>
          </div>
        </div>

        <div className="hero">
          <div className="hero-tag">✦ &nbsp;{autoTag}</div>
          <h1 className="hero-h">{storeName}</h1>
          <p className="hero-sub">{tagline || `${category} on ${location}`}</p>
        </div>

        <div className="cats">
          <div className="cat active">All</div>
        </div>

        {featured && (
          <div className="featured">
            <div className="feat-tag">⚡ Most ordered</div>
            <div className="feat-name">{featured.name}</div>
            <div className="feat-desc">{featured.description}</div>
            <div className="feat-bottom">
              <div className="feat-price">{formatPrice(currencySymbol, featured.price)}</div>
              <a href={waLink} target="_blank" rel="noreferrer"><button className="feat-btn">Add to order</button></a>
            </div>
          </div>
        )}

        <div className="products">
          <div className="prod-label">Menu</div>
          {others.map((p,idx)=> (
            <div className="product-card" key={idx}>
              <div className="prod-info">
                <div className="prod-name">{p.name}</div>
                <div className="prod-desc">{p.description}</div>
              </div>
              <div className="prod-right">
                <div className="prod-price">{formatPrice(currencySymbol, p.price)}</div>
                <a href={waLink} target="_blank" rel="noreferrer"><button className="add-btn">+</button></a>
              </div>
            </div>
          ))}
        </div>

        <div className="order-cta">
          <div className="order-cta-text">
            <div className="order-cta-t">Ready to order?</div>
            <div className="order-cta-s">Chat directly on WhatsApp</div>
          </div>
          <a href={waLink} target="_blank" rel="noreferrer"><button className="wa-btn">💬 Order now</button></a>
        </div>

        <div className="footer">
          <div className="footer-txt">POWERED BY</div>
          <div className="footer-link">kioskk.me/{slugify(storeName)}</div>
        </div>
      </div>
    </div>
  );
}
