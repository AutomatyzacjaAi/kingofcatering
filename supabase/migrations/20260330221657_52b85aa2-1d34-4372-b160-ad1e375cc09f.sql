
-- Menus table
CREATE TABLE public.menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  price_on_site numeric DEFAULT NULL,
  is_configurable boolean NOT NULL DEFAULT false,
  icon text DEFAULT '📋',
  tenant_id uuid REFERENCES public.tenants(id),
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to menus" ON public.menus FOR ALL TO public USING (true) WITH CHECK (true);

-- Menu groups (e.g., "Zupa", "Danie główne", "Deser")
CREATE TABLE public.menu_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_selections integer DEFAULT 1,
  max_selections integer DEFAULT 1,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.menu_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to menu_groups" ON public.menu_groups FOR ALL TO public USING (true) WITH CHECK (true);

-- Menu group items (linked to dishes)
CREATE TABLE public.menu_group_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.menu_groups(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id),
  name text NOT NULL,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.menu_group_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to menu_group_items" ON public.menu_group_items FOR ALL TO public USING (true) WITH CHECK (true);
