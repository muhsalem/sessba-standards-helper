import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ClipboardCheck,
  Download,
  Loader2,
  Printer,
  Scale,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { SiteShell } from "@/features/ssesba/SiteShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  axes,
  complianceLevelForScore,
  complianceLevels,
  gateChecks,
  methodologyVersion,
  type FinancialFigures,
  type Lang,
} from "@/lib/ssesba-data";
import { evaluateCompanySixScale } from "@/lib/ssesba.functions";

const l10n = {
  ar: {
    eyebrow: "أداة تدقيق شرعي استرشادية",
    title: "المقياس السداسي للامتثال الشرعي",
    intro:
      "قيّم امتثال شركة وفق المستويات الستة الموحدة (100 إلى أقل من 45) مع تطبيق المعايير القطاعية للقطاع الأولي أو الثانوي أو الخدمي. تُطبَّق بوابة الأهلية وحدود الفرز المالي حتميًا أولًا، ثم يقترح الذكاء الاصطناعي درجات المحاور الستة، وتحسب المنصة الدرجة المرجّحة والمستوى والتطهير حسابًا ثابتًا. هذه القراءة التمهيدية لا تُغني عن التقييم الكامل أو اعتماد هيئة شرعية مؤهلة.",
    company: "اسم الشركة",
    sector: "القطاع الاقتصادي",
    activity: "وصف النشاط الرئيسي",
    financing: "الهيكل التمويلي والإيرادات",
    notes: "ملاحظات استثنائية (سياسات، عقود، بيئة عمل) — اختياري",
    gate: "بوابة الأهلية الملزمة",
    gateNote:
      "يؤدي فشل أي بند إلى نتيجة صفر ومحظور شرعًا، ولا تعوضه بقية المحاور، ولا يُستدعى الذكاء الاصطناعي.",
    evidence: "الأرقام المالية (اختياري)",
    evidenceNote:
      "حدود الفرز على نهج معيار أيوفي الشرعي رقم 21. لا يُقيَّم الحد إذا لم يُدخل مقامه.",
    totalAssets: "إجمالي الأصول",
    interestBearingDebt: "الديون الربوية",
    interestBearingDeposits: "الودائع والاستثمارات الربوية",
    totalRevenue: "إجمالي الإيرادات",
    nonCompliantRevenue: "الدخل غير المباح المثبت",
    distributedReturn: "العائد الموزّع المستلم (أرباح أو توزيعات)",
    screens: "الفرز المالي الكمي",
    purification: "التطهير",
    ratio: "نسبة الدخل غير المباح",
    purificationAmount: "مبلغ التطهير الواجب إخراجه",
    purificationNote:
      "يُطهَّر العائد الموزّع بنسبة الدخل غير المباح إلى إجمالي الإيرادات، لا أصل رأس المال، على نهج معيار أيوفي الشرعي رقم 21. الحساب استرشادي ويعتمده المراجع الشرعي.",
    sectors: {
      primary: "أولي (استخراجي، زراعي، رعوي، تعدين)",
      secondary: "ثانوي (صناعي، تحويلي، بناء، تطوير عقاري)",
      services: "خدمي (مالي، تقني، تجاري، تعليمي، استشاري)",
    },
    submit: "قيّم الشركة",
    loading: "يجري التدقيق…",
    result: "نتيجة التقييم",
    score: "الدرجة المرجّحة",
    level: "المستوى",
    axes: "درجات المحاور المقترحة",
    justification: "التبرير الشرعي والمالي",
    plan: "خطة المعالجة والتطهير",
    scale: "الهيكل السداسي الموحد",
    ineligible: "غير مؤهل — لم تُحسب درجة المحاور",
    reference: "الرقم المرجعي للنتيجة",
    version: "نسخة المنهجية",
    advisory: "نتيجة استرشادية تتطلب مراجعة هيئة شرعية مؤهلة؛ ليست فتوى ولا اعتمادًا نهائيًا.",
    method: "طريقة تقدير المحاور",
    methodAi: "اقتراح بالذكاء الاصطناعي",
    methodManual: "إدخال يدوي من المراجع",
    manualNote:
      "يعمل هذا المسار دون الذكاء الاصطناعي: أدخل درجة كل محور وفق الأدلة، وتحسب المنصة الدرجة والمستوى والتطهير.",
    aiFallback: "يمكنك المتابعة بالإدخال اليدوي لدرجات المحاور.",
    downloadTxt: "تنزيل التقرير (نص)",
    print: "طباعة / PDF",
    axesNote: "الأوزان المعتمدة 25/25/20/15/10/5؛ الدرجة النهائية مجموع مرجّح محسوب آليًا.",
    outOf: "من 100",
  },
  en: {
    eyebrow: "Indicative Shariah audit tool",
    title: "The Six-Level Shariah Compliance Scale",
    intro:
      "Assess a company against the unified six levels (100 down to below 45) and the relevant primary, secondary, or services standards. The eligibility gate and financial screens apply deterministically first; AI then proposes the six axis scores, and the platform computes the weighted score, level, and purification with fixed rules. This preliminary reading does not replace the full assessment or approval by a qualified Shariah board.",
    company: "Company name",
    sector: "Economic sector",
    activity: "Main activity description",
    financing: "Financing structure and revenue",
    notes: "Exceptional notes (policies, contracts, work environment) — optional",
    gate: "Binding eligibility gate",
    gateNote:
      "Failing any item produces a zero score and prohibited status; axis scores cannot offset it, and no AI call is made.",
    evidence: "Financial figures (optional)",
    evidenceNote:
      "Screen limits follow AAOIFI Shariah Standard No. 21. A screen is not evaluated when its denominator is empty.",
    totalAssets: "Total assets",
    interestBearingDebt: "Interest-bearing debt",
    interestBearingDeposits: "Interest-bearing deposits and investments",
    totalRevenue: "Total revenue",
    nonCompliantRevenue: "Verified non-permissible income",
    distributedReturn: "Distributed return received (profits or dividends)",
    screens: "Quantitative financial screens",
    purification: "Purification",
    ratio: "Non-permissible income ratio",
    purificationAmount: "Amount to purify",
    purificationNote:
      "The distributed return is purified by the ratio of non-permissible income to total revenue, not the invested capital, following AAOIFI Shariah Standard No. 21. The figure is indicative and must be confirmed by the Shariah reviewer.",
    sectors: {
      primary: "Primary (extractive, agriculture, livestock, mining)",
      secondary: "Secondary (manufacturing, processing, construction, real estate)",
      services: "Services (financial, tech, commercial, education, consulting)",
    },
    submit: "Assess the company",
    loading: "Auditing…",
    result: "Assessment result",
    score: "Weighted score",
    level: "Level",
    axes: "Proposed axis scores",
    justification: "Shariah and financial justification",
    plan: "Remediation and purification plan",
    scale: "Unified six-level structure",
    ineligible: "Ineligible — axis scores were not computed",
    reference: "Result reference",
    version: "Methodology version",
    advisory:
      "An indicative result requiring review by a qualified Shariah board; neither a fatwa nor a final accreditation.",
    method: "Axis scoring method",
    methodAi: "AI suggestion",
    methodManual: "Manual reviewer entry",
    manualNote:
      "This path works without AI: enter each axis score from the evidence, and the platform computes the score, level, and purification.",
    aiFallback: "You can continue with manual axis entry.",
    downloadTxt: "Download report (text)",
    print: "Print / PDF",
    axesNote: "Approved weights 25/25/20/15/10/5; the final score is a computed weighted sum.",
    outOf: "out of 100",
  },
} as const;

