ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'expert';

ALTER TABLE public.waqf_expert_contributions
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION private.can_review_contributions(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('admin','reviewer','expert'))
$$;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_review_contributions(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.my_roles()
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(role::text), '{}') FROM public.user_roles WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_roles() TO authenticated;

GRANT SELECT, UPDATE ON public.waqf_expert_contributions TO authenticated;
GRANT ALL ON public.waqf_expert_contributions TO service_role;

DROP POLICY IF EXISTS "Only admins can read expert contributions" ON public.waqf_expert_contributions;
DROP POLICY IF EXISTS "Only admins can update expert contributions" ON public.waqf_expert_contributions;
CREATE POLICY "Reviewers can read expert contributions" ON public.waqf_expert_contributions FOR SELECT TO authenticated USING (private.can_review_contributions(auth.uid()));
CREATE POLICY "Reviewers can update expert contributions" ON public.waqf_expert_contributions FOR UPDATE TO authenticated USING (private.can_review_contributions(auth.uid())) WITH CHECK (private.can_review_contributions(auth.uid()) AND status IN ('received','under_review','accepted','needs_revision','declined'));

CREATE TRIGGER waqf_expert_contributions_updated_at BEFORE UPDATE ON public.waqf_expert_contributions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();