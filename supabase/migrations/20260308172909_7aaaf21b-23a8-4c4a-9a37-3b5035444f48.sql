
-- ============================================
-- KING OF CATERING — FULL DATABASE SCHEMA
-- ============================================

-- ===== HELPER: updated_at trigger function =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 1. CLIENTS
-- ============================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  phone_alt TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  nip TEXT DEFAULT '',
  company_address TEXT DEFAULT '',
  company_city TEXT DEFAULT '',
  company_postal_code TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 2. EVENT TYPES
-- ============================================
CREATE TABLE public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'CalendarDays',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to event_types" ON public.event_types FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON public.event_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. PRODUCT CATEGORIES
-- ============================================
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Salad',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to product_categories" ON public.product_categories FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. EVENT ↔ CATEGORY MAPPING
-- ============================================
CREATE TABLE public.event_category_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  UNIQUE(event_type_id, category_id)
);
ALTER TABLE public.event_category_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to event_category_mappings" ON public.event_category_mappings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. INGREDIENTS
-- ============================================
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  price_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0,
  allergens TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to ingredients" ON public.ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. DISHES (simple products like patery + regular dishes)
-- ============================================
CREATE TABLE public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  price_netto NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_rate INT NOT NULL DEFAULT 8,
  price_brutto NUMERIC(10,2) NOT NULL DEFAULT 0,
  dietary_tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  category_slug TEXT,
  product_type TEXT NOT NULL DEFAULT 'dish',
  price_per_unit NUMERIC(10,2) DEFAULT 0,
  unit_label TEXT DEFAULT 'szt.',
  min_quantity INT DEFAULT 1,
  icon TEXT DEFAULT '🍽️',
  contents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dishes" ON public.dishes FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. DISH ↔ INGREDIENTS
-- ============================================
CREATE TABLE public.dish_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE(dish_id, ingredient_id)
);
ALTER TABLE public.dish_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dish_ingredients" ON public.dish_ingredients FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 8. BUNDLES (expandable products)
-- ============================================
CREATE TABLE public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  image_url TEXT,
  price_netto NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_rate INT NOT NULL DEFAULT 8,
  price_brutto NUMERIC(10,2) NOT NULL DEFAULT 0,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_quantity INT NOT NULL DEFAULT 1,
  icon TEXT DEFAULT '🍽️',
  category_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to bundles" ON public.bundles FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. BUNDLE VARIANTS
-- ============================================
CREATE TABLE public.bundle_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  allergens TEXT[] DEFAULT '{}',
  dietary_tags TEXT[] DEFAULT '{}',
  dish_id UUID REFERENCES public.dishes(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.bundle_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to bundle_variants" ON public.bundle_variants FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 10. CONFIGURABLE SETS
-- ============================================
CREATE TABLE public.configurable_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  image_url TEXT,
  price_per_person NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_persons INT NOT NULL DEFAULT 10,
  icon TEXT DEFAULT '🍽️',
  category_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.configurable_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to configurable_sets" ON public.configurable_sets FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_configurable_sets_updated_at BEFORE UPDATE ON public.configurable_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 11. CONFIG GROUPS
-- ============================================
CREATE TABLE public.config_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.configurable_sets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_selections INT NOT NULL DEFAULT 1,
  max_selections INT NOT NULL DEFAULT 3,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.config_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to config_groups" ON public.config_groups FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 12. CONFIG GROUP OPTIONS
-- ============================================
CREATE TABLE public.config_group_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.config_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allergens TEXT[] DEFAULT '{}',
  dish_id UUID REFERENCES public.dishes(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.config_group_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to config_group_options" ON public.config_group_options FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 13. EXTRAS
-- ============================================
CREATE TABLE public.extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'dodatki',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  image_url TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_netto NUMERIC(10,2) DEFAULT 0,
  vat_rate INT DEFAULT 23,
  price_brutto NUMERIC(10,2) DEFAULT 0,
  unit_label TEXT DEFAULT 'szt.',
  price_label TEXT DEFAULT '',
  icon TEXT DEFAULT '✨',
  contents TEXT[] DEFAULT '{}',
  food_cost NUMERIC(10,2) DEFAULT 0,
  duration TEXT,
  requires_person_count BOOLEAN DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to extras" ON public.extras FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_extras_updated_at BEFORE UPDATE ON public.extras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 14. BLOCKED DATES
-- ============================================
CREATE TABLE public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to blocked_dates" ON public.blocked_dates FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 15. COMPANY SETTINGS
-- ============================================
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT '',
  nip TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  bank_account TEXT DEFAULT '',
  min_order_value NUMERIC(10,2) DEFAULT 200,
  min_lead_days INT DEFAULT 3,
  auto_confirm BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 16. ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT DEFAULT '',
  client_phone TEXT DEFAULT '',
  event_type TEXT DEFAULT '',
  event_date DATE,
  delivery_address TEXT DEFAULT '',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Nowe',
  notes TEXT DEFAULT '',
  contact_city TEXT DEFAULT '',
  contact_street TEXT DEFAULT '',
  contact_building TEXT DEFAULT '',
  contact_apartment TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  guest_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_orders_client_id ON public.orders(client_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_event_date ON public.orders(event_date);

-- ============================================
-- 17. ORDER ITEMS
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'szt.',
  price_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_type TEXT DEFAULT 'simple',
  food_cost_per_unit NUMERIC(10,2) DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- ============================================
-- 18. ORDER ITEM SUB-ITEMS
-- ============================================
CREATE TABLE public.order_item_sub_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'szt.',
  food_cost_per_unit NUMERIC(10,4) DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.order_item_sub_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to order_item_sub_items" ON public.order_item_sub_items FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_order_sub_items_item_id ON public.order_item_sub_items(order_item_id);

-- ============================================
-- 19. PAYMENT METHODS
-- ============================================
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '💳',
  is_active BOOLEAN DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to payment_methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
