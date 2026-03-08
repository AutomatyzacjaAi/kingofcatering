# 🚀 Migracja na własną infrastrukturę (DigitalOcean)

## Stan projektu

Cała aplikacja frontendowa jest **gotowa** — kreator zamówień, panel admina, logowanie, zarządzanie produktami, klientami, zamówieniami. Jedyne co trzeba zrobić to **podpiąć własną bazę danych PostgreSQL** i (opcjonalnie) przenieść edge function.

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React + Vite + TypeScript)  ✅   │
│  - Kreator zamówień klienta                 │
│  - Panel admina (/admin)                    │
│  - Logowanie (/login)                       │
│  - Cała logika biznesowa                    │
├─────────────────────────────────────────────┤
│  BACKEND — do podpięcia                     │
│  - PostgreSQL (DigitalOcean Managed DB)     │
│  - Auth (Supabase Cloud / self-hosted)      │
│  - 1 edge function (calculate-delivery)     │
└─────────────────────────────────────────────┘
```

---

## Spis treści

1. [Co jest gotowe, a co trzeba podpiąć](#1-co-jest-gotowe)
2. [Krok 1: Baza danych na DigitalOcean](#krok-1-baza-danych)
3. [Krok 2: Podpięcie Supabase do własnej bazy](#krok-2-podpięcie-supabase)
4. [Krok 3: Przeniesienie edge function](#krok-3-edge-function)
5. [Krok 4: Zmienne środowiskowe](#krok-4-zmienne)
6. [Krok 5: Deploy frontendu](#krok-5-deploy)
7. [Schemat bazy danych (pełny SQL)](#schemat-bazy-danych)
8. [Mapa plików](#mapa-plików)
9. [Checklist](#checklist)

---

## 1. Co jest gotowe

### ✅ Gotowe (nie wymaga zmian):
- Cały frontend React (kreator, admin, logowanie)
- Wszystkie hooki do pobierania danych (`useSupabaseData.ts`)
- Logika zamówień (`useCateringOrder.ts`, `submitOrder.ts`)
- Komponenty UI (shadcn/ui)
- Panel admina z CRUD-em dla produktów, klientów, zamówień, ustawień
- Zarządzanie kategoriami, typami wydarzeń, mapowaniami
- Obliczanie dostawy (geocoding + routing)

### 🔧 Do podpięcia (minimalna praca):
| Element | Co zrobić | Trudność |
|---------|-----------|----------|
| **Baza PostgreSQL** | Stworzyć tabele na DigitalOcean (SQL gotowy poniżej) | ⭐ Łatwa |
| **Supabase Client** | Zmienić URL + klucz w jednym pliku | ⭐ Łatwa |
| **Typy TypeScript** | Wygenerować automatycznie z nowej bazy | ⭐ Łatwa |
| **Edge Function** | Przenieść na własny backend LUB zostawić na Supabase | ⭐⭐ Średnia |
| **Auth** | Skonfigurować użytkownika admina w nowym Supabase | ⭐ Łatwa |

---

## Krok 1: Baza danych

### DigitalOcean Managed Database (PostgreSQL 15+)

1. W panelu DigitalOcean → **Databases** → **Create Database Cluster**
2. Wybierz PostgreSQL 15+, region najbliżej klientów (np. Frankfurt)
3. Po utworzeniu — skopiuj connection string

### Tworzenie tabel

Wykonaj poniższy SQL na nowej bazie. **Cały schemat jest identyczny z tym co działa teraz** — wystarczy skopiować i wykonać:

```sql
-- ================================================
-- TABELA: company_settings
-- ================================================
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '',
  nip text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  bank_account text DEFAULT '',
  logo_url text,
  favicon_url text,
  min_order_value numeric DEFAULT 200,
  min_lead_days integer DEFAULT 3,
  auto_confirm boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  company_address_full text DEFAULT '',
  company_lat numeric,
  company_lng numeric,
  delivery_price_per_km numeric NOT NULL DEFAULT 3,
  max_delivery_km numeric,
  free_delivery_above_km numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: event_types
-- ================================================
CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'CalendarDays',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: product_categories
-- ================================================
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  icon text NOT NULL DEFAULT 'Salad',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: event_category_mappings
-- ================================================
CREATE TABLE public.event_category_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id uuid NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE
);

