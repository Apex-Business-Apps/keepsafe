import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch all recalls for sitemap
    const { data: recalls, error } = await supabase
      .from('recalls')
      .select('brand, model, published_date')
      .order('published_date', { ascending: false })
      .limit(10000); // Max 10k URLs per sitemap

    if (error) {
      console.error('Error fetching recalls:', error);
    }

    const baseUrl = req.headers.get('origin') || 'https://keepsafe.lovable.app';
    const today = new Date().toISOString().split('T')[0];

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Core pages
    const corePages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/dashboard', priority: '0.8', changefreq: 'weekly' },
      { path: '/auth', priority: '0.7', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
    ];

    for (const page of corePages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Recall pages
    if (recalls && recalls.length > 0) {
      for (const recall of recalls) {
        const slug = `${recall.brand}-${recall.model}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/recalls/${slug}</loc>\n`;
        xml += `    <lastmod>${recall.published_date || today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += '</urlset>';

    console.log(`Generated sitemap with ${corePages.length + (recalls?.length || 0)} URLs`);

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
