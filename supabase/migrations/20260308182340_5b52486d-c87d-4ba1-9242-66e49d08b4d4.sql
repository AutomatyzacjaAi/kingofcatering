
-- Create delivery_zones table
CREATE TABLE public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  cities text[] DEFAULT '{}',
  postal_codes text[] DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0,
  free_delivery_above numeric DEFAULT NULL,
  min_order_value numeric DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to delivery_zones" ON public.delivery_zones FOR ALL USING (true) WITH CHECK (true);

-- Add delivery columns to orders
ALTER TABLE public.orders 
  ADD COLUMN delivery_zone_id uuid REFERENCES public.delivery_zones(id) DEFAULT NULL,
  ADD COLUMN delivery_cost numeric NOT NULL DEFAULT 0;
