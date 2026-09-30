CREATE TABLE public.waqf_expert_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  organization text NOT NULL CHECK (char_length(organization) <= 160),
  specialty text NOT NULL CHECK (specialty IN ('shariah','fiqh','industry','business','finance','other')),
  experience text NOT NULL CHECK (char_length(experience) BETWEEN 10 AND 1000),
  contribution_area text NOT NULL CHECK (contribution_area IN ('drafting','review','sector','research','translation')),
  proposal text NOT NULL CHECK (char_length(proposal) BETWEEN 20 AND 3000),
  preferred_language text NOT NULL DEFAULT 'ar' CHECK (preferred_language IN ('ar','en')),
  consent_version text NOT NULL DEFAULT 'privacy-2026-09-23',
  consented_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','under_review','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.waqf_expert_contributions TO authenticated;
GRANT ALL ON public.waqf_expert_contributions TO service_role;
ALTER TABLE public.waqf_expert_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can read expert contributions" ON public.waqf_expert_contributions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update expert contributions" ON public.waqf_expert_contributions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));