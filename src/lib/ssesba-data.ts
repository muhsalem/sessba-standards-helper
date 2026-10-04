export type Lang = "ar" | "en";
export type AssessmentMode = "expert" | "self" | "ai_review";
export type RiskTier = "S1" | "S2" | "S3" | "S4";
export type ComplianceLevelId =
  "full" | "substantial" | "conditional" | "structural_remediation" | "non_compliant" | "high_risk";

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

export const methodologyVersion = "SSESBA-IND-1.2.0";

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
  // الدرجة تقيس جودة الامتثال ولا تُنشئ حكمًا بالتحريم؛ وصف «محظور» مقصور على الإخفاق في بوابة الأهلية.
  {
    id: "high_risk",
    min: 0,
    max: 44,
    ar: "غير متوافق — مخاطر شرعية عالية",
    en: "Non-compliant — high Shariah risk",
  },
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

/**
 * وصف النتيجة عند عدم الأهلية: التحريم مصدره بوابة النشاط وحدها،
 * أما تجاوز حدود الفرز المالي فعدم أهلية لا حكم بالتحريم.
 */
export const ineligibleLabels = {
  gate: {
    ar: "محظور شرعًا — إخفاق في بوابة الأهلية",
    en: "Prohibited — failed the eligibility gate",
  },
  screens: {
    ar: "غير مؤهل — تجاوز حدود الفرز المالي",
    en: "Ineligible — financial screen limits exceeded",
  },
} as const;
export type IneligibleReason = keyof typeof ineligibleLabels;

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
  {
    id: "under_remediation",
    verdict: "under_remediation",
    ar: "تحت التصحيح (مهلة محددة)",
    en: "Under remediation (fixed deadline)",
    arHelp:
      "لمن تجاوز حدود الفرز المالي دون إخفاق في بوابة النشاط: يبقى في التصنيف تحت المراقبة حتى تاريخ انتهاء المهلة، ثم يُعاد فرزه.",
    enHelp:
      "For a company that exceeds financial screen limits without failing the activity gate: it stays classified under monitoring until the deadline, then is re-screened.",
  },
] as const;
export type SpecialStateId = (typeof specialStates)[number]["id"];

/**
 * أقصى مهلة تصحيح بالأشهر. قيمة مقترحة تحتاج اعتماد الهيئة الشرعية.
 * لا تُتاح المهلة إلا حين يكون الإخفاق في حدود الفرز المالي وحدها، لا في بوابة النشاط.
 */
export const maxRemediationMonths = 12;

/** الأرقام المالية المستخدمة في الفرز الكمي وحساب التطهير. الحقول غير المُدخلة لا تُقيَّم. */
export type FinancialFigures = {
  marketCap?: number | undefined;
  totalAssets?: number | undefined;
  cashAndReceivables?: number | undefined;
  interestBearingDebt?: number | undefined;
  interestBearingDeposits?: number | undefined;
  totalRevenue?: number | undefined;
  nonCompliantRevenue?: number | undefined;
};

/**
 * مقام نسبتي الديون والودائع الربوية. معيار أيوفي الشرعي رقم 21 ينسبهما إلى القيمة السوقية،
 * وتعتمد مؤشرات أخرى إجمالي الأصول. تختار الهيئة المقام المعتمد، ويُسجَّل مع كل نتيجة.
 */
export const screenBases = [
  {
    id: "marketCap",
    ar: "القيمة السوقية (للشركات المدرجة)",
    en: "Market capitalization (listed companies)",
    arShort: "القيمة السوقية",
    enShort: "market capitalization",
  },
  {
    id: "totalAssets",
    ar: "إجمالي الأصول (لغير المدرجة)",
    en: "Total assets (unlisted companies)",
    arShort: "إجمالي الأصول",
    enShort: "total assets",
  },
] as const;
export type ScreenBasis = (typeof screenBases)[number]["id"];
export const defaultScreenBasis: ScreenBasis = "marketCap";

/**
 * حدود الفرز المالي الكمي على نهج معيار أيوفي الشرعي رقم 21 (الأوراق المالية).
 * - حدود «gate» جزء من بوابة الأهلية: تجاوزها يُسقط الأهلية ولا تعوّضه درجات المحاور.
 * - حد «trading» شرطٌ على التداول لا على الأهلية: إذا غلبت النقود والديون على الموجودات
 *   دخل تداول السهم في أحكام الصرف وبيع الدين، فلا يجوز إلا بالقيمة الاسمية بشروطه.
 * الحدود قابلة للضبط وفق ما تعتمده الهيئة الشرعية؛ وحد السيولة (70%) مقترح ينتظر اعتمادها.
 */
export const financialScreens = [
  {
    id: "debt",
    kind: "gate",
    numerator: "interestBearingDebt",
    denominator: "basis",
    max: 30,
    ar: "الديون الربوية",
    en: "Interest-bearing debt",
  },
  {
    id: "deposits",
    kind: "gate",
    numerator: "interestBearingDeposits",
    denominator: "basis",
    max: 30,
    ar: "الودائع والاستثمارات الربوية",
    en: "Interest-bearing deposits and investments",
  },
  {
    id: "income",
    kind: "gate",
    numerator: "nonCompliantRevenue",
    denominator: "totalRevenue",
    max: 5,
    ar: "الدخل غير المباح إلى إجمالي الإيرادات",
    en: "Non-permissible income to total revenue",
  },
  {
    id: "liquidity",
    kind: "trading",
    numerator: "cashAndReceivables",
    denominator: "totalAssets",
    max: 70,
    ar: "النقد والذمم المدينة إلى إجمالي الأصول",
    en: "Cash and receivables to total assets",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  kind: "gate" | "trading";
  numerator: keyof FinancialFigures;
  denominator: keyof FinancialFigures | "basis";
  max: number;
  ar: string;
  en: string;
}>;

function positive(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

/** اسم الفحص مع مقامه الفعلي، لعرضه في النتيجة والتقرير. */
export function screenLabel(
  screen: (typeof financialScreens)[number],
  basis: ScreenBasis,
  lang: Lang,
) {
  if (screen.denominator !== "basis") return screen[lang];
  const base = screenBases.find((item) => item.id === basis) ?? screenBases[0];
  return lang === "ar" ? `${screen.ar} إلى ${base.arShort}` : `${screen.en} to ${base.enShort}`;
}

export function evaluateFinancialScreens(
  figures: FinancialFigures = {},
  basis: ScreenBasis = defaultScreenBasis,
) {
  return financialScreens.map((screen) => {
    const key = screen.denominator === "basis" ? basis : screen.denominator;
    const denominator = positive(figures[key]);
    if (denominator === 0) return { screen, ratio: null, passed: null };
    const ratio = Math.round((positive(figures[screen.numerator]) / denominator) * 10000) / 100;
    return { screen, ratio, passed: ratio <= screen.max };
  });
}

/** هل تاريخ نهاية المهلة صالح: بعد اليوم، وفي حدود أقصى مهلة معتمدة. */
export function validRemediationDeadline(deadline: string | null | undefined, now = new Date()) {
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return false;
  const end = new Date(`${deadline}T23:59:59Z`);
  if (Number.isNaN(end.getTime()) || end <= now) return false;
  const limit = new Date(now);
  limit.setUTCMonth(limit.getUTCMonth() + maxRemediationMonths);
  return end <= limit;
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
  basis?: ScreenBasis | undefined;
  specialState?: SpecialStateId | null | undefined;
  remediationDeadline?: string | null | undefined;
  now?: Date | undefined;
};

export function calculateAssessment(
  scores: Record<string, number>,
  gate: GateState,
  risk: RiskTier,
  options: AssessmentOptions = {},
) {
  const basis = options.basis ?? defaultScreenBasis;
  const failedGates = failedGateChecks(gate);
  const screens = evaluateFinancialScreens(options.figures, basis);
  const failedScreens = screens.filter(
    (item) => item.screen.kind === "gate" && item.passed === false,
  );
  // شرط التداول بالقيمة الاسمية لا يُسقط الأهلية، ويُعرض شرطًا على النتيجة.
  const tradingAtParOnly = screens.some(
    (item) => item.screen.kind === "trading" && item.passed === false,
  );
  const requested = specialStates.find((state) => state.id === options.specialState) ?? null;
  // مهلة التصحيح لا تُعالج إلا تجاوز حدود الفرز؛ ولا أثر لها مع إخفاق البوابة أو بلا تجاوز.
  const remediation =
    requested?.id === "under_remediation" &&
    failedGates.length === 0 &&
    failedScreens.length > 0 &&
    validRemediationDeadline(options.remediationDeadline, options.now)
      ? { deadline: options.remediationDeadline as string }
      : null;
  const special =
    requested?.id === "under_remediation" ? (remediation ? requested : null) : requested;
  const flagged = flaggedAxes(scores);
  const common = {
    basis,
    flagged,
    failedGates,
    screens,
    failedScreens,
    tradingAtParOnly,
    remediation,
  };
  // الإخفاق في البوابة أو الفرز حكمٌ قاطع يتقدّم على الحالات الخاصة، إلا مهلة التصحيح المعتمدة للفرز.
  if (failedGates.length > 0 || (failedScreens.length > 0 && !remediation)) {
    return {
      score: 0,
      level: complianceLevelForScore(0),
      band: "non_compliant" as Band,
      verdict: "rejected" as Verdict,
      ineligible: true,
      ineligibleReason: (failedGates.length > 0 ? "gate" : "screens") as IneligibleReason,
      structuralFailure: true,
      special,
      ...common,
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
    ineligibleReason: null as IneligibleReason | null,
    structuralFailure: score < structuralFailureThreshold,
    special,
    ...common,
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
    tieredStandards: "المعايير المتدرّجة",
    waqf: "الوقف والخبراء",
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
    tieredStandards: "Tiered standards",
    waqf: "Waqf & experts",
    back: "Back to the standard",
    language: "العربية",
    advisory:
      "An indicative result requiring approval by a qualified Shariah reviewer; it is neither a fatwa nor a final accreditation.",
  },
} as const;