-- ================================================
-- TABELA: extras_categories
-- ================================================
CREATE TABLE public.extras_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  icon text NOT NULL DEFAULT 'Sparkles',
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: dishes
-- ================================================
CREATE TABLE public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  category_slug text,
  product_type text NOT NULL DEFAULT 'dish',
  price_netto numeric NOT NULL DEFAULT 0,
  vat_rate integer NOT NULL DEFAULT 8,
  price_brutto numeric NOT NULL DEFAULT 0,
  price_per_unit numeric DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  min_quantity integer DEFAULT 1,
  icon text DEFAULT '🍽️',
  contents text[] DEFAULT '{}',
  dietary_tags text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: bundles + bundle_variants
-- ================================================
CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  category_slug text,
  price_netto numeric NOT NULL DEFAULT 0,
  vat_rate integer NOT NULL DEFAULT 8,
  price_brutto numeric NOT NULL DEFAULT 0,
  base_price numeric NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 1,
  icon text DEFAULT '🍽️',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bundle_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  dish_id uuid REFERENCES public.dishes(id),
  dietary_tags text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);

-- ================================================
-- TABELA: configurable_sets + config_groups + options
-- ================================================
CREATE TABLE public.configurable_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  category_slug text,
  price_per_person numeric NOT NULL DEFAULT 0,
  min_persons integer NOT NULL DEFAULT 10,
  icon text DEFAULT '🍽️',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.config_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.configurable_sets(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_selections integer NOT NULL DEFAULT 1,
  max_selections integer NOT NULL DEFAULT 3,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.config_group_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.config_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  dish_id uuid REFERENCES public.dishes(id),
  allergens text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);

-- ================================================
-- TABELA: extras
-- ================================================
CREATE TABLE public.extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'dodatki',
  extras_category_id uuid REFERENCES public.extras_categories(id),
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  price_netto numeric DEFAULT 0,
  vat_rate integer DEFAULT 23,
  price_brutto numeric DEFAULT 0,
  food_cost numeric DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  price_label text DEFAULT '',
  icon text DEFAULT '✨',
  contents text[] DEFAULT '{}',
  duration text,
  requires_person_count boolean DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: ingredients + dish_ingredients
-- ================================================
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'g',
  price_per_unit numeric NOT NULL DEFAULT 0,
  allergens text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dish_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0
);

-- ================================================
-- TABELA: delivery_zones
-- ================================================
CREATE TABLE public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  cities text[] DEFAULT '{}',
  postal_codes text[] DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0,
  free_delivery_above numeric,
  min_order_value numeric,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: clients
-- ================================================
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  phone_alt text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  company_name text DEFAULT '',
  nip text DEFAULT '',
  company_address text DEFAULT '',
  company_city text DEFAULT '',
  company_postal_code text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: orders + order_items + sub_items
-- ================================================
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  client_id uuid REFERENCES public.clients(id),
  client_name text NOT NULL DEFAULT '',
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  event_type text DEFAULT '',
  event_date date,
  guest_count integer DEFAULT 0,
  delivery_address text DEFAULT '',
  contact_city text DEFAULT '',
  contact_street text DEFAULT '',
  contact_building text DEFAULT '',
  contact_apartment text DEFAULT '',
  delivery_zone_id uuid REFERENCES public.delivery_zones(id),
  delivery_cost numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Nowe',
  payment_method text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'szt.',
  price_per_unit numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  item_type text DEFAULT 'simple',
  food_cost_per_unit numeric DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.order_item_sub_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'szt.',
  food_cost_per_unit numeric DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

-- ================================================
-- TABELA: payment_methods
-- ================================================
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '💳',
  is_active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

