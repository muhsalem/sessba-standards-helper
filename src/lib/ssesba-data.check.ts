/**
 * فحص منطق الحساب: يُشغَّل عبر `bun run test`.
 * يتحقق من الأوزان، عتبات النطاقات، بوابة الأهلية، الفرز المالي، الحالات الخاصة، التطهير، ومصفوفة الحكم.
 */
import assert from "node:assert/strict";
import {
  axes,
  calculateAssessment,
  calculatePurification,
  complianceLevelForScore,
  evaluateFinancialScreens,
  gateChecks,
  structuralFailureThreshold,
  verdictMatrix,
  weightedScore,
  type RiskTier,
} from "./ssesba-data";

const openGate = Object.fromEntries(gateChecks.map((c) => [c.id, true]));
const flat = (value: number) => Object.fromEntries(axes.map((a) => [a.id, value]));

assert.equal(
  axes.reduce((sum, a) => sum + a.weight, 0),
  100,
  "مجموع الأوزان يجب أن يكون 100",
);

assert.equal(calculateAssessment(flat(100), openGate, "S1").score, 100);
assert.equal(calculateAssessment(flat(0), openGate, "S1").score, 0);

const bands: Array<[number, string]> = [
  [100, "compliant"],
  [85, "compliant"],
  [84, "conditional"],
  [75, "conditional"],
  [74, "remediation"],
  [60, "remediation"],
  [59, "non_compliant"],
];
for (const [score, band] of bands)
  assert.equal(calculateAssessment(flat(score), openGate, "S1").band, band, `النطاق عند ${score}`);

const levels: Array<[number, string]> = [
  [100, "full"],
  [95, "full"],
  [94, "substantial"],
  [85, "substantial"],
  [84, "conditional"],
  [75, "conditional"],
  [74, "structural_remediation"],
  [60, "structural_remediation"],
  [59, "non_compliant"],
  [45, "non_compliant"],
  [44, "high_risk"],
  [0, "high_risk"],
];
for (const [score, level] of levels)
  assert.equal(complianceLevelForScore(score).id, level, `المستوى السداسي عند ${score}`);

const decimals: Array<[number, string]> = [
  [94.3, "substantial"],
  [84.5, "conditional"],
  [74.9, "structural_remediation"],
  [59.5, "non_compliant"],
  [44.9, "high_risk"],
];
for (const [score, level] of decimals)
  assert.equal(complianceLevelForScore(score).id, level, `المستوى السداسي للدرجة العشرية ${score}`);
const mixed = calculateAssessment({ ...flat(84), contracts: 85 }, openGate, "S1");
assert.equal(mixed.score, 84.3);
assert.equal(mixed.level.id, "conditional", "الدرجة 84.3 يجب ألا تُصنَّف محظورة");

for (const [band, row] of Object.entries(verdictMatrix)) {
  const score =
    band === "compliant" ? 90 : band === "conditional" ? 80 : band === "remediation" ? 65 : 40;
  for (const tier of ["S1", "S2", "S3", "S4"] as RiskTier[]) {
    assert.equal(
      calculateAssessment(flat(score), openGate, tier).verdict,
      row[tier],
      `الحكم ${band}/${tier}`,
    );
  }
}

for (const check of gateChecks) {
  const result = calculateAssessment(flat(100), { ...openGate, [check.id]: false }, "S1");
  assert.equal(result.ineligible, true, `تخلّف ${check.id} يُسقط الأهلية`);
  assert.equal(result.verdict, "rejected");
  assert.equal(result.score, 0);
  assert.equal(result.level.id, "high_risk");
  assert.equal(result.ineligibleReason, "gate", "إخفاق البوابة وحده يوصف بالتحريم");
}

assert.equal(calculateAssessment(flat(40), openGate, "S1").structuralFailure, true);
assert.equal(
  calculateAssessment(flat(structuralFailureThreshold), openGate, "S1").structuralFailure,
  false,
);
assert.equal(
  calculateAssessment({ ...flat(90), contracts: 20 }, openGate, "S1").flagged.length,
  1,
  "تنبيه المحور المنخفض",
);

// الفرز المالي الكمي جزء من البوابة: ربا التمويل لا تعوّضه بقية المحاور.
const strong = { ...flat(100), financing: 30 };
assert.equal(
  calculateAssessment(strong, openGate, "S1").verdict,
  "approved",
  "بدون أرقام مالية لا يُقيَّم الفرز",
);
const leveraged = calculateAssessment(strong, openGate, "S1", {
  figures: { totalAssets: 1000, interestBearingDebt: 450 },
  basis: "totalAssets",
});
assert.equal(leveraged.ineligible, true, "دين ربوي 45% من الأصول يُسقط الأهلية");
assert.equal(leveraged.verdict, "rejected");
assert.equal(leveraged.failedScreens[0]?.screen.id, "debt");
assert.equal(leveraged.ineligibleReason, "screens", "تجاوز الفرز عدم أهلية لا تحريم");
assert.equal(
  calculateAssessment(strong, openGate, "S1", {
    figures: { totalAssets: 1000, interestBearingDebt: 300 },
    basis: "totalAssets",
  }).ineligible,
  false,
  "30% بالضبط ضمن الحد",
);
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", {
    figures: { totalRevenue: 1000, nonCompliantRevenue: 51 },
  }).ineligible,
  true,
  "دخل غير مباح 5.1% يتجاوز الحد",
);
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", {
    figures: { totalRevenue: 1000, nonCompliantRevenue: 50 },
  }).ineligible,
  false,
  "دخل غير مباح 5% ضمن الحد",
);
assert.deepEqual(
  evaluateFinancialScreens({}).map((item) => item.passed),
  [null, null, null, null],
  "لا تقييم دون مقام",
);
assert.equal(
  evaluateFinancialScreens({ totalAssets: 0, interestBearingDebt: 100 }, "totalAssets")[0]?.passed,
  null,
  "مقام صفري لا يُقيَّم",
);

