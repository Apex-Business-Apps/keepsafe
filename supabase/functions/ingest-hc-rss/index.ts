import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { buildCorsHeaders } from "../_shared/cors.ts";
import { fingerprintRecord, stableSourceId, tokenize } from "../_shared/recallMatcher.ts";

function inferBrand(title: string): string {
  const cleaned = title.replace(/recall(ed|s)?/ig, '').trim();
  return cleaned.split(/\s+/).slice(0, 2).join(' ') || 'Unknown';
}

function inferModel(title: string): string {
  const match = title.match(/(?:model|models?)\s+([a-z0-9\- ]{2,40})/i);
  return match?.[1]?.trim() || title.split(/\s+/).slice(0, 8).join(' ');
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const caller = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const { data: role } = await caller.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
  if (!role) {
    await admin.from('security_audit_log').insert({ user_id: user.id, action: 'ingest_hc_rss_denied', resource: 'health_canada_recalls', success: false });
    return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const response = await fetch('https://healthycanadians.gc.ca/recall-alert-rappel-avis/api/recent/en.rss');
    if (!response.ok) throw new Error(`Health Canada RSS fetch failed: ${response.status}`);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/xml');
    if (!doc) throw new Error('Failed to parse RSS feed');

    const rows = [];
    for (const item of doc.querySelectorAll('item')) {
      const el = item as Element;
      const title = el.querySelector('title')?.textContent?.trim() || '';
      const link = el.querySelector('link')?.textContent?.trim() || '';
      const pubDateText = el.querySelector('pubDate')?.textContent?.trim() || '';
      if (!title || !link) continue;
      const brand = inferBrand(title);
      const model = inferModel(title);
      const published = pubDateText ? new Date(pubDateText) : null;
      const sourceSystem = 'health_canada';
      const sourceId = stableSourceId(sourceSystem, link, title);
      const fingerprint = await fingerprintRecord([sourceSystem, link, title, pubDateText]);
      rows.push({
        brand,
        model,
        title,
        url: link,
        source: 'hc',
        source_system: sourceSystem,
        source_url: link,
        source_id: sourceId,
        content_fingerprint: fingerprint,
        published_date: published && !Number.isNaN(published.getTime()) ? published.toISOString().slice(0, 10) : null,
        normalized_brand_tokens: tokenize(brand),
        normalized_model_tokens: tokenize(model),
        normalized_name_tokens: tokenize(title),
        raw_payload: { title, link, pubDate: pubDateText },
        last_seen_at: new Date().toISOString(),
      });
    }

    const { data, error } = await admin.from('recalls').upsert(rows, { onConflict: 'source_system,source_id' }).select('id');
    if (error) throw error;
    await admin.from('security_audit_log').insert({ user_id: user.id, action: 'ingest_hc_rss', resource: 'health_canada_recalls', success: true, details: { parsed: rows.length, upserted: data?.length || 0 } });
    return new Response(JSON.stringify({ success: true, parsed: rows.length, upserted: data?.length || 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    await admin.from('security_audit_log').insert({ user_id: user.id, action: 'ingest_hc_rss_failed', resource: 'health_canada_recalls', success: false, details: { error: error instanceof Error ? error.message : 'Unknown error' } });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
