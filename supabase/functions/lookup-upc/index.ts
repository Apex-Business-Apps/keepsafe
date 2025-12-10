import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean barcode - remove any non-numeric characters
    const cleanBarcode = barcode.replace(/\D/g, '');
    
    if (cleanBarcode.length < 8 || cleanBarcode.length > 14) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid barcode format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up UPC:', cleanBarcode);

    // Initialize Supabase client to check cache
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first
    const { data: cached } = await supabase
      .from('upc_cache')
      .select('product_data')
      .eq('barcode', cleanBarcode)
      .maybeSingle();

    if (cached?.product_data) {
      console.log('Returning cached UPC data');
      return new Response(
        JSON.stringify({ success: true, data: cached.product_data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try UPC Database API (free tier)
    let productData = null;
    
    // Try Open Food Facts first (free, no API key required)
    try {
      const offResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`,
        { headers: { 'User-Agent': 'KeepSafe/1.0 (contact@keepsafe.app)' } }
      );
      
      if (offResponse.ok) {
        const offData = await offResponse.json();
        if (offData.status === 1 && offData.product) {
          const p = offData.product;
          productData = {
            name: p.product_name || p.product_name_en || 'Unknown Product',
            brand: p.brands || null,
            category: p.categories?.split(',')[0]?.trim() || null,
            image_url: p.image_url || p.image_front_url || null,
            description: p.generic_name || null,
            source: 'openfoodfacts'
          };
          console.log('Found product in Open Food Facts:', productData.name);
        }
      }
    } catch (e) {
      console.log('Open Food Facts lookup failed:', e);
    }

    // Try UPC Item DB as fallback (free tier: 100 lookups/day)
    if (!productData) {
      try {
        const upcResponse = await fetch(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${cleanBarcode}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (upcResponse.ok) {
          const upcData = await upcResponse.json();
          if (upcData.items && upcData.items.length > 0) {
            const item = upcData.items[0];
            productData = {
              name: item.title || 'Unknown Product',
              brand: item.brand || null,
              category: item.category || null,
              image_url: item.images?.[0] || null,
              description: item.description || null,
              source: 'upcitemdb'
            };
            console.log('Found product in UPC Item DB:', productData.name);
          }
        }
      } catch (e) {
        console.log('UPC Item DB lookup failed:', e);
      }
    }

    if (!productData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product not found', barcode: cleanBarcode }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the result
    await supabase
      .from('upc_cache')
      .upsert({
        barcode: cleanBarcode,
        product_data: productData,
        cached_at: new Date().toISOString()
      }, { onConflict: 'barcode' });

    console.log('Product data cached for barcode:', cleanBarcode);

    return new Response(
      JSON.stringify({ success: true, data: productData, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lookup-upc function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
