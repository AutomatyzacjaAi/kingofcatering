
-- Create extras_categories table
CREATE TABLE public.extras_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Sparkles',
  description text DEFAULT '',
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.extras_categories ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Allow full access to extras_categories" ON public.extras_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Add extras_category_id to extras table
ALTER TABLE public.extras ADD COLUMN extras_category_id uuid REFERENCES public.extras_categories(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_extras_categories_updated_at
  BEFORE UPDATE ON public.extras_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
