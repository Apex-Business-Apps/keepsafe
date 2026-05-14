import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

async function checkRateLimit(admin: ReturnType<typeof createClient>, key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000).toISOString();
  const { data } = await admin.from('rate_limits').select('count, reset_at').eq('key', key).maybeSingle();
  if (!data || new Date(data.reset_at) <= now) {
    await admin.from('rate_limits').upsert({ key, count: 1, reset_at: resetAt }, { onConflict: 'key' });
    return true;
  }
  if (data.count >= limit) return false;
  await admin.from('rate_limits').update({ count: data.count + 1 }).eq('key', key);
  return true;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data: { user }, error: userError } = await anon.auth.getUser();
  if (userError || !user) {
    await admin.from('security_audit_log').insert({ action: 'lookup_upc_denied', resource: 'lookup-upc', success: false, details: { reason: 'invalid_jwt' } });
    return new Response(JSON.stringify({ success: false, error: 'Invalid authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { barcode } = await req.json();
    const cleanBarcode = String(barcode || '').replace(/\D/g, '');
    if (cleanBarcode.length < 8 || cleanBarcode.length > 14) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid barcode format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: cached } = await admin.from('upc_cache').select('product_data, lookup_count').eq('barcode', cleanBarcode).maybeSingle();
    if (cached?.product_data) {
      await admin.from('upc_cache').update({ cached_at: new Date().toISOString(), lookup_count: (cached.lookup_count || 0) + 1 }).eq('barcode', cleanBarcode);
      return new Response(JSON.stringify({ success: true, data: cached.product_data, cached: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!(await checkRateLimit(admin, `lookup-upc:${user.id}`, 25, 86400))) {
      await admin.from('security_audit_log').insert({ user_id: user.id, action: 'lookup_upc_rate_limited', resource: 'lookup-upc', success: false });
      return new Response(JSON.stringify({ success: false, error: 'Lookup limit reached. Enter details manually or try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let productData = null;
    try {
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`, { headers: { 'User-Agent': 'KeepSafe/1.0 (contact@keepsafe.app)' } });
      if (offResponse.ok) {
        const offData = await offResponse.json();
        if (offData.status === 1 && offData.product) {
          const p = offData.product;
          productData = { name: p.product_name || p.product_name_en || 'Unknown Product', brand: p.brands || null, category: p.categories?.split(',')[0]?.trim() || null, image_url: p.image_url || p.image_front_url || null, description: p.generic_name || null, source: 'openfoodfacts' };
        }
      }
    } catch (e) {
      console.log('Open Food Facts lookup failed; manual fallback remains available', e);
    }

    if (!productData) {
      try {
        const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${cleanBarcode}`, { headers: { 'Accept': 'application/json' } });
        if (upcResponse.ok) {
          const upcData = await upcResponse.json();
          if (upcData.items?.length > 0) {
            const item = upcData.items[0];
            productData = { name: item.title || 'Unknown Product', brand: item.brand || null, category: item.category || null, image_url: item.images?.[0] || null, description: item.description || null, source: 'upcitemdb' };
          }
        }
      } catch (e) {
        console.log('UPC Item DB lookup failed; manual fallback remains available', e);
      }
    }

    if (!productData) {
      return new Response(JSON.stringify({ success: false, error: 'Product not found', barcode: cleanBarcode, manualEntryRecommended: true }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await admin.from('upc_cache').upsert({ barcode: cleanBarcode, product_data: productData, source: productData.source, cached_at: new Date().toISOString(), lookup_count: 1 }, { onConflict: 'barcode' });
    return new Response(JSON.stringify({ success: true, data: productData, cached: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in lookup-upc function:', error);
    return new Response(JSON.stringify({ success: false, error: 'UPC lookup unavailable. You can still add the item manually.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
