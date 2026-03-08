-- Add logo columns to company_settings
ALTER TABLE public.company_settings 
  ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT NULL;

-- Create storage bucket for company assets
INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for company-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- Allow authenticated upload
CREATE POLICY "Authenticated upload for company-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-assets');

-- Allow authenticated update
CREATE POLICY "Authenticated update for company-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-assets');

-- Allow authenticated delete
CREATE POLICY "Authenticated delete for company-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-assets');