-- منهجية 1.2.0: مقام نسبتي الديون والودائع يُختار ويُسجَّل، وحد السيولة شرط تداول،
-- والمستوى الأدنى «غير متوافق — مخاطر شرعية عالية» بدل «محظور شرعًا»، ومهلة «تحت التصحيح».

-- معرّف المستوى الأدنى: high_risk بدل prohibited، مع ترحيل النتائج المحفوظة.
ALTER TABLE public.assessment_result_snapshots DROP CONSTRAINT IF EXISTS assessment_result_snapshots_level_check;
UPDATE public.assessment_result_snapshots SET level = 'high_risk' WHERE level = 'prohibited';
ALTER TABLE public.assessment_result_snapshots ADD CONSTRAINT assessment_result_snapshots_level_check
  CHECK (level IN ('full','substantial','conditional','structural_remediation','non_compliant','high_risk'));

-- لقطة مراجعة قبل تعديل نص المعيار.
INSERT INTO public.content_revisions (section_id, snapshot, change_note)
SELECT s.id, to_jsonb(s), 'Methodology 1.2.0: screen denominator, liquidity condition, lowest level, remediation period'
FROM public.standard_sections s
WHERE s.section_key IN ('score_bands', 'eligibility_gate') AND s.body_ar NOT LIKE '%النقد والذمم المدينة%' AND s.body_ar NOT LIKE '%مخاطر شرعية عالية%';

UPDATE public.standard_sections SET
  body_ar = 'فحص أولي ملزم وغير مرجح للتحقق من خلو النشاط من الربا والميسر والسلع أو الخدمات المحرمة والغش والغرر؛ والإخفاق فيه وحده يوصف بـ«محظور شرعًا». ويتبعه الفرز المالي الكمي على نهج معيار أيوفي الشرعي رقم 21: الديون الربوية لا تتجاوز 30%، والودائع والاستثمارات الربوية لا تتجاوز 30%، منسوبتين إلى القيمة السوقية للشركات المدرجة أو إلى إجمالي الأصول لغيرها وفق ما تعتمده الهيئة، ويُسجَّل المقام مع كل نتيجة؛ والدخل غير المباح لا يتجاوز 5% من إجمالي الإيرادات. تجاوز أي من هذه الحدود يعني عدم الأهلية لا الحكم بالتحريم، ويجوز منح مهلة تصحيح محددة لا تتجاوز اثني عشر شهرًا إذا كان الإخفاق في حدود الفرز وحدها. أما إذا غلب النقد والذمم المدينة على الموجودات (أكثر من 70%، حد مقترح ينتظر اعتماد الهيئة) فلا يُتداول السهم إلا بالقيمة الاسمية وفق أحكام الصرف وبيع الدين، دون أن تسقط الأهلية.',
  body_en = 'A mandatory, unweighted initial screen verifies that the activity is free from riba, maysir, prohibited goods or services, fraud, and gharar; failing it is the only case labelled “prohibited”. Quantitative financial screens follow AAOIFI Shariah Standard No. 21: interest-bearing debt not exceeding 30% and interest-bearing deposits and investments not exceeding 30%, measured against market capitalization for listed companies or total assets otherwise as the board approves, with the denominator recorded on every result; and non-permissible income not exceeding 5% of total revenue. Exceeding a screen means ineligibility, not a ruling of prohibition, and a fixed remediation period of up to twelve months may be granted when only the screens fail. Where cash and receivables dominate the assets (over 70%, a proposed limit awaiting board approval), the share may only trade at par under the rules of currency exchange and debt sale, without losing eligibility.',
  content_version = content_version + 1
WHERE section_key = 'eligibility_gate' AND body_ar NOT LIKE '%النقد والذمم المدينة%';

UPDATE public.standard_sections SET
  body_ar = 'المقياس السداسي الموحد: متوافق كليًا 95–100، متوافق جوهريًا 85–94، متوافق بشروط 75–84، يحتاج معالجة هيكلية 60–74، غير متوافق 45–59، غير متوافق — مخاطر شرعية عالية أقل من 45. والدرجة تقيس جودة الامتثال ولا تُنشئ حكمًا بالتحريم. ولأغراض مصفوفة الحكم تُجمع المستويات في نطاقات تشغيلية: ممتثل (85 فأكثر)، مشروط (75 إلى أقل من 85)، معالجة (60 إلى أقل من 75)، غير ممتثل (أقل من 60). ويُطهَّر الدخل غير المباح من العائد الموزّع لا من أصل رأس المال.',
  body_en = 'The unified six-level scale: fully compliant 95–100, substantially compliant 85–94, compliant with conditions 75–84, requires structural remediation 60–74, non-compliant 45–59, and non-compliant — high Shariah risk below 45. A score measures compliance quality and never creates a ruling of prohibition. For the verdict matrix the levels group into operational bands: compliant (85 and above), conditional (75 to below 85), remediation (60 to below 75), and non-compliant (below 60). Non-permissible income is purified from distributed returns, not from invested capital.',
  content_version = content_version + 1
WHERE section_key = 'score_bands' AND body_ar NOT LIKE '%مخاطر شرعية عالية%';
