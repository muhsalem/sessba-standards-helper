import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, MessagesSquare, Sparkles } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copy, type Lang } from "@/lib/ssesba-data";
import { askStandardAssistant } from "@/lib/ssesba.functions";

type Answer = Awaited<ReturnType<typeof askStandardAssistant>>;

const labels = {
  ar: {
    eyebrow: "أداة مساندة للقراءة",
    title: "المساعد الشرعي لقراءة المعيار",
    desc: "الصق نصًا من المعايير أو اطرح سؤالًا عنها، فيُنتج المساعد شرحًا مبسطًا وإجابة مرتبطة بمحتوى معايير التصنيف الشرعي (مَشْتَق · SSESBA) دون الخروج عنه.",
    question: "سؤالك عن المعيار",
    questionPlaceholder: "مثال: ما الفرق بين بوابة الأهلية ودرجة الامتثال؟ ومتى يسقط النشاط كليًا؟",
    excerpt: "نص المعيار (اختياري)",
    excerptPlaceholder: "الصق هنا فقرة من المعيار تريد تبسيطها…",
    submit: "اشرح وأجب",
    loading: "جاري التحليل…",
    summaryTitle: "الشرح المبسّط",
    pointsTitle: "نقاط أساسية",
    relatedTitle: "أقسام المعيار ذات الصلة",
    empty: "اكتب سؤالك أو الصق نص المعيار لتبدأ.",
    error: "تعذّر إنتاج الإجابة",
  },
  en: {
    eyebrow: "Reading support tool",
    title: "Standards reading assistant",
    desc: "Paste standard text or ask a question, and the assistant returns a plain-language explanation grounded strictly in the SSESBA standard content.",
    question: "Your question about the standard",
    questionPlaceholder:
      "Example: how does the eligibility gate differ from the compliance score, and when is an activity rejected outright?",
    excerpt: "Standard text (optional)",
    excerptPlaceholder: "Paste a passage from the standard you want simplified…",
    submit: "Explain and answer",
    loading: "Analysing…",
    summaryTitle: "Plain-language explanation",
    pointsTitle: "Key points",
    relatedTitle: "Related standard sections",
    empty: "Write a question or paste standard text to begin.",
    error: "The answer could not be produced",
  },
} as const;

export function AssistantPage({ lang }: { lang: Lang }) {
  const t = labels[lang];
  const ask = useServerFn(askStandardAssistant);
  const [question, setQuestion] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    try {
      const result = await ask({
        data: { question: question.trim(), excerpt: excerpt.trim() || undefined, lang },
      });
      setAnswer(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell lang={lang} eyebrow={t.eyebrow} title={t.title}>
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="rounded-xl border border-brand-gold/25 bg-card p-6 shadow-sm">
          <p className="mb-6 text-sm leading-7 text-muted-foreground">{t.desc}</p>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="assistant-question">{t.question}</Label>
              <Textarea
                id="assistant-question"
                rows={4}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={t.questionPlaceholder}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assistant-excerpt">{t.excerpt}</Label>
              <Textarea
                id="assistant-excerpt"
                rows={7}
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder={t.excerptPlaceholder}
              />
            </div>
            <Button
              onClick={onSubmit}
              disabled={busy || question.trim().length < 5}
              aria-busy={busy}
              className="justify-center"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {busy ? t.loading : t.submit}
            </Button>
            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true" className="grid content-start gap-4">
          {answer ? (
            <>
              <article className="rounded-xl border border-brand-gold/25 bg-card p-6 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-display-ar text-lg text-brand-navy">
                  <MessagesSquare className="size-5 text-brand-gold" />
                  {t.summaryTitle}
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-foreground/85">
                  {answer.summary}
                </p>
              </article>
              {answer.points.length ? (
                <article className="rounded-xl border border-brand-gold/25 bg-card p-6 shadow-sm">
                  <h2 className="mb-3 font-display-ar text-lg text-brand-navy">{t.pointsTitle}</h2>
                  <ul className="grid gap-2 text-sm leading-7 text-foreground/85">
                    {answer.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-gold" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ) : null}
              {answer.related.length ? (
                <article className="rounded-xl border border-brand-gold/25 bg-card p-6 shadow-sm">
                  <h2 className="mb-3 font-display-ar text-lg text-brand-navy">{t.relatedTitle}</h2>
                  <div className="flex flex-wrap gap-2">
                    {answer.related.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-brand-gold/40 bg-brand-parchment px-3 py-1 text-xs text-brand-navy"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ) : null}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-gold/40 bg-card/60 p-8 text-center text-sm text-muted-foreground">
              {t.empty}
            </div>
          )}
          <p className="rounded-md border border-brand-gold/30 bg-brand-parchment p-4 text-xs leading-6 text-brand-navy/80">
            {copy[lang].advisory}
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
