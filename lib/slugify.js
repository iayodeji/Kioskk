import { createBrowserSupabase } from './supabase';

function slugifyBase(name) {
  return name
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateSlug(storeName) {
  const base = slugifyBase(storeName || '');
  if (!base) return '';

  const supabase = createBrowserSupabase();

  // Try base, then -2, -3, ... until unique
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    try {
      const { data, error } = await supabase.from('stores').select('id').eq('slug', candidate).limit(1).maybeSingle();
      if (error) {
        // If a permission issue or other error, assume not found to avoid blocking UI.
        if (String(error.message || '').toLowerCase().includes('permission')) {
          // fallthrough
        }
      }
      if (!data) return candidate;
    } catch (e) {
      return candidate;
    }
  }

  // Fallback: append timestamp
  return `${base}-${Date.now().toString(36)}`;
}

export default generateSlug;
