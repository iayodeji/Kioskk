"use client";
import React from 'react';
import { slugify, initials, formatPrice } from './utils';

export default function TemplateCream(props){
  const { storeName='Store', ownerName, category='Store', location='', whatsappNumber='', currencySymbol='₦', tagline, products=[] } = props || {};
  const autoTag = tagline || `${category} in ${location}`;
  const featured = products.find(p=>p.featured) || products[0] || null;
  const others = products.filter(p=> p !== featured);
  const waLink = `https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent(`Hi, I'd like to order from ${storeName}`)}`;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;} body{margin:0;background:#E8E4DC;overflow-x:hidden;} .phone{width:100%;max-width:none;margin:0 auto;background:#F5F0E8;min-height:100vh;font-family:'DM Sans',sans-serif;color:#1a1a18;word-break:break-word;overflow-wrap:anywhere;} .header{padding:20px 22px 16px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;} .store-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:600;color:#1a1a18;letter-spacing:-0.5px;line-height:1.1;overflow-wrap:anywhere;} .store-sub{font-size:10px;color:#A09880;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;overflow-wrap:anywhere;} .open-badge{display:inline-flex;align-items:center;gap:5px;background:#1a1a18;color:#F5F0E8;font-size:10px;font-weight:500;padding:5px 10px;border-radius:100px;letter-spacing:0.3px;margin-top:4px;} .open-dot{width:5px;height:5px;border-radius:50%;background:#4CAF50;} .hero-banner{margin:0 22px 20px;background:#1a1a18;border-radius:18px;padding:28px 24px;position:relative;overflow:hidden;} .hero-banner::after{content:'✦';position:absolute;right:-10px;bottom:-20px;font-size:100px;color:rgba(200,75,47,0.08);line-height:1;} .hero-eyebrow{font-size:9px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px;overflow-wrap:anywhere;} .hero-h{font-family:'Playfair Display',serif;font-size:28px;font-weight:400;color:#F5F0E8;line-height:1.15;letter-spacing:-0.5px;margin-bottom:8px;overflow-wrap:anywhere;} .hero-h em{font-style:italic;color:#C84B2F;} .hero-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,0.4);overflow-wrap:anywhere;} .section-label{font-size:9px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:#A09880;margin-bottom:12px;padding:0 22px;} .featured-card{margin:0 22px 20px;background:#fff;border-radius:16px;padding:20px;border:0.5px solid rgba(0,0,0,0.06);} .feat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;gap:12px;} .feat-badge{font-size:9px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:#C84B2F;background:rgba(200,75,47,0.08);padding:4px 9px;border-radius:100px;} .feat-price-big{font-family:'Playfair Display',serif;font-size:24px;font-weight:600;color:#1a1a18;white-space:nowrap;} .feat-name{font-size:18px;font-weight:600;color:#1a1a18;letter-spacing:-0.4px;margin-bottom:4px;overflow-wrap:anywhere;} .feat-desc{font-size:12px;color:#888780;line-height:1.6;margin-bottom:16px;overflow-wrap:anywhere;} .feat-btn{width:100%;min-height:40px;padding:10px 14px;background:#1a1a18;border:none;border-radius:10px;color:#F5F0E8;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:-0.1px;line-height:1.2;white-space:normal;} .product-row{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:0.5px solid rgba(0,0,0,0.06);gap:12px;} .prod-name{font-size:14px;font-weight:500;color:#1a1a18;letter-spacing:-0.2px;overflow-wrap:anywhere;} .prod-desc{font-size:11px;color:#A09880;margin-top:2px;overflow-wrap:anywhere;} .prod-right{display:flex;align-items:center;gap:12px;flex-shrink:0;} .prod-price{font-size:15px;font-weight:600;color:#1a1a18;letter-spacing:-0.4px;white-space:nowrap;} .add-circle{width:30px;height:30px;border-radius:50%;background:#1a1a18;border:none;color:#F5F0E8;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1;} .divider{height:8px;background:rgba(0,0,0,0.04);margin:4px 0;} .cta-area{padding:20px 22px 32px;} .cta-box{background:#C84B2F;border-radius:16px;padding:20px;} .cta-t{font-family:'Playfair Display',serif;font-size:20px;font-weight:400;color:#fff;margin-bottom:4px;line-height:1.2;overflow-wrap:anywhere;} .cta-t em{font-style:italic;} .cta-s{font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:16px;line-height:1.5;overflow-wrap:anywhere;} .cta-btn{width:100%;min-height:42px;padding:10px 14px;background:#fff;border:none;border-radius:10px;color:#C84B2F;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;line-height:1.2;white-space:normal;} .footer{padding:12px 22px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;} .foot-l{font-size:10px;color:#C0BAB0;letter-spacing:0.3px;} .foot-r{font-size:10px;color:#C84B2F;opacity:0.6;overflow-wrap:anywhere;}
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html:css}} />
      <div className="phone">
        <div className="header">
          <div>
            <div className="store-name">{storeName}</div>
            <div className="store-sub">{category} · {location}</div>
            <div className="open-badge"><div className="open-dot"/>Open now</div>
          </div>
          <div style={{fontSize:22, marginTop:4}}>💬</div>
        </div>

        <div className="hero-banner">
          <div className="hero-eyebrow">✦ &nbsp;{autoTag}</div>
          <h1 className="hero-h">{storeName.split(' ').slice(0,2).join(' ')} <br/><em>{storeName.split(' ').slice(2).join(' ')}</em></h1>
          <div className="hero-tag">{tagline || autoTag}</div>
        </div>

        <div className="section-label">This week's pick</div>
        {featured && (
          <div className="featured-card">
            <div className="feat-top">
              <div className="feat-badge">🔥 Most wanted</div>
              <div className="feat-price-big">{formatPrice(currencySymbol, featured.price)}</div>
            </div>
            <div className="feat-name">{featured.name}</div>
            <div className="feat-desc">{featured.description}</div>
            <a href={waLink} target="_blank" rel="noreferrer"><button className="feat-btn">Order via WhatsApp</button></a>
          </div>
        )}

        <div className="section-label">All items</div>
        {others.map((p,idx)=> (
          <div className="product-row" key={idx}>
            <div>
              <div className="prod-name">{p.name}</div>
              <div className="prod-desc">{p.description}</div>
            </div>
            <div className="prod-right">
              <div className="prod-price">{formatPrice(currencySymbol,p.price)}</div>
              <a href={waLink} target="_blank" rel="noreferrer"><button className="add-circle">+</button></a>
            </div>
          </div>
        ))}

        <div className="divider" />

        <div className="cta-area">
          <div className="cta-box">
            <div className="cta-t">See something<br/>you <em>love?</em></div>
            <div className="cta-s">{tagline || `Message ${storeName} on WhatsApp for orders.`}</div>
            <a href={waLink} target="_blank" rel="noreferrer"><button className="cta-btn">💬 Chat on WhatsApp</button></a>
          </div>
        </div>

        <div className="footer">
          <div className="foot-l">Powered by</div>
          <div className="foot-r">kioskk.me/{slugify(storeName)}</div>
        </div>
      </div>
    </div>
  );
}
