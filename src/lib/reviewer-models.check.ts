import assert from "node:assert/strict";
import { axes, gateChecks } from "./ssesba-data";
import { calculateModel, documentKinds, initialModel, modelPayloadSchema, modelReady, modelTemplates } from "./reviewer-models";
for (const template of modelTemplates) {
  for (const lang of ["ar", "en"] as const) {
    const p = initialModel(template.key, lang);
    assert.equal(documentKinds.length, 3);
    assert.equal(Object.keys(p.documents).length, 3);
    assert.ok(documentKinds.every(k => p.documents[k].length >= 100));
    assert.equal(modelReady(p), false, "A template without actual evidence cannot be assessed");
  }
}
const p = initialModel("dates", "en");
p.company = "Test evidence-backed farm"; p.period = "2026"; p.currency = "EGP"; p.risk = "S1"; p.riskReason = "Verified standard contracts";
for (const c of gateChecks) { p.gates[c.id] = true; p.gateEvidence[c.id] = "Verified contract register"; }
for (const a of axes) { p.scores[a.id] = 80; p.axisEvidence[a.id] = "Verified supporting document"; }
p.figures = { totalAssets: 1000000, marketCap: null, totalRevenue: 500000, interestBearingDebt: 0, interestBearingDeposits: 0, nonCompliantRevenue: 10000, cashAndReceivables: 100000 };
assert.equal(modelReady(p), true);
assert.equal(calculateModel(p).score, 80);
assert.equal(calculateModel(p).level.id, "conditional");
for (const k of documentKinds) {
  assert.equal(modelReady({ ...p, documents: { ...p.documents, [k]: "" } }), false, `Missing ${k} blocks calculation`);
}
assert.equal(modelReady({ ...p, gates: { ...p.gates, riba: null } }), false);
assert.equal(modelReady({ ...p, gateEvidence: { ...p.gateEvidence, riba: "" } }), false);
assert.equal(modelReady({ ...p, axisEvidence: { ...p.axisEvidence, contracts: "" } }), false);
assert.equal(calculateModel({ ...p, gates: { ...p.gates, riba: false } }).score, 0);
assert.equal(modelPayloadSchema.safeParse({ ...p, scores: { ...p.scores, contracts: 101 } }).success, false);
assert.equal(modelReady({ ...p, figures: { ...p.figures, totalRevenue: 0 } }), false);
console.log("Reviewer model document and calculation tests passed");