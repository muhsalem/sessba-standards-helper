import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardCheck, Download, Loader2, Printer, Scale, ShieldAlert, Wrench } from "lucide-react";
import { SiteShell } from "@/features/ssesba/SiteShell";
import { Button } from "@/components/ui/button";
import { axes, complianceLevelForScore, complianceLevels, copy, type Lang } from "@/lib/ssesba-data";
import { evaluateCompanySixScale } from "@/lib/ssesba.functions";

const l10n = {
  ar: {
    eyebrow: "أداة تدقيق شرعي استرشادية",
    title: "المقياس السداسي للامتثال الشرعي",
    intro: "قيّم امتثال شركة وفق المستويات الستة الموحدة (100 إلى أقل من 45) مع تطبيق المعايير القطاعية للقطاع الأولي أو الثانوي أو الخدمي. يُقرأ المستوى ضمن منهجية SSESBA التي تبدأ ببوابة الأهلية، ثم المحاور المرجّحة، ثم مخاطر S1–S4 لإصدار الحكم النهائي. هذه القراءة التمهيدية لا تُغني عن التقييم الكامل أو اعتماد هيئة شرعية مؤهلة.",
    company: "اسم الشركة", sector: "القطاع الاقتصادي", activity: "وصف النشاط الرئيسي", financing: "الهيكل التمويلي والإيرادات", notes: "ملاحظات استثنائية (سياسات، عقود، بيئة عمل) — اختياري", gate: "بوابة الأهلية الملزمة", gateNote: "يؤدي فشل أي بند إلى نتيجة صفر ومحظور شرعًا، ولا تعوضه بقية المحاور.", evidence: "الأدلة الرقمية", totalRevenue: "إجمالي الإيراد", nonCompliantRevenue: "الدخل غير المتوافق المثبت", investmentAmount: "قيمة الاستثمار محل القياس", purificationNote: "الحساب المالي نسبة إسناد استرشادية فقط، وليس معادلة تطهير شرعية معتمدة.", ratio: "نسبة الدخل غير المتوافق", attributable: "المبلغ المنسوب إلى الاستثمار",
    sectors: { primary: "أولي (استخراجي، زراعي، رعوي، تعدين)", secondary: "ثانوي (صناعي، تحويلي، بناء، تطوير عقاري)", services: "خدمي (مالي، تقني، تجاري، تعليمي، استشاري)" },
    submit: "قيّم الشركة", loading: "يجري التدقيق…",
    result: "نتيجة التقييم", level: "المستوى", score: "الدرجة", justification: "التبرير الشرعي والمالي", plan: "خطة المعالجة والتطهير",
    scale: "الهيكل السداسي الموحد", current: "المستوى الحالي", advisory: "نتيجة استرشادية تتطلب مراجعة هيئة شرعية مؤهلة؛ ليست فتوى ولا اعتمادًا نهائيًا.",
    downloadTxt: "تنزيل التقرير (نص)", print: "طباعة / PDF", axesTitle: "درجات المحاور الستة", axesNote: "الأوزان المعتمدة 25/25/20/15/10/5؛ الدرجة النهائية مجموع مرجّح محسوب آلياً.", outOf: "من 100",
    levels: ["متوافق كلياً", "متوافق جوهرياً", "متوافق بشروط", "يحتاج معالجة هيكلية", "غير متوافق", "محظور شرعاً"],
  },
  en: {
    eyebrow: "Indicative Shariah audit tool",
    title: "The Six-Level Shariah Compliance Scale",
    intro: "Assess a company against the unified six levels (100 down to below 45) and the relevant primary, secondary, or services standards. Within SSESBA, the level is read after the eligibility gate and weighted axes, then combined with S1–S4 risk for the final verdict. This preliminary reading does not replace the full assessment or approval by a qualified Shariah board.",
    company: "Company name", sector: "Economic sector", activity: "Main activity description", financing: "Financing structure and revenue", notes: "Exceptional notes (policies, contracts, work environment) — optional", gate: "Binding eligibility gate", gateNote: "Failing any item produces a zero score and prohibited status; axis scores cannot offset it.", evidence: "Numeric evidence", totalRevenue: "Total revenue", nonCompliantRevenue: "Verified non-compliant revenue", investmentAmount: "Investment amount being measured", purificationNote: "This is an indicative attribution calculation, not an approved Shariah purification formula.", ratio: "Non-compliant revenue ratio", attributable: "Amount attributable to the investment",
    sectors: { primary: "Primary (extractive, agriculture, livestock, mining)", secondary: "Secondary (manufacturing, processing, construction, real estate)", services: "Services (financial, tech, commercial, education, consulting)" },
    submit: "Assess the company", loading: "Auditing…",
    result: "Assessment result", level: "Level", score: "Score", justification: "Shariah and financial justification", plan: "Remediation and purification plan",
    scale: "Unified six-level structure", current: "Current level", advisory: "An indicative result requiring review by a qualified Shariah board; neither a fatwa nor a final accreditation.",
    downloadTxt: "Download report (text)", print: "Print / PDF", axesTitle: "Six axis scores", axesNote: "Approved weights 25/25/20/15/10/5; the final score is a computed weighted sum.", outOf: "out of 100",
    levels: ["Fully compliant", "Substantially compliant", "Compliant with conditions", "Requires structural remediation", "Non-compliant", "Prohibited"],
  },
} as const;

