/**
 * ====================================================================
 * STRIPE CHECKOUT SESSION — Edge Function
 * ====================================================================
 * 
 * Ta funkcja tworzy Stripe Checkout Session na podstawie zamówienia.
 * 
 * KONFIGURACJA:
 * 1. Utwórz konto na https://stripe.com
 * 2. Skopiuj Secret Key z Dashboard → Developers → API keys
 * 3. Dodaj secret do projektu:
 *    - W Lovable Cloud: Supabase Secrets → STRIPE_SECRET_KEY
 *    - Na własnym serwerze: zmienna środowiskowa STRIPE_SECRET_KEY
 * 4. Ustaw STRIPE_WEBHOOK_SECRET jeśli chcesz obsługiwać webhooki
 * 
 * UŻYCIE Z FRONTENDU:
 *   const { data } = await supabase.functions.invoke("create-stripe-checkout", {
 *     body: { orderId, orderNumber, amount, customerEmail, lineItems }
 *   });
 *   window.location.href = data.url; // Przekierowanie do Stripe
 * 
 * PO MIGRACJI NA DIGITALOCEAN:
 *   Zamień na endpoint Express.js — logika identyczna.
 *   Patrz MIGRATION_GUIDE.md dla pełnego kodu Express.
 * ====================================================================
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CheckoutRequest {
  orderId: string;          // UUID zamówienia w bazie
  orderNumber: string;      // Numer zamówienia (KC-XXXXXXXX-XXXXXX)
  amount: number;           // Kwota w PLN (np. 2500.00)
  customerEmail: string;    // Email klienta
  customerName: string;     // Imię i nazwisko
  lineItems: {              // Pozycje zamówienia
    name: string;
    quantity: number;
    unitPrice: number;      // Cena jednostkowa w PLN
  }[];
  successUrl?: string;      // URL po udanej płatności
  cancelUrl?: string;       // URL po anulowaniu
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // =============================================
    // 1. POBIERZ KLUCZ STRIPE
    // =============================================
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'stripe_not_configured',
          message: 'Płatności online nie są jeszcze skonfigurowane. Dodaj STRIPE_SECRET_KEY do secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // 2. PARSUJ REQUEST
    // =============================================
    const body: CheckoutRequest = await req.json();
    const { orderId, orderNumber, amount, customerEmail, customerName, lineItems, successUrl, cancelUrl } = body;

    if (!orderId || !amount || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'missing_params', message: 'Brak wymaganych parametrów (orderId, amount, customerEmail)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // 3. UTWÓRZ STRIPE CHECKOUT SESSION
    //    Używamy Stripe API bezpośrednio (bez SDK)
    //    Dokumentacja: https://stripe.com/docs/api/checkout/sessions/create
    // =============================================
    
    // Buduj line_items dla Stripe
    const stripeLineItems = lineItems.map(item => ({
      price_data: {
        currency: 'pln',
        product_data: {
          name: item.name,
        },
        // Stripe wymaga kwoty w groszach (najmniejsza jednostka)
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    // Jeśli brak szczegółowych pozycji, utwórz jedną pozycję z łączną kwotą
    if (stripeLineItems.length === 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Zamówienie ${orderNumber}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      });
    }

    // Domyślne URL-e (zmień na swoją domenę)
    const baseUrl = successUrl?.split('?')[0]?.replace(/\/+$/, '') || 'https://twojadomena.pl';

    const formData = new URLSearchParams();
    formData.append('payment_method_types[]', 'card');
    formData.append('payment_method_types[]', 'p24');  // Przelewy24 — popularne w PL
    formData.append('payment_method_types[]', 'blik'); // BLIK
    formData.append('mode', 'payment');
    formData.append('customer_email', customerEmail);
    formData.append('success_url', successUrl || `${baseUrl}?payment=success&order=${orderNumber}`);
    formData.append('cancel_url', cancelUrl || `${baseUrl}?payment=cancelled&order=${orderNumber}`);
    formData.append('metadata[order_id]', orderId);
    formData.append('metadata[order_number]', orderNumber);
    formData.append('metadata[customer_name]', customerName);

    // Dodaj line items
    stripeLineItems.forEach((item, idx) => {
      formData.append(`line_items[${idx}][price_data][currency]`, item.price_data.currency);
      formData.append(`line_items[${idx}][price_data][product_data][name]`, item.price_data.product_data.name);
      formData.append(`line_items[${idx}][price_data][unit_amount]`, String(item.price_data.unit_amount));
      formData.append(`line_items[${idx}][quantity]`, String(item.quantity));
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('Stripe API error:', session);
      return new Response(
        JSON.stringify({ error: 'stripe_error', message: session.error?.message || 'Błąd Stripe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // 4. ZWRÓĆ URL SESJI
    // =============================================
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,  // Przekieruj klienta pod ten URL
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('create-stripe-checkout error:', err);
    return new Response(
      JSON.stringify({ error: 'internal_error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
