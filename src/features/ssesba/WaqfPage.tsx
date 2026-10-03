import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpenCheck, CheckCircle2, HandHeart, Landmark, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitExpertContribution } from "@/lib/ssesba.functions";
import type { Lang } from "@/lib/ssesba-data";
import { SiteShell } from "./SiteShell";

const specialties = [
  { value: "shariah", ar: "التدقيق والرقابة الشرعية", en: "Shariah audit and supervision" },
  { value: "fiqh", ar: "الفقه وأصوله", en: "Fiqh and legal theory" },
  { value: "industry", ar: "القطاعات الصناعية", en: "Industry and sector practice" },
  { value: "business", ar: "أنشطة الأعمال", en: "Business activities" },
  { value: "finance", ar: "المحاسبة والتمويل والزكاة", en: "Accounting, finance and zakat" },
  { value: "other", ar: "تخصص آخر", en: "Other expertise" },
] as const;
const areas = [
  { value: "drafting", ar: "صياغة المعايير", en: "Drafting standards" },
  { value: "review", ar: "المراجعة الشرعية والفقهية", en: "Shariah and fiqh review" },
  { value: "sector", ar: "تحليل قطاع أو نشاط", en: "Sector and activity analysis" },
  { value: "research", ar: "البحث والأدلة", en: "Research and evidence" },
  {
    value: "translation",
    ar: "مراجعة المصطلحات والترجمة",
    en: "Terminology and translation review",
  },
] as const;

