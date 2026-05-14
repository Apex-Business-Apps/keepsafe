import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { matchRecall } from "../_shared/recallMatcher.ts";

async function fetchAll(client: ReturnType<typeof createClient>, table: string, select: string, pageSize = 1000) {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client.from(table).select(select).range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
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
    await admin.from('security_audit_log').insert({ user_id: user.id, action: 'check_recalls_denied', resource: 'recall_matching', success: false });
    return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const [items, recalls] = await Promise.all([
      fetchAll(admin, 'items', 'id,user_id,name,brand,barcode,serial_number'),
      fetchAll(admin, 'recalls', 'id,title,brand,model,url,source,source_system,source_url,published_date,normalized_brand_tokens,normalized_model_tokens,normalized_name_tokens,affected_barcodes'),
    ]);

    const matchRows = [];
    const bestByItem = new Map<string, { score: number; url: string | null }>();
    for (const item of items) {
      for (const recall of recalls) {
        const evidence = matchRecall(item, recall);
        if (!evidence.matched) continue;
        matchRows.push({
          item_id: item.id,
          recall_id: recall.id,
          user_id: item.user_id,
          match_score: evidence.match_score,
          match_reason: evidence.match_reason,
          matched_brand_tokens: evidence.matched_brand_tokens,
          matched_model_tokens: evidence.matched_model_tokens,
          matched_barcode: evidence.matched_barcode,
          source_system: evidence.source_system,
          source_url: evidence.source_url,
          published_date: evidence.published_date,
        });
        const current = bestByItem.get(item.id);
        if (!current || evidence.match_score > current.score) bestByItem.set(item.id, { score: evidence.match_score, url: evidence.source_url });
      }
    }

    if (matchRows.length > 0) {
      const { error } = await admin.from('item_recall_matches').upsert(matchRows, { onConflict: 'item_id,recall_id' });
      if (error) throw error;
    }

    for (const item of items) {
      const best = bestByItem.get(item.id);
      await admin.from('items').update({ recall_match: Boolean(best), recall_url: best?.url || null }).eq('id', item.id);
    }

    await admin.from('security_audit_log').insert({ user_id: user.id, action: 'check_recalls', resource: 'recall_matching', success: true, details: { itemsChecked: items.length, recallsChecked: recalls.length, matches: matchRows.length } });
    return new Response(JSON.stringify({ success: true, itemsChecked: items.length, recallsChecked: recalls.length, matches: matchRows.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    await admin.from('security_audit_log').insert({ user_id: user.id, action: 'check_recalls_failed', resource: 'recall_matching', success: false, details: { error: error instanceof Error ? error.message : 'Unknown error' } });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
