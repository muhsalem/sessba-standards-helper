import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAssessmentObjection } from "@/lib/ssesba.functions";
import type { Lang } from "@/lib/ssesba-data";

export function ObjectionPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const submit = useServerFn(submitAssessmentObjection);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { await submit({ data: { referenceCode: String(form.get("referenceCode")), requesterName: String(form.get("requesterName")), email: String(form.get("email")), reason: String(form.get("reason")), preferredLanguage: lang } }); setDone(true); }
    catch (err) { setError(err instanceof Error ? err.message : en ? "Submission failed" : "تعذر إرسال الاعتراض"); }
    finally { setBusy(false); }
  }
  return <SiteShell lang={lang} eyebrow={en ? "Human review" : "مراجعة بشرية"} title={en ? "Object to an assessment result" : "الاعتراض على نتيجة تقييم"}><section className="mx-auto max-w-3xl px-5 py-12">{done ? <div role="status" aria-live="polite" className="rounded-md border bg-card p-10 text-center"><CheckCircle2 className="mx-auto size-12 text-brand-emerald"/><h2 className="mt-4 text-2xl font-semibold">{en ? "Objection received" : "تم استلام الاعتراض"}</h2><p className="mt-3 text-muted-foreground">{en ? "An authorized reviewer will assess the evidence. Submission does not suspend or change the original result automatically." : "سيراجع مختص مخول الأدلة. لا يوقف الاعتراض النتيجة الأصلية ولا يغيرها تلقائيًا."}</p></div> : <form onSubmit={onSubmit} className="grid gap-5 rounded-md border bg-card p-6"><p className="leading-7 text-muted-foreground">{en ? "Provide the result reference and explain the evidence or methodological concern requiring human review." : "أدخل رقم النتيجة واشرح الدليل أو الاعتراض المنهجي الذي يتطلب مراجعة بشرية."}</p><div><Label htmlFor="objection-reference">{en ? "Reference number" : "الرقم المرجعي"}</Label><Input id="objection-reference" name="referenceCode" required minLength={4} maxLength={40} className="mt-2"/></div><div><Label htmlFor="objection-name">{en ? "Full name" : "الاسم الكامل"}</Label><Input id="objection-name" name="requesterName" required minLength={2} maxLength={120} className="mt-2"/></div><div><Label htmlFor="objection-email">{en ? "Email" : "البريد الإلكتروني"}</Label><Input id="objection-email" name="email" type="email" required maxLength={255} className="mt-2"/></div><div><Label htmlFor="objection-reason">{en ? "Reason and supporting evidence" : "سبب الاعتراض والأدلة المؤيدة"}</Label><Textarea id="objection-reason" name="reason" required minLength={20} maxLength={3000} className="mt-2 min-h-40"/></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy}>{busy ? (en ? "Submitting…" : "جارٍ الإرسال…") : (en ? "Submit objection" : "إرسال الاعتراض")}</Button></form>}</section></SiteShell>;
}