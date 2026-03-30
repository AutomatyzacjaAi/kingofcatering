
-- 1. Tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  company_name text DEFAULT '',
  nip text DEFAULT '',
  address text DEFAULT '',
  is_active boolean DEFAULT true,
  max_users integer DEFAULT 5,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to tenants" ON public.tenants FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. App role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_admin', 'tenant_user');

-- 3. User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to user_roles" ON public.user_roles FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  email text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to profiles" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. Add tenant_id to key tables
ALTER TABLE public.orders ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.clients ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.dishes ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.bundles ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.configurable_sets ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.extras ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.extras_categories ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.dedicated_offers ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.product_categories ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.event_types ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.company_settings ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.delivery_zones ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.blocked_dates ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.offer_templates ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
