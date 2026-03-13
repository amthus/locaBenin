
-- Create payments table for rent tracking
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  amount integer NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  period_month integer NOT NULL,
  period_year integer NOT NULL,
  payment_method text DEFAULT 'mobile_money',
  reference text,
  status text DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenants can view their payments" ON public.payments FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Owners can view their payments" ON public.payments FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Tenants can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- Updated_at trigger
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
