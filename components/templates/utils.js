export function slugify(name = ""){
  return String(name).toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
}

export function initials(name=""){ return (name||"").split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase(); }

export function formatPrice(sym, price){ return `${sym}${price}`; }