export function WaqfPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const submit = useServerFn(submitExpertContribution);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [area, setArea] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!specialty || !area) {
      setError(en ? "Choose your specialty and contribution area." : "اختر التخصص ومجال المشاركة.");
      return;
    }
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("consent") !== "on") {
      setError(en ? "Please agree to the privacy policy." : "يرجى الموافقة على سياسة الخصوصية.");
      setBusy(false);
      return;
    }
    try {
      await submit({
        data: {
          fullName: String(form.get("fullName")),
          email: String(form.get("email")),
          organization: String(form.get("organization")),
          specialty: specialty as (typeof specialties)[number]["value"],
          experience: String(form.get("experience")),
          contributionArea: area as (typeof areas)[number]["value"],
          proposal: String(form.get("proposal")),
          preferredLanguage: lang,
          consent: true,
        },
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : en
            ? "Submission failed. Please try again."
            : "تعذر إرسال المشاركة. حاول مرة أخرى.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell
      lang={lang}
      eyebrow={en ? "An open knowledge endowment" : "وقف معرفي مفتوح"}
      title={en ? "A knowledge waqf for the Muslim ummah" : "وقف معرفي للأمة الإسلامية"}
    >
      <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <p className="max-w-2xl font-display-ar text-2xl leading-relaxed text-brand-navy md:text-3xl">
              {en
                ? "An invitation to build Shariah standards together, with rigor and service at the center."
                : "دعوةٌ لصياغة المعايير الشرعية معًا، بعلمٍ رصينٍ وخدمةٍ ممتدة."}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
              {en
                ? "We dedicate SSESBA as a non-profit knowledge endowment for the benefit of the Muslim ummah. We invite Shariah scholars and auditors, jurists, industry practitioners, business-activity specialists, accountants and researchers to contribute to the Shariah Standards for Economic Sectors & Business Activities."
                : "نُخصّص منصة معايير التصنيف الشرعي وقفًا معرفيًا غير ربحي لخدمة الأمة الإسلامية، وندعو العلماء والفقهاء والمدققين الشرعيين وخبراء الصناعة وأنشطة الأعمال والمحاسبة والبحث للمساهمة في صياغة المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال."}
            </p>
            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              <div className="border-s-2 border-brand-gold ps-5">
                <HandHeart className="size-6 text-brand-emerald" />
                <h2 className="mt-3 text-xl font-semibold">
                  {en ? "Shared benefit" : "نفع مشترك"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {en
                    ? "Knowledge offered for public benefit, without claiming that any legal waqf deed or registered endowment has been created."
                    : "علم يُقدَّم للنفع العام دون ادعاء إنشاء صك وقف قانوني أو تسجيل وقف رسمي."}
                </p>
              </div>
              <div className="border-s-2 border-brand-emerald ps-5">
                <BookOpenCheck className="size-6 text-brand-gold" />
                <h2 className="mt-3 text-xl font-semibold">
                  {en ? "Scholarly review" : "مراجعة علمية"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {en
                    ? "Proposals are examined for evidence, sector relevance, Shariah soundness and consistency before any publication."
                    : "تُفحص المقترحات من حيث الأدلة وملاءمة القطاع وسلامة التأصيل الشرعي واتساق الصياغة قبل نشرها."}
                </p>
              </div>
              <div className="border-s-2 border-brand-emerald ps-5">
                <UsersRound className="size-6 text-brand-gold" />
                <h2 className="mt-3 text-xl font-semibold">
                  {en ? "Complementary expertise" : "خبرات متكاملة"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {en
                    ? "Fiqh specialists and practitioners examine contracts, operations, finance, zakat and real sector practices together."
                    : "يتعاون الفقهاء والممارسون في دراسة العقود والعمليات والتمويل والزكاة وواقع الأنشطة القطاعية."}
                </p>
              </div>
              <div className="border-s-2 border-brand-gold ps-5">
                <Landmark className="size-6 text-brand-emerald" />
                <h2 className="mt-3 text-xl font-semibold">
                  {en ? "Accountable publication" : "نشر منضبط"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {en
                    ? "Contribution does not confer approval or authorship of the final standard; formal review and version governance remain required."
                    : "لا تعني المشاركة اعتماد المعيار أو نسبة الإصدار النهائي للمشارك؛ وتبقى المراجعة وحوكمة الإصدارات لازمتين."}
                </p>
              </div>
            </div>
            <div className="mt-10 border-t pt-7">
              <h2 className="text-xl font-semibold">
                {en ? "How proposals are considered" : "كيف تُدرس المقترحات؟"}
              </h2>
              <ol className="mt-4 grid gap-3 text-sm leading-7 text-muted-foreground">
                <li>
                  <Link
                    to={en ? "/en/map" : "/map"}
                    className="font-medium text-brand-emerald underline"
                  >
                    {en
                      ? "See how standards evolve from principle to sector rules →"
                      : "اطّلع على خريطة تطور المعايير من المبدأ إلى معايير القطاعات ←"}
                  </Link>
                </li>
                <li>
                  {en
                    ? "1. Submit your expertise and a focused proposal."
                    : "١. أرسل تخصصك ومقترحًا محددًا للمساهمة."}
                </li>
                <li>
                  {en
                    ? "2. The team reviews relevance, evidence and any conflicts of interest."
                    : "٢. يراجع الفريق الملاءمة والأدلة وأي تضارب محتمل في المصالح."}
                </li>
                <li>
                  {en
                    ? "3. Qualified Shariah and sector reviewers examine proposed wording before any governed edition is published."
                    : "٣. يُعرض النص المقترح على مختصين شرعيين وقطاعيين قبل إدراجه في إصدار محكوم."}
                </li>
              </ol>
            </div>
          </div>
          <div id="participate" className="lg:pt-1">
            <div className="border-t-4 border-brand-emerald bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-display-ar text-2xl font-semibold text-brand-navy">
                {en ? "Contribute your expertise" : "ساهم بخبرتك في صياغة المعايير"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {en
                  ? "Tell us where your experience can strengthen the standards."
                  : "عرّفنا بتخصصك وما يمكن أن تضيفه إلى صياغة المعايير ومراجعتها."}
              </p>
              {done ? (
                <div role="status" aria-live="polite" className="mt-10 border-t py-10 text-center">
                  <CheckCircle2 className="mx-auto size-12 text-brand-emerald" />
                  <h3 className="mt-4 text-xl font-semibold">
                    {en ? "Contribution received" : "وصلت مشاركتك"}
                  </h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {en
                      ? "Thank you. Your proposal will be reviewed; submission does not imply acceptance or endorsement."
                      : "شكرًا لمشاركتك. سيُراجع المقترح، ولا يعني إرساله قبوله أو اعتماده."}
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-7 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="waqf-name">{en ? "Full name" : "الاسم الكامل"}</Label>
                      <Input
                        id="waqf-name"
                        name="fullName"
                        required
                        minLength={2}
                        maxLength={120}
                        className="mt-2 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waqf-email">{en ? "Email" : "البريد الإلكتروني"}</Label>
                      <Input
                        id="waqf-email"
                        name="email"
                        type="email"
                        required
                        maxLength={255}
                        className="mt-2 h-11"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="waqf-org">
                      {en ? "Affiliation / organization" : "الجهة أو الانتماء المهني"}
                    </Label>
                    <Input
                      id="waqf-org"
                      name="organization"
                      required
                      minLength={2}
                      maxLength={160}
                      className="mt-2 h-11"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="waqf-specialty">{en ? "Specialty" : "التخصص"}</Label>
                      <Select value={specialty} onValueChange={setSpecialty} required>
                        <SelectTrigger id="waqf-specialty" className="mt-2 h-11 w-full">
                          <SelectValue placeholder={en ? "Select specialty" : "اختر التخصص"} />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s[lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="waqf-area">
                        {en ? "Contribution area" : "مجال المساهمة"}
                      </Label>
                      <Select value={area} onValueChange={setArea} required>
                        <SelectTrigger id="waqf-area" className="mt-2 h-11 w-full">
                          <SelectValue placeholder={en ? "Select area" : "اختر المجال"} />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              {a[lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="waqf-experience">
                      {en ? "Relevant experience" : "الخبرة ذات الصلة"}
                    </Label>
                    <Textarea
                      id="waqf-experience"
                      name="experience"
                      required
                      minLength={10}
                      maxLength={1000}
                      className="mt-2 min-h-24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waqf-proposal">
                      {en ? "Your proposed contribution" : "المساهمة المقترحة"}
                    </Label>
                    <Textarea
                      id="waqf-proposal"
                      name="proposal"
                      required
                      minLength={20}
                      maxLength={3000}
                      className="mt-2 min-h-32"
                    />
                  </div>
                  <label className="flex items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      className="mt-1 size-4 accent-brand-emerald"
                    />
                    <span>
                      {en ? (
                        <>
                          I agree to the processing of my submission under the{" "}
                          <Link to="/en/privacy" className="underline">
                            privacy policy
                          </Link>
                          .
                        </>
                      ) : (
                        <>
                          أوافق على معالجة بيانات مشاركتي وفق{" "}
                          <Link to="/privacy" className="underline">
                            سياسة الخصوصية
                          </Link>
                          .
                        </>
                      )}
                    </span>
                  </label>
                  {error && (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={busy}
                    className="min-h-12 bg-brand-emerald text-primary-foreground hover:bg-brand-navy"
                  >
                    {busy
                      ? en
                        ? "Submitting…"
                        : "جارٍ الإرسال…"
                      : en
                        ? "Submit contribution"
                        : "إرسال المشاركة"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