type Sector = keyof (typeof l10n)["ar"]["sectors"];
type SixResult = Awaited<ReturnType<typeof evaluateCompanySixScale>>;
const figureKeys = [
  "totalAssets",
  "interestBearingDebt",
  "interestBearingDeposits",
  "totalRevenue",
  "nonCompliantRevenue",
] as const;

function levelTone(score: number, ineligible: boolean): string {
  if (ineligible) return "border-destructive/40 bg-destructive/10 text-destructive";
  const idx = complianceLevels.findIndex((level) => level.id === complianceLevelForScore(score).id);
  if (idx <= 1) return "border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald";
  if (idx <= 3) return "border-brand-gold/50 bg-brand-gold/10 text-brand-gold";
  return "border-destructive/40 bg-destructive/10 text-destructive";
}

function parseAmount(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
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
  const [figures, setFigures] = useState<FinancialFigures>({});
  const [distributedReturn, setDistributedReturn] = useState<number | undefined>(undefined);
  const [method, setMethod] = useState<"ai" | "manual">("ai");
  const [axisScores, setAxisScores] = useState<Record<(typeof axes)[number]["id"], number>>(
    () =>
      Object.fromEntries(axes.map((axis) => [axis.id, 75])) as Record<
        (typeof axes)[number]["id"],
        number
      >,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SixResult | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const out = await evaluate({
        data: {
          companyName,
          sector,
          activity,
          financing,
          notes: notes || undefined,
          lang,
          gate,
          figures,
          distributedReturn: distributedReturn ?? 0,
          method,
          axisScores: method === "manual" ? axisScores : undefined,
        },
      });
      setResult(out);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(method === "ai" ? `${message} ${t.aiFallback}` : message);
    } finally {
      setBusy(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const lines = [
      `${t.title} — SSESBA`,
      `${t.company}: ${companyName}`,
      `${t.sector}: ${t.sectors[sector]}`,
      `${t.score}: ${result.score} / 100`,
      `${t.level}: ${result.level}`,
      ...(result.ineligible ? [t.ineligible] : []),
      ...(result.referenceCode ? [`${t.reference}: ${result.referenceCode}`] : []),
      `${t.version}: ${methodologyVersion}`,
      ...(result.axisScores
        ? [
            "",
            `${t.axes}:`,
            ...axes.map(
              (axis) => `- ${axis[lang]} (${axis.weight}%): ${result.axisScores?.[axis.id] ?? "—"}`,
            ),
          ]
        : []),
      "",
      `${t.screens}:`,
      ...result.screens.map(
        (item) =>
          `- ${item.screen[lang]} (≤ ${item.screen.max}%): ${item.ratio === null ? "—" : `${item.ratio}%`}`,
      ),
      "",
      `${t.purification}:`,
      `- ${t.ratio}: ${result.purification.ratio}%`,
      `- ${t.purificationAmount}: ${result.purification.purificationAmount.toLocaleString(lang)}`,
      "",
      `${t.justification}:`,
      ...result.justification.map((line) => `- ${line}`),
      ...(result.plan.length > 0
        ? ["", `${t.plan}:`, ...result.plan.map((line) => `- ${line}`)]
        : []),
      "",
      t.advisory,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssesba-six-scale-${result.referenceCode ?? (companyName.trim().replace(/\s+/g, "-") || "report")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-brand-gold focus:outline-none";
  const label = "mb-1 block text-sm font-semibold text-brand-navy";

  return (
    <SiteShell lang={lang} eyebrow={t.eyebrow} title={t.title}>
      <section className="mx-auto max-w-7xl px-5 py-10">
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{t.intro}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label={t.scale}>
          {complianceLevels.map((level, index) => (
            <div
              key={level.id}
              className="border-s-4 border-brand-gold bg-card px-3 py-3 shadow-sm"
            >
              <span className="text-xs text-muted-foreground">{index + 1}</span>
              <strong className="mt-1 block text-sm text-brand-navy">{level[lang]}</strong>
              <span className="font-mono text-xs text-muted-foreground">
                {level.min === 0 ? "<45" : `${level.min}–${level.max}`}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <form
            className="grid gap-4 rounded-lg border border-brand-gold/30 bg-card p-6 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) void submit();
            }}
          >
            <div>
              <label className={label} htmlFor="six-company">
                {t.company}
              </label>
              <input
                id="six-company"
                className={field}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                minLength={2}
                maxLength={160}
              />
            </div>
            <div>
              <label className={label} htmlFor="six-sector">
                {t.sector}
              </label>
              <select
                id="six-sector"
                className={field}
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
              >
                {(Object.keys(t.sectors) as Sector[]).map((key) => (
                  <option key={key} value={key}>
                    {t.sectors[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="six-activity">
                {t.activity}
              </label>
              <textarea
                id="six-activity"
                className={field}
                rows={3}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                required
                minLength={10}
                maxLength={3000}
              />
            </div>
            <div>
              <label className={label} htmlFor="six-financing">
                {t.financing}
              </label>
              <textarea
                id="six-financing"
                className={field}
                rows={3}
                value={financing}
                onChange={(e) => setFinancing(e.target.value)}
                required
                minLength={5}
                maxLength={3000}
              />
            </div>
            <div>
              <label className={label} htmlFor="six-notes">
                {t.notes}
              </label>
              <textarea
                id="six-notes"
                className={field}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={3000}
              />
            </div>
            <fieldset className="rounded-md border p-4">
              <legend className="px-2 text-sm font-semibold text-brand-navy">{t.gate}</legend>
              <p className="mb-3 text-xs leading-5 text-muted-foreground">{t.gateNote}</p>
              {gateChecks.map((check) => (
                <label key={check.id} className="flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={gate[check.id]}
                    onChange={(e) => setGate({ ...gate, [check.id]: e.target.checked })}
                  />
                  <span>{check[lang]}</span>
                </label>
              ))}
            </fieldset>
            <fieldset className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
              <legend className="px-2 text-sm font-semibold text-brand-navy">{t.evidence}</legend>
              <p className="text-xs leading-5 text-muted-foreground md:col-span-2">
                {t.evidenceNote}
              </p>
              {figureKeys.map((key) => (
                <div key={key}>
                  <label className={label} htmlFor={`six-${key}`}>
                    {t[key]}
                  </label>
                  <input
                    id={`six-${key}`}
                    className={field}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={figures[key] ?? ""}
                    onChange={(e) => setFigures({ ...figures, [key]: parseAmount(e.target.value) })}
                  />
                </div>
              ))}
              <div>
                <label className={label} htmlFor="six-distributed">
                  {t.distributedReturn}
                </label>
                <input
                  id="six-distributed"
                  className={field}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={distributedReturn ?? ""}
                  onChange={(e) => setDistributedReturn(parseAmount(e.target.value))}
                />
              </div>
            </fieldset>
            <fieldset className="rounded-md border p-4">
              <legend className="px-2 text-sm font-semibold text-brand-navy">{t.method}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["ai", "manual"] as const).map((value) => (
                  <label
                    key={value}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm ${method === value ? "border-brand-gold bg-brand-parchment font-semibold text-brand-navy" : ""}`}
                  >
                    <input
                      type="radio"
                      name="six-method"
                      value={value}
                      checked={method === value}
                      onChange={() => setMethod(value)}
                    />
                    {value === "ai" ? t.methodAi : t.methodManual}
                  </label>
                ))}
              </div>
              {method === "manual" && (
                <div className="mt-4 grid gap-4">
                  <p className="text-xs leading-5 text-muted-foreground">{t.manualNote}</p>
                  {axes.map((axis) => (
                    <div key={axis.id}>
                      <div className="mb-2 flex items-baseline justify-between text-sm">
                        <span id={`six-axis-${axis.id}`} className="font-semibold">
                          {axis[lang]} · {axis.weight}%
                        </span>
                        <output className="font-mono font-bold">{axisScores[axis.id]}</output>
                      </div>
                      <Slider
                        aria-labelledby={`six-axis-${axis.id}`}
                        aria-valuetext={`${axisScores[axis.id]} / 100`}
                        value={[axisScores[axis.id]]}
                        max={100}
                        step={1}
                        onValueChange={(v) =>
                          setAxisScores({ ...axisScores, [axis.id]: v[0] ?? 0 })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </fieldset>
            <Button
              type="submit"
              disabled={busy}
              className="bg-brand-navy text-primary-foreground hover:bg-brand-navy/90"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Scale className="size-4" />}
              {busy ? t.loading : t.submit}
            </Button>
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
          </form>

          <div aria-live="polite" aria-atomic="true">
            {!result && !busy && (
              <div className="grid h-full min-h-64 place-items-center rounded-lg border border-dashed border-brand-gold/40 bg-brand-parchment/40 p-8 text-center text-sm text-muted-foreground">
                <div>
                  <ClipboardCheck className="mx-auto mb-3 size-8 text-brand-gold" />
                  {t.intro}
                </div>
              </div>
            )}
            {result && (
              <div className="grid gap-4">
                <div
                  className={`rounded-lg border-2 p-6 ${levelTone(result.score, result.ineligible)}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                        {t.result}
                      </div>
                      <div className="mt-2 font-display-ar text-3xl font-bold">{result.level}</div>
                      <div className="mt-1 text-sm">
                        {t.score}: <b>{result.score} / 100</b>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 print:hidden">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={downloadReport}
                        className="min-h-11 border-current bg-transparent"
                      >
                        <Download className="size-4" />
                        {t.downloadTxt}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="min-h-11 border-current bg-transparent"
                      >
                        <Printer className="size-4" />
                        {t.print}
                      </Button>
                    </div>
                  </div>
                  {result.ineligible && (
                    <div className="mt-2 text-xs opacity-80">{t.ineligible}</div>
                  )}
                  {result.referenceCode && (
                    <div className="mt-3 text-xs">
                      {t.reference}: <b className="font-mono text-sm">{result.referenceCode}</b> ·{" "}
                      {t.version} {methodologyVersion}
                    </div>
                  )}
                </div>
                {result.axisScores && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold text-brand-navy">{t.axes}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{t.axesNote}</p>
                    <ul className="mt-4 grid gap-3">
                      {axes.map((axis) => {
                        const value = result.axisScores?.[axis.id];
                        const pct =
                          typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
                        return (
                          <li key={axis.id}>
                            <div className="flex items-baseline justify-between gap-2 text-sm">
                              <span className="font-medium text-brand-navy">
                                {axis[lang]}{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({axis.weight}%)
                                </span>
                              </span>
                              <span className="font-mono font-bold text-brand-navy">
                                {value ?? "—"}
                                <span className="text-xs font-normal text-muted-foreground">
                                  {" "}
                                  / 100
                                </span>
                              </span>
                            </div>
                            <div
                              className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
                              role="img"
                              aria-label={`${axis[lang]}: ${value ?? "—"} ${t.outOf}`}
                            >
                              <div
                                className={`h-full rounded-full ${pct >= 85 ? "bg-brand-emerald" : pct >= 60 ? "bg-brand-gold" : "bg-destructive"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-navy">
                    <ShieldAlert className="size-4 text-brand-gold" />
                    {t.justification}
                  </h2>
                  <ul className="list-disc space-y-1 ps-5 text-sm leading-7">
                    {result.justification.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold text-brand-navy">{t.screens}</h2>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {result.screens.map((item) => (
                      <li
                        key={item.screen.id}
                        className={`flex justify-between gap-3 rounded-md border px-3 py-2 ${item.passed === false ? "border-destructive/50 bg-destructive/10 text-destructive" : ""}`}
                      >
                        <span>
                          {item.screen[lang]} (≤ {item.screen.max}%)
                        </span>
                        <span className="font-mono">
                          {item.ratio === null ? "—" : `${item.ratio}%`}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <h2 className="mt-5 text-sm font-semibold text-brand-navy">{t.purification}</h2>
                  <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">{t.ratio}</dt>
                      <dd className="mt-1 font-mono font-bold">{result.purification.ratio}%</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t.purificationAmount}</dt>
                      <dd className="mt-1 font-mono font-bold">
                        {result.purification.purificationAmount.toLocaleString(lang)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-muted-foreground">{t.purificationNote}</p>
                </div>
                {result.plan.length > 0 && (
                  <div className="rounded-lg border border-brand-gold/40 bg-card p-5">
                    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-navy">
                      <Wrench className="size-4 text-brand-gold" />
                      {t.plan}
                    </h2>
                    <ul className="list-disc space-y-1 ps-5 text-sm leading-7">
                      {result.plan.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
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
