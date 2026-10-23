CREATE TABLE public.reviewer_assessment_files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_user_id uuid NOT NULL DEFAULT auth.uid(),
 title text NOT NULL,
 template_key text NOT NULL,
 language text NOT NULL DEFAULT 'ar',
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 result jsonb,
 methodology_version text NOT NULL,
 version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reviewer_assessment_files TO authenticated;
GRANT ALL ON public.reviewer_assessment_files TO service_role;
ALTER TABLE public.reviewer_assessment_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviewer_files_select ON public.reviewer_assessment_files FOR SELECT TO authenticated USING (owner_user_id = auth.uid() AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY reviewer_files_insert ON public.reviewer_assessment_files FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid() AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY reviewer_files_update ON public.reviewer_assessment_files FOR UPDATE TO authenticated USING (owner_user_id = auth.uid() AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin'))) WITH CHECK (owner_user_id = auth.uid() AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'expert') OR public.has_role(auth.uid(), 'admin')));
CREATE INDEX reviewer_files_owner_idx ON public.reviewer_assessment_files(owner_user_id, updated_at DESC);
CREATE TRIGGER reviewer_files_updated_at BEFORE UPDATE ON public.reviewer_assessment_files FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();