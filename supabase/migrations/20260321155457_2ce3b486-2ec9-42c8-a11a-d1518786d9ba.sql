ALTER TABLE dedicated_offer_items 
  ADD COLUMN source_type text DEFAULT NULL,
  ADD COLUMN source_id uuid DEFAULT NULL;

ALTER TABLE offer_template_section_items
  ADD COLUMN source_type text DEFAULT NULL,
  ADD COLUMN source_id uuid DEFAULT NULL;