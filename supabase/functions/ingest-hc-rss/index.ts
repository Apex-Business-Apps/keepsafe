import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://aljdaazlgjcfwirqfjuc.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Health Canada RSS feed...');
    
    const response = await fetch(
      'https://healthycanadians.gc.ca/recall-alert-rappel-avis/api/recent/en.rss'
    );

    if (!response.ok) {
      throw new Error(`Health Canada RSS fetch failed: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    if (!doc) {
      throw new Error('Failed to parse RSS feed');
    }

    const items = doc.querySelectorAll('item');
    const recalls = [];

    for (const item of items) {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      
      recalls.push({ title, link, pubDate });
    }

    console.log(`HC: parsed ${recalls.length} items`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: recalls.length,
        recalls: recalls.slice(0, 10) // Return first 10 for preview
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ingest-hc-rss:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
