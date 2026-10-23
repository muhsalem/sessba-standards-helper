import { z } from "zod";
import { axes, calculateAssessment, gateChecks, methodologyVersion } from "./ssesba-data";
import type { Lang } from "./ssesba-data";

const bilingual = (ar: string, en: string) => ({ ar, en });
export const modelTemplates = [
  { key: "dates", code: "ISIC 0122", title: bilingual("مزرعة وإنتاج تمور", "Date farm and production"), scope: bilingual("زراعة النخيل وحصاد التمور وبيع المحصول؛ تُفصل عقود السلم عن بيع المحصول بعد تملكه.", "Palm cultivation, date harvesting and crop sales; distinguish salam contracts from sales of owned harvested crops."), checks: bilingual("صك ملكية أو عقد انتفاع الأرض؛ تراخيص المياه؛ عقد بيع المحصول؛ عقود السلم ومواصفات المسلم فيه ومواعيد التسليم؛ الأجور وسلامة العمال؛ أثر استهلاك المياه.", "Land ownership or usufruct agreement; water permits; crop sales contracts; salam specifications and delivery dates; wages and worker safety; water consumption impact.") },
  { key: "food", code: "ISIC 1030", title: bilingual("تصنيع وحفظ الفاكهة والخضراوات", "Fruit and vegetable processing"), scope: bilingual("تصنيع وحفظ الفاكهة والخضراوات؛ تشمل المراجعة المكونات والمضافات وسلسلة التوريد والعقود.", "Fruit and vegetable processing and preservation, including ingredients, additives, supply chains and contracts."), checks: bilingual("ترخيص المصنع؛ قائمة المكونات والمضافات ومصادرها؛ شهادات الموردين عند الحاجة؛ سجلات تتبع الدفعات؛ اختبارات السلامة؛ عقود الاستصناع والتوريد؛ سياسة منع التلوث بالمحرمات.", "Factory license; ingredient and additive origins; supplier certifications where needed; batch traceability; safety tests; manufacturing and supply contracts; prohibited-material contamination controls.") },
  { key: "hospital", code: "ISIC 8610", title: bilingual("مستشفى وخدمات علاجية", "Hospital and clinical services"), scope: bilingual("الخدمات العلاجية والإقامة الطبية؛ لا يتضمن الملف بيانات مرضى أو سجلات طبية شخصية.", "Clinical services and inpatient care; the file must not contain patient identities or personal medical records."), checks: bilingual("ترخيص المنشأة والممارسين؛ نماذج عقود الخدمة والفوترة منزوعة الهوية؛ الموافقات العلاجية النموذجية؛ مشتريات الأدوية؛ ضوابط الضرورة الطبية؛ ترتيبات التكافل؛ سياسة خصوصية المرضى.", "Facility and practitioner licenses; de-identified service contracts and billing samples; standard treatment consent forms; medicine procurement; medical-necessity controls; takaful arrangements; patient privacy policy.") },
] as const;
export type ModelKey = (typeof modelTemplates)[number]["key"];
export const documentKinds = ["foundation", "governance", "implementation"] as const;
export const documentTitles = {
  foundation: bilingual("الوثيقة التأسيسية", "Founding document"),
  governance: bilingual("وثيقة الحوكمة", "Governance document"),
  implementation: bilingual("أدلة التنفيذ", "Implementation evidence"),
};
export const financialFields = [
  { key: "totalAssets", ...bilingual("إجمالي الأصول", "Total assets") },
  { key: "marketCap", ...bilingual("القيمة السوقية (عند اختيارها)", "Market capitalization (if selected)") },
  { key: "interestBearingDebt", ...bilingual("الديون الربوية", "Interest-bearing debt") },
  { key: "interestBearingDeposits", ...bilingual("الودائع الربوية", "Interest-bearing deposits") },
  { key: "totalRevenue", ...bilingual("إجمالي الإيرادات", "Total revenue") },
  { key: "nonCompliantRevenue", ...bilingual("الدخل غير المباح", "Non-permissible income") },
  { key: "cashAndReceivables", ...bilingual("النقد والذمم المدينة", "Cash and receivables") },
] as const;
const amount = z.number().finite().min(0).max(1e15).nullable();
export const modelPayloadSchema = z.object({
  company: z.string().trim().max(200),
  activity: z.string().trim().max(3000),
  period: z.string().trim().max(100),
  currency: z.string().trim().max(30),
  basis: z.enum(["marketCap", "totalAssets"]),
  risk: z.enum(["S1", "S2", "S3", "S4"]),
  riskReason: z.string().trim().max(2000),
  documents: z.object({ foundation: z.string().trim().max(20000), governance: z.string().trim().max(20000), implementation: z.string().trim().max(20000) }),
  gates: z.object({ riba: z.boolean().nullable(), maysir: z.boolean().nullable(), prohibited: z.boolean().nullable(), gharar: z.boolean().nullable() }),
  gateEvidence: z.object({ riba: z.string().trim().max(2000), maysir: z.string().trim().max(2000), prohibited: z.string().trim().max(2000), gharar: z.string().trim().max(2000) }),
  scores: z.object({ contracts: amount, revenues: amount, financing: amount, operations: amount, governance: amount, disclosure: amount }).refine(v => Object.values(v).every(n => n === null || n <= 100), "Scores must be 0–100"),
  axisEvidence: z.object({ contracts: z.string().trim().max(2000), revenues: z.string().trim().max(2000), financing: z.string().trim().max(2000), operations: z.string().trim().max(2000), governance: z.string().trim().max(2000), disclosure: z.string().trim().max(2000) }),
  figures: z.object({ totalAssets: amount, marketCap: amount, interestBearingDebt: amount, interestBearingDeposits: amount, totalRevenue: amount, nonCompliantRevenue: amount, cashAndReceivables: amount }),
});
export type ModelPayload = z.infer<typeof modelPayloadSchema>;

