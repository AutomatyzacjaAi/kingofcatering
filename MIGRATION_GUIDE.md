# 🚀 King of Catering — Dokumentacja i Migracja na DigitalOcean

## Opis aplikacji

**King of Catering** to pełna platforma do zarządzania firmą cateringową, składająca się z:

### 🛒 Kreator zamówień (strona klienta — `/`)

5-etapowy wizard do składania zamówień cateringowych:

1. **Wydarzenie** — typ wydarzenia (wesele, konferencja, urodziny...), data, godzina, liczba gości, typ cateringu (wyjazdowy/na miejscu)
2. **Produkty** — wybór dań (simple), pakietów z wariantami (expandable/bundle), zestawów konfigurowalnych (configurable) z kategoriami filtrowanymi wg typu wydarzenia
3. **Dodatki** — dekoracje, sprzęt, opakowania jednorazowe/porcelanowe, obsługa kelnerska
4. **Kontakt** — dane klienta, adres dostawy, automatyczne obliczanie kosztu dostawy (geocoding Nominatim + routing OSRM), dane firmowe (NIP, faktura)
5. **Podsumowanie** — przegląd zamówienia z dwoma opcjami: **Zapłać online** (Stripe Checkout) lub **Wyślij zapytanie** (oferta mailem)

### 🔧 Panel admina (`/admin`)

Pełne zarządzanie biznesem:

- **Zamówienia** — lista, szczegóły, edycja statusów/pozycji/cen, generowanie dokumentów:
  - Oferta (PDF)
  - Lista zakupów (PDF z agregacją składników)
  - Rozpiska na kuchnię (PDF z rozbiciem zestawów na dania)
  - Food cost (PDF z analizą marży + ręczne pozycje kosztowe)
  - Podsumowania zbiorcze pogrupowane wg dni
- **Klienci** — CRUD, automatyczne powiązywanie z zamówieniami, historia zamówień
- **Raporty** — analityka sprzedaży, porównania YoY, średnia wartość zamówienia
- **Ustawienia**:
  - Dania (simple, dish) + składniki + food cost
  - Pakiety (bundle) z wariantami powiązanymi z daniami
  - Zestawy konfigurowalne z grupami i opcjami
  - Dodatki z kategoriami
  - Kategorie produktów + mapowanie na typy wydarzeń
  - Typy wydarzeń
  - Strefy dostaw
  - Metody płatności
  - Zablokowane daty
  - Ustawienia firmy (logo, dane, adresy, parametry dostawy)
  - Kalendarz zamówień

### 🔐 Logowanie (`/login`)

Autentykacja admina przez Supabase Auth (email + hasło).

---

## Stos technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | React hooks (useState, useCallback, useMemo) |
| Data fetching | Supabase JS SDK + TanStack Query |
| Routing | React Router v6 |
| PDF | jsPDF + jspdf-autotable (font Roboto z polskimi znakami) |
| Płatności | Stripe Checkout (edge function) |
| Geokodowanie | Nominatim (OSM) + OSRM (routing) |
| Baza danych | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Backend functions | Supabase Edge Functions (Deno) |

---

## Struktura plików

```
src/
├── components/
│   ├── catering/               ← Kreator zamówień klienta
│   │   ├── CateringWizard.tsx    - Główny stepper (5 kroków)
│   │   ├── EventDetails.tsx      - Krok 1: Wydarzenie
│   │   ├── ProductsStep.tsx      - Krok 2: Produkty
│   │   ├── ProductCard.tsx       - Karta produktu
│   │   ├── ProductModal.tsx      - Modal szczegółów produktu
│   │   ├── ExtrasStep.tsx        - Krok 3: Dodatki + pakowanie + kelner
│   │   ├── ContactForm.tsx       - Krok 4: Kontakt + obliczanie dostawy
│   │   ├── OrderSummary.tsx      - Krok 5: Podsumowanie + Stripe
│   │   ├── CartDrawer.tsx        - Koszyk (drawer)
│   │   ├── QuantityInput.tsx     - Komponent ilości
│   │   ├── MobileNav.tsx         - Nawigacja mobilna
│   │   └── FullscreenDateTimePicker.tsx
│   ├── admin/                  ← Panel admina
│   │   ├── AdminSidebar.tsx      - Menu boczne
│   │   ├── OrdersView.tsx        - Zamówienia (CRUD + dokumenty + podsumowania)
│   │   ├── ClientsView.tsx       - Klienci
│   │   ├── ClientDetailView.tsx  - Szczegóły klienta
│   │   ├── ClientFormView.tsx    - Formularz klienta
│   │   ├── ReportsView.tsx       - Raporty
│   │   ├── SettingsView.tsx      - Router ustawień
│   │   └── settings/
│   │       ├── SettingsDishesView.tsx     - Dania + pakiety + zestawy
│   │       ├── ExtrasTab.tsx             - Dodatki
│   │       ├── SettingsEventsView.tsx     - Typy wydarzeń + kategorie + mapowania
│   │       ├── SettingsDeliveryView.tsx   - Strefy dostaw
│   │       ├── SettingsOrdersView.tsx     - Metody płatności + zablokowane daty
│   │       ├── SettingsCompanyView.tsx    - Dane firmy
│   │       ├── SettingsCalendarView.tsx   - Kalendarz
│   │       └── SettingsFormView.tsx       - Ustawienia formularza
│   └── ui/                     ← shadcn/ui (gotowe)
├── hooks/
│   ├── useSupabaseData.ts        - Pobieranie wszystkich danych z bazy
│   ├── useCateringOrder.ts       - Stan zamówienia klienta
│   ├── useAdminAuth.ts           - Autentykacja admina
│   └── use-mobile.tsx            - Detekcja mobilna
├── lib/
│   ├── submitOrder.ts            - Zapis zamówienia do bazy
│   ├── generatePdf.ts            - Generowanie PDF (oferta, food cost, itp.)
│   ├── pricing.ts                - Logika cenowa (wyjazdowy vs na miejscu)
│   └── utils.ts                  - cn() helper
├── data/
│   ├── products.ts               - Typy Product, Category, EventType
│   └── extras.ts                 - Typy Extra, Packaging, Waiter, Payment
├── pages/
│   ├── Index.tsx                 - Strona główna (kreator)
│   ├── Admin.tsx                 - Panel admina
│   ├── Login.tsx                 - Logowanie
│   └── NotFound.tsx
├── integrations/supabase/
│   ├── client.ts                 - ⚠️ ZMIEŃ URL + KLUCZ przy migracji
│   └── types.ts                  - ⚠️ WYGENERUJ NOWE po migracji
└── assets/                       - Zdjęcia produktów

supabase/
├── config.toml                   - Konfiguracja Supabase
└── functions/
    ├── calculate-delivery/       - Obliczanie kosztu dostawy
    │   └── index.ts
    ├── create-stripe-checkout/   - Tworzenie sesji Stripe Checkout
    │   └── index.ts
    └── stripe-webhook/           - Webhook Stripe (aktualizacja statusu)
        └── index.ts

public/
├── fonts/Roboto-Regular.ttf      - Font do PDF z polskimi znakami
├── products/                     - Zdjęcia produktów
└── extras/                       - Zdjęcia dodatków
```

---

## Baza danych — schemat

```
company_settings (1 wiersz — konfiguracja firmy)

event_types ──┐
              ├── event_category_mappings (filtrowanie kategorii wg wydarzenia)
product_categories ──┘

extras_categories ──── extras (dodatki z kategoriami)

dishes ──── dish_ingredients ──── ingredients (składniki + food cost)
  │
  ├── bundle_variants ──── bundles (pakiety z wariantami)
  │
  └── config_group_options ──── config_groups ──── configurable_sets (zestawy)

clients ──── orders ──── order_items ──── order_item_sub_items
                │
                └── order_food_cost_extras (ręczne pozycje kosztowe)

payment_methods (metody płatności)
blocked_dates (zablokowane daty)
delivery_zones (strefy dostaw)
```

### Tabele — 22 tabel

| Tabela | Opis |
|--------|------|
| `company_settings` | Dane firmy, logo, parametry dostawy |
| `event_types` | Typy wydarzeń (wesele, konferencja...) |
| `product_categories` | Kategorie produktów (patery, zestawy...) |
| `event_category_mappings` | Które kategorie widoczne dla jakiego wydarzenia |
| `extras_categories` | Kategorie dodatków |
| `dishes` | Dania (simple, dish) |
| `bundles` | Pakiety (expandable) |
| `bundle_variants` | Warianty pakietów |
| `configurable_sets` | Zestawy konfigurowalne |
| `config_groups` | Grupy w zestawach |
| `config_group_options` | Opcje w grupach |
| `extras` | Dodatki |
| `ingredients` | Składniki |
| `dish_ingredients` | Powiązania danie↔składnik |
| `delivery_zones` | Strefy dostawy |
| `clients` | Klienci |
| `orders` | Zamówienia |
| `order_items` | Pozycje zamówienia |
| `order_item_sub_items` | Sub-pozycje (składowe zestawów) |
| `order_food_cost_extras` | Ręczne pozycje kosztowe FC |
| `payment_methods` | Metody płatności |
| `blocked_dates` | Zablokowane daty |

---

## Edge Functions — 3 funkcje

### 1. `calculate-delivery`
- **Cel:** Obliczanie kosztu dostawy
- **Input:** `{ address, companyLat, companyLng }`
- **Logika:** Nominatim → OSRM → dystans km
- **Bez klucza API** (Nominatim/OSRM darmowe)

### 2. `create-stripe-checkout`
- **Cel:** Tworzenie Stripe Checkout Session
- **Input:** `{ orderId, orderNumber, amount, customerEmail, customerName, lineItems, successUrl, cancelUrl }`
- **Wymaga:** `STRIPE_SECRET_KEY` w secretach
- **Metody płatności:** Karta, Przelewy24, BLIK

### 3. `stripe-webhook`
- **Cel:** Odbiera powiadomienia Stripe o statusie płatności
- **Event:** `checkout.session.completed` → aktualizuje status zamówienia na "Potwierdzone"
- **Wymaga:** `STRIPE_WEBHOOK_SECRET` (opcjonalny, ale zalecany)

---

## Migracja na DigitalOcean — krok po kroku

### Wymagania
- DigitalOcean Droplet (Ubuntu 22+) lub App Platform
- PostgreSQL 15+ (DigitalOcean Managed Database lub self-hosted)
- Node.js 18+ (do budowania frontendu)
- Supabase (Cloud lub self-hosted) — do obsługi Auth + SDK

---

### Krok 1: Baza danych

#### DigitalOcean Managed Database (PostgreSQL 15+)

1. Panel DigitalOcean → **Databases** → **Create Database Cluster**
2. PostgreSQL 15+, region Frankfurt (eu)
3. Skopiuj connection string

#### Tworzenie tabel

Wykonaj poniższy SQL na nowej bazie:

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
  privacy_policy_url text,
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
  price_per_unit_on_site numeric,
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
  price_on_site numeric,
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
  price_per_person_on_site numeric,
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
  price_on_site numeric,
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
-- TABELA: order_food_cost_extras
-- ================================================
CREATE TABLE public.order_food_cost_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
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
-- RLS (Row-Level Security)
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
ALTER TABLE public.order_food_cost_extras ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "full_access" ON public.order_food_cost_extras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.blocked_dates FOR ALL USING (true) WITH CHECK (true);
```

---

### Krok 2: Supabase

#### Opcja A: Supabase Cloud (rekomendowana)

1. [supabase.com](https://supabase.com) → Nowy projekt
2. SQL Editor → wklej SQL z Kroku 1
3. Skopiuj **Project URL** i **Anon Key**

#### Opcja B: Self-hosted na DigitalOcean

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
# Edytuj .env — ustaw connection string do DigitalOcean Managed DB
docker compose up -d
```

#### Zmiana w kodzie (JEDYNY plik do zmiany):

```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://TWOJ-PROJEKT.supabase.co"
const SUPABASE_ANON_KEY = "TWOJ-ANON-KEY"
```

#### Regeneracja typów:
```bash
npx supabase gen types typescript --project-id TWOJ-PROJECT-ID > src/integrations/supabase/types.ts
```

---

### Krok 3: Edge Functions

#### Opcja A: Zostaw na Supabase (najprostsza)

```bash
npx supabase functions deploy calculate-delivery --project-ref TWOJ-PROJECT-ID
npx supabase functions deploy create-stripe-checkout --project-ref TWOJ-PROJECT-ID
npx supabase functions deploy stripe-webhook --project-ref TWOJ-PROJECT-ID
```

Dodaj sekrety:
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_XXXXX --project-ref TWOJ-PROJECT-ID
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXXX --project-ref TWOJ-PROJECT-ID
```

#### Opcja B: Express.js na DigitalOcean

Utwórz `server/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// === Calculate Delivery ===
app.post('/api/calculate-delivery', async (req, res) => {
  const { address, companyLat, companyLng } = req.body;
  // ... (kod z supabase/functions/calculate-delivery/index.ts)
});

// === Stripe Checkout ===
app.post('/api/create-stripe-checkout', async (req, res) => {
  const { orderId, orderNumber, amount, customerEmail, lineItems, successUrl, cancelUrl } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'p24', 'blik'],
    mode: 'payment',
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { order_id: orderId, order_number: orderNumber },
    line_items: lineItems.map(item => ({
      price_data: {
        currency: 'pln',
        product_data: { name: item.name },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    })),
  });

  res.json({ sessionId: session.id, url: session.url });
});

// === Stripe Webhook ===
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET
  );
  if (event.type === 'checkout.session.completed') {
    const orderId = event.data.object.metadata.order_id;
    // UPDATE orders SET status = 'Potwierdzone' WHERE id = orderId
  }
  res.json({ received: true });
});

app.listen(3001, () => console.log('API running on :3001'));
```

Jeśli przenosisz na Express, zmień w frontendzie:
```typescript
// src/components/catering/OrderSummary.tsx — zamień:
const { data } = await supabase.functions.invoke("create-stripe-checkout", { body: { ... } });