-- ================================================
-- TABELA: blocked_dates
-- ================================================
CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TRIGGER: auto-update updated_at
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Dodaj trigger do tabel z updated_at:
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON public.event_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extras_categories_updated_at BEFORE UPDATE ON public.extras_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configurable_sets_updated_at BEFORE UPDATE ON public.configurable_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extras_updated_at BEFORE UPDATE ON public.extras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON public.delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- RLS (Row-Level Security) — domyślnie full access
-- W produkcji ogranicz dostęp!
-- ================================================
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurable_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_group_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_sub_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Polityki full access (zastąp bardziej restrykcyjnymi w produkcji):
CREATE POLICY "full_access" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.event_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.product_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.event_category_mappings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.extras_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.dishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.bundles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.bundle_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.configurable_sets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.config_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.config_group_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.extras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.dish_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.delivery_zones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.order_item_sub_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.blocked_dates FOR ALL USING (true) WITH CHECK (true);
```

---

## Krok 2: Podpięcie Supabase do własnej bazy

### Opcja A: Supabase Cloud (rekomendowana — najmniej pracy)

1. Załóż konto na [supabase.com](https://supabase.com)
2. Utwórz projekt → wykonaj SQL z powyżej w SQL Editor
3. Skopiuj **Project URL** i **Anon Key**

### Opcja B: Self-hosted Supabase na DigitalOcean

```bash
# Na Droplet z Docker:
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
# Edytuj .env — ustaw connection string do Managed Database
docker compose up -d
```

### Zmiana w kodzie (JEDYNY plik do zmiany):

```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://TWOJ-PROJEKT.supabase.co"
const SUPABASE_ANON_KEY = "TWOJ-ANON-KEY"
```

### Regeneracja typów:
```bash
npx supabase gen types typescript --project-id TWOJ-PROJECT-ID > src/integrations/supabase/types.ts
```

---

## Krok 3: Edge Function

### Jedyna edge function: `calculate-delivery`

**Co robi:** Geokoduje adres klienta (Nominatim) → oblicza trasę (OSRM) → zwraca km i czas.

**Opcja 1 — Zostaw na Supabase:**
```bash
npx supabase functions deploy calculate-delivery --project-ref TWOJ-PROJECT-ID
```

**Opcja 2 — Przenieś na własny backend (Express/Node.js):**

Utwórz `server/routes/delivery.js`:

```javascript
const express = require('express');
const router = express.Router();

function cleanPolishAddress(address) {
  return address
    .replace(/\bul\.\s*/gi, '')
    .replace(/\baleja\s*/gi, '')
    .replace(/\bal\.\s*/gi, '')
    .replace(/\bos\.\s*/gi, '')
    .replace(/\bpl\.\s*/gi, '')
    .replace(/\bplac\s+/gi, '')
    .trim();
}

async function geocodeAddress(address) {
  const cleaned = cleanPolishAddress(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}&countrycodes=pl&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'KingOfCatering/1.0' } });
  const data = await res.json();
  if (!data?.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

async function calculateRoute(fromLat, fromLng, toLat, toLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes?.length) return null;
  return { distanceKm: Math.round(data.routes[0].distance / 100) / 10, durationMin: Math.round(data.routes[0].duration / 60) };
}

