import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Save, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell } from "./SiteShell";
import { getMyRoles } from "@/lib/waqf-review.functions";
import { listReviewerModels, saveReviewerModel } from "@/lib/reviewer-models.functions";
import { calculateModel, documentKinds, documentText, documentTitles, financialFields, initialModel, modelPayloadSchema, modelReady, modelTemplates } from "@/lib/reviewer-models";
import type { ModelKey, ModelPayload } from "@/lib/reviewer-models";
import { axes, gateChecks, ineligibleLabels, methodologyVersion, riskTiers, screenBases, screenLabel } from "@/lib/ssesba-data";
import type { Lang } from "@/lib/ssesba-data";

type SavedRow = Awaited<ReturnType<typeof listReviewerModels>>[number];

export function ReviewerModelsPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const t = (ar: string, english: string) => en ? english : ar;
  const qc = useQueryClient();
  const fetchRoles = useServerFn(getMyRoles);
  const fetchFiles = useServerFn(listReviewerModels);
  const save = useServerFn(saveReviewerModel);
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const allowed = roles.data?.some(r => ["admin", "reviewer", "expert"].includes(r)) ?? false;
  const files = useQuery({ queryKey: ["reviewer-models"], queryFn: () => fetchFiles(), enabled: allowed });
  const [key, setKey] = useState<ModelKey>("dates");
  const [payload, setPayload] = useState<ModelPayload>(() => initialModel("dates", lang));
  const [id, setId] = useState<string>();
  const [version, setVersion] = useState(1);
  const [stored, setStored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [documentKind, setDocumentKind] = useState<(typeof documentKinds)[number]>("foundation");
  const [evaluated, setEvaluated] = useState(false);
  const result = evaluated && modelReady(payload) ? calculateModel(payload) : null;
  const template = modelTemplates.find(x => x.key === key) ?? modelTemplates[0];
  const field = "mt-2 h-11 w-full rounded-md border bg-background px-3";

  function edit(next: ModelPayload) { setPayload(next); setDirty(true); setEvaluated(false); }
  function canSwitch() { return !dirty || window.confirm(t("توجد تغييرات غير محفوظة. هل تريد تركها؟", "Discard unsaved changes?")); }
  function choose(next: ModelKey) {
    if (!canSwitch()) return;
    setKey(next); setPayload(initialModel(next, lang)); setId(undefined); setVersion(1); setStored(false); setDirty(false); setEvaluated(false);
  }
  function open(row: SavedRow) {
    if (!canSwitch()) return;
    const parsed = modelPayloadSchema.safeParse(row.payload);
    const model = modelTemplates.find(x => x.key === row.template_key);
    if (!parsed.success || !model) { toast.error(t("تعذر فتح الملف", "Could not open file")); return; }
    setPayload(parsed.data); setKey(model.key); setId(row.id); setVersion(row.version); setStored(true); setDirty(false); setEvaluated(Boolean(row.result));
  }
  async function persist(evaluate: boolean) {
    setBusy(true);
    try {
      const row = await save({ data: { ...(id ? { id } : {}), version, templateKey: key, language: lang, payload, evaluate } });
      setId(row.id); setVersion(row.version); setStored(true); setDirty(false); setEvaluated(evaluate);
      await qc.invalidateQueries({ queryKey: ["reviewer-models"] });
      toast.success(t("حُفظ الملف في حسابك", "File saved to your account"));
    } catch { toast.error(t("تعذر الحفظ. تحقق من الصلاحية والبيانات وأعد فتح أحدث نسخة.", "Could not save. Check access and details, then reopen the latest version.")); }
    finally { setBusy(false); }
  }
  function download(kind: (typeof documentKinds)[number]) {
    const blob = new Blob(["\ufeff", documentText(payload, kind, lang, version)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `SSESBA-${key}-${kind}-v${version}.txt`; anchor.click(); URL.revokeObjectURL(url);
  }
  const verdicts: Record<string, string> = {
    approved: t("مقبول وفق المصفوفة — استرشادي", "Accepted by matrix — indicative"),
    approved_conditional: t("مقبول بقيود — استرشادي", "Accepted with restrictions — indicative"),
    conditional: t("قبول مشروط — استرشادي", "Conditional acceptance — indicative"),
    remediation: t("يتطلب معالجة — استرشادي", "Remediation required — indicative"),
    rejected: t("غير مقبول وفق المصفوفة — استرشادي", "Not accepted by matrix — indicative"),
  };
  return <SiteShell lang={lang} eyebrow={t("ملفات المراجع", "Reviewer files")} title={t("نماذج التقييم الموثّقة", "Documented assessment models")}>
    <section className="mx-auto max-w-7xl px-5 py-8">
      <Link to={en ? "/en/review" : "/review"} className="text-sm underline">{t("العودة إلى لوحة المراجعة", "Back to review desk")}</Link>
      {roles.isLoading && <p className="mt-6" role="status">{t("جارٍ التحقق من الصلاحية…", "Checking access…")}</p>}
      {roles.error && <p className="mt-6 text-destructive" role="alert">{t("تعذر التحقق من الحساب", "Could not verify account")}</p>}
      {!roles.isLoading && !roles.error && !allowed && <p className="mt-6 border-s-2 border-brand-gold ps-4">{t("تحتاج صلاحية مراجع أو خبير يمنحها مشرف المنصة.", "An administrator must grant reviewer or expert access.")}</p>}
      {allowed && <>
        <p className="my-6 border-s-2 border-brand-gold ps-4 text-sm leading-7 text-muted-foreground">{t("نماذج تشغيلية قابلة للاستخدام على كيانات حقيقية، وليست تقييمات مكتملة أو شهادات اعتماد. لم تُزوّد المنصة بوثائق كيان بعينه؛ تُستكمل بأدلته الفعلية. ملفاتك خاصة بحسابك، والنصوص المحفوظة تبقى بلغتها الأصلية.", "Operational models for real entities, not completed assessments or accreditation certificates. No entity-specific records have been supplied; complete each file with actual evidence. Files are private to your account; saved text retains its original language.")}</p>
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="border-e pe-5">
            <h2 className="font-semibold">{t("نماذج جديدة", "New models")}</h2>
            <div className="mt-3 grid gap-2">{modelTemplates.map(model => <Button key={model.key} variant={key === model.key && !stored ? "default" : "outline"} className="h-auto justify-start whitespace-normal py-3 text-start" onClick={() => choose(model.key)}><FileText className="shrink-0" />{model.title[lang]}</Button>)}</div>
            <h2 className="mt-8 font-semibold">{t("ملفاتي المحفوظة", "My saved files")}</h2>
            {files.isLoading && <p className="mt-3 text-sm">{t("جارٍ التحميل…", "Loading…")}</p>}
            {files.error && <p role="alert" className="mt-3 text-sm text-destructive">{t("تعذر تحميل الملفات", "Could not load files")}</p>}
            {files.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{t("لا توجد ملفات محفوظة", "No saved files")}</p>}
            <div className="mt-3 grid gap-2">{files.data?.map(row => <Button variant={id === row.id ? "secondary" : "ghost"} key={row.id} onClick={() => open(row)} className="h-auto justify-start whitespace-normal py-3 text-start">{row.title} · v{row.version}</Button>)}</div>
          </aside>
          <div className="min-w-0">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-5"><div><h2 className="text-xl font-semibold">{template.title[lang]}</h2><p className="mt-1 text-sm text-muted-foreground">{template.code} · {methodologyVersion} · v{version}</p></div><span className="text-sm text-muted-foreground" role="status">{dirty ? t("تغييرات غير محفوظة", "Unsaved changes") : stored ? t("محفوظ في حسابك", "Saved to your account") : t("مسودة جديدة", "New draft")}</span></header>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(["company", "period", "currency"] as const).map((k, i) => <label key={k} className="text-sm font-medium">{[t("اسم الكيان", "Entity name"), t("فترة القوائم المالية", "Financial reporting period"), t("العملة", "Currency")][i]}<Input value={payload[k]} className="mt-2" onChange={e => edit({ ...payload, [k]: e.target.value })} maxLength={k === "company" ? 200 : k === "period" ? 100 : 30} /></label>)}
              <label className="text-sm font-medium">{t("وصف النشاط الفعلي", "Actual activity")}<Textarea value={payload.activity} className="mt-2" maxLength={3000} onChange={e => edit({ ...payload, activity: e.target.value })} /></label>
            </div>
            <section className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold">{t("الوثائق الثلاث", "Three supporting documents")}</h3>
              <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label={t("الوثائق", "Documents")}>{documentKinds.map(kind => <Button key={kind} role="tab" aria-selected={kind === documentKind} variant={kind === documentKind ? "default" : "outline"} onClick={() => setDocumentKind(kind)}>{documentTitles[kind][lang]}</Button>)}</div>
              <label className="mt-4 block text-sm font-medium" htmlFor="model-document">{documentTitles[documentKind][lang]}</label>
              <Textarea id="model-document" className="mt-2 min-h-80 leading-7" maxLength={20000} value={payload.documents[documentKind]} onChange={e => edit({ ...payload, documents: { ...payload.documents, [documentKind]: e.target.value } })} />
              <div className="mt-3 flex flex-wrap gap-2">{documentKinds.map(kind => <Button variant="outline" key={kind} onClick={() => download(kind)}><Download />{documentTitles[kind][lang]} · TXT</Button>)}</div>
            </section>
            <section className="mt-8 border-t pt-6"><h3 className="text-lg font-semibold">{t("بوابة الأهلية وأدلتها", "Eligibility gate and evidence")}</h3><div className="mt-4 grid gap-5">{gateChecks.map(check => <div key={check.id} className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <label className="text-sm font-medium">{check[lang]}<select className={field} value={payload.gates[check.id] === null ? "unknown" : payload.gates[check.id] ? "yes" : "no"} onChange={e => edit({ ...payload, gates: { ...payload.gates, [check.id]: e.target.value === "unknown" ? null : e.target.value === "yes" } })}><option value="unknown">{t("غير متحقق بعد", "Not verified yet")}</option><option value="yes">{t("متحقق", "Met")}</option><option value="no">{t("غير متحقق — مخالفة مثبتة", "Not met — verified breach")}</option></select></label>
              <label className="text-sm">{t("مرجع الدليل والتعليل", "Evidence reference and reasoning")}<Textarea className="mt-2" maxLength={2000} value={payload.gateEvidence[check.id]} onChange={e => edit({ ...payload, gateEvidence: { ...payload.gateEvidence, [check.id]: e.target.value } })} /></label>
            </div>)}</div></section>
            <section className="mt-8 border-t pt-6"><h3 className="text-lg font-semibold">{t("الفرز المالي", "Financial screening")}</h3><label className="mt-4 block text-sm font-medium">{t("مقام الديون والودائع", "Debt and deposit denominator")}<select className={field} value={payload.basis} onChange={e => edit({ ...payload, basis: e.target.value === "marketCap" ? "marketCap" : "totalAssets" })}>{screenBases.map(b => <option key={b.id} value={b.id}>{b[lang]}</option>)}</select></label><div className="mt-4 grid gap-4 sm:grid-cols-2">{financialFields.map(f => <label key={f.key} className="text-sm">{f[lang]}<Input className="mt-2" type="number" min="0" max="1000000000000000" step="any" value={payload.figures[f.key] ?? ""} onChange={e => edit({ ...payload, figures: { ...payload.figures, [f.key]: e.target.value === "" ? null : Number(e.target.value) } })} /></label>)}</div></section>
            <section className="mt-8 border-t pt-6"><h3 className="text-lg font-semibold">{t("المحاور الستة وتعليل الدرجات", "Six axes and score reasoning")}</h3><div className="mt-4 grid gap-5">{axes.map(axis => <div key={axis.id} className="grid gap-3 sm:grid-cols-[1fr_2fr]"><label className="text-sm font-medium">{axis[lang]} · {axis.weight}%<Input className="mt-2" type="number" min="0" max="100" step="0.1" value={payload.scores[axis.id] ?? ""} onChange={e => edit({ ...payload, scores: { ...payload.scores, [axis.id]: e.target.value === "" ? null : Number(e.target.value) } })} /></label><label className="text-sm">{t("الأدلة وتعليل الدرجة", "Evidence and score rationale")}<Textarea className="mt-2" maxLength={2000} value={payload.axisEvidence[axis.id]} onChange={e => edit({ ...payload, axisEvidence: { ...payload.axisEvidence, [axis.id]: e.target.value } })} /></label></div>)}</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">{t("مرتبة المخاطر", "Risk tier")}<select className={field} value={payload.risk} onChange={e => edit({ ...payload, risk: riskTiers.find(r => r.id === e.target.value)?.id ?? "S4" })}>{riskTiers.map(r => <option key={r.id} value={r.id}>{r.id} — {r[lang]}</option>)}</select></label><label className="text-sm font-medium">{t("تعليل المخاطر والإحالات", "Risk rationale and referrals")}<Textarea className="mt-2" maxLength={2000} value={payload.riskReason} onChange={e => edit({ ...payload, riskReason: e.target.value })} /></label></div>
            </section>
            <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => persist(false)}><Save />{t("حفظ المسودة", "Save draft")}</Button><Button disabled={busy || !modelReady(payload)} onClick={() => persist(true)}><ClipboardCheck />{busy ? t("جارٍ الحفظ…", "Saving…") : t("حساب وحفظ التقييم", "Calculate and save assessment")}</Button></div>
            {!modelReady(payload) && <p className="mt-3 text-sm text-muted-foreground">{t("التقييم معلق حتى استكمال بيانات الكيان والوثائق وأدلة البوابة والمحاور والأرقام المالية وتعليل المخاطر.", "Assessment pending entity details, documents, gate and axis evidence, financial figures and risk rationale.")}</p>}
            {result && <section aria-label={t("نتيجة التقييم", "Assessment result")} className="mt-8 border-t-2 border-brand-gold pt-6"><h3 className="text-xl font-semibold">{t("نتيجة استرشادية محفوظة", "Saved indicative result")}</h3><div className="mt-5 grid gap-5 sm:grid-cols-3"><div><p className="text-sm text-muted-foreground">{t("الدرجة المرجحة", "Weighted score")}</p><b className="text-3xl">{result.score}/100</b></div><div><p className="text-sm text-muted-foreground">{t("مستوى الامتثال العددي", "Numerical compliance level")}</p><b>{result.level[lang]}</b></div><div><p className="text-sm text-muted-foreground">{t("الحكم وفق المخاطر والبوابة", "Verdict after risk and gate")}</p><b>{result.ineligibleReason ? ineligibleLabels[result.ineligibleReason][lang] : verdicts[result.verdict]}</b></div></div><div className="mt-6 grid gap-3">{result.screens.map(s => <p key={s.screen.id} className="text-sm">{screenLabel(s.screen, payload.basis, lang)}: {s.ratio ?? "—"}% · {s.passed === null ? "—" : s.passed ? t("ضمن الحد", "Within limit") : t("تجاوز الحد", "Limit exceeded")}</p>)}</div><p className="mt-4 text-sm text-muted-foreground">{t("النتيجة الحسابية لا تُغني عن مراجعة الهيئة الشرعية ولا تمنح اعتمادًا نهائيًا.", "The calculated result does not replace Shariah-board review or grant final accreditation.")}</p></section>}
          </div>
        </div>
      </>}
    </section>
  </SiteShell>;
}