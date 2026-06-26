
REVOKE ALL ON FUNCTION public.award_referral_bonus(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_plan_change() FROM PUBLIC, anon, authenticated;