export function initialModel(key: ModelKey, lang: Lang): ModelPayload {
  const template = modelTemplates.find(t => t.key === key) ?? modelTemplates[0];
  const en = lang === "en";
  const documents = en ? {
    foundation: `DRAFT — Founding document\nModel: ${template.title.en}\nClassification: ${template.code} (indicative; confirm actual activity).\nScope: ${template.scope.en}\nMethodology: ${methodologyVersion}.\nPurpose: evidence-based indicative assessment, not a fatwa or accreditation.\nSource hierarchy: Quran and Sunnah; relevant verified fiqh-council decisions and Shariah standards; document the exact edition, clause and applicability before relying on a citation. Disputed issues are referred to a qualified Shariah board.\nThe activity gate precedes scoring. Six axis weights: contracts 25%, revenue 25%, financing 20%, operations 15%, governance 10%, disclosure 5%; these are proposed methodology weights, pending board adoption. Financial denominator must be recorded and is not interchangeable.\nComplete: legal entity, ownership, activity, jurisdiction, reporting period, boundaries and exceptions.`,
    governance: `DRAFT — Governance document\nResponsibilities: entity representative supplies accurate records; industry expert verifies technical facts; Shariah reviewer records reasoning; independent board decides accreditation outside this indicative tool.\nDeclare conflicts of interest and recuse when necessary. No reviewer self-accreditation.\nRecord reviewer identity, evidence dates, document versions, materiality, unresolved questions and corrective action owners. Re-review after material changes.\nKeep financial documents private. Do not enter patient data or unnecessary personal identifiers.\nRecord objections and correction deadlines; never treat missing evidence as compliant.\nComplete: named responsible persons, conflict declaration, review date, escalation path and approval authority.`,
    implementation: `DRAFT — Implementation evidence register\nSector evidence requested: ${template.checks.en}\nFor each eligibility check and axis, record: document identifier, issuer, date, reporting period, relevant clause/page, finding and verification status.\nFinancial evidence: signed financial statements, debt/deposit schedules, revenue breakdown, cash/receivables, and market-cap source if used. Reconcile figures to the same period and currency.\nUnverified or absent records stay pending. No real evidence is supplied by this template.\nCorrective actions: issue, owner, target date and closure evidence. No automatic purification or zakat ruling.\nComplete this register with actual verified references; link each reference to the relevant field below.`,
  } : {
    foundation: `مسودة — الوثيقة التأسيسية\nالنموذج: ${template.title.ar}\nالتصنيف: ${template.code} (استرشادي؛ يُتحقق من النشاط الفعلي).\nالنطاق: ${template.scope.ar}\nالمنهجية: ${methodologyVersion}.\nالغرض: تقييم استرشادي مسند بالأدلة، لا فتوى ولا شهادة اعتماد.\nتراتبية المصادر: الكتاب والسنة، ثم قرارات المجامع والمعايير الشرعية ذات الصلة بعد التحقق من رقم البند والإصدار وانطباقه. تُحال المسائل الخلافية إلى هيئة شرعية مختصة.\nبوابة النشاط تسبق الدرجة. أوزان المحاور: العقود 25%، الإيرادات 25%، التمويل 20%، العمليات 15%، الحوكمة 10%، الإفصاح 5%؛ أوزان اجتهادية تنتظر اعتماد الهيئة. يُسجّل مقام الفرز المالي ولا يُستبدل بمقام آخر دون بيان.\nيُستكمل: الكيان القانوني، الملكية، النشاط، الولاية القانونية، فترة التقرير، نطاق الفحص والاستثناءات.`,
    governance: `مسودة — وثيقة الحوكمة\nالمسؤوليات: ممثل الكيان يوفر سجلات صحيحة؛ خبير الصناعة يتحقق من الوقائع الفنية؛ المراجع الشرعي يوثق التعليل؛ هيئة مستقلة تصدر الاعتماد خارج هذه الأداة الاسترشادية.\nالإفصاح عن تعارض المصالح والتنحي عند وجوده؛ لا يعتمد المراجع تقييمه بنفسه.\nتوثيق اسم المراجع، تواريخ الأدلة، إصدارات الوثائق، الأهمية النسبية، المسائل المعلقة، ومسؤولي المعالجة. تُعاد المراجعة عند تغير جوهري.\nحفظ الوثائق المالية بسرية؛ عدم إدخال بيانات مرضى أو معرفات شخصية غير لازمة.\nتوثيق الاعتراضات ومهل التصحيح؛ غياب الدليل ليس دليل امتثال.\nيُستكمل: المسؤولون بالاسم، إقرار التعارض، تاريخ المراجعة، مسار الإحالة وسلطة الاعتماد.`,
    implementation: `مسودة — سجل أدلة التنفيذ\nالأدلة القطاعية المطلوبة: ${template.checks.ar}\nلكل بند أهلية ومحور: رقم الوثيقة، الجهة المصدرة، التاريخ، فترة التقرير، الصفحة أو البند، نتيجة التدقيق وحالة التحقق.\nالأدلة المالية: قوائم مالية موقعة، كشوف الديون والودائع، تحليل الإيرادات، النقد والذمم، ومصدر القيمة السوقية عند استخدامها. تُطابق الأرقام مع فترة واحدة وعملة واحدة.\nالسجلات الغائبة أو غير المتحققة تبقى معلقة. لا يوفر هذا النموذج أدلة حقيقية عن كيان محدد.\nالمعالجة: المخالفة، المسؤول، الموعد المستهدف، ودليل الإغلاق؛ لا يُنشأ حكم تطهير أو زكاة آلي.\nيُستكمل السجل بالمراجع الفعلية المتحققة ويربط كل مرجع بالحقل المعني أدناه.`,
  };
  return { company: "", activity: template.scope[lang], period: "", currency: "", basis: "totalAssets", risk: "S4", riskReason: "", documents, gates: { riba: null, maysir: null, prohibited: null, gharar: null }, gateEvidence: { riba: "", maysir: "", prohibited: "", gharar: "" }, scores: { contracts: null, revenues: null, financing: null, operations: null, governance: null, disclosure: null }, axisEvidence: { contracts: "", revenues: "", financing: "", operations: "", governance: "", disclosure: "" }, figures: { totalAssets: null, marketCap: null, interestBearingDebt: null, interestBearingDeposits: null, totalRevenue: null, nonCompliantRevenue: null, cashAndReceivables: null } };
}

