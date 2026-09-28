import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Building2, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  axes, brand, calculateAssessment, complianceLevels, copy, gateChecks, riskTiers, structuralFailureThreshold,
  type AssessmentMode, type GateState, type Lang, type RiskTier,
} from "@/lib/ssesba-data";
import { getAssessmentExamples, suggestHospitalAssessment } from "@/lib/ssesba.functions";

type Example = Awaited<ReturnType<typeof getAssessmentExamples>>[number];

const labels = {
  ar: {
    title: "تقييم نماذج قطاعية واقعية", eyebrow: "تطبيق واقعي تفاعلي",
    desc: "اختر نموذج قطاع واقعيًا، فتُطبَّق بوادر الأهلية ودرجات المحاور تلقائيًا وتظهر النتيجة فورًا. راجع اختبارات الأهلية المستقلة أولًا، ثم عدّل درجات المحاور وفق الأدلة المتاحة.",
    model: "نموذج القطاع", loadingModels: "جاري تحميل النماذج…", reset: "إعادة تعيين النموذج",
    gate: "بوابة الأهلية", gateNote: "اختبارات ملزمة مستقلة؛ تخلّف أي اختبار يُسقط الأهلية ولا تعوّضه درجات المحاور.",
    gateFailed: "تخلّف اختبار أهلية واحد أو أكثر:", risk: "مستوى المخاطر الشرعية",
    riskNote: "يحدده المراجع المختص؛ لا يستنتجه النظام آليًا.", result: "النتيجة المركبة",
    expert: "خبير", self: "ذاتي", ai_review: "اقتراح AI", analyze: "اقتراح الدرجات", evidence: "وصف النشاط والأدلة",
    full: "متوافق كليًا", compliant: "متوافق", conditional: "متوافق بشروط", remediation: "يحتاج معالجة",
    non_compliant: "غير متوافق", ineligible: "غير مؤهل", approved: "معتمد", approved_conditional: "معتمد بشروط", rejected: "مرفوض",
    level: "مستوى الامتثال السداسي", band: "النطاق التشغيلي", verdictLabel: "الحكم النهائي بعد المخاطر", weight: "الوزن", structural: "إخفاق بنيوي: الدرجة أقل من 45.",
    flagged: "محاور دون 45 تستوجب مراجعة الأدلة (تنبيه فقط؛ لا يوجد حدٌّ أدنى معتمد لكل محور في هذه النسخة):",
    how: "كيف تُقرأ النتيجة: تُطبَّق بوابة الأهلية أولًا، ثم يُحسب متوسط المحاور الستة المرجّح، فتحدد الدرجة أحد مستويات الامتثال الستة. بعد ذلك يُدمج نطاق المستوى مع مخاطر S1–S4 لإصدار الحكم النهائي.",
  },
  en: {
    title: "Real sector model assessments", eyebrow: "Interactive real-world application",
    desc: "Pick a real sector model; its eligibility gate and axis scores load automatically and the result appears instantly. Review the independent eligibility tests first, then adjust each axis using available evidence.",
    model: "Sector model", loadingModels: "Loading models…", reset: "Reset model",
    gate: "Eligibility gate", gateNote: "Independent binding tests; failing any one removes eligibility and cannot be offset by axis scores.",
    gateFailed: "One or more eligibility tests failed:", risk: "Shariah risk tier",
    riskNote: "Selected by a qualified reviewer; the system does not infer it automatically.", result: "Combined result",
    expert: "Expert", self: "Self", ai_review: "AI suggestion", analyze: "Suggest scores", evidence: "Activity and evidence description",
    full: "Full compliance", compliant: "Compliant", conditional: "Conditionally compliant", remediation: "Needs remediation",
    non_compliant: "Non-compliant", ineligible: "Ineligible", approved: "Approved", approved_conditional: "Approved with conditions", rejected: "Rejected",
    level: "Six-level compliance level", band: "Operational band", verdictLabel: "Final verdict after risk", weight: "Weight", structural: "Structural failure: score below 45.",
    flagged: "Axes below 45 require evidence review (advisory only; this version defines no approved per-axis floor):",
    how: "Reading the result: the eligibility gate applies first, then the six weighted axes produce a score and one of six compliance levels. Its operational band is then combined with S1–S4 risk to reach the final verdict.",
  },
} as const;

function scoreTone(score: number) {
  if (score >= 85) return "bg-brand-emerald-soft text-brand-emerald";
  if (score >= 75) return "bg-brand-parchment text-brand-navy";
  if (score >= structuralFailureThreshold) return "bg-brand-gold/20 text-brand-gold";
  return "bg-destructive/10 text-destructive";
}

