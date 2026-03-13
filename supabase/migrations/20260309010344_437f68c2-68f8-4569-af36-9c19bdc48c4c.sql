-- Create trigger function to notify admins on new KYC submission
CREATE OR REPLACE FUNCTION public.notify_admins_on_kyc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  user_name TEXT;
BEGIN
  -- Get user name from profile
  SELECT full_name INTO user_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Notify all admins
  FOR admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      admin_record.user_id,
      '📋 Nouvelle demande KYC',
      'L''utilisateur "' || COALESCE(user_name, 'Inconnu') || '" a soumis une demande de vérification d''identité.',
      'info',
      '/ctrl-panel-x?tab=kyc'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new KYC submissions
DROP TRIGGER IF EXISTS on_kyc_submitted ON public.kyc_verifications;
CREATE TRIGGER on_kyc_submitted
  AFTER INSERT ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_kyc();