// Na:
const res = await fetch("https://TWOJ-BACKEND/api/create-stripe-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ... }),
});
const data = await res.json();
```

---

### Krok 4: Stripe

1. [stripe.com](https://stripe.com) → Dashboard → Developers → API keys
2. Skopiuj **Secret Key** (sk_live_... lub sk_test_...)
3. Dodaj do Supabase Secrets lub zmiennych środowiskowych
4. Webhooks → Add endpoint:
   - URL: `https://TWOJ-PROJECT-ID.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`
   - Skopiuj Signing Secret → `STRIPE_WEBHOOK_SECRET`

---

### Krok 5: Zmienne środowiskowe

```
VITE_SUPABASE_URL=https://TWOJ-PROJEKT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TWOJ-ANON-KEY
```

⚠️ Zmienne `VITE_` są publiczne — to OK dla anon key.

Sekrety po stronie serwera (edge functions / Express):
```
STRIPE_SECRET_KEY=sk_live_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXX
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### Krok 6: Deploy frontendu

```bash
npm install
npm run build
# Wynik → dist/
```

#### Nginx na DigitalOcean Droplet:
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

### Krok 7: Export danych z obecnej bazy

Eksport danych z Lovable Cloud → import do nowej bazy:

```bash
# Eksport (z obecnej bazy)
pg_dump --data-only --inserts \
  --table=company_settings \
  --table=event_types \
  --table=product_categories \
  --table=event_category_mappings \
  --table=extras_categories \
  --table=dishes \
  --table=bundles \
  --table=bundle_variants \
  --table=configurable_sets \
  --table=config_groups \
  --table=config_group_options \
  --table=extras \
  --table=ingredients \
  --table=dish_ingredients \
  --table=delivery_zones \
  --table=clients \
  --table=orders \
  --table=order_items \
  --table=order_item_sub_items \
  --table=order_food_cost_extras \
  --table=payment_methods \
  --table=blocked_dates \
  "postgresql://..." > data_export.sql

# Import (do nowej bazy)
psql "postgresql://NOWA-BAZA..." < data_export.sql
```

---

## Checklist migracji

- [ ] PostgreSQL na DigitalOcean — tabele utworzone (SQL z Kroku 1)
- [ ] Supabase projekt (Cloud lub self-hosted) podpięty do bazy
- [ ] `client.ts` — nowy URL + klucz
- [ ] `types.ts` — wygenerowane z nowej bazy
- [ ] `.env` — nowe wartości
- [ ] Export danych z Lovable Cloud → import do nowej bazy
- [ ] Edge functions wdrożone (Supabase lub Express)
- [ ] Stripe — klucze dodane do secretów
- [ ] Stripe — webhook skonfigurowany
- [ ] Użytkownik admina utworzony w nowym Supabase Auth
- [ ] `npm run build` → deploy na DigitalOcean
- [ ] Test: złożenie zamówienia end-to-end
- [ ] Test: płatność Stripe (tryb testowy)
- [ ] Test: panel admina — zamówienia, dokumenty, food cost
- [ ] Domena + SSL (Let's Encrypt / Cloudflare)

---

## Pliki do zmiany przy migracji (2-3 pliki)

| Plik | Co zmienić |
|------|-----------|
| `src/integrations/supabase/client.ts` | URL + klucz nowego Supabase |
| `src/integrations/supabase/types.ts` | Wygeneruj z `supabase gen types` |
| `.env` | Nowy URL i klucz |
| *(opcjonalnie)* `ContactForm.tsx` | Jeśli przenosisz delivery na Express |
| *(opcjonalnie)* `OrderSummary.tsx` | Jeśli przenosisz Stripe na Express |

**Cała reszta kodu pozostaje bez zmian.**

---

## FAQ

**Q: Ile plików muszę zmienić?**
A: 2-3 pliki (`client.ts`, `types.ts`, `.env`). Opcjonalnie 2 więcej jeśli przenosisz edge functions.

**Q: Czy mogę użyć MySQL?**
A: Nie. Supabase SDK wymaga PostgreSQL.

**Q: Nominatim/OSRM kosztują?**
A: Nie, oba są darmowe. Nominatim: ~1 req/s — dla cateringu wystarczające.

**Q: Co z autentykacją admina?**
A: Supabase Auth — wystarczy utworzyć użytkownika w nowym projekcie. Logika jest gotowa.

**Q: Jak działa Stripe w tej aplikacji?**
A: Klient klika "Zapłać online" → tworzona jest Stripe Checkout Session → przekierowanie do Stripe → po płatności webhook aktualizuje status zamówienia. Obsługiwane metody: karta, Przelewy24, BLIK.

**Q: Co jeśli Stripe nie jest skonfigurowany?**
A: Przycisk "Zapłać online" wyświetli komunikat, że płatności nie są jeszcze dostępne. Zamówienie zostanie zapisane z możliwością kontaktu mailowego.
