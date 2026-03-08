# 🚀 Instrukcja migracji z Lovable Cloud na własną infrastrukturę

## Spis treści
1. [Przegląd architektury](#1-przegląd-architektury)
2. [Co musisz przygotować](#2-co-musisz-przygotować)
3. [Krok 1: Eksport kodu źródłowego](#krok-1-eksport-kodu-źródłowego)
4. [Krok 2: Własna baza danych PostgreSQL](#krok-2-własna-baza-danych-postgresql)
5. [Krok 3: Konfiguracja Supabase (self-hosted lub cloud)](#krok-3-konfiguracja-supabase)
6. [Krok 4: Edge Functions → własny backend](#krok-4-edge-functions--własny-backend)
7. [Krok 5: Zmienne środowiskowe](#krok-5-zmienne-środowiskowe)
8. [Krok 6: Build i deploy frontendu](#krok-6-build-i-deploy-frontendu)
9. [Mapa plików — co jest gdzie](#mapa-plików)
10. [Schemat bazy danych](#schemat-bazy-danych)
11. [FAQ i rozwiązywanie problemów](#faq)

---

## 1. Przegląd architektury

Aplikacja składa się z:

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React + Vite + TypeScript)       │
│  - Strona klienta (kreator zamówień)        │
│  - Panel admina (/admin)                    │
│  - Logowanie (/login)                       │
├─────────────────────────────────────────────┤
│  BACKEND (Supabase / Lovable Cloud)         │
│  - Baza danych PostgreSQL                   │
│  - Autentykacja (Supabase Auth)             │
│  - Edge Functions (Deno) — obliczanie       │
│    dostawy                                  │
│  - Row-Level Security (RLS)                 │
└─────────────────────────────────────────────┘
```

**Komunikacja frontend ↔ backend:**
- Frontend używa biblioteki `@supabase/supabase-js` do komunikacji z bazą
- Klient Supabase jest skonfigurowany w `src/integrations/supabase/client.ts`
- Typy TypeScript bazy są w `src/integrations/supabase/types.ts`

---

## 2. Co musisz przygotować

### Minimalne wymagania:
- [ ] Serwer PostgreSQL (wersja 15+)
- [ ] Node.js 18+ (do budowania frontendu)
- [ ] Hosting dla frontendu (Vercel, Netlify, VPS z nginx, itp.)
- [ ] (Opcjonalnie) Własna instancja Supabase LUB zamiennik backendu

### Dwie ścieżki migracji:

| Ścieżka | Opis | Trudność |
|---------|------|----------|
| **A) Supabase Cloud/Self-hosted** | Zakładasz konto na supabase.com lub stawiasz self-hosted. Minimalne zmiany w kodzie. | ⭐ Łatwa |
| **B) Własny backend (Express/Fastify)** | Piszesz własne API. Musisz zastąpić klienta Supabase. | ⭐⭐⭐ Trudna |

**Rekomendacja:** Ścieżka A — załóż darmowe konto na [supabase.com](https://supabase.com) i użyj ich hostowanego PostgreSQL + Auth.

---

## Krok 1: Eksport kodu źródłowego

### Z Lovable:
1. W Lovable kliknij **GitHub** → połącz repozytorium
2. Lub pobierz ZIP z kodu (przycisk "Download" w ustawieniach projektu)

### Po pobraniu:
```bash
# Zainstaluj zależności
npm install

# Uruchom lokalnie (dev)
npm run dev

# Zbuduj produkcyjnie
npm run build
# Wynik budowania: folder dist/
```

---

## Krok 2: Własna baza danych PostgreSQL

### Tabele do utworzenia:

Poniżej **pełny SQL** do stworzenia wszystkich tabel. Wykonaj go na swojej bazie:

```sql
-- ================================================
-- TABELA: company_settings (ustawienia firmy)
-- ================================================
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '',
  nip text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  bank_account text DEFAULT '',
  min_order_value numeric DEFAULT 200,
  min_lead_days integer DEFAULT 3,
  auto_confirm boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  -- Ustawienia dostawy (obliczanie km)
  company_address_full text DEFAULT '',
  company_lat numeric DEFAULT NULL,
  company_lng numeric DEFAULT NULL,
  delivery_price_per_km numeric NOT NULL DEFAULT 3,
  max_delivery_km numeric DEFAULT NULL,
  free_delivery_above_km numeric DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: event_types (typy wydarzeń)
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
-- TABELA: product_categories (kategorie produktów)
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
-- TABELA: dishes (pojedyncze dania / patery)
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
-- TABELA: bundles (zestawy z wariantami, np. tacos)
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
-- TABELA: configurable_sets (zestawy konfigurowalne)
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
-- TABELA: extras (dodatki: obsługa, pakowanie, etc.)
-- ================================================
CREATE TABLE public.extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'dodatki',
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  price_netto numeric DEFAULT 0,
  vat_rate integer DEFAULT 23,
  price_brutto numeric DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  price_label text DEFAULT '',
  icon text DEFAULT '✨',
  contents text[] DEFAULT '{}',
  food_cost numeric DEFAULT 0,
  duration text,
  requires_person_count boolean DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: ingredients (składniki)
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
-- TABELA: clients (klienci)
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
-- TABELA: orders (zamówienia)
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
-- TABELA: payment_methods (metody płatności)
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
-- TABELA: blocked_dates (zablokowane daty)
-- ================================================
CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- TABELA: delivery_zones (strefy dostaw - legacy)
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
-- TRIGGER: auto-update updated_at
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Dodaj trigger do każdej tabeli z kolumną updated_at:
-- CREATE TRIGGER update_<table>_updated_at
--   BEFORE UPDATE ON public.<table>
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Krok 3: Konfiguracja Supabase

### Ścieżka A: Supabase Cloud (rekomendowana)

1. Załóż konto na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Wykonaj powyższy SQL w **SQL Editor**
4. Skopiuj:
   - **Project URL** (np. `https://xyz.supabase.co`)
   - **Anon Key** (publiczny klucz)

5. Zmień plik `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = "https://TWOJ-PROJEKT.supabase.co"
const SUPABASE_ANON_KEY = "TWOJ-ANON-KEY"

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
```

6. Wygeneruj nowe typy TypeScript:
```bash
npx supabase gen types typescript --project-id TWOJ-PROJECT-ID > src/integrations/supabase/types.ts
```

### Ścieżka B: Self-hosted Supabase

Dokumentacja: https://supabase.com/docs/guides/self-hosting

```bash
# Klonuj repozytorium Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
docker compose up -d
```

---

## Krok 4: Edge Functions → własny backend

### Aktualnie jest 1 edge function:

#### `calculate-delivery` — obliczanie kosztu dostawy

**Lokalizacja:** `supabase/functions/calculate-delivery/index.ts`

**Co robi:**
1. Przyjmuje adres klienta + współrzędne firmy
2. Geokoduje adres przez Nominatim (OpenStreetMap)
3. Oblicza trasę przez OSRM
4. Zwraca odległość w km i czas dojazdu

**Opcja 1: Zostaw na Supabase (Edge Function)**

Jeśli korzystasz z Supabase Cloud, wystarczy wdrożyć funkcję:
```bash
npx supabase functions deploy calculate-delivery --project-ref TWOJ-PROJECT-ID
```

**Opcja 2: Przenieś na własny backend (Node.js/Express)**

Utwórz plik `server/routes/delivery.js`:

```javascript
const express = require('express');
const router = express.Router();

// Oczyszczanie polskich prefiksów adresów
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
  const res = await fetch(url, {
    headers: { 'User-Agent': 'KingOfCatering/1.0' }
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}

async function calculateRoute(fromLat, fromLng, toLat, toLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return null;
  return {
    distanceKm: Math.round(data.routes[0].distance / 100) / 10,
    durationMin: Math.round(data.routes[0].duration / 60)
  };
}

router.post('/calculate-delivery', async (req, res) => {
  try {
    const { address, companyLat, companyLng } = req.body;

    if (!address || companyLat == null || companyLng == null) {
      return res.status(400).json({ error: 'Missing params' });
    }

    const geo = await geocodeAddress(address);
    if (!geo) {
      return res.json({ error: 'address_not_found', message: 'Nie znaleziono adresu' });
    }

    const route = await calculateRoute(companyLat, companyLng, geo.lat, geo.lng);
    if (!route) {
      return res.json({ error: 'route_not_found', message: 'Nie udało się obliczyć trasy' });
    }

    return res.json({
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      customerLat: geo.lat,
      customerLng: geo.lng,
      customerAddress: geo.displayName
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
```

**Zmiana w frontendzie** (`src/components/catering/ContactForm.tsx`):

Zamień:
```typescript
const { data, error } = await supabase.functions.invoke("calculate-delivery", {
  body: { address, companyLat, companyLng },
});
```

Na:
```typescript
const res = await fetch("https://TWOJ-BACKEND.pl/api/calculate-delivery", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ address: fullAddress, companyLat, companyLng }),
});
const data = await res.json();
```

**Opcja 3: Bezpośrednio z frontendu (bez backendu)**

Możesz wywołać Nominatim i OSRM prosto z przeglądarki. Zobacz `src/components/admin/settings/SettingsDeliveryView.tsx` — tam geocoding już działa bezpośrednio z frontendu.

---

## Krok 5: Zmienne środowiskowe

### Obecne zmienne (Lovable Cloud):
```
VITE_SUPABASE_URL=https://nzcbboigpstffizshcxm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=nzcbboigpstffizshcxm
```

### Po migracji — utwórz plik `.env`:
```
VITE_SUPABASE_URL=https://TWOJ-NOWY-PROJEKT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TWOJ-NOWY-ANON-KEY
```

⚠️ **Pamiętaj**: zmienne z prefiksem `VITE_` są widoczne publicznie w przeglądarce — to jest OK dla anon key.

---

## Krok 6: Build i deploy frontendu

```bash
# Budowanie
npm run build

# Wynik → folder dist/
# Możesz go wgrać na:
# - Vercel (npm i -g vercel && vercel)
# - Netlify (drag & drop dist/)
# - VPS z nginx
```

### Przykładowa konfiguracja nginx:
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

---

## Mapa plików

### 📁 Kluczowe pliki do modyfikacji przy migracji:

| Plik | Opis | Co zmienić |
|------|------|-----------|
| `src/integrations/supabase/client.ts` | Klient Supabase | URL + klucz nowego projektu |
| `src/integrations/supabase/types.ts` | Typy TypeScript bazy | Wygeneruj nowe z `supabase gen types` |
| `.env` | Zmienne środowiskowe | Nowy URL i klucz |
| `supabase/functions/calculate-delivery/index.ts` | Edge function dostawy | Przenieś na backend LUB zostaw na Supabase |

### 📁 Pliki których NIE MUSISZ zmieniać:

| Plik/Folder | Opis |
|------------|------|
| `src/components/` | Komponenty React — działają niezależnie |
| `src/pages/` | Strony aplikacji |
| `src/hooks/` | Hooki — pobierają dane przez klienta Supabase |
| `src/data/` | Statyczne dane (fallback) |
| `public/` | Obrazki i zasoby statyczne |

### 📁 Struktura komponentów:

```
src/
├── components/
│   ├── catering/           ← Kreator zamówień klienta
│   │   ├── CateringWizard.tsx    (główny komponent kreatora)
│   │   ├── ProductsStep.tsx      (wybór produktów)
│   │   ├── ExtrasStep.tsx        (wybór dodatków)
│   │   ├── ContactForm.tsx       (formularz kontaktowy + dostawa)
│   │   ├── OrderSummary.tsx      (podsumowanie zamówienia)
│   │   ├── ProductCard.tsx       (karta produktu)
│   │   ├── ProductModal.tsx      (modal szczegółów)
│   │   ├── CartDrawer.tsx        (koszyk)
│   │   └── EventDetails.tsx      (szczegóły wydarzenia)
│   │
│   ├── admin/              ← Panel administracyjny
│   │   ├── OrdersView.tsx        (lista zamówień)
│   │   ├── ClientsView.tsx       (lista klientów)
│   │   ├── ReportsView.tsx       (raporty)
│   │   ├── SettingsView.tsx      (ustawienia - router)
│   │   └── settings/
│   │       ├── SettingsCompanyView.tsx   (dane firmy)
│   │       ├── SettingsDeliveryView.tsx  (strefy dostaw)
│   │       ├── SettingsDishesView.tsx    (zarządzanie daniami)
│   │       ├── SettingsEventsView.tsx    (typy wydarzeń)
│   │       ├── SettingsCalendarView.tsx  (zablokowane daty)
│   │       ├── SettingsOrdersView.tsx    (ustawienia zamówień)
│   │       └── SettingsFormView.tsx      (ustawienia formularza)
│   │
│   └── ui/                 ← Komponenty UI (shadcn/ui)
│
├── hooks/
│   ├── useCateringOrder.ts       (stan zamówienia)
│   ├── useSupabaseData.ts        (pobieranie danych z bazy)
│   ├── useAdminAuth.ts           (autoryzacja admina)
│   └── use-mobile.tsx            (wykrywanie mobilki)
│
├── lib/
│   ├── submitOrder.ts            (logika składania zamówienia)
│   └── utils.ts                  (funkcje pomocnicze)
│
├── pages/
│   ├── Index.tsx                 (strona główna — kreator)
│   ├── Admin.tsx                 (panel admina)
│   ├── Login.tsx                 (logowanie)
│   └── NotFound.tsx              (404)
│
└── integrations/supabase/
    ├── client.ts                 (⚠️ ZMIEŃ URL + KLUCZ)
    └── types.ts                  (⚠️ WYGENERUJ NOWE)
```

---

## Schemat bazy danych

### Diagram relacji:

```
company_settings (1 wiersz)
    └── Ustawienia dostawy, firma, kontakt

event_types ──┐
              ├── event_category_mappings
product_categories ──┘

dishes ──── dish_ingredients ──── ingredients
  │
  ├── bundle_variants ──── bundles
  │
  └── config_group_options ──── config_groups ──── configurable_sets

extras (niezależna tabela)

clients ──── orders ──── order_items ──── order_item_sub_items

payment_methods (niezależna tabela)
blocked_dates (niezależna tabela)
delivery_zones (niezależna tabela - legacy, zastąpiona przez km)
```

### Opis tabel:

| Tabela | Cel | Ważne pola |
|--------|-----|------------|
| `company_settings` | Dane firmy, ustawienia dostawy | `company_lat/lng` — punkt startowy dostawy |
| `dishes` | Pojedyncze produkty (patery, dania) | `product_type`, `price_brutto`, `category_slug` |
| `bundles` + `bundle_variants` | Produkty z wariantami (tacos, burgery) | Warianty mają swoje ceny |
| `configurable_sets` + `config_groups` + `config_group_options` | Zestawy konfigurowalne (menu na osobę) | `price_per_person`, grupy z min/max selekcji |
| `extras` | Dodatki (obsługa kelnerska, zastawa) | `category` (pakowanie/obsluga/dodatki) |
| `orders` + `order_items` + `order_item_sub_items` | Zamówienia | `order_number`, `status`, `delivery_cost` |
| `clients` | Baza klientów | Dane kontaktowe + firmowe |
| `event_types` | Typy wydarzeń do wyboru | Wesele, Konferencja, itp. |
| `payment_methods` | Metody płatności | `is_active` włącza/wyłącza |
| `blocked_dates` | Zablokowane daty w kalendarzu | `blocked_date` |

---

## FAQ

### Q: Czy mogę użyć MySQL zamiast PostgreSQL?
**A:** Nie bezpośrednio. Supabase wymaga PostgreSQL. Jeśli chcesz MySQL, musisz zastąpić cały klient Supabase własnym API.

### Q: Czy muszę płacić za Nominatim/OSRM?
**A:** Nie. Oba API są darmowe. Nominatim ma limit ~1 zapytanie/sekundę. Dla cateringu to więcej niż wystarczające.

### Q: Jak przenieść dane z Lovable Cloud?
**A:** Wyeksportuj dane z panelu Lovable Cloud (SQL dump) i zaimportuj do nowej bazy.

### Q: Autentykacja — jak działa?
**A:** Obecnie używa Supabase Auth. Jeśli zostaniesz na Supabase Cloud, działa tak samo. Przy własnym backendzie musisz wdrożyć własne uwierzytelnianie (np. Passport.js, NextAuth, itp.).

### Q: Co z RLS (Row-Level Security)?
**A:** Aktualnie wszystkie tabele mają politykę `true` (pełny dostęp). Przed produkcją powinieneś ograniczyć dostęp — np. zamówienia widoczne tylko dla zalogowanych adminów.

---

## Checklist migracji

- [ ] Eksport kodu z Lovable (GitHub/ZIP)
- [ ] Stworzenie nowego projektu Supabase / własnej bazy PostgreSQL
- [ ] Wykonanie SQL z tworzeniem tabel
- [ ] Eksport i import danych (jeśli masz istniejące)
- [ ] Zmiana URL i klucza w `client.ts` / `.env`
- [ ] Regeneracja typów TypeScript
- [ ] Deploy edge function LUB przeniesienie na backend
- [ ] `npm run build` i deploy frontendu
- [ ] Test zamówienia end-to-end
- [ ] Konfiguracja domeny i SSL
