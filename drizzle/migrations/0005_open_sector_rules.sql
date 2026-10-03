CREATE TABLE public.sector_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL DEFAULT ('R-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))),
  sector text NOT NULL CHECK (sector IN ('primary','secondary','services')),
  axis text NOT NULL CHECK (axis IN ('contracts','revenues','financing','operations','governance','disclosure')),
  title text NOT NULL,
  rule_text text NOT NULL,
  evidence text,
  max_deduction integer NOT NULL DEFAULT 10 CHECK (max_deduction BETWEEN 0 AND 40),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','rejected')),
  proposed_by uuid NOT NULL,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sector_rules TO anon;
GRANT SELECT, INSERT, UPDATE ON public.sector_rules TO authenticated;
GRANT ALL ON public.sector_rules TO service_role;
ALTER TABLE public.sector_rules ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.can_approve_rules(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('admin','reviewer'))
$$;
GRANT EXECUTE ON FUNCTION private.can_approve_rules(uuid) TO authenticated;

CREATE POLICY "Approved rules are public" ON public.sector_rules FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Contributors read all rules" ON public.sector_rules FOR SELECT TO authenticated USING (private.can_review_contributions(auth.uid()));
CREATE POLICY "Experts propose rules" ON public.sector_rules FOR INSERT TO authenticated WITH CHECK (private.can_review_contributions(auth.uid()) AND proposed_by = auth.uid() AND status = 'proposed' AND approved_by IS NULL);
CREATE POLICY "Proposers edit own pending rules" ON public.sector_rules FOR UPDATE TO authenticated USING (proposed_by = auth.uid() AND status = 'proposed') WITH CHECK (proposed_by = auth.uid() AND status = 'proposed' AND approved_by IS NULL);
CREATE POLICY "Reviewers approve rules" ON public.sector_rules FOR UPDATE TO authenticated USING (private.can_approve_rules(auth.uid())) WITH CHECK (private.can_approve_rules(auth.uid()));

CREATE TRIGGER sector_rules_updated_at BEFORE UPDATE ON public.sector_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();