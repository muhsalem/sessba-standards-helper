-- حفظ نتائج التقييم برقم مرجعي وإصدار المنهجية، لأغراض التدقيق ومسار الاعتراض.
CREATE TABLE public.assessment_result_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE DEFAULT ('RES-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  source text NOT NULL CHECK (source IN ('weighted', 'six_scale')),
  methodology_version text NOT NULL CHECK (char_length(methodology_version) BETWEEN 3 AND 40),
  inputs jsonb NOT NULL,
  score numeric(5,1) NOT NULL CHECK (score BETWEEN 0 AND 100),
  level text NOT NULL CHECK (level IN ('full','substantial','conditional','structural_remediation','non_compliant','prohibited')),
  verdict text,
  ineligible boolean NOT NULL DEFAULT false,
  run_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.assessment_result_snapshots TO authenticated;
GRANT ALL ON public.assessment_result_snapshots TO service_role;
ALTER TABLE public.assessment_result_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers can read assessment results" ON public.assessment_result_snapshots FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'reviewer'));
CREATE INDEX assessment_result_snapshots_created_idx ON public.assessment_result_snapshots (created_at DESC);

-- توحيد نص المعيار مع المقياس السداسي المطبّق وحدود الفرز المالي، مع لقطة مراجعة قبل التعديل.
INSERT INTO public.content_revisions (section_id, snapshot, change_note)
SELECT s.id, to_jsonb(s), 'Align with six-level scale and quantitative financial screens (methodology 1.1.0)'
FROM public.standard_sections s WHERE s.section_key IN ('score_bands', 'eligibility_gate');

UPDATE public.standard_sections SET
  body_ar = 'فحص أولي ملزم وغير مرجح للتحقق من خلو النشاط من الربا والميسر والسلع أو الخدمات المحرمة والغش والغرر. ويشمل حدود الفرز المالي الكمي على نهج معيار أيوفي الشرعي رقم 21: الديون الربوية لا تتجاوز 30% من إجمالي الأصول، والودائع والاستثمارات الربوية لا تتجاوز 30% منها، والدخل غير المباح لا يتجاوز 5% من إجمالي الإيرادات. يؤدي الإخفاق في أي اختبار إلى عدم الأهلية بصرف النظر عن درجات المحاور.',
  body_en = 'A mandatory, unweighted initial screen verifies that the activity is free from riba, maysir, prohibited goods or services, fraud, and gharar. It includes quantitative financial screens following AAOIFI Shariah Standard No. 21: interest-bearing debt not exceeding 30% of total assets, interest-bearing deposits and investments not exceeding 30% of total assets, and non-permissible income not exceeding 5% of total revenue. Failing any test makes the activity ineligible regardless of its axis scores.',
  content_version = content_version + 1
WHERE section_key = 'eligibility_gate';

UPDATE public.standard_sections SET
  body_ar = 'المقياس السداسي الموحد: متوافق كليًا 95–100، متوافق جوهريًا 85–94، متوافق بشروط 75–84، يحتاج معالجة هيكلية 60–74، غير متوافق 45–59، محظور شرعًا أقل من 45. ولأغراض مصفوفة الحكم تُجمع المستويات في نطاقات تشغيلية: ممتثل (85 فأكثر)، مشروط (75 إلى أقل من 85)، معالجة (60 إلى أقل من 75)، غير ممتثل (أقل من 60). ويُطهَّر الدخل غير المباح من العائد الموزّع لا من أصل رأس المال.',
  body_en = 'The unified six-level scale: fully compliant 95–100, substantially compliant 85–94, compliant with conditions 75–84, requires structural remediation 60–74, non-compliant 45–59, prohibited below 45. For the verdict matrix the levels group into operational bands: compliant (85 and above), conditional (75 to below 85), remediation (60 to below 75), and non-compliant (below 60). Non-permissible income is purified from distributed returns, not from invested capital.',
  content_version = content_version + 1
WHERE section_key = 'score_bands';
