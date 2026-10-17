import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell } from "@/features/ssesba/SiteShell";
import { getMyRoles } from "@/lib/waqf-review.functions";
import { analyzeGitSync } from "@/lib/git-sync.functions";
import { canAnalyzeGitSync, type GitSyncAnalysis } from "@/lib/git-sync-data";

const title = "تشخيص مزامنة GitHub | لوحة الإدارة";
export const Route = createFileRoute("/_authenticated/git-sync")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: "أداة للمشرفين لتحليل سجلات Git ومعرفة التغييرات المرصودة في السجل." },
      { property: "og:title", content: title },
      { property: "og:description", content: "تشخيص مزامنة GitHub بالذكاء الاصطناعي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GitSyncPage,
});

const confidenceLabel = { low: "منخفضة", medium: "متوسطة", high: "عالية" } as const;

function GitSyncPage() {
  const fetchRoles = useServerFn(getMyRoles);
  const analyze = useServerFn(analyzeGitSync);
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const [gitLog, setGitLog] = useState("");
  const [gitStatus, setGitStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GitSyncAnalysis | null>(null);
  const isAdmin = canAnalyzeGitSync(roles.data ?? []);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyze({ data: { gitLog, gitStatus, notes } });
      if (res.error) setError(res.error);
      else if (res.result) setResult(res.result);
    } catch (e) {
      setError(e instanceof Error && e.message.startsWith("Forbidden") ? "هذه الأداة للمشرفين فقط." : "تعذّر التحليل. تأكد من إدخال سجل أو حالة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell lang="ar" eyebrow="لوحة الإدارة" title="تشخيص مزامنة GitHub">
      <section className="mx-auto max-w-4xl px-5 py-10">
        <Link to="/review" className="text-sm text-muted-foreground underline">
          ← العودة إلى لوحة المراجعة
        </Link>
        {roles.isLoading && <p className="mt-6">جارٍ التحقق من الصلاحيات…</p>}
        {roles.error && <p role="alert" className="mt-6 text-destructive">تعذّر التحقق من الصلاحيات.</p>}
        {!roles.isLoading && !roles.error && !isAdmin && (
          <p className="mt-6 border-s-2 border-brand-gold ps-4">هذه الأداة متاحة لمشرفي المنصة فقط.</p>
        )}
        {isAdmin && (
          <div className="mt-6 grid gap-5">
            <p className="leading-8 text-muted-foreground">
              تحليل استرشادي للنص المرسل فقط؛ لا يفحص المستودع ولا يغيّر الملفات أو ينفّذ المزامنة.
              لا تُرسل كلمات مرور أو مفاتيح وصول أو بيانات شخصية.
            </p>
            <label className="grid gap-2 font-medium">
              سجل Git
              <Textarea dir="ltr" rows={8} maxLength={20000} value={gitLog} onChange={(e) => setGitLog(e.target.value)} className="font-mono text-sm" />
            </label>
            <label className="grid gap-2 font-medium">
              حالة الملفات (git status)
              <Textarea dir="ltr" rows={8} maxLength={20000} value={gitStatus} onChange={(e) => setGitStatus(e.target.value)} className="font-mono text-sm" />
            </label>
            <label className="grid gap-2 font-medium">
              ملاحظات (اختياري)
              <Textarea rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <Button onClick={run} disabled={busy || (!gitLog.trim() && !gitStatus.trim())}>
              {busy ? "جارٍ التحليل…" : "حلّل المزامنة"}
            </Button>
            {error && <p role="alert" className="text-destructive">{error}</p>}
            {result && (
              <div className="grid gap-4 rounded-lg border p-5">
                <p className="leading-8">{result.summary}</p>
                <div>
                  <h2 className="mb-2 font-semibold">التغييرات المرصودة في السجل</h2>
                  {result.unsyncedChanges.length === 0 ? (
                    <p className="text-muted-foreground">لم تُرصد تغييرات معلّقة في النص المرسل؛ لا يؤكد ذلك اكتمال المزامنة.</p>
                  ) : (
                    <ul className="grid gap-2">
                      {result.unsyncedChanges.map((c, i) => (
                        <li key={i} className="border-s-2 border-brand-gold ps-3">
                          <code dir="ltr" className="text-sm">{c.item}</code> — <span className="text-sm text-muted-foreground">{c.kind}</span>
                          <p className="text-sm">{c.detail}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h2 className="mb-2 font-semibold">سبب التعثر المرجّح</h2>
                  <p className="leading-8">{result.likelyCause}</p>
                </div>
                <div>
                  <h2 className="mb-2 font-semibold">الخطوات التالية</h2>
                  <ol className="list-decimal ps-6 leading-8">
                    {result.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
                <p className="text-sm text-muted-foreground">
                  درجة الثقة: {confidenceLabel[result.confidence]} · تحليل آلي مساعد، راجعه قبل التنفيذ.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
