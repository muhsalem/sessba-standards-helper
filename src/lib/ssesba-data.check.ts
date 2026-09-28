/**
 * فحص منطق الحساب: يُشغَّل يدويًا عبر `bun run src/lib/ssesba-data.check.ts`.
 * يتحقق من الأوزان، عتبات النطاقات، بوابة الأهلية، ومصفوفة الحكم.
 */
import assert from "node:assert/strict";
import { axes, calculateAssessment, complianceLevelForScore, gateChecks, structuralFailureThreshold, verdictMatrix, type RiskTier } from "./ssesba-data";

const openGate = Object.fromEntries(gateChecks.map((c) => [c.id, true]));
const flat = (value: number) => Object.fromEntries(axes.map((a) => [a.id, value]));

assert.equal(axes.reduce((sum, a) => sum + a.weight, 0), 100, "مجموع الأوزان يجب أن يكون 100");

assert.equal(calculateAssessment(flat(100), openGate, "S1").score, 100);
assert.equal(calculateAssessment(flat(0), openGate, "S1").score, 0);

const bands: Array<[number, string]> = [[100, "compliant"], [85, "compliant"], [84, "conditional"], [75, "conditional"], [74, "remediation"], [60, "remediation"], [59, "non_compliant"]];
for (const [score, band] of bands) assert.equal(calculateAssessment(flat(score), openGate, "S1").band, band, `النطاق عند ${score}`);

const levels: Array<[number, string]> = [[100, "full"], [95, "full"], [94, "substantial"], [85, "substantial"], [84, "conditional"], [75, "conditional"], [74, "structural_remediation"], [60, "structural_remediation"], [59, "non_compliant"], [45, "non_compliant"], [44, "prohibited"], [0, "prohibited"]];
for (const [score, level] of levels) assert.equal(complianceLevelForScore(score).id, level, `المستوى السداسي عند ${score}`);

for (const [band, row] of Object.entries(verdictMatrix)) {
  const score = band === "compliant" ? 90 : band === "conditional" ? 80 : band === "remediation" ? 65 : 40;
  for (const tier of ["S1", "S2", "S3", "S4"] as RiskTier[]) {
    assert.equal(calculateAssessment(flat(score), openGate, tier).verdict, row[tier], `الحكم ${band}/${tier}`);
  }
}

for (const check of gateChecks) {
  const result = calculateAssessment(flat(100), { ...openGate, [check.id]: false }, "S1");
  assert.equal(result.ineligible, true, `تخلّف ${check.id} يُسقط الأهلية`);
  assert.equal(result.verdict, "rejected");
  assert.equal(result.score, 0);
  assert.equal(result.level.id, "prohibited");
}

assert.equal(calculateAssessment(flat(40), openGate, "S1").structuralFailure, true);
assert.equal(calculateAssessment(flat(structuralFailureThreshold), openGate, "S1").structuralFailure, false);
assert.equal(calculateAssessment({ ...flat(90), contracts: 20 }, openGate, "S1").flagged.length, 1, "تنبيه المحور المنخفض");

console.log("جميع فحوصات منطق التقييم ناجحة");