router.post('/calculate-delivery', async (req, res) => {
  try {
    const { address, companyLat, companyLng } = req.body;
    if (!address || companyLat == null || companyLng == null) return res.status(400).json({ error: 'Missing params' });

    const geo = await geocodeAddress(address);
    if (!geo) return res.json({ error: 'address_not_found', message: 'Nie znaleziono adresu' });

    const route = await calculateRoute(companyLat, companyLng, geo.lat, geo.lng);
    if (!route) return res.json({ error: 'route_not_found', message: 'Nie udało się obliczyć trasy' });

    return res.json({ distanceKm: route.distanceKm, durationMin: route.durationMin, customerLat: geo.lat, customerLng: geo.lng, customerAddress: geo.displayName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
```

Zmiana w frontendzie (`src/components/catering/ContactForm.tsx`):
```typescript
// Zamień:
const { data } = await supabase.functions.invoke("calculate-delivery", { body: { ... } });

// Na:
const res = await fetch("https://TWOJ-BACKEND/api/calculate-delivery", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ address, companyLat, companyLng }),
});
const data = await res.json();
```

**Opcja 3 — Bez backendu:** Wywołaj Nominatim i OSRM bezpośrednio z frontendu (jak w `SettingsDeliveryView.tsx`).

---

## Krok 4: Zmienne środowiskowe

Utwórz `.env` z nowymi wartościami:
```
VITE_SUPABASE_URL=https://TWOJ-PROJEKT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TWOJ-ANON-KEY
```

⚠️ Zmienne `VITE_` są publiczne w przeglądarce — to OK dla anon key.

---

## Krok 5: Deploy frontendu

```bash
npm install
npm run build
# Wynik → dist/
```

### Nginx na DigitalOcean Droplet:
```nginx
server {
    listen 80;
    server_name twojadomena.pl;
    root /var/www/kingofcatering/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Alternatywnie: Vercel, Netlify, DigitalOcean App Platform.

---

## Mapa plików

### 🔧 Pliki do zmiany przy migracji (2-3 pliki):

| Plik | Co zmienić |
|------|-----------|
| `src/integrations/supabase/client.ts` | URL + klucz nowego Supabase |
| `src/integrations/supabase/types.ts` | Wygeneruj z `supabase gen types` |
| `.env` | Nowy URL i klucz |

### ✅ Pliki których NIE zmieniasz:

Cała reszta — komponenty, hooki, strony, logika biznesowa, style. Wszystko działa z dowolnym Supabase backendem.

### 📁 Struktura:

```
src/
├── components/
│   ├── catering/           ← Kreator zamówień (gotowy)
│   ├── admin/              ← Panel admina (gotowy)
│   └── ui/                 ← shadcn/ui (gotowy)
├── hooks/
│   ├── useSupabaseData.ts  ← Pobieranie danych (gotowy)
│   ├── useCateringOrder.ts ← Stan zamówienia (gotowy)
│   └── useAdminAuth.ts     ← Auth admina (gotowy)
├── lib/
│   ├── submitOrder.ts      ← Składanie zamówień (gotowy)
│   └── utils.ts
├── pages/                  ← Strony (gotowe)
└── integrations/supabase/
    ├── client.ts           ← ⚠️ ZMIEŃ URL + KLUCZ
    └── types.ts            ← ⚠️ WYGENERUJ NOWE
```

---

## Schemat bazy danych

```
company_settings (1 wiersz — konfiguracja firmy)

event_types ──┐
              ├── event_category_mappings (filtrowanie kategorii wg wydarzenia)
product_categories ──┘

extras_categories ──── extras (dodatki z kategoriami)

dishes ──── dish_ingredients ──── ingredients
  │
  ├── bundle_variants ──── bundles
  │
  └── config_group_options ──── config_groups ──── configurable_sets

clients ──── orders ──── order_items ──── order_item_sub_items

payment_methods (niezależna)
blocked_dates (niezależna)
delivery_zones (strefy dostaw)
```

---

## Checklist

- [ ] Utworzenie PostgreSQL na DigitalOcean
- [ ] Wykonanie SQL (tworzenie tabel) — skopiuj z tego pliku
- [ ] Nowy projekt Supabase (Cloud lub self-hosted) podpięty do bazy
- [ ] Zmiana URL + klucz w `client.ts`
- [ ] Regeneracja `types.ts`
- [ ] Export danych z Lovable Cloud → import do nowej bazy
- [ ] Deploy edge function LUB przeniesienie na backend
- [ ] `npm run build` → deploy na DigitalOcean
- [ ] Test zamówienia end-to-end
- [ ] Konfiguracja domeny + SSL (Let's Encrypt)

---

## FAQ

**Q: Ile plików muszę zmienić?**
A: Maksymalnie 2-3 pliki (`client.ts`, `types.ts`, `.env`). Opcjonalnie `ContactForm.tsx` jeśli przenosisz edge function.

**Q: Czy mogę użyć MySQL?**
A: Nie. Cały kod korzysta z Supabase SDK który wymaga PostgreSQL.

**Q: Jak przenieść dane z Lovable Cloud?**
A: Eksport SQL dump z panelu Lovable Cloud → import do nowej bazy.

**Q: Nominatim/OSRM kosztują?**
A: Nie, oba API są darmowe. Nominatim: ~1 req/s. Dla cateringu to więcej niż wystarczające.

**Q: Co z autentykacją admina?**
A: Supabase Auth — wystarczy utworzyć użytkownika admina w nowym projekcie Supabase. Cała logika logowania jest gotowa w kodzie.
