const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GeoResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OsrmRoute {
  routes: { distance: number; duration: number }[];
}

function cleanPolishAddress(address: string): string {
  // Remove Polish street prefixes that confuse Nominatim
  return address
    .replace(/\bul\.\s*/gi, '')
    .replace(/\baleja\s*/gi, '')
    .replace(/\bal\.\s*/gi, '')
    .replace(/\bos\.\s*/gi, '')
    .replace(/\bpl\.\s*/gi, '')
    .replace(/\bplac\s+/gi, '')
    .trim();
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const cleaned = cleanPolishAddress(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}&countrycodes=pl&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'KingOfCatering/1.0', 'Accept': 'application/json' },
  });
  if (!res.ok) {
    console.error('Nominatim error:', res.status, await res.text());
    return null;
  }
  const text = await res.text();
  let data: GeoResult[];
  try {
    data = JSON.parse(text);
  } catch {
    console.error('Nominatim returned non-JSON:', text.substring(0, 200));
    return null;
  }
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

async function calculateRouteDistance(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
): Promise<{ distanceKm: number; durationMin: number } | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  const res = await fetch(url);
  const data: OsrmRoute = await res.json();
  if (!data.routes || data.routes.length === 0) return null;
  return {
    distanceKm: Math.round(data.routes[0].distance / 100) / 10, // round to 0.1 km
    durationMin: Math.round(data.routes[0].duration / 60),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, companyLat, companyLng } = await req.json();

    if (!address || companyLat == null || companyLng == null) {
      return new Response(
        JSON.stringify({ error: 'Missing address or company coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Geocode customer address
    const geo = await geocodeAddress(address);
    if (!geo) {
      return new Response(
        JSON.stringify({ error: 'address_not_found', message: 'Nie znaleziono adresu' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Calculate route
    const route = await calculateRouteDistance(companyLat, companyLng, geo.lat, geo.lng);
    if (!route) {
      return new Response(
        JSON.stringify({ error: 'route_not_found', message: 'Nie udało się obliczyć trasy' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
        customerLat: geo.lat,
        customerLng: geo.lng,
        customerAddress: geo.displayName,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('calculate-delivery error:', err);
    return new Response(
      JSON.stringify({ error: 'internal_error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