export function modelReady(p: ModelPayload) {
  return Boolean(p.company && p.activity && p.period && p.currency && p.riskReason &&
    documentKinds.every(k => p.documents[k].trim().length >= 100) &&
    gateChecks.every(c => p.gates[c.id] !== null && p.gateEvidence[c.id].trim().length > 0) &&
    axes.every(a => p.scores[a.id] !== null && p.axisEvidence[a.id].trim().length > 0) &&
    (p.figures[p.basis] ?? 0) > 0 && (p.figures.totalAssets ?? 0) > 0 && (p.figures.totalRevenue ?? 0) > 0 &&
    financialFields.filter(f => f.key !== "marketCap").every(f => p.figures[f.key] !== null) &&
    (p.figures.nonCompliantRevenue ?? 0) <= (p.figures.totalRevenue ?? 0) &&
    (p.figures.cashAndReceivables ?? 0) <= (p.figures.totalAssets ?? 0));
}
export function calculateModel(p: ModelPayload) {
  if (!modelReady(p)) throw new Error("Incomplete assessment evidence");
  return calculateAssessment(
    Object.fromEntries(axes.map(a => [a.id, p.scores[a.id] ?? 0])),
    Object.fromEntries(gateChecks.map(c => [c.id, p.gates[c.id] === true])), p.risk,
    { basis: p.basis, figures: Object.fromEntries(financialFields.map(f => [f.key, p.figures[f.key] ?? undefined])) },
  );
}

export function documentText(p: ModelPayload, kind: (typeof documentKinds)[number], lang: Lang, version: number) {
  return `${documentTitles[kind][lang]} — SSESBA\n${p.company || (lang === "en" ? "Unnamed entity" : "كيان غير مسمى")}\n${p.period} · ${p.currency}\n${methodologyVersion} · v${version}\n\n${p.documents[kind]}\n\n` + (kind === "implementation" ? [
    ...gateChecks.map(c => `${c[lang]}: ${p.gates[c.id] === null ? "—" : p.gates[c.id] ? (lang === "en" ? "Met" : "متحقق") : (lang === "en" ? "Not met" : "غير متحقق")}\n${p.gateEvidence[c.id]}`),
    ...axes.map(a => `${a[lang]} (${a.weight}%): ${p.scores[a.id] ?? "—"}/100\n${p.axisEvidence[a.id]}`),
    ...financialFields.map(f => `${f[lang]}: ${p.figures[f.key] ?? "—"}`),
    `${p.basis} · ${p.risk}\n${p.riskReason}`,
  ].join("\n\n") : "");
}