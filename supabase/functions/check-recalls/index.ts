import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // SECURITY: Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.id} triggered recall check`);
    
    // Log security event
    await supabase.from('security_audit_log').insert({
      user_id: user.id,
      action: 'check_recalls',
      resource: 'cpsc_api',
      success: true,
    });

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching items with brand info for recall check...');
    
    // Optimized: Only fetch items with brand info, select needed fields
    const { data: items, error: fetchError } = await supabaseAdmin
      .from('items')
      .select('id, name, brand')
      .not('brand', 'is', null)
      .limit(1000);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Processing ${items?.length || 0} items`);

    // Check CPSC recalls with timeout
    const cpscController = new AbortController();
    const cpscTimeout = setTimeout(() => cpscController.abort(), 10000);
    
    try {
      const cpscResponse = await fetch(
        'https://www.cpsc.gov/cgibin/CPSCUpcWS/getProdList.aspx?format=json&start=0&rows=100',
        { signal: cpscController.signal }
      );
      clearTimeout(cpscTimeout);
      
      if (!cpscResponse.ok) {
        console.error('CPSC API error:', cpscResponse.status);
      } else {
        const cpscData = await cpscResponse.json();
        console.log(`CPSC: fetched ${cpscData?.length || 0} records`);

        // Batch updates for efficiency
        const updates = [];
        
        for (const item of items || []) {
          const brandLower = item.brand!.toLowerCase();
          const recall = cpscData.find((r: any) => 
            r.Manufacturer?.toLowerCase().includes(brandLower) ||
            r.ProductName?.toLowerCase().includes(brandLower)
          );

          if (recall) {
            const recallUrl = recall.URL || 'https://www.cpsc.gov';
            console.log(`Match found for ${item.name} (${item.brand})`);
            updates.push({ id: item.id, recall_url: recallUrl });
          }
        }

        // Batch update all matches
        if (updates.length > 0) {
          for (const update of updates) {
            await supabaseAdmin
              .from('items')
              .update({ recall_match: true, recall_url: update.recall_url })
              .eq('id', update.id);
          }
          console.log(`Updated ${updates.length} items with recall matches`);
        }
      }
    } catch (err) {
      clearTimeout(cpscTimeout);
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('CPSC API timeout after 10s');
      } else {
        throw err;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        itemsChecked: items?.length || 0,
        message: 'Recall check completed' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-recalls:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
