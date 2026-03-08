
CREATE TABLE public.order_food_cost_extras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_food_cost_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to order_food_cost_extras"
  ON public.order_food_cost_extras
  FOR ALL
  USING (true)
  WITH CHECK (true);
