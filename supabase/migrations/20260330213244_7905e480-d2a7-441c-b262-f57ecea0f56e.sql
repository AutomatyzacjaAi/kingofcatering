
-- 1. Platters table
CREATE TABLE public.platters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  long_description text DEFAULT '',
  image_url text,
  price_netto numeric DEFAULT 0,
  vat_rate integer DEFAULT 8,
  price_brutto numeric DEFAULT 0,
  price_on_site numeric,
  unit_label text DEFAULT 'szt.',
  min_quantity integer DEFAULT 1,
  icon text DEFAULT '🍽️',
  category_slug text,
  tenant_id uuid REFERENCES public.tenants(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.platters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to platters" ON public.platters FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Platter items (dish + multiplier)
CREATE TABLE public.platter_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platter_id uuid NOT NULL REFERENCES public.platters(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id),
  multiplier numeric DEFAULT 1,
  sort_order integer DEFAULT 0,
  name text DEFAULT ''
);
ALTER TABLE public.platter_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to platter_items" ON public.platter_items FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Event ↔ Extras category mappings
CREATE TABLE public.event_extras_category_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id uuid NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  extras_category_id uuid NOT NULL REFERENCES public.extras_categories(id) ON DELETE CASCADE,
  UNIQUE(event_type_id, extras_category_id)
);
ALTER TABLE public.event_extras_category_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to event_extras_category_mappings" ON public.event_extras_category_mappings FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Extras sets (configurable groups of extras for client to pick from)
CREATE TABLE public.extras_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  extras_category_id uuid REFERENCES public.extras_categories(id),
  min_selections integer DEFAULT 1,
  max_selections integer DEFAULT 3,
  price numeric DEFAULT 0,
  price_on_site numeric,
  tenant_id uuid REFERENCES public.tenants(id),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.extras_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to extras_sets" ON public.extras_sets FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.extras_set_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid NOT NULL REFERENCES public.extras_sets(id) ON DELETE CASCADE,
  extra_id uuid REFERENCES public.extras(id),
  sort_order integer DEFAULT 0,
  name text DEFAULT ''
);
ALTER TABLE public.extras_set_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to extras_set_items" ON public.extras_set_items FOR ALL TO public USING (true) WITH CHECK (true);
