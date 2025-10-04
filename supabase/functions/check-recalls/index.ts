import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching all items for recall check...');
    
    // Fetch all items from database
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Processing ${items?.length || 0} items`);

    // Check CPSC recalls
    const cpscResponse = await fetch(
      'https://www.cpsc.gov/cgibin/CPSCUpcWS/getProdList.aspx?format=json&start=0&rows=100'
    );
    
    if (!cpscResponse.ok) {
      console.error('CPSC API error:', cpscResponse.status);
    } else {
      const cpscData = await cpscResponse.json();
      console.log(`CPSC: fetched ${cpscData?.length || 0} records`);

      // Match recalls with items
      for (const item of items || []) {
        if (!item.brand) continue;

        const brandLower = item.brand.toLowerCase();
        const recall = cpscData.find((r: any) => 
          r.Manufacturer?.toLowerCase().includes(brandLower) ||
          r.ProductName?.toLowerCase().includes(brandLower)
        );

        if (recall) {
          const recallUrl = recall.URL || 'https://www.cpsc.gov';
          console.log(`Match found for ${item.name} (${item.brand})`);
          
          await supabase
            .from('items')
            .update({ 
              recall_match: true, 
              recall_url: recallUrl 
            })
            .eq('id', item.id);
        }
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
