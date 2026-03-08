
ALTER TABLE public.company_settings
  ADD COLUMN company_address_full text DEFAULT '',
  ADD COLUMN company_lat numeric DEFAULT NULL,
  ADD COLUMN company_lng numeric DEFAULT NULL,
  ADD COLUMN delivery_price_per_km numeric NOT NULL DEFAULT 3,
  ADD COLUMN max_delivery_km numeric DEFAULT NULL,
  ADD COLUMN free_delivery_above_km numeric DEFAULT NULL;