// مقام نسبتي الديون والودائع: القيمة السوقية افتراضًا، وإجمالي الأصول اختيارًا.
const mixedFigures = { marketCap: 2000, totalAssets: 1000, interestBearingDebt: 450 };
assert.equal(
  calculateAssessment(strong, openGate, "S1", { figures: mixedFigures }).ineligible,
  false,
  "دين 450 من قيمة سوقية 2000 = 22.5% ضمن الحد",
);
assert.equal(
  calculateAssessment(strong, openGate, "S1", { figures: mixedFigures, basis: "totalAssets" })
    .ineligible,
  true,
  "الدين نفسه 45% من إجمالي الأصول يتجاوز الحد",
);
assert.equal(
  evaluateFinancialScreens({ totalAssets: 1000, interestBearingDebt: 450 })[0]?.passed,
  null,
  "بلا قيمة سوقية لا يُقيَّم الدين على المقام الافتراضي",
);

// حد السيولة شرط تداول لا يُسقط الأهلية.
const liquid = calculateAssessment(flat(90), openGate, "S1", {
  figures: { totalAssets: 1000, cashAndReceivables: 800 },
});
assert.equal(liquid.ineligible, false, "غلبة النقود والديون لا تُسقط الأهلية");
assert.equal(liquid.tradingAtParOnly, true, "لكنها تقيّد التداول بالقيمة الاسمية");
assert.equal(liquid.failedScreens.length, 0);
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", {
    figures: { totalAssets: 1000, cashAndReceivables: 700 },
  }).tradingAtParOnly,
  false,
  "70% بالضبط ضمن الحد",
);

// مهلة التصحيح: لتجاوز الفرز وحده، بتاريخ مستقبلي في حدود المهلة القصوى.
const now = new Date("2026-10-01T00:00:00Z");
const overDebt = {
  figures: { totalAssets: 1000, interestBearingDebt: 350 },
  basis: "totalAssets" as const,
  now,
};
const remediated = calculateAssessment(flat(90), openGate, "S1", {
  ...overDebt,
  specialState: "under_remediation",
  remediationDeadline: "2027-03-31",
});
assert.equal(remediated.ineligible, false, "المهلة تُبقي الشركة في التصنيف");
assert.equal(remediated.verdict, "under_remediation");
assert.equal(remediated.remediation?.deadline, "2027-03-31");
assert.equal(remediated.score, 90);
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", {
    ...overDebt,
    specialState: "under_remediation",
    remediationDeadline: "2026-09-30",
  }).ineligible,
  true,
  "تاريخ منتهٍ لا يمنح مهلة",
);
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", {
    ...overDebt,
    specialState: "under_remediation",
    remediationDeadline: "2027-10-02",
  }).ineligible,
  true,
  "مهلة تتجاوز 12 شهرًا مرفوضة",
);
const gateAndScreens = calculateAssessment(flat(90), { ...openGate, riba: false }, "S1", {
  ...overDebt,
  specialState: "under_remediation",
  remediationDeadline: "2027-03-31",
});
assert.equal(gateAndScreens.verdict, "rejected", "لا مهلة مع إخفاق بوابة النشاط");
assert.equal(gateAndScreens.ineligibleReason, "gate");
const noBreach = calculateAssessment(flat(90), openGate, "S1", {
  now,
  specialState: "under_remediation",
  remediationDeadline: "2027-03-31",
});
assert.equal(noBreach.special, null, "لا حالة تصحيح بلا تجاوز");
assert.equal(noBreach.verdict, "approved");

// المستوى الأدنى وصفٌ لمخاطر عالية لا حكمٌ بالتحريم.
assert.equal(complianceLevelForScore(30).id, "high_risk");
assert.equal(complianceLevelForScore(30).ar.includes("محظور"), false);

// الحالتان الخاصتان مستقلتان عن نطاقات الدرجات.
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", { specialState: "under_study" }).verdict,
  "referred",
);
assert.equal(
  calculateAssessment(flat(90), openGate, "S1", { specialState: "out_of_scope" }).verdict,
  "not_applicable",
);
assert.equal(
  calculateAssessment(flat(90), { ...openGate, riba: false }, "S1", { specialState: "under_study" })
    .verdict,
  "rejected",
  "إخفاق البوابة يتقدّم على الحالة الخاصة",
);

// التطهير من العائد الموزّع لا من أصل الاستثمار.
assert.deepEqual(calculatePurification(1000, 30, 200), { ratio: 3, purificationAmount: 6 });
assert.deepEqual(calculatePurification(0, 30, 200), { ratio: 0, purificationAmount: 0 });
assert.deepEqual(
  calculatePurification(1000, 5000, 200),
  { ratio: 100, purificationAmount: 200 },
  "الدخل غير المباح لا يتجاوز الإيرادات",
);

assert.equal(weightedScore(flat(80)), 80);

console.log("جميع فحوصات منطق التقييم ناجحة");
