
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS price_per_unit_on_site numeric DEFAULT NULL;
ALTER TABLE public.bundle_variants ADD COLUMN IF NOT EXISTS price_on_site numeric DEFAULT NULL;
ALTER TABLE public.configurable_sets ADD COLUMN IF NOT EXISTS price_per_person_on_site numeric DEFAULT NULL;
ALTER TABLE public.extras ADD COLUMN IF NOT EXISTS price_on_site numeric DEFAULT NULL;
