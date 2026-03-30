# 🚀 King of Catering — Kompletna dokumentacja migracji

> **Wersja:** 2.0 · **Data aktualizacji:** 2026-03-31
> **Autor:** Lovable AI · **Tabele:** 41 · **Edge Functions:** 4

---

## Spis treści

1. [Opis aplikacji](#1-opis-aplikacji)
2. [Architektura i stos technologiczny](#2-architektura-i-stos-technologiczny)
3. [Struktura plików](#3-struktura-plików)
4. [Baza danych — pełny schemat](#4-baza-danych--pełny-schemat)
5. [Dlaczego takie decyzje architektoniczne?](#5-dlaczego-takie-decyzje-architektoniczne)
6. [Edge Functions — dokumentacja](#6-edge-functions--dokumentacja)
7. [Migracja krok po kroku](#7-migracja-krok-po-kroku)
8. [Konfiguracja produkcyjna](#8-konfiguracja-produkcyjna)
9. [Checklist migracji](#9-checklist-migracji)
10. [FAQ i troubleshooting](#10-faq-i-troubleshooting)

---

## 1. Opis aplikacji

**King of Catering** to wielodostępowa (multi-tenant) platforma SaaS do zarządzania firmami cateringowymi. Każdy tenant (firma) ma własny panel, dane, produkty, klientów i oferty.

### 🛒 Kreator zamówień (strona klienta — `/{tenant-slug}`)

5-etapowy wizard do składania zamówień cateringowych:

1. **Wydarzenie** — typ wydarzenia (wesele, konferencja, urodziny...), data, godzina, liczba gości, typ cateringu (wyjazdowy/na sali)
2. **Produkty** — wybór dań (simple), pakietów z wariantami (bundle), zestawów konfigurowalnych z przelicznikiem, pater ze składem
3. **Dodatki** — dekoracje, sprzęt, pakowanie, obsługa kelnerska, zestawy dodatków
4. **Kontakt** — dane klienta, adres dostawy, geocoding (Nominatim + OSRM), dane firmowe (NIP, faktura)
5. **Podsumowanie** — przegląd zamówienia: **Zapłać online** (Stripe Checkout) lub **Wyślij zapytanie**

### 🔧 Panel admina (`/{tenant-slug}/admin`)

- **Zamówienia** — CRUD, edycja statusów/pozycji/cen, generowanie dokumentów PDF (oferta, lista zakupów, rozpiska, podsumowania zbiorcze)
- **Klienci** — baza klientów z historią zamówień
- **Oferty dedykowane** — tworzenie interaktywnych ofert z linkami dla klientów, dwa typy sekcji kontaktowej (firmowy/weselny), konwersja na zamówienie
- **Szablony ofert** — wielokrotnie używane struktury ofert
- **Raporty** — analityka sprzedaży
- **Katalog produktów** — składniki, dania, pakiety, patery, zestawy konfigurowalne, dodatki, zestawy dodatków, menu (stałe/konfigurowalne)
- **Ustawienia** — typy wydarzeń, kategorie, strefy dostaw, metody płatności, dane firmy, kalendarz

### 🏢 Super Admin (`/admin`)

- Zarządzanie tenantami (firmami)
- Tworzenie użytkowników dla tenantów
- Globalny przegląd systemu

### 🔐 Autentykacja

- **Super Admin** — `/login` (Supabase Auth, rola `super_admin`)
- **Tenant Admin** — `/{tenant-slug}/login` (Supabase Auth, rola `tenant_admin`)
- System ról: `super_admin`, `tenant_admin`, `tenant_user`

---

## 2. Architektura i stos technologiczny

| Warstwa | Technologia | Uzasadnienie |
|---------|-------------|--------------|
| **Frontend** | React 18 + TypeScript + Vite 5 | Szybki build, HMR, type safety |
| **Styling** | Tailwind CSS 3 + shadcn/ui | Design system z tokenami, ciemny motyw, dynamiczny kolor tenanta |
| **State** | React hooks + useState/useCallback | Prostota, brak potrzeby Redux |
| **Data** | Supabase JS SDK + TanStack Query | Realtime-ready, cache, auto-refetch |
| **Routing** | React Router v6 | Dynamiczne ścieżki per-tenant |
| **PDF** | jsPDF + jspdf-autotable | Font Roboto z pełnymi polskimi znakami (base64 embedded) |
| **Płatności** | Stripe Checkout (edge function) | PCI DSS compliance, BLIK + P24 |
| **Geokodowanie** | Nominatim (OSM) + OSRM | Darmowe, bez API key, wystarczające dla cateringu |
| **Baza danych** | PostgreSQL 15+ (via Supabase) | JSONB, arrays, RLS, triggers |
| **Auth** | Supabase Auth | JWT, email/hasło, integracja z RLS |
| **Backend** | Supabase Edge Functions (Deno) | Serverless, auto-scale, zero config |
| **Storage** | Supabase Storage (bucket `company-assets`) | Logo, favicon, zdjęcia produktów |

---

## 3. Struktura plików

```
src/
├── components/
│   ├── catering/                  ← Kreator zamówień klienta
│   │   ├── CateringWizard.tsx       - Główny stepper (5 kroków)
│   │   ├── EventDetails.tsx         - Krok 1: Wydarzenie + typ cateringu
│   │   ├── ProductsStep.tsx         - Krok 2: Produkty (filtrowane wg wydarzenia)
│   │   ├── ProductCard.tsx          - Karta produktu (danie/pakiet/zestaw/patera)
│   │   ├── ProductModal.tsx         - Modal szczegółów z konfiguracją
│   │   ├── ExtrasStep.tsx           - Krok 3: Dodatki + zestawy dodatków
│   │   ├── ContactForm.tsx          - Krok 4: Kontakt + geocoding dostawy
│   │   ├── OrderSummary.tsx         - Krok 5: Podsumowanie + Stripe
│   │   ├── CartDrawer.tsx           - Koszyk (drawer)
│   │   ├── QuantityInput.tsx        - Edytowalny input ilości
│   │   ├── MobileNav.tsx            - Nawigacja mobilna
│   │   └── FullscreenDateTimePicker.tsx
│   ├── admin/                     ← Panel admina
│   │   ├── AdminSidebar.tsx         - Menu boczne (ikony + akordeon)
│   │   ├── OrdersView.tsx           - Zamówienia (CRUD + PDF + sub-items)
│   │   ├── ClientsView.tsx          - Lista klientów
│   │   ├── ClientDetailView.tsx     - Szczegóły klienta + historia
│   │   ├── ClientFormView.tsx       - Formularz klienta
│   │   ├── DedicatedOffersView.tsx  - Lista ofert dedykowanych
│   │   ├── ReportsView.tsx          - Raporty sprzedaży
│   │   ├── TenantsView.tsx          - Zarządzanie tenantami (super admin)
│   │   ├── SettingsView.tsx         - Router ustawień
│   │   ├── offers/
│   │   │   ├── AdminOfferEditor.tsx       - Edytor oferty (sekcje + pozycje + dni)
│   │   │   ├── OfferTemplatesManager.tsx  - Zarządzanie szablonami
│   │   │   └── ProductPickerDialog.tsx    - Dialog wyboru produktu z katalogu
│   │   └── settings/
│   │       ├── SettingsDishesView.tsx      - Katalog: składniki, dania, pakiety, zestawy, patery
│   │       ├── ExtrasTab.tsx              - Dodatki
│   │       ├── ExtrasSetsTab.tsx           - Zestawy dodatków
│   │       ├── MenusTab.tsx               - Menu (stałe/konfigurowalne)
│   │       ├── SettingsEventsView.tsx      - Typy wydarzeń + mapowania kategorii
│   │       ├── SettingsFormView.tsx        - Ustawienia formularza
│   │       ├── SettingsDeliveryView.tsx    - Strefy dostaw
│   │       ├── SettingsOrdersView.tsx      - Metody płatności + zablokowane daty
│   │       ├── SettingsCompanyView.tsx     - Dane firmy + logo + kolor
│   │       └── SettingsCalendarView.tsx    - Kalendarz zamówień
│   └── ui/                        ← shadcn/ui components
├── hooks/
│   ├── useSupabaseData.ts           - Pobieranie danych z bazy (per tenant)
│   ├── useCateringOrder.ts          - Stan koszyka klienta
│   ├── useAdminAuth.ts              - Autentykacja + sprawdzanie ról
│   ├── useTenantColor.ts            - Dynamiczny kolor marki tenanta
│   └── use-mobile.tsx               - Detekcja mobilna
├── lib/
│   ├── submitOrder.ts               - Zapis zamówienia do bazy (items + sub-items)
│   ├── generatePdf.ts               - Generowanie PDF (Roboto, polskie znaki, tabele)
│   ├── pricing.ts                   - Logika cenowa (wyjazdowy vs na sali)
│   └── utils.ts                     - cn() helper
├── pages/
│   ├── Index.tsx                    - Strona główna (kreator per tenant)
│   ├── Admin.tsx                    - Panel super admina
│   ├── TenantAdmin.tsx              - Panel admina tenanta
│   ├── Login.tsx                    - Login super admina
│   ├── TenantLogin.tsx              - Login tenanta
│   ├── ClientOffer.tsx              - Interaktywna oferta dla klienta
│   └── NotFound.tsx
├── integrations/supabase/
│   ├── client.ts                    - ⚠️ ZMIEŃ URL + KLUCZ przy migracji
│   └── types.ts                     - ⚠️ WYGENERUJ NOWE po migracji
└── index.css                        - Design tokens, ciemny motyw

supabase/
├── config.toml                      - Konfiguracja Supabase
└── functions/
    ├── calculate-delivery/          - Geocoding + obliczanie dystansu
    ├── create-stripe-checkout/      - Tworzenie sesji Stripe
    ├── stripe-webhook/              - Webhook płatności
    └── create-tenant-user/          - Tworzenie użytkownika tenanta (admin API)
```

---

## 4. Baza danych — pełny schemat

### 4.1 Diagram relacji (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MULTI-TENANCY                              │
│                                                                     │
│  tenants ─────────────┬──→ company_settings                         │
│    │                  ├──→ event_types ──→ event_category_mappings   │
│    │                  ├──→ product_categories ──┘                    │
│    │                  ├──→ extras_categories ──→ event_extras_cat... │
│    │                  ├──→ dishes ──→ dish_ingredients ──→ ingred.   │
│    │                  ├──→ bundles ──→ bundle_variants               │
│    │                  ├──→ configurable_sets ──→ config_groups       │
│    │                  │                          └→ config_group_opt │
│    │                  ├──→ platters ──→ platter_items                │
│    │                  ├──→ extras ──→ extras_sets ──→ extras_set_... │
│    │                  ├──→ menus ──→ menu_groups ──→ menu_group_...  │
│    │                  ├──→ delivery_zones                            │
│    │                  ├──→ blocked_dates                             │
│    │                  ├──→ clients ──→ orders                        │
│    │                  │               ├──→ order_items               │
│    │                  │               │    └→ order_item_sub_items   │
│    │                  │               └──→ order_food_cost_extras    │
│    │                  ├──→ offer_templates ──→ offer_template_sec... │
│    │                  │                       └→ offer_template_...  │
│    │                  └──→ dedicated_offers                          │
│    │                       ├──→ dedicated_offer_days                 │
│    │                       ├──→ dedicated_offer_sections             │
│    │                       │    └→ dedicated_offer_items             │
│    │                       └──→ dedicated_offer_selections           │
│                                                                     │
│  profiles ──→ auth.users                                            │
│  user_roles ──→ auth.users                                          │
│  payment_methods (globalne)                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tabele — opis i uzasadnienie (41 tabel)

#### 🏢 WARSTWA: Multi-tenancy

| Tabela | Opis | Dlaczego? |
|--------|------|-----------|
| `tenants` | Firmy cateringowe (nazwa, slug, NIP, kontakt) | Centralna tabela multi-tenancy. Slug używany w URL (`/king-catering/admin`). |
| `profiles` | Profil użytkownika (imię, email, tenant_id) | Rozszerzenie `auth.users` Supabase — nie można dodawać kolumn do auth schema. |
| `user_roles` | Przypisanie ról (`super_admin`, `tenant_admin`, `tenant_user`) | **Osobna tabela ról** — zabezpieczenie przed privilege escalation. Nigdy nie trzymamy ról w `profiles`. |

#### ⚙️ WARSTWA: Konfiguracja firmy

| Tabela | Opis | Dlaczego? |
|--------|------|-----------|
| `company_settings` | Dane firmy, logo, parametry dostawy, kolor marki | Per-tenant. Jeden wiersz per firma. Zawiera współrzędne GPS siedziby do kalkulacji dostawy. `primary_color` — dynamiczny kolor marki. |
| `event_types` | Typy wydarzeń (Wesele, Konferencja...) | Per-tenant. Admin definiuje jakie wydarzenia obsługuje. Ikona z Lucide. |
| `product_categories` | Kategorie produktów (Mini catering, Zestawy...) | Per-tenant. `slug` do filtrowania w kodzie, `name` do wyświetlania. |
| `event_category_mappings` | Mapowanie: które kategorie widoczne dla jakiego wydarzenia | Tablica łącząca N:N. Pozwala np. ukryć "Pakiety weselne" dla konferencji. |
| `extras_categories` | Kategorie dodatków (Dekoracje, Obsługa...) | Per-tenant. `is_required` — czy kategoria jest obowiązkowa w formularzu. |
| `event_extras_category_mappings` | Mapowanie: które kategorie dodatków widoczne dla jakiego wydarzenia | Analogiczne do `event_category_mappings` ale dla dodatków. |
| `blocked_dates` | Zablokowane daty w kalendarzu | Per-tenant. Klient nie może wybrać zablokowanej daty. |
| `payment_methods` | Metody płatności (Karta, Przelew, Gotówka) | Globalne — wspólne dla wszystkich tenantów. `is_active` do włączania/wyłączania. |
| `delivery_zones` | Strefy dostawy z cenami | Per-tenant. Tablica `cities[]` i `postal_codes[]` — elastyczne dopasowanie. `free_delivery_above` — darmowa dostawa powyżej kwoty. |

#### 🍽️ WARSTWA: Katalog produktów

| Tabela | Opis | Dlaczego? |
|--------|------|-----------|
| `ingredients` | Składniki (nazwa, jednostka, cena, alergeny) | Budulec dań. Ceny w kg/l automatycznie przeliczane. Alergeny do informacji na etykietach. |
| `dishes` | Dania (cena netto/brutto, VAT, kategoria, typ) | **Centralny element katalogu.** `product_type` rozróżnia typy dań. Dwie ceny: `price_per_unit` (wyjazdowy) i `price_per_unit_on_site` (na sali). |
| `dish_ingredients` | Powiązanie danie↔składnik z ilością | Tablica łącząca. `quantity` w jednostkach składnika. Automatyczny food cost. |
| `bundles` | Pakiety z wariantami cenowymi | Per-tenant. Pakiet to zestaw wariantów (np. "Mini Premium" — 3 warianty do wyboru). |
| `bundle_variants` | Warianty pakietu (nazwa, cena, powiązanie z daniem) | `dish_id` — opcjonalny link do dania (dziedziczenie alergenu). `price_on_site` — cena na sali. |
| `configurable_sets` | Zestawy konfigurowalne (cena za osobę) | Per-tenant. Klient wybiera opcje z grup. `min_persons` — minimalna liczba osób. |
| `config_groups` | Grupy w zestawie (Zupa, Danie główne, Deser) | `min/max_selections` — ile pozycji klient musi/może wybrać. `multiplier` — przelicznik ilości (np. 1.5x dla porcji mięsa). |
| `config_group_options` | Opcje do wyboru w grupie (linkowane do dań) | `dish_id` — powiązanie z daniem (alergeny, food cost). |
| `platters` | Patery (taca z kompozycją dań) | Per-tenant. Cena za jednostkę (nie za osobę). `price_on_site` dla cateringu na sali. |
| `platter_items` | Skład patery (dania + przelicznik) | `multiplier` — ile porcji dania na paterze. `dish_id` → link do dania. |
| `extras` | Dodatki (dekoracje, sprzęt, usługi) | Per-tenant. `requires_person_count` — czy ilość zależy od gości. `food_cost` — koszt wewnętrzny. |
| `extras_sets` | Zestawy dodatków (np. Zestaw barowy) | Per-tenant. Grupa extras do wyboru z `min/max_selections`. |
| `extras_set_items` | Pozycje w zestawie dodatków | Link do `extras` — korzysta z istniejącego katalogu. |
| `menus` | Menu (stałe lub konfigurowalne) | Per-tenant. `is_configurable` — stałe menu (pozycje na sztywno) vs konfigurowalne (klient wybiera). Używane w ofertach dedykowanych. |
| `menu_groups` | Grupy w menu (Zupa, Danie główne...) | Dla stałych menu — `min/max = count(items)`. Dla konfigurowalnych — klient wybiera. |
| `menu_group_items` | Pozycje w grupie menu (linkowane do dań) | `dish_id` → link do katalogu dań. |

#### 📦 WARSTWA: Zamówienia

| Tabela | Opis | Dlaczego? |
|--------|------|-----------|
| `clients` | Baza klientów (dane osobowe + firmowe) | Per-tenant. Oddzielne pola na adres osobisty i firmowy. `phone_alt` — drugi telefon. |
| `orders` | Zamówienia | Per-tenant. `order_number` — unikalny numer (KC-XXXXXXXX-XXXXXX). `delivery_zone_id` → obliczona strefa. `discount` — zniżka ręczna. |
| `order_items` | Pozycje zamówienia | `item_type`: `simple`, `bundle`, `configurable`, `extra`, `platter`. `food_cost_per_unit` — koszt wewnętrzny. |
| `order_item_sub_items` | Sub-pozycje (składowe zestawów, pater) | Rozbite elementy zestawu konfigurowalnego. `quantity` uwzględnia `multiplier` × ilość główna. |
| `order_food_cost_extras` | Ręczne pozycje kosztowe | Admin dodaje ręcznie koszty (np. transport, wynajem sprzętu) do analizy food cost. |

#### 📋 WARSTWA: Oferty dedykowane

| Tabela | Opis | Dlaczego? |
|--------|------|-----------|
| `offer_templates` | Szablony ofert | Per-tenant. Wielokrotnie używane struktury sekcji. `contact_section_type`: `corporate` (firmowy) lub `wedding` (weselny). |
| `offer_template_sections` | Sekcje szablonu (np. "Przystawki", "Deser") | Sortowalne sekcje z ikonami. |
| `offer_template_section_items` | Pozycje w sekcji szablonu | `source_type` + `source_id` — link do katalogu (danie/pakiet/extra). |
| `dedicated_offers` | Oferty dedykowane (wysyłane do klientów) | Per-tenant. `token` (64 znaki) — unikalny link dla klienta. `contact_section_type` — typ formularza (firmowy/weselny). Pola weselne: para młoda, koordynator, goście, menu dietetyczne. `status`: draft/sent/accepted/rejected. |
| `dedicated_offer_days` | Dni w ofercie wielodniowej | Dla wydarzeń trwających wiele dni (np. 3-dniowa konferencja). Każdy dzień ma datę, lokalizację, godziny. |
| `dedicated_offer_sections` | Sekcje oferty (np. "Przerwa kawowa") | `day_id` — opcjonalny link do konkretnego dnia. |
| `dedicated_offer_items` | Pozycje w sekcji oferty | `source_type` + `source_id` — link do katalogu. `unit_label` — "szt.", "os.", itp. |
| `dedicated_offer_selections` | Wybory klienta w ofercie interaktywnej | Klient zaznacza pozycje i ustawia ilości. `selected: boolean`, `quantity`, `notes`. |

### 4.3 Pełny SQL — tworzenie tabel

> ⚠️ **Kolejność jest ważna** — tabele z foreign keys muszą być tworzone po tabelach, do których się odwołują.

```sql
-- ============================================================
-- KROK 1: Rozszerzenie auth (tylko dla Supabase)
-- ============================================================

-- Typ enum ról
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_admin', 'tenant_user');

-- Tabela ról (MUSI być osobna — bezpieczeństwo!)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Profile użytkowników
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  email text DEFAULT '',
  avatar_url text DEFAULT '',
  tenant_id uuid, -- FK dodany po stworzeniu tenants
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Funkcja sprawdzania roli (SECURITY DEFINER — omija RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-tworzenie profilu przy rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- KROK 2: Tabela tenantów (fundament multi-tenancy)
-- ============================================================

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  email text DEFAULT '',
  phone text DEFAULT '',
  company_name text DEFAULT '',
  nip text DEFAULT '',
  address text DEFAULT '',
  is_active boolean DEFAULT true,
  max_users integer DEFAULT 5,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dodaj FK do profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ============================================================
-- KROK 3: Konfiguracja firmy
-- ============================================================

CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  company_name text DEFAULT '',
  nip text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  bank_account text DEFAULT '',
  company_address_full text DEFAULT '',
  company_lat numeric,
  company_lng numeric,
  delivery_price_per_km numeric NOT NULL DEFAULT 3,
  max_delivery_km numeric,
  free_delivery_above_km numeric,
  min_order_value numeric DEFAULT 200,
  min_lead_days integer DEFAULT 3,
  auto_confirm boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  logo_url text,
  favicon_url text,
  privacy_policy_url text,
  primary_color text DEFAULT '#000000',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'CalendarDays',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  slug text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  icon text NOT NULL DEFAULT 'Salad',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.extras_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  name text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  icon text NOT NULL DEFAULT 'Sparkles',
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Mapowania N:N: które kategorie są widoczne dla jakiego wydarzenia
CREATE TABLE public.event_category_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id uuid NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE
);

CREATE TABLE public.event_extras_category_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id uuid NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  extras_category_id uuid NOT NULL REFERENCES public.extras_categories(id) ON DELETE CASCADE
);

CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  blocked_date date NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '💳',
  is_active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
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

-- ============================================================
-- KROK 4: Katalog produktów
-- ============================================================

CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'g',
  price_per_unit numeric NOT NULL DEFAULT 0,
  allergens text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
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

CREATE TABLE public.dish_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0
);

CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
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
  dish_id uuid REFERENCES public.dishes(id) ON DELETE SET NULL,
  dietary_tags text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.configurable_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
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
  multiplier numeric NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.config_group_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.config_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  dish_id uuid REFERENCES public.dishes(id) ON DELETE SET NULL,
  allergens text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.platters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  category_slug text,
  price_netto numeric DEFAULT 0,
  vat_rate integer DEFAULT 8,
  price_brutto numeric DEFAULT 0,
  price_on_site numeric,
  unit_label text DEFAULT 'szt.',
  min_quantity integer DEFAULT 1,
  icon text DEFAULT '🍽️',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.platter_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platter_id uuid NOT NULL REFERENCES public.platters(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id),
  name text DEFAULT '',
  multiplier numeric DEFAULT 1,
  sort_order integer DEFAULT 0
);

CREATE TABLE public.extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  extras_category_id uuid REFERENCES public.extras_categories(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'dodatki',
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

CREATE TABLE public.extras_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  extras_category_id uuid REFERENCES public.extras_categories(id),
  name text NOT NULL,
  description text DEFAULT '',
  min_selections integer DEFAULT 1,
  max_selections integer DEFAULT 3,
  price numeric DEFAULT 0,
  price_on_site numeric,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.extras_set_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.extras_sets(id) ON DELETE CASCADE,
  extra_id uuid REFERENCES public.extras(id),
  name text DEFAULT '',
  sort_order integer DEFAULT 0
);

CREATE TABLE public.menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  price_on_site numeric,
  is_configurable boolean NOT NULL DEFAULT false,
  icon text DEFAULT '📋',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.menu_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_selections integer DEFAULT 1,
  max_selections integer DEFAULT 1,
  sort_order integer DEFAULT 0
);

CREATE TABLE public.menu_group_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.menu_groups(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id),
  name text NOT NULL,
  sort_order integer DEFAULT 0
);

-- ============================================================
-- KROK 5: Zamówienia
-- ============================================================

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
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

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  order_number text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
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
  discount numeric NOT NULL DEFAULT 0,
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

CREATE TABLE public.order_food_cost_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- KROK 6: Oferty dedykowane
-- ============================================================

CREATE TABLE public.offer_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  name text NOT NULL,
  description text DEFAULT '',
  event_type text DEFAULT '',
  contact_section_type text NOT NULL DEFAULT 'corporate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.offer_template_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.offer_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '🍽️',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.offer_template_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.offer_template_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  source_type text,
  source_id uuid,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.dedicated_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  template_id uuid REFERENCES public.offer_templates(id) ON DELETE SET NULL,
  token text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  client_company text DEFAULT '',
  client_nip text DEFAULT '',
  client_address text DEFAULT '',
  event_name text DEFAULT '',
  event_date_start date,
  event_date_end date,
  status text NOT NULL DEFAULT 'draft',
  notes text DEFAULT '',
  contact_section_type text NOT NULL DEFAULT 'corporate',
  -- Pola weselne
  groom_first_name text,
  groom_last_name text,
  groom_phone text,
  groom_email text,
  bride_first_name text,
  bride_last_name text,
  bride_phone text,
  bride_email text,
  wedding_date text,
  coordinator text,
  venue text,
  arrival_time text,
  guests_adults integer DEFAULT 0,
  guests_children_3_12 integer DEFAULT 0,
  guests_children_under_2 integer DEFAULT 0,
  guests_subcontractors integer DEFAULT 0,
  menu_standard integer DEFAULT 0,
  menu_vegetarian integer DEFAULT 0,
  menu_children integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dedicated_offer_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.dedicated_offers(id) ON DELETE CASCADE,
  day_date date NOT NULL,
  guest_count integer DEFAULT 0,
  location text DEFAULT '',
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  sort_order integer DEFAULT 0
);

CREATE TABLE public.dedicated_offer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.dedicated_offers(id) ON DELETE CASCADE,
  day_id uuid REFERENCES public.dedicated_offer_days(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '🍽️',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.dedicated_offer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.dedicated_offer_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  source_type text,
  source_id uuid,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.dedicated_offer_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.dedicated_offers(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.dedicated_offer_items(id) ON DELETE CASCADE,
  selected boolean NOT NULL DEFAULT false,
  quantity integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- KROK 7: Trigger auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Dodaj trigger do każdej tabeli z updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
    GROUP BY table_name
  LOOP
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- KROK 8: Row-Level Security (RLS)
-- ============================================================

-- Włącz RLS na wszystkich tabelach
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END;
$$;

-- ⚠️ PONIŻSZE POLITYKI SĄ OTWARTE (DEV MODE)
-- W PRODUKCJI zamień na restrykcyjne polityki per-tenant!
-- Przykład produkcyjnych polityk poniżej w sekcji 8.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'CREATE POLICY "full_access" ON public.%I FOR ALL TO public USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END;
$$;
```

---

## 5. Dlaczego takie decyzje architektoniczne?

### 5.1 Multi-tenancy przez `tenant_id`

**Decyzja:** Każda tabela biznesowa ma kolumnę `tenant_id` (FK do `tenants`).

**Dlaczego nie osobne bazy per tenant?**
- Prostota — jeden schemat, jeden deploy
- Łatwe zarządzanie migracjami (ALTER TABLE dotyczy wszystkich)
- Niższy koszt (jedna instancja PostgreSQL)
- RLS PostgreSQL zapewnia izolację danych

**Trade-off:** Przy bardzo dużej skali (1000+ tenantów) rozważ sharding lub schema-per-tenant.

### 5.2 Role w osobnej tabeli

**Decyzja:** `user_roles` zamiast kolumny `role` w `profiles`.

**Dlaczego?**
- **Bezpieczeństwo:** Kolumna w profiles jest edytowalna przez użytkownika (jeśli ma UPDATE policy). Osobna tabela z SECURITY DEFINER uniemożliwia privilege escalation.
- **Elastyczność:** Użytkownik może mieć wiele ról.
- **Standard Supabase:** Oficjalna rekomendacja.

### 5.3 Dwie ceny (standardowa + "na sali")

**Decyzja:** `price_per_unit` + `price_per_unit_on_site` na produktach.

**Dlaczego?**
- Catering wyjazdowy = wyższa marża (transport, logistyka)
- Catering na sali = niższe koszty, inna wycena
- Klient wybiera typ w kroku 1 → ceny dynamicznie się zmieniają

### 5.4 `multiplier` w config_groups i platter_items

**Decyzja:** Przelicznik ilości na grupach zestawów i pozycjach pater.

**Dlaczego?**
- Zestaw dla 100 osób: "Danie główne" z multiplier 1.5 = 150 porcji
- Patera: danie z multiplier 0.5 = pół porcji na paterze
- Automatyczne obliczanie w zamówieniu i dokumentach PDF

### 5.5 `contact_section_type` na ofertach

**Decyzja:** Dwa typy sekcji kontaktowej: `corporate` i `wedding`.

**Dlaczego?**
- Wesela wymagają danych pary młodej, koordynatora, szczegółów gości i diet
- Konferencje/firmowe — prosty formularz: osoba kontaktowa + firma
- Typ wybierany w szablonie, dziedziczony przez ofertę

### 5.6 Soft-delete items przez ON DELETE CASCADE

**Decyzja:** Usunięcie rodzica kasuje dzieci (CASCADE).

**Dlaczego?**
- Usunięcie zamówienia automatycznie czyści order_items i sub_items
- Usunięcie zestawu czyści grupy i opcje
- Prostota — brak osieroconych danych
- Dane zamówień historycznych zachowane (zamówienie nie jest usuwane po realizacji)

### 5.7 PostgreSQL arrays zamiast tabel junction

**Decyzja:** `allergens text[]`, `dietary_tags text[]`, `contents text[]`, `cities text[]`.

**Dlaczego?**
- Proste listy stringów — nie potrzebują osobnych tabel
- Szybkie zapytania: `@>` operator w PostgreSQL
- Mniejsza złożoność schematu

---

## 6. Edge Functions — dokumentacja

### 6.1 `calculate-delivery`

| Parametr | Typ | Opis |
|----------|-----|------|
| `address` | string | Adres klienta (do geocodingu) |
| `companyLat` | number | Szerokość GPS siedziby firmy |
| `companyLng` | number | Długość GPS siedziby firmy |

**Logika:**
1. Czyści prefiks ulicy (`ul.`, `al.`, `os.` — mylą Nominatim)
2. Geocoding: Nominatim (OpenStreetMap) → lat/lng
3. Routing: OSRM → dystans w km + czas
4. Zwraca: `{ distanceKm, durationMin, customerLat, customerLng, customerAddress }`

**Bez klucza API** — Nominatim i OSRM darmowe. Limit: ~1 req/s.

### 6.2 `create-stripe-checkout`

| Parametr | Typ | Opis |
|----------|-----|------|
| `orderId` | string | UUID zamówienia |
| `orderNumber` | string | Numer (KC-XXXXXXXX-XXXXXX) |
| `amount` | number | Kwota w PLN |
| `customerEmail` | string | Email klienta |
| `customerName` | string | Imię i nazwisko |
| `lineItems` | array | Pozycje: `{ name, quantity, unitPrice }` |
| `successUrl` | string | URL po udanej płatności |
| `cancelUrl` | string | URL po anulowaniu |

**Wymaga:** `STRIPE_SECRET_KEY` w secretach.
**Metody płatności:** Karta, Przelewy24, BLIK.
**Zwraca:** `{ sessionId, url }` → przekieruj klienta.

### 6.3 `stripe-webhook`

| Event | Akcja |
|-------|-------|
| `checkout.session.completed` | UPDATE orders SET status = 'Potwierdzone', payment_method = 'Stripe' |

**Wymaga:** `STRIPE_WEBHOOK_SECRET` (opcjonalny, ale zalecany dla bezpieczeństwa).
Weryfikacja podpisu HMAC SHA256 wbudowana.

### 6.4 `create-tenant-user`

| Parametr | Typ | Opis |
|----------|-----|------|
| `email` | string | Email użytkownika |
| `password` | string | Hasło (min. 8 znaków) |
| `first_name` | string | Imię |
| `last_name` | string | Nazwisko |
| `tenant_id` | string | UUID tenanta |

**Wymaga:** `SUPABASE_SERVICE_ROLE_KEY` (admin API).
Sprawdza czy tenant istnieje i jest aktywny.
Tworzy użytkownika, aktualizuje profil, przypisuje rolę `tenant_admin`.

---

## 7. Migracja krok po kroku

### Wymagania wstępne

- Serwer Linux (Ubuntu 22+ / Debian 12+) lub DigitalOcean App Platform
- PostgreSQL 15+ (Supabase Cloud, DigitalOcean Managed DB, lub self-hosted)
- Node.js 18+ (build frontend)
- Nginx lub Caddy (reverse proxy)
- Domena + certyfikat SSL

### Krok 1: Przygotuj bazę danych

#### Opcja A: Supabase Cloud (rekomendowana)

1. [supabase.com](https://supabase.com) → Nowy projekt
2. SQL Editor → wklej cały SQL z sekcji 4.3
3. Skopiuj **Project URL** i **Anon Key** z Settings → API

#### Opcja B: Supabase Self-Hosted na DigitalOcean

```bash
# 1. Przygotuj Droplet (min. 4 GB RAM)
ssh root@twoj-droplet

# 2. Zainstaluj Docker
curl -fsSL https://get.docker.com | sh

# 3. Sklonuj Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env

# 4. Wygeneruj sekrety
sed -i "s|super-secret-jwt-token-with-at-least-32-characters-long|$(openssl rand -base64 32)|g" .env
sed -i "s|this-is-your-super-secret-and-long-postgres-password|$(openssl rand -base64 24)|g" .env

# 5. Zmień SITE_URL na swoją domenę
sed -i "s|SITE_URL=http://localhost:3000|SITE_URL=https://twojadomena.pl|" .env

# 6. Uruchom
docker compose up -d

# 7. Wklej SQL z sekcji 4.3 przez Supabase Studio (port 8000)
```

#### Opcja C: Czysty PostgreSQL (bez Supabase)

> ⚠️ Ta opcja wymaga zastąpienia Supabase Auth własnym rozwiązaniem (np. Passport.js + JWT) i przepisania edge functions na Express.js.

```bash
# DigitalOcean Managed Database
# Panel → Databases → Create → PostgreSQL 15+, Frankfurt (eu)
# Skopiuj connection string

psql "postgresql://USER:PASS@HOST:25060/defaultdb?sslmode=require" < schema.sql
```

### Krok 2: Zmień konfigurację frontendu

**Jedyne 2 pliki do zmiany:**

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = "https://TWOJ-PROJEKT.supabase.co"  // ← ZMIEŃ
const SUPABASE_ANON_KEY = "TWOJ-ANON-KEY"                // ← ZMIEŃ

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
```

```bash
# Wygeneruj nowe typy TypeScript
npx supabase gen types typescript --project-id TWOJ-PROJECT-ID > src/integrations/supabase/types.ts
```

### Krok 3: Wdróż Edge Functions

```bash
# Zainstaluj Supabase CLI
npm install -g supabase

# Zaloguj się
npx supabase login

# Deploy wszystkich funkcji
npx supabase functions deploy calculate-delivery --project-ref TWOJ-PROJECT-ID
npx supabase functions deploy create-stripe-checkout --project-ref TWOJ-PROJECT-ID
npx supabase functions deploy stripe-webhook --project-ref TWOJ-PROJECT-ID
npx supabase functions deploy create-tenant-user --project-ref TWOJ-PROJECT-ID

# Ustaw sekrety
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_XXXXX --project-ref TWOJ-PROJECT-ID
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXXX --project-ref TWOJ-PROJECT-ID
```

#### Alternatywa: Express.js (jeśli nie chcesz Supabase Functions)

```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// === Calculate Delivery ===
app.post('/api/calculate-delivery', async (req, res) => {
  const { address, companyLat, companyLng } = req.body;
  
  // Geocoding via Nominatim
  const cleanAddress = address
    .replace(/\bul\.\s*/gi, '')
    .replace(/\bal\.\s*/gi, '')
    .trim();
  
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&countrycodes=pl&limit=1`,
    { headers: { 'User-Agent': 'KingOfCatering/1.0' } }
  );
  const geoData = await geoRes.json();
  if (!geoData.length) return res.json({ error: 'address_not_found' });

  // Routing via OSRM
  const { lat, lon } = geoData[0];
  const routeRes = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${companyLng},${companyLat};${lon},${lat}?overview=false`
  );
  const routeData = await routeRes.json();
  if (!routeData.routes?.length) return res.json({ error: 'route_not_found' });

  res.json({
    distanceKm: Math.round(routeData.routes[0].distance / 100) / 10,
    durationMin: Math.round(routeData.routes[0].duration / 60),
    customerLat: parseFloat(lat),
    customerLng: parseFloat(lon),
    customerAddress: geoData[0].display_name,
  });
});

// === Stripe Checkout ===
app.post('/api/create-stripe-checkout', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { orderId, orderNumber, amount, customerEmail, customerName, lineItems, successUrl, cancelUrl } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'p24', 'blik'],
    mode: 'payment',
    customer_email: customerEmail,
    success_url: successUrl || `${process.env.FRONTEND_URL}?payment=success`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL}?payment=cancelled`,
    metadata: { order_id: orderId, order_number: orderNumber, customer_name: customerName },
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
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const orderId = event.data.object.metadata.order_id;
    await supabase.from('orders').update({
      status: 'Potwierdzone',
      payment_method: 'Stripe',
    }).eq('id', orderId);
  }
  res.json({ received: true });
});

// === Create Tenant User ===
app.post('/api/create-tenant-user', async (req, res) => {
  const { email, password, first_name, last_name, tenant_id } = req.body;
  
  const { data: tenant } = await supabase
    .from('tenants').select('id, is_active').eq('id', tenant_id).single();
  if (!tenant?.is_active) return res.status(403).json({ error: 'Tenant inactive' });

  const { data: authData, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) return res.status(400).json({ error: error.message });

  await supabase.from('profiles').update({
    tenant_id, first_name, last_name, email,
  }).eq('id', authData.user.id);

  await supabase.from('user_roles').insert({
    user_id: authData.user.id, role: 'tenant_admin',
  });

  res.json({ success: true, user_id: authData.user.id });
});

app.listen(3001, () => console.log('API on :3001'));
```

**Jeśli przenosisz na Express, zmień w frontendzie wywołania:**
```typescript
// Zamień:
supabase.functions.invoke("create-stripe-checkout", { body: {...} })
// Na:
fetch("https://api.twojadomena.pl/api/create-stripe-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({...}),
})
```

### Krok 4: Skonfiguruj Stripe

1. [stripe.com](https://stripe.com) → Dashboard → Developers → API keys
2. Skopiuj **Secret Key** (`sk_live_...` lub `sk_test_...`)
3. Webhooks → Add endpoint:
   - URL: `https://TWOJ-PROJECT-ID.supabase.co/functions/v1/stripe-webhook`
   - Lub: `https://api.twojadomena.pl/api/stripe-webhook`
   - Events: `checkout.session.completed`
   - Skopiuj Signing Secret → `STRIPE_WEBHOOK_SECRET`

### Krok 5: Utwórz Storage bucket

```sql
-- W Supabase SQL Editor (jeśli bucket nie istnieje)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true);
```

### Krok 6: Utwórz pierwszego admina

```sql
-- Po zarejestrowaniu użytkownika przez Supabase Auth:
INSERT INTO public.user_roles (user_id, role)
VALUES ('UUID-TWOJEGO-USERA', 'super_admin');
```

### Krok 7: Export danych z obecnej bazy

```bash
# Export z Lovable Cloud (wymaga dostępu do bazy)
pg_dump --data-only --inserts --no-owner --no-privileges \
  --exclude-table=auth.* \
  --exclude-table=storage.* \
  --exclude-table=supabase_functions.* \
  --table='public.*' \
  "postgresql://LOVABLE-CLOUD-URL" > data_export.sql

# Import do nowej bazy
psql "postgresql://NOWA-BAZA" < data_export.sql
```

### Krok 8: Build i deploy frontend

```bash
# Install + build
npm install
npm run build
# Wynik: dist/

# Test lokalnie
npx serve dist
```

#### Deploy na DigitalOcean (Nginx)

```nginx
server {
    listen 80;
    server_name twojadomena.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name twojadomena.pl;

    ssl_certificate /etc/letsencrypt/live/twojadomena.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/twojadomena.pl/privkey.pem;

    root /var/www/kingofcatering/dist;
    index index.html;

    # SPA — wszystkie ścieżki → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

```bash
# SSL z Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d twojadomena.pl
```

#### Deploy na Vercel/Netlify

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist
```

---

## 8. Konfiguracja produkcyjna

### 8.1 Zmienne środowiskowe

**Frontend (publiczne — OK):**
```
VITE_SUPABASE_URL=https://TWOJ-PROJEKT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

**Backend (sekrety — NIGDY w kodzie!):**
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 8.2 Produkcyjne polityki RLS

> ⚠️ Poniższe zastępują otwarte `USING (true)` z dev mode.

```sql
-- Przykład: Tenant widzi tylko swoje dane
CREATE POLICY "tenant_isolation" ON public.orders
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Super admin widzi wszystko
CREATE POLICY "super_admin_all" ON public.orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Klient (anonim) może czytać publiczne dane
CREATE POLICY "public_read_products" ON public.dishes
  FOR SELECT TO anon
  USING (true);

-- Klient może tworzyć zamówienia
CREATE POLICY "anon_insert_orders" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- Oferty dedykowane — dostęp po tokenie (anonim)
CREATE POLICY "offer_by_token" ON public.dedicated_offers
  FOR SELECT TO anon
  USING (true); -- Filtrowane w kodzie po tokenie
```

### 8.3 Backup bazy danych

```bash
# Automatyczny backup (cron co noc)
0 3 * * * pg_dump "postgresql://..." | gzip > /backups/kingofcatering_$(date +\%Y\%m\%d).sql.gz

# Retencja — 30 dni
find /backups -name "kingofcatering_*.sql.gz" -mtime +30 -delete
```

---

## 9. Checklist migracji

### Faza 1: Infrastruktura
- [ ] PostgreSQL uruchomiony i dostępny
- [ ] Supabase projekt (Cloud lub self-hosted) skonfigurowany
- [ ] SQL z sekcji 4.3 wykonany — 41 tabel utworzonych
- [ ] Trigger `update_updated_at_column` aktywny
- [ ] RLS włączone na wszystkich tabelach
- [ ] Storage bucket `company-assets` utworzony

### Faza 2: Aplikacja
- [ ] `src/integrations/supabase/client.ts` — nowy URL + klucz
- [ ] `src/integrations/supabase/types.ts` — wygenerowane z nowej bazy
- [ ] `.env` — nowe wartości `VITE_SUPABASE_URL` i `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `npm run build` — kompilacja bez błędów

### Faza 3: Backend
- [ ] Edge functions wdrożone (lub Express.js skonfigurowany)
- [ ] `STRIPE_SECRET_KEY` dodany do secretów
- [ ] `STRIPE_WEBHOOK_SECRET` dodany do secretów
- [ ] Webhook Stripe skonfigurowany (URL + event)

### Faza 4: Dane
- [ ] Export danych z Lovable Cloud
- [ ] Import danych do nowej bazy
- [ ] Super admin user utworzony + rola `super_admin` przypisana
- [ ] Tenant testowy utworzony

### Faza 5: Deploy + test
- [ ] Frontend zdeployowany (Nginx/Vercel/Netlify)
- [ ] Domena + SSL skonfigurowane
- [ ] Test: logowanie super admina
- [ ] Test: logowanie tenant admina
- [ ] Test: złożenie zamówienia end-to-end
- [ ] Test: płatność Stripe (tryb testowy)
- [ ] Test: oferta dedykowana — link klienta
- [ ] Test: generowanie PDF (polskie znaki)
- [ ] Test: kalkulacja dostawy (geocoding)
- [ ] Test: panel admina — zamówienia, dokumenty

### Faza 6: Produkcja
- [ ] Polityki RLS zamienione na restrykcyjne
- [ ] Backup bazy skonfigurowany
- [ ] Monitoring (np. UptimeRobot, Grafana)
- [ ] Stripe przełączony na klucze produkcyjne

---

## 10. FAQ i troubleshooting

**Q: Ile plików muszę zmienić w kodzie?**
A: Minimum 2: `client.ts` (URL + klucz) i `types.ts` (wygenerowany). Opcjonalnie 2 więcej jeśli przenosisz edge functions na Express.

**Q: Czy mogę użyć MySQL?**
A: Nie. Supabase SDK wymaga PostgreSQL. Kod korzysta z `text[]` arrays, triggerów, RLS — specyficznych dla PostgreSQL.

**Q: Nominatim/OSRM kosztują?**
A: Nie. Oba darmowe, open-source. Nominatim: max ~1 req/s (wystarczające dla cateringu). Dla wyższego ruchu rozważ self-hosted instancje.

**Q: Co jeśli Stripe nie jest skonfigurowany?**
A: Przycisk "Zapłać online" pokaże komunikat, że płatności nie są dostępne. Zamówienie zostanie zapisane z opcją "Wyślij zapytanie".

**Q: Jak dodać nowego tenanta?**
A: Super admin: panel → Tenants → Dodaj. Automatycznie tworzy się tenant i można przypisać admina przez `create-tenant-user`.

**Q: Jak zmienić kolor marki tenanta?**
A: Tenant admin → Ustawienia → Dane firmy → Kolor główny. Dynamicznie zmienia CSS variables (`--primary`, przyciski, akcenty).

**Q: Co z migracjami schematu w przyszłości?**
A: Używaj `supabase migration new` do tworzenia migracji SQL. Pliki w `supabase/migrations/` — wersjonowane.

**Q: Jak debugować edge functions?**
A: `npx supabase functions serve` lokalnie, lub sprawdź logi: `npx supabase functions logs calculate-delivery --project-ref TWOJ-ID`.

**Q: Polskie znaki w PDF nie działają?**
A: Font Roboto jest embedowany w `generatePdf.ts` jako base64. Jeśli brakuje znaków, pobierz pełny `Roboto-Regular.ttf` z Google Fonts i zamień base64 w pliku.

**Q: Jak skalować aplikację?**
A: Frontend → CDN (Cloudflare/Vercel). Supabase Cloud automatycznie skaluje. Self-hosted → zwiększ RAM/CPU Droplet, włącz read replicas PostgreSQL.

---

*Dokument wygenerowany automatycznie. Ostatnia aktualizacja: 2026-03-31.*
