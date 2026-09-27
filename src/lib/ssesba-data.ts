export type Lang = "ar" | "en";
export type AssessmentMode = "expert" | "self" | "ai_review";
export type RiskTier = "S1" | "S2" | "S3" | "S4";
export type ComplianceLevelId =
  | "full"
  | "substantial"
  | "conditional"
  | "structural_remediation"
  | "non_compliant"
  | "prohibited";

export const brand = {
  ar: {
    short: "مَشْتَق",
    acronym: "SSESBA",
    full: "المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال",
  },
  en: {
    short: "SSESBA",
    acronym: "SSESBA",
    full: "Shariah Standards for Economic Sectors & Business Activities",
  },
} as const;

export const axes = [
  { id: "contracts", ar: "العقود", en: "Contracts", weight: 25, sampleScore: 88 },
  { id: "revenues", ar: "الإيرادات", en: "Revenue", weight: 25, sampleScore: 96 },
  { id: "financing", ar: "التمويل", en: "Financing", weight: 20, sampleScore: 72 },
  { id: "operations", ar: "العمليات", en: "Operations", weight: 15, sampleScore: 90 },
  { id: "governance", ar: "الحوكمة", en: "Governance", weight: 10, sampleScore: 82 },
  { id: "disclosure", ar: "الإفصاح", en: "Disclosure", weight: 5, sampleScore: 78 },
] as const;

export const methodologyVersion = "SSESBA-IND-1.1.0";

export const riskTiers = [
  {
    id: "S1",
    ar: "مخاطر محدودة",
    en: "Limited risk",
    arHelp: "أدلة مكتملة، عقود نمطية، ولا توجد مسائل اجتهادية مؤثرة.",
    enHelp: "Complete evidence, standard contracts, and no material interpretive issues.",
  },
  {
    id: "S2",
    ar: "مخاطر متوسطة",
    en: "Moderate risk",
    arHelp: "نواقص قابلة للاستكمال أو شروط تصحيحية محدودة لا تمس أصل النشاط.",
    enHelp: "Evidence gaps or limited corrective conditions that do not affect the core activity.",
  },
  {
    id: "S3",
    ar: "مخاطر مرتفعة",
    en: "High risk",
    arHelp: "عقود مركبة أو مسألة اجتهادية مؤثرة تستوجب مراجعة هيئة شرعية.",
    enHelp: "Complex contracts or a material interpretive issue requiring Shariah-board review.",
  },
  {
    id: "S4",
    ar: "مخاطر حرجة",
    en: "Critical risk",
    arHelp: "غموض جوهري أو أدلة غير كافية تمنع إصدار حكم إيجابي.",
    enHelp: "Material uncertainty or insufficient evidence prevents a positive verdict.",
  },
] as const satisfies ReadonlyArray<{
  id: RiskTier;
  ar: string;
  en: string;
  arHelp: string;
  enHelp: string;
}>;

/** بوابة الأهلية: اختبارات مستقلة ملزمة، تخلّف أي منها يُسقط الأهلية. */
export const gateChecks = [
  { id: "riba", ar: "خلوّ النشاط الأساسي من الربا", en: "Core activity free of riba" },
  { id: "maysir", ar: "خلوّ النشاط الأساسي من الميسر", en: "Core activity free of maysir" },
  {
    id: "prohibited",
    ar: "خلوّ النشاط من السلع والخدمات المحرمة",
    en: "No prohibited goods or services",
  },
  { id: "gharar", ar: "خلوّ العقود من الغش والغرر الجوهري", en: "No fraud or material gharar" },
] as const;

export type GateState = Record<string, boolean>;

/**
 * عتبة الإخفاق البنيوي المنصوص عليها في المعيار (أقل من 45).
 * لا يوجد في هذه النسخة حدٌّ أدنى معتمد لكل محور، لذلك تُعرض المحاور
 * التي تقل عن هذه العتبة كتنبيهٍ للمراجع دون أثر آلي على الحكم.
 */
export const structuralFailureThreshold = 45;

/** المقياس السداسي الموحّد: وصف الدرجة قبل تطبيق مرتبة المخاطر والحكم النهائي. */
export const complianceLevels = [
  { id: "full", min: 95, max: 100, ar: "متوافق كليًا", en: "Fully compliant" },
  { id: "substantial", min: 85, max: 94, ar: "متوافق جوهريًا", en: "Substantially compliant" },
  { id: "conditional", min: 75, max: 84, ar: "متوافق بشروط", en: "Compliant with conditions" },
  {
    id: "structural_remediation",
    min: 60,
    max: 74,
    ar: "يحتاج معالجة هيكلية",
    en: "Requires structural remediation",
  },
  { id: "non_compliant", min: 45, max: 59, ar: "غير متوافق", en: "Non-compliant" },
  { id: "prohibited", min: 0, max: 44, ar: "محظور شرعًا", en: "Prohibited" },
] as const satisfies ReadonlyArray<{
  id: ComplianceLevelId;
  min: number;
  max: number;
  ar: string;
  en: string;
}>;

export function complianceLevelForScore(score: number) {
  // المستويات مرتبة تنازليًا؛ المطابقة بالحد الأدنى فقط حتى لا تسقط الدرجات العشرية (مثل 84.3) في فجوة بين نطاقين.
  const normalized = Math.max(0, Math.min(100, score));
  return complianceLevels.find((level) => normalized >= level.min) ?? complianceLevels[5];
}

export const verdictMatrix = {
  compliant: { S1: "approved", S2: "approved_conditional", S3: "conditional", S4: "rejected" },
  conditional: { S1: "conditional", S2: "conditional", S3: "remediation", S4: "rejected" },
  remediation: { S1: "remediation", S2: "remediation", S3: "remediation", S4: "rejected" },
  non_compliant: { S1: "rejected", S2: "rejected", S3: "rejected", S4: "rejected" },
} as const;

export function gatePassed(gate: GateState) {
  return gateChecks.every((check) => gate[check.id] === true);
}

export function failedGateChecks(gate: GateState) {
  return gateChecks.filter((check) => gate[check.id] !== true);
}

export function flaggedAxes(scores: Record<string, number>) {
  return axes.filter((axis) => (scores[axis.id] ?? 0) < structuralFailureThreshold);
}

/**
 * الحالتان الخاصتان المنصوص عليهما في المعيار: مستقلتان عن نطاقات الدرجات،
 * فلا يُقحَم النشاط المستجد في مرتبةٍ قسرًا، ولا يُقيَّم ما هو خارج النطاق.
 */
export const specialStates = [
  {
    id: "under_study",
    verdict: "referred",
    ar: "قيد الدراسة / إحالة",
    en: "Under study / referral",
    arHelp: "نشاط مستجد لا حكم مستقرًّا فيه؛ يُحال إلى الهيئة الشرعية ولا يُمنح مرتبة.",
    enHelp:
      "An emerging activity without a settled ruling; referred to the Shariah board without a rank.",
  },
  {
    id: "out_of_scope",
    verdict: "not_applicable",
    ar: "غير منطبق / خارج النطاق",
    en: "Not applicable / out of scope",
    arHelp: "نشاط خارج نطاق المعيار؛ لا تُصدر له نتيجة امتثال.",
    enHelp: "An activity outside the standard's scope; no compliance result is issued.",
  },
] as const;
export type SpecialStateId = (typeof specialStates)[number]["id"];

/** الأرقام المالية المستخدمة في الفرز الكمي وحساب التطهير. الحقول غير المُدخلة لا تُقيَّم. */
export type FinancialFigures = {
  totalAssets?: number | undefined;
  interestBearingDebt?: number | undefined;
  interestBearingDeposits?: number | undefined;
  totalRevenue?: number | undefined;
  nonCompliantRevenue?: number | undefined;
};

/**
 * حدود الفرز المالي الكمي على نهج معيار أيوفي الشرعي رقم 21 (الأوراق المالية).
 * تُعدّ جزءًا من بوابة الأهلية: تجاوز أي حد يُسقط الأهلية ولا تعوّضه درجات المحاور،
 * فلا يُعوَّض ربا التمويل بارتفاع بقية المحاور. الحدود قابلة للضبط وفق الولاية القضائية.
 */
export const financialScreens = [
  {
    id: "debt",
    numerator: "interestBearingDebt",
    denominator: "totalAssets",
    max: 30,
    ar: "الديون الربوية إلى إجمالي الأصول",
    en: "Interest-bearing debt to total assets",
  },
  {
    id: "deposits",
    numerator: "interestBearingDeposits",
    denominator: "totalAssets",
    max: 30,
    ar: "الودائع والاستثمارات الربوية إلى إجمالي الأصول",
    en: "Interest-bearing deposits and investments to total assets",
  },
  {
    id: "income",
    numerator: "nonCompliantRevenue",
    denominator: "totalRevenue",
    max: 5,
    ar: "الدخل غير المباح إلى إجمالي الإيرادات",
    en: "Non-permissible income to total revenue",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  numerator: keyof FinancialFigures;
  denominator: keyof FinancialFigures;
  max: number;
  ar: string;
  en: string;
}>;

function positive(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

export function evaluateFinancialScreens(figures: FinancialFigures = {}) {
  return financialScreens.map((screen) => {
    const denominator = positive(figures[screen.denominator]);
    if (denominator === 0) return { screen, ratio: null, passed: null };
    const ratio = Math.round((positive(figures[screen.numerator]) / denominator) * 10000) / 100;
    return { screen, ratio, passed: ratio <= screen.max };
  });
}

/** المتوسط المرجّح للمحاور الستة مقرّبًا إلى منزلة عشرية واحدة. */
export function weightedScore(scores: Record<string, number>) {
  return (
    Math.round(
      axes.reduce((total, axis) => total + ((scores[axis.id] ?? 0) * axis.weight) / 100, 0) * 10,
    ) / 10
  );
}

export type AssessmentOptions = {
  figures?: FinancialFigures | undefined;
  specialState?: SpecialStateId | null | undefined;
};

export function calculateAssessment(
  scores: Record<string, number>,
  gate: GateState,
  risk: RiskTier,
  options: AssessmentOptions = {},
) {
  const failedGates = failedGateChecks(gate);
  const screens = evaluateFinancialScreens(options.figures);
  const failedScreens = screens.filter((item) => item.passed === false);
  const special = specialStates.find((state) => state.id === options.specialState) ?? null;
  const flagged = flaggedAxes(scores);
  // الإخفاق في البوابة أو الفرز حكمٌ قاطع يتقدّم على الحالات الخاصة.
  if (failedGates.length > 0 || failedScreens.length > 0) {
    return {
      score: 0,
      level: complianceLevelForScore(0),
      band: "non_compliant" as Band,
      verdict: "rejected" as Verdict,
      ineligible: true,
      structuralFailure: true,
      flagged,
      failedGates,
      screens,
      failedScreens,
      special,
    };
  }
  const score = weightedScore(scores);
  const band: Band =
    score >= 85
      ? "compliant"
      : score >= 75
        ? "conditional"
        : score >= 60
          ? "remediation"
          : "non_compliant";
  return {
    score,
    level: complianceLevelForScore(score),
    band,
    verdict: (special?.verdict ?? verdictMatrix[band][risk]) as Verdict,
    ineligible: false,
    structuralFailure: score < structuralFailureThreshold,
    flagged,
    failedGates,
    screens,
    failedScreens,
    special,
  };
}

type Band = keyof typeof verdictMatrix;
export type Verdict =
  (typeof verdictMatrix)[Band][RiskTier] | (typeof specialStates)[number]["verdict"];

/**
 * حساب التطهير على نهج معيار أيوفي الشرعي رقم 21: يُطهَّر من العائد الموزّع
 * (الأرباح أو التوزيعات) بنسبة الدخل غير المباح إلى إجمالي الإيرادات، لا من أصل رأس المال.
 */
export function calculatePurification(
  totalRevenue: number,
  nonCompliantRevenue: number,
  distributedReturn: number,
) {
  const revenue = positive(totalRevenue);
  const nonCompliant = Math.min(positive(nonCompliantRevenue), revenue);
  const ratio = revenue > 0 ? nonCompliant / revenue : 0;
  return {
    ratio: Math.round(ratio * 10000) / 100,
    purificationAmount: Math.round(positive(distributedReturn) * ratio * 100) / 100,
  };
}

/** إصدار سياسة الخصوصية التي يوافق عليها مقدّم الطلب صراحةً. */
export const privacyConsentVersion = "privacy-2026-09-23";

export const copy = {
  ar: {
    brand: "مَشْتَق",
    standard: "المعيار",
    request: "طلب تقييم",
    assessment: "التقييم",
    admin: "الإدارة",
    explorer: "مستكشف التصنيف",
    assistant: "المساعد الشرعي",
    six: "المقياس السداسي",
    sectorStandards: "معايير القطاعات",
    back: "العودة إلى المعيار",
    language: "English",
    advisory: "نتيجة استرشادية تحتاج اعتماد مراجع شرعي مختص، وليست فتوى ولا اعتمادًا نهائيًا.",
  },
  en: {
    brand: "SSESBA",
    standard: "Standard",
    request: "Request assessment",
    assessment: "Assessment",
    admin: "Admin",
    explorer: "Classification explorer",
    assistant: "Standards assistant",
    six: "Six-level scale",
    sectorStandards: "Sector standards",
    back: "Back to the standard",
    language: "العربية",
    advisory:
      "An indicative result requiring approval by a qualified Shariah reviewer; it is neither a fatwa nor a final accreditation.",
  },
} as const;
