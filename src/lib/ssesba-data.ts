export type Lang = "ar" | "en";
export type AssessmentMode = "expert" | "self" | "ai_review";
export type RiskTier = "S1" | "S2" | "S3" | "S4";
export type ComplianceLevelId = "full" | "substantial" | "conditional" | "structural_remediation" | "non_compliant" | "prohibited";

export const brand = {
  ar: { short: "معايير التصنيف الشرعي", acronym: "م.ش.ت.ق.أ", full: "المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال" },
  en: { short: "SSESBA", acronym: "SSESBA", full: "Shariah Standards for Economic Sectors & Business Activities" },
} as const;

export const axes = [
  { id: "contracts", ar: "العقود", en: "Contracts", weight: 25, hospital: 88 },
  { id: "revenues", ar: "الإيرادات", en: "Revenue", weight: 25, hospital: 96 },
  { id: "financing", ar: "التمويل", en: "Financing", weight: 20, hospital: 72 },
  { id: "operations", ar: "العمليات", en: "Operations", weight: 15, hospital: 90 },
  { id: "governance", ar: "الحوكمة", en: "Governance", weight: 10, hospital: 82 },
  { id: "disclosure", ar: "الإفصاح", en: "Disclosure", weight: 5, hospital: 78 },
] as const;

export const methodologyVersion = "SSESBA-IND-1.0.0";

export const riskTiers = [
  { id: "S1", ar: "مخاطر محدودة", en: "Limited risk", arHelp: "أدلة مكتملة، عقود نمطية، ولا توجد مسائل اجتهادية مؤثرة.", enHelp: "Complete evidence, standard contracts, and no material interpretive issues." },
  { id: "S2", ar: "مخاطر متوسطة", en: "Moderate risk", arHelp: "نواقص قابلة للاستكمال أو شروط تصحيحية محدودة لا تمس أصل النشاط.", enHelp: "Evidence gaps or limited corrective conditions that do not affect the core activity." },
  { id: "S3", ar: "مخاطر مرتفعة", en: "High risk", arHelp: "عقود مركبة أو مسألة اجتهادية مؤثرة تستوجب مراجعة هيئة شرعية.", enHelp: "Complex contracts or a material interpretive issue requiring Shariah-board review." },
  { id: "S4", ar: "مخاطر حرجة", en: "Critical risk", arHelp: "غموض جوهري أو أدلة غير كافية تمنع إصدار حكم إيجابي.", enHelp: "Material uncertainty or insufficient evidence prevents a positive verdict." },
] as const satisfies ReadonlyArray<{ id: RiskTier; ar: string; en: string; arHelp: string; enHelp: string }>;

/** بوابة الأهلية: اختبارات مستقلة ملزمة، تخلّف أي منها يُسقط الأهلية. */
export const gateChecks = [
  { id: "riba", ar: "خلوّ النشاط الأساسي من الربا", en: "Core activity free of riba" },
  { id: "maysir", ar: "خلوّ النشاط الأساسي من الميسر", en: "Core activity free of maysir" },
  { id: "prohibited", ar: "خلوّ النشاط من السلع والخدمات المحرمة", en: "No prohibited goods or services" },
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
  { id: "structural_remediation", min: 60, max: 74, ar: "يحتاج معالجة هيكلية", en: "Requires structural remediation" },
  { id: "non_compliant", min: 45, max: 59, ar: "غير متوافق", en: "Non-compliant" },
  { id: "prohibited", min: 0, max: 44, ar: "محظور شرعًا", en: "Prohibited" },
] as const satisfies ReadonlyArray<{ id: ComplianceLevelId; min: number; max: number; ar: string; en: string }>;

export function complianceLevelForScore(score: number) {
  const normalized = Math.max(0, Math.min(100, score));
  // الحدود الدنيا فقط: الدرجات العشرية (مثل 94.5) تبقى ضمن المستوى الأدنى الأقرب دون أن تسقط إلى «محظور».
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

export function calculateAssessment(scores: Record<string, number>, gate: GateState, risk: RiskTier) {
  if (!gatePassed(gate)) {
    return { score: 0, level: complianceLevelForScore(0), band: "non_compliant", verdict: "rejected", ineligible: true, structuralFailure: true, flagged: flaggedAxes(scores) } as const;
  }
  const score = Math.round(axes.reduce((total, axis) => total + (scores[axis.id] ?? 0) * axis.weight / 100, 0) * 10) / 10;
  const band = score >= 85 ? "compliant" : score >= 75 ? "conditional" : score >= 60 ? "remediation" : "non_compliant";
  return {
    score,
    level: complianceLevelForScore(score),
    band,
    verdict: verdictMatrix[band][risk],
    ineligible: false,
    structuralFailure: score < structuralFailureThreshold,
    flagged: flaggedAxes(scores),
  } as const;
}

export function calculateFinancialExposure(totalRevenue: number, nonCompliantRevenue: number, investmentAmount: number) {
  const revenue = Math.max(0, totalRevenue);
  const nonCompliant = Math.max(0, Math.min(nonCompliantRevenue, revenue));
  const investment = Math.max(0, investmentAmount);
  const ratio = revenue > 0 ? nonCompliant / revenue : 0;
  return {
    ratio: Math.round(ratio * 10000) / 100,
    attributableAmount: Math.round(investment * ratio * 100) / 100,
  };
}

export const copy = {
  ar: {
    brand: "معايير التصنيف الشرعي", standard: "المعيار", request: "طلب تقييم", assessment: "التقييم", admin: "الإدارة", explorer: "مستكشف التصنيف", assistant: "المساعد الشرعي", six: "المقياس السداسي",
    back: "العودة إلى المعيار", language: "English", advisory: "نتيجة استرشادية تحتاج اعتماد مراجع شرعي مختص، وليست فتوى ولا اعتمادًا نهائيًا.",
  },
  en: {
    brand: "SSESBA", standard: "Standard", request: "Request assessment", assessment: "Assessment", admin: "Admin", explorer: "Classification explorer", assistant: "Standards assistant", six: "Six-level scale",
    back: "Back to the standard", language: "العربية", advisory: "An indicative result requiring approval by a qualified Shariah reviewer; it is neither a fatwa nor a final accreditation.",
  },
} as const;
