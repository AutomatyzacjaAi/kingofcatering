
-- Add contact_section_type to offer_templates
ALTER TABLE public.offer_templates ADD COLUMN IF NOT EXISTS contact_section_type text NOT NULL DEFAULT 'corporate';

-- Add contact_section_type and wedding-specific fields to dedicated_offers
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS contact_section_type text NOT NULL DEFAULT 'corporate';

-- Wedding-specific fields
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS groom_first_name text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS groom_last_name text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS groom_phone text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS groom_email text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS bride_first_name text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS bride_last_name text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS bride_phone text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS bride_email text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS wedding_date text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS coordinator text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS venue text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS arrival_time text;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS guests_adults integer DEFAULT 0;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS guests_children_3_12 integer DEFAULT 0;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS guests_children_under_2 integer DEFAULT 0;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS guests_subcontractors integer DEFAULT 0;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS menu_standard integer DEFAULT 0;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS menu_vegetarian integer DEFAULT 0;
ALTER TABLE public.dedicated_offers ADD COLUMN IF NOT EXISTS menu_children integer DEFAULT 0;
