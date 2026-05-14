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
  if (!authHeader) return new Response(JSON.stringify({ success: false, error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const caller = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user) return new Response(JSON.stringify({ success: false, error: 'Invalid authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Image data is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (imageBase64.length > 8_000_000) {
      await admin.from('security_audit_log').insert({ user_id: user.id, action: 'receipt_ocr_rejected', resource: 'extract-receipt', success: false, details: { reason: 'payload_too_large' } });
      return new Response(JSON.stringify({ success: false, error: 'Receipt image is too large. Add details manually or upload a smaller image.' }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!(await checkRateLimit(admin, `extract-receipt:${user.id}`, 10, 86400))) {
      await admin.from('security_audit_log').insert({ user_id: user.id, action: 'receipt_ocr_rate_limited', resource: 'extract-receipt', success: false });
      return new Response(JSON.stringify({ success: false, error: 'Receipt scan limit reached. Manual entry remains available.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Receipt scanning is unavailable. Add receipt details manually.' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Extract receipt data. Return valid JSON only.' },
          { role: 'user', content: [
            { type: 'text', text: 'Return JSON with store_name, purchase_date YYYY-MM-DD or null, total_amount number or null, items array of {name, price, quantity}, payment_method, confidence high/medium/low. Use null when unclear.' },
            { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
          ] }
        ],
        tools: [{ type: 'function', function: { name: 'extract_receipt_data', description: 'Extract structured receipt data', parameters: { type: 'object', properties: { store_name: { type: 'string' }, purchase_date: { type: 'string' }, total_amount: { type: 'number' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' } }, required: ['name', 'price'] } }, payment_method: { type: 'string' }, confidence: { type: 'string', enum: ['high', 'medium', 'low'] } }, required: ['confidence'] } } }],
        tool_choice: { type: 'function', function: { name: 'extract_receipt_data' } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const error = status === 429 ? 'Receipt scanning is temporarily rate limited. Add details manually.' : status === 402 ? 'Receipt scanning credits are unavailable. Add details manually.' : 'Failed to process receipt. Add details manually.';
      return new Response(JSON.stringify({ success: false, error }), { status: status === 429 ? 429 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const content = data.choices?.[0]?.message?.content;
    const parsed = args ? JSON.parse(args) : JSON.parse(String(content || '{}').replace(/```json\n?|\n?```/g, ''));
    return new Response(JSON.stringify({ success: true, data: parsed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in extract-receipt function:', error);
    return new Response(JSON.stringify({ success: false, error: 'Receipt scanning failed. Add details manually.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
