-- Function to auto-assign admin role to specific email on signup
CREATE OR REPLACE FUNCTION public.check_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('ametepemalthus16@gmail.com', 'learninhack@gmail.com') THEN
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger after user creation
CREATE TRIGGER on_auth_user_created_check_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_admin_email();