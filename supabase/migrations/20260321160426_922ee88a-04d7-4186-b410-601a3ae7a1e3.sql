-- Multi-day support: each offer can have multiple days
CREATE TABLE public.dedicated_offer_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.dedicated_offers(id) ON DELETE CASCADE,
  day_date date NOT NULL,
  location text DEFAULT '',
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  guest_count integer DEFAULT 0,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.dedicated_offer_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to dedicated_offer_days" ON public.dedicated_offer_days FOR ALL TO public USING (true) WITH CHECK (true);

-- Add day_id to sections so sections belong to a specific day
ALTER TABLE public.dedicated_offer_sections ADD COLUMN day_id uuid REFERENCES public.dedicated_offer_days(id) ON DELETE CASCADE;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dedicated_offer_days;