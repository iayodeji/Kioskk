import { createServerSupabase } from '../../../lib/supabase';
import StoreApp from './store-app';

export const revalidate = 60;

type StoreRow = {
  id: string;
  slug: string;
  store_name: string;
  owner_name: string;
  whatsapp_number: string;
  category: string;
  location: string;
  currency_code: string;
  currency_symbol: string;
  template_id: string;
  tagline?: string;
  products: unknown;
  is_active: boolean;
  created_at: string;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase.from('public_stores').select('store_name,tagline').eq('slug', resolved.slug).maybeSingle();
  if (!data) return { title: 'kioskk.me' };
  return {
    title: `${data.store_name} — kioskk.me`,
    openGraph: { description: data.tagline || '' },
  };
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from('public_stores').select('id,slug,store_name,owner_name,whatsapp_number,category,location,currency_code,currency_symbol,template_id,tagline,products,is_active,created_at').eq('slug', resolved.slug).maybeSingle<StoreRow>();

  if (error) throw new Error(error.message);
  if (!data) {
    return (
      <main style={{ padding: 40 }}>
        <h1>This store doesn't exist yet.</h1>
        <p>Create yours at kioskk.me</p>
        <a href="/create"><button>Create a store</button></a>
      </main>
    );
  }

  return <StoreApp business={data} />;
}
