/**
 * ====================================================================
 * STRIPE WEBHOOK — Edge Function
 * ====================================================================
 * 
 * Odbiera powiadomienia od Stripe o statusie płatności.
 * Po udanej płatności aktualizuje status zamówienia w bazie.
 * 
 * KONFIGURACJA:
 * 1. W Stripe Dashboard → Developers → Webhooks → Add endpoint
 * 2. URL: https://TWOJ-PROJECT-ID.supabase.co/functions/v1/stripe-webhook
 *    (lub po migracji: https://TWOJ-BACKEND/api/stripe-webhook)
 * 3. Wybierz eventy: checkout.session.completed
 * 4. Skopiuj Signing Secret → dodaj jako STRIPE_WEBHOOK_SECRET
 * 
 * PO MIGRACJI:
 *   Zamień na endpoint Express.js — patrz MIGRATION_GUIDE.md
 * ====================================================================
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Prosta weryfikacja podpisu Stripe (HMAC SHA256)
async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const sigPart = parts.find(p => p.startsWith('v1='));
  
  if (!timestampPart || !sigPart) return false;
  
  const timestamp = timestampPart.split('=')[1];
  const expectedSig = sigPart.split('=')[1];
  
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const computedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return computedSig === expectedSig;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase config');
      return new Response('Server misconfigured', { status: 500, headers: corsHeaders });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Weryfikuj podpis jeśli mamy secret
    if (STRIPE_WEBHOOK_SECRET && signature) {
      const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid Stripe signature');
        return new Response('Invalid signature', { status: 400, headers: corsHeaders });
      }
    }

    const event = JSON.parse(body);

    // =============================================
    // OBSŁUGA EVENTÓW
    // =============================================
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const orderNumber = session.metadata?.order_number;
      const paymentStatus = session.payment_status; // 'paid' | 'unpaid'

      console.log(`Payment ${paymentStatus} for order ${orderNumber} (${orderId})`);

      if (orderId && paymentStatus === 'paid') {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Aktualizuj status zamówienia
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'Potwierdzone',
            payment_method: 'Stripe',
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order:', error);
        } else {
          console.log(`Order ${orderNumber} status updated to Potwierdzone`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('stripe-webhook error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
