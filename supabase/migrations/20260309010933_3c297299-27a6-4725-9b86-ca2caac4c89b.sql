-- Create admin_api_secrets table for storing API configuration
CREATE TABLE IF NOT EXISTS public.admin_api_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL UNIQUE,
  key_value text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.admin_api_secrets ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API secrets
CREATE POLICY "Admins can manage API secrets"
ON public.admin_api_secrets
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add update trigger
CREATE TRIGGER update_admin_api_secrets_updated_at
  BEFORE UPDATE ON public.admin_api_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();