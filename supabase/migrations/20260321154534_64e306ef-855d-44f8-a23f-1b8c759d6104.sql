
-- Offer templates (e.g. "Konferencja", "Wesele")
CREATE TABLE public.offer_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  event_type text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.offer_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to offer_templates" ON public.offer_templates FOR ALL TO public USING (true) WITH CHECK (true);

-- Sections within a template (e.g. "Przerwa kawowa", "Lunch")
CREATE TABLE public.offer_template_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.offer_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '🍽️',
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.offer_template_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to offer_template_sections" ON public.offer_template_sections FOR ALL TO public USING (true) WITH CHECK (true);

-- Items within a section (e.g. specific dishes/options)
CREATE TABLE public.offer_template_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.offer_template_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.offer_template_section_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to offer_template_section_items" ON public.offer_template_section_items FOR ALL TO public USING (true) WITH CHECK (true);

-- Dedicated offers generated for specific clients
CREATE TABLE public.dedicated_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.offer_templates(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE,
  client_name text NOT NULL DEFAULT '',
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  client_company text DEFAULT '',
  event_name text DEFAULT '',
  event_date_start date,
  event_date_end date,
  status text NOT NULL DEFAULT 'draft',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.dedicated_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dedicated_offers" ON public.dedicated_offers FOR ALL TO public USING (true) WITH CHECK (true);

-- Sections copied into a dedicated offer (from template)
CREATE TABLE public.dedicated_offer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.dedicated_offers(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '🍽️',
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.dedicated_offer_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dedicated_offer_sections" ON public.dedicated_offer_sections FOR ALL TO public USING (true) WITH CHECK (true);

-- Items within dedicated offer sections
CREATE TABLE public.dedicated_offer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.dedicated_offer_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  unit_label text DEFAULT 'szt.',
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.dedicated_offer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dedicated_offer_items" ON public.dedicated_offer_items FOR ALL TO public USING (true) WITH CHECK (true);

-- Client selections on a dedicated offer
CREATE TABLE public.dedicated_offer_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.dedicated_offers(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.dedicated_offer_items(id) ON DELETE CASCADE,
  selected boolean NOT NULL DEFAULT false,
  quantity integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.dedicated_offer_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dedicated_offer_selections" ON public.dedicated_offer_selections FOR ALL TO public USING (true) WITH CHECK (true);

-- Enable realtime for selections so admin sees changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.dedicated_offer_selections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dedicated_offers;