export function AssessmentPage({ lang }: { lang: Lang }) {
  const t = labels[lang];
  const [mode, setMode] = useState<AssessmentMode>("expert");
  const [gate, setGate] = useState<GateState>(Object.fromEntries(gateChecks.map((c) => [c.id, true])));
  const [risk, setRisk] = useState<RiskTier>("S2");
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(axes.map((a) => [a.id, a.hospital])));
  const [description, setDescription] = useState(lang === "ar"
    ? "مستشفى عام، إيراداته من الخدمات الطبية والصيدلية المباحة، لديه تمويل تقليدي محدود، ولجنة حوكمة داخلية وتقارير مالية دورية."
    : "A general hospital earning revenue from permissible clinical and pharmacy services, with limited conventional financing, internal governance, and periodic financial reporting.");
  const [aiNote, setAiNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [examples, setExamples] = useState<Example[]>([]);
  const [exampleId, setExampleId] = useState("");
  const suggest = useServerFn(suggestHospitalAssessment);
  const loadExamples = useServerFn(getAssessmentExamples);
  const result = useMemo(() => calculateAssessment(scores, gate, risk), [scores, gate, risk]);
  const failed = gateChecks.filter((c) => gate[c.id] !== true);
  const current = examples.find((e) => e.id === exampleId);

  function applyExample(example: Example) {
    setExampleId(example.id);
    setGate(Object.fromEntries(gateChecks.map((c) => [c.id, (example.gate_state as GateState)?.[c.id] === true])));
    const raw = (example.scores ?? {}) as Record<string, number>;
    setScores(Object.fromEntries(axes.map((a) => [a.id, Number(raw[a.id] ?? 0)])));
    setRisk((example.risk_tier as RiskTier) ?? "S2");
    setDescription(lang === "ar" ? example.description_ar : example.description_en);
    setAiNote("");
  }

  useEffect(() => {
    let active = true;
    loadExamples()
      .then((rows) => {
        if (!active || rows.length === 0) return;
        setExamples(rows);
        const first = rows[0]!;
        setExampleId(first.id);
        setGate(Object.fromEntries(gateChecks.map((c) => [c.id, (first.gate_state as GateState)?.[c.id] === true])));
        const raw = (first.scores ?? {}) as Record<string, number>;
        setScores(Object.fromEntries(axes.map((a) => [a.id, Number(raw[a.id] ?? 0)])));
        setRisk((first.risk_tier as RiskTier) ?? "S2");
        setDescription(lang === "ar" ? first.description_ar : first.description_en);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load sector models"));
    return () => { active = false; };
  }, [loadExamples, lang]);


  async function runAI() {
    setBusy(true); setError("");
    try {
      const r = await suggest({ data: { description } });
      setScores(Object.fromEntries(axes.map((a, i) => [a.id, r.scores[i] ?? a.hospital])));
      setAiNote(r.note);
    } catch (e) { setError(e instanceof Error ? e.message : "AI request failed"); }
    finally { setBusy(false); }
  }

  const bandLabel = result.ineligible ? t.ineligible : (t[result.band as keyof typeof t] as string);
  const verdict = t[result.verdict as keyof typeof t] as string;

  return (
    <SiteShell lang={lang} eyebrow={t.eyebrow} title={t.title}>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b pb-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-brand-gold">
              <Building2 /><span className="font-semibold">{current ? `${lang === "ar" ? current.activity_ar : current.activity_en} · ${current.isic_code}` : t.loadingModels}</span>
            </div>
            <div className="mb-4 max-w-sm">
              <Label>{t.model}</Label>
              <Select value={exampleId} onValueChange={(v) => { const e = examples.find((x) => x.id === v); if (e) applyExample(e); }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder={t.loadingModels} /></SelectTrigger>
                <SelectContent>{examples.map((e) => <SelectItem key={e.id} value={e.id}>{lang === "ar" ? e.title_ar : e.title_en}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="leading-7 text-muted-foreground">{current ? (lang === "ar" ? current.description_ar : current.description_en) : t.desc}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{brand[lang].short} — {brand[lang].full}</p>
          </div>
          <Tabs value={mode} onValueChange={(v) => setMode(v as AssessmentMode)}>
            <TabsList className="h-11">
              <TabsTrigger value="expert">{t.expert}</TabsTrigger>
              <TabsTrigger value="self">{t.self}</TabsTrigger>
              <TabsTrigger value="ai_review">{t.ai_review}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <section className="space-y-7">
            <div className="rounded-md border bg-card p-5">
              <h2 className="text-base font-semibold">{t.gate}</h2>
              <p className="mt-3 flex items-start gap-2 rounded-md border border-brand-gold/50 bg-brand-parchment p-3 text-sm font-medium leading-6 text-brand-navy">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-brand-gold" />{t.gateNote}
              </p>
              <div className="mt-4 space-y-3">
                {gateChecks.map((check) => (
                  <div key={check.id} className="flex items-start gap-3">
                    <Checkbox id={check.id} checked={gate[check.id] === true} onCheckedChange={(v) => setGate({ ...gate, [check.id]: v === true })} className="mt-1" />
                    <Label htmlFor={check.id} className="text-sm leading-6 font-normal">{check[lang]}</Label>
                  </div>
                ))}
              </div>
              {failed.length > 0 && (
                <div role="alert" className="mt-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  <p className="font-semibold">{t.gateFailed}</p>
                  <ul className="mt-2 list-disc space-y-1 ps-5">{failed.map((c) => <li key={c.id}>{c[lang]}</li>)}</ul>
                </div>
              )}
            </div>

            {mode === "ai_review" && (
              <div className="rounded-md border border-brand-gold/40 bg-brand-parchment p-5">
                <Label>{t.evidence}</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-3 min-h-28 bg-background" />
                <Button onClick={runAI} disabled={busy} className="mt-3 bg-brand-navy text-primary-foreground"><Sparkles />{busy ? "…" : t.analyze}</Button>
                {aiNote && <p role="status" className="mt-3 text-sm leading-6">{aiNote}</p>}
                {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              </div>
            )}

            <div className="space-y-4">
              {axes.map((axis) => {
                const score = scores[axis.id] ?? axis.hospital;
                const low = score < structuralFailureThreshold;
                return (
                  <div key={axis.id} className={`rounded-md border bg-card p-5 ${low ? "border-destructive/50" : ""}`}>
                    <div className="mb-4 flex items-baseline justify-between">
                      <div>
                        <h3 id={`axis-${axis.id}-label`} className="font-semibold">{axis[lang]}</h3>
                        <p className="text-xs text-muted-foreground">{t.weight} {axis.weight}%</p>
                      </div>
                      <output className={`rounded-md px-2.5 py-1 font-mono text-xl font-bold ${scoreTone(score)}`}>{score}</output>
                    </div>
                    <Slider aria-labelledby={`axis-${axis.id}-label`} aria-valuetext={`${score} / 100`} value={[score]} max={100} step={1} onValueChange={(v) => setScores({ ...scores, [axis.id]: v[0] ?? 0 })} />
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div aria-live="polite" aria-atomic="true" className="overflow-hidden rounded-md border bg-card shadow-sm">
              <div className="bg-brand-navy p-6 text-primary-foreground">
                <p className="text-sm text-brand-gold-soft">{t.result}</p>
                <div className="mt-2 flex items-end justify-between">
                  <strong className="font-serif text-5xl">{result.score}</strong><span className="pb-1 text-sm">/ 100</span>
                </div>
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs text-muted-foreground">{t.level}</p>
                  <p className="mt-1 text-xl font-semibold">{result.ineligible ? t.ineligible : result.level[lang]}</p>
                  {result.structuralFailure && <p className="mt-1 text-sm text-destructive">{t.structural}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 border-y py-4 text-xs sm:grid-cols-3">
                  {complianceLevels.map((level) => <div key={level.id} className={`rounded-md border p-2 ${result.level.id === level.id && !result.ineligible ? "border-brand-gold bg-brand-parchment font-semibold" : "border-border text-muted-foreground"}`}><span className="block">{level[lang]}</span><span className="font-mono">{level.min === 0 ? "<45" : `${level.min}–${level.max}`}</span></div>)}
                </div>
                <div><p className="text-xs text-muted-foreground">{t.band}</p><p className="mt-1 font-semibold">{bandLabel}</p></div>
                <div>
                  <Label>{t.risk}</Label>
                   <Select value={risk} onValueChange={(v) => setRisk(v as RiskTier)}>
                     <SelectTrigger className="mt-2" aria-describedby="risk-guidance"><SelectValue /></SelectTrigger>
                     <SelectContent>{riskTiers.map((tier) => <SelectItem key={tier.id} value={tier.id}>{tier.id} — {tier[lang]}</SelectItem>)}</SelectContent>
                  </Select>
                   <p id="risk-guidance" className="mt-2 text-xs text-muted-foreground">{t.riskNote} {riskTiers.find((tier) => tier.id === risk)?.[lang === "ar" ? "arHelp" : "enHelp"]}</p>
                </div>
                <div className={`rounded-md p-4 ${result.verdict === "rejected" ? "bg-destructive/10 text-destructive" : "bg-brand-parchment text-brand-navy"}`}>
                  {result.verdict === "rejected" ? <AlertTriangle /> : <CheckCircle2 />}
                  <p className="mt-2 text-xs font-medium opacity-75">{t.verdictLabel}</p>
                  <p className="mt-2 text-lg font-bold">{verdict}</p>
                </div>
                {result.flagged.length > 0 && (
                  <div className="rounded-md border border-brand-gold/40 bg-brand-parchment/60 p-4 text-xs leading-5">
                    <p className="font-semibold">{t.flagged}</p>
                    <p className="mt-1">{result.flagged.map((a) => a[lang]).join(lang === "ar" ? "، " : ", ")}</p>
                  </div>
                )}
                <p className="border-t pt-4 text-sm leading-6 text-foreground/80">{t.how}</p>
                <p className="border-t pt-4 text-xs leading-5 font-medium text-brand-navy">{copy[lang].advisory}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" className="sticky bottom-0 z-40 border-t border-brand-gold/40 bg-brand-navy px-5 py-3 text-primary-foreground lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-brand-gold-soft">{t.result}</span>
          <span className="flex items-baseline gap-1"><strong className="font-mono text-2xl">{result.score}</strong><small className="text-xs">/100</small></span>
          <span className="truncate text-sm font-semibold">{verdict}</span>
        </div>
      </div>
    </SiteShell>
  );
}
