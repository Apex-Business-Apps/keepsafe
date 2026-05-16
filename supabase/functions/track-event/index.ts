import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { buildCorsHeaders } from "../_shared/cors.ts";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  if (!authHeader) {
    await admin.from('security_audit_log').insert({ action: 'track_event_denied', resource: 'track-event', success: false, details: { reason: 'missing_authorization_header' } });
    return new Response(JSON.stringify({ error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    await admin.from('security_audit_log').insert({ action: 'track_event_denied', resource: 'track-event', success: false, details: { reason: 'invalid_jwt' } });
    return new Response(JSON.stringify({ error: 'Invalid authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();
    if (!checkRateLimit(user.id)) {
      await admin.from('security_audit_log').insert({ user_id: user.id, action: 'track_event_rate_limited', resource: 'track-event', success: false });
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { name, props } = body;
    if (!name || typeof name !== 'string') return new Response(JSON.stringify({ error: 'Event name is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data, error } = await supabase.from('events').insert({ name, user_id: user.id, props: props || {} }).select('id,name,ts').single();
    if (error) throw error;
    return new Response(JSON.stringify({ success: true, event: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in track-event function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