type Sector = keyof (typeof l10n)["ar"]["sectors"];
type SixResult = { score: number; level: string; justification: string[]; plan: string[]; scores: Record<string, number>; financialExposure: { ratio: number; attributableAmount: number } };

function levelTone(score: number): string {
  const idx = complianceLevels.findIndex((level) => level.id === complianceLevelForScore(score).id);
  if (idx <= 1 && idx >= 0) return "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald";
  if (idx <= 3 && idx >= 0) return "border-brand-gold/50 bg-brand-gold/10 text-brand-gold";
  return "border-destructive/40 bg-destructive/10 text-destructive";
}

export function SixScalePage({ lang }: { lang: Lang }) {
  const t = l10n[lang];
  const evaluate = useServerFn(evaluateCompanySixScale);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState<Sector>("services");
  const [activity, setActivity] = useState("");
  const [financing, setFinancing] = useState("");
  const [notes, setNotes] = useState("");
  const [gate, setGate] = useState({ riba: true, maysir: true, prohibited: true, gharar: true });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [nonCompliantRevenue, setNonCompliantRevenue] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SixResult | null>(null);

  const submit = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      const out = await evaluate({ data: { companyName, sector, activity, financing, notes: notes || undefined, lang, gate, totalRevenue, nonCompliantRevenue, investmentAmount } });
      setResult(out);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };

  const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-gold focus:outline-none";
  const label = "mb-1 block text-sm font-semibold text-brand-navy";

  return (
    <SiteShell lang={lang} eyebrow={t.eyebrow} title={t.title}>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{t.intro}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label={t.scale}>
          {complianceLevels.map((level, index) => <div key={level.id} className="border-s-4 border-brand-gold bg-card px-3 py-3 shadow-sm"><span className="text-xs text-muted-foreground">{index + 1}</span><strong className="mt-1 block text-sm text-brand-navy">{level[lang]}</strong><span className="font-mono text-xs text-muted-foreground">{level.min === 0 ? "<45" : `${level.min}–${level.max}`}</span></div>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <form className="grid gap-4 rounded-lg border border-brand-gold/30 bg-card p-6 shadow-sm" onSubmit={(e) => { e.preventDefault(); if (!busy) void submit(); }}>
            <div><label className={label} htmlFor="six-company">{t.company}</label><input id="six-company" className={field} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required minLength={2} maxLength={160} /></div>
            <div><label className={label} htmlFor="six-sector">{t.sector}</label>
              <select id="six-sector" className={field} value={sector} onChange={(e) => setSector(e.target.value as Sector)}>
                {(Object.keys(t.sectors) as Sector[]).map((key) => <option key={key} value={key}>{t.sectors[key]}</option>)}
              </select>
            </div>
            <div><label className={label} htmlFor="six-activity">{t.activity}</label><textarea id="six-activity" className={field} rows={3} value={activity} onChange={(e) => setActivity(e.target.value)} required minLength={10} maxLength={3000} /></div>
            <div><label className={label} htmlFor="six-financing">{t.financing}</label><textarea id="six-financing" className={field} rows={3} value={financing} onChange={(e) => setFinancing(e.target.value)} required minLength={5} maxLength={3000} /></div>
            <div><label className={label} htmlFor="six-notes">{t.notes}</label><textarea id="six-notes" className={field} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} /></div>
            <fieldset className="rounded-md border p-4"><legend className="px-2 text-sm font-semibold text-brand-navy">{t.gate}</legend><p className="mb-3 text-xs leading-5 text-muted-foreground">{t.gateNote}</p>{(["riba","maysir","prohibited","gharar"] as const).map((id) => <label key={id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={gate[id]} onChange={(e) => setGate({ ...gate, [id]: e.target.checked })}/><span>{{ riba: lang === "ar" ? "النشاط الأساسي خالٍ من الربا" : "Core activity free of riba", maysir: lang === "ar" ? "النشاط الأساسي خالٍ من الميسر" : "Core activity free of maysir", prohibited: lang === "ar" ? "لا سلع أو خدمات محرمة" : "No prohibited goods or services", gharar: lang === "ar" ? "لا غرر جوهري أو غش" : "No material gharar or fraud" }[id]}</span></label>)}</fieldset>
            <fieldset className="grid gap-4 rounded-md border p-4 md:grid-cols-3"><legend className="px-2 text-sm font-semibold text-brand-navy">{t.evidence}</legend><div><label className={label} htmlFor="six-revenue">{t.totalRevenue}</label><input id="six-revenue" className={field} type="number" min="0" step="0.01" value={totalRevenue} onChange={(e) => setTotalRevenue(Number(e.target.value))}/></div><div><label className={label} htmlFor="six-noncompliant">{t.nonCompliantRevenue}</label><input id="six-noncompliant" className={field} type="number" min="0" step="0.01" value={nonCompliantRevenue} onChange={(e) => setNonCompliantRevenue(Number(e.target.value))}/></div><div><label className={label} htmlFor="six-investment">{t.investmentAmount}</label><input id="six-investment" className={field} type="number" min="0" step="0.01" value={investmentAmount} onChange={(e) => setInvestmentAmount(Number(e.target.value))}/></div><p className="text-xs leading-5 text-muted-foreground md:col-span-3">{t.purificationNote}</p></fieldset>
            <Button type="submit" disabled={busy} className="bg-brand-navy text-primary-foreground hover:bg-brand-navy/90">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Scale className="size-4" />}{busy ? t.loading : t.submit}
            </Button>
            {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          </form>

          <div aria-live="polite" aria-atomic="true">
            {!result && !busy && (
              <div className="grid h-full min-h-64 place-items-center rounded-lg border border-dashed border-brand-gold/40 bg-brand-parchment/40 p-8 text-center text-sm text-muted-foreground">
                <div><ClipboardCheck className="mx-auto mb-3 size-8 text-brand-gold" />{t.intro}</div>
              </div>
            )}
            {result && (
              <div className="grid gap-4">
                <div className={`rounded-lg border-2 p-6 ${levelTone(result.score)}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{t.result}</div>
                  <div className="mt-2 font-display-ar text-3xl font-bold">{complianceLevelForScore(result.score)[lang]}</div>
                  <div className="mt-1 text-sm">{t.score}: <b>{result.score} / 100</b></div>
                  <div className="mt-2 text-xs opacity-80">{t.current}: {complianceLevelForScore(result.score)[lang]}</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-navy"><ShieldAlert className="size-4 text-brand-gold" />{t.justification}</h2>
                  <ul className="list-disc space-y-1 ps-5 text-sm leading-7">{result.justification.map((line, i) => <li key={i}>{line}</li>)}</ul>
                </div>
                <div className="rounded-lg border border-border bg-card p-5"><h2 className="text-sm font-semibold text-brand-navy">{lang === "ar" ? "درجات المحاور (أوزان 25/25/20/15/10/5)" : "Axis scores (weights 25/25/20/15/10/5)"}</h2><dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{axes.map((a) => <div key={a.id}><dt className="text-muted-foreground">{a[lang]} · {a.weight}%</dt><dd className="font-mono font-bold">{result.scores[a.id] ?? "—"}</dd></div>)}</dl></div>
                <div className="rounded-lg border border-border bg-card p-5"><h2 className="text-sm font-semibold text-brand-navy">{t.evidence}</h2><dl className="mt-3 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-muted-foreground">{t.ratio}</dt><dd className="mt-1 font-mono font-bold">{result.financialExposure.ratio}%</dd></div><div><dt className="text-muted-foreground">{t.attributable}</dt><dd className="mt-1 font-mono font-bold">{result.financialExposure.attributableAmount.toLocaleString(lang)}</dd></div></dl><p className="mt-3 text-xs text-muted-foreground">{t.purificationNote}</p></div>
                {result.plan.length > 0 && (
                  <div className="rounded-lg border border-brand-gold/40 bg-card p-5">
                    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-navy"><Wrench className="size-4 text-brand-gold" />{t.plan}</h2>
                    <ul className="list-disc space-y-1 ps-5 text-sm leading-7">{result.plan.map((line, i) => <li key={i}>{line}</li>)}</ul>
                  </div>
                )}
                <p className="text-xs leading-6 text-muted-foreground">{t.advisory}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
