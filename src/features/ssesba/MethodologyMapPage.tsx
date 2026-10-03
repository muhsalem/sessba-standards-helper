import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  FileSearch,
  GitBranch,
  Layers3,
  RefreshCw,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/ssesba-data";
import { SiteShell } from "./SiteShell";

type Stage = {
  number: string;
  icon: LucideIcon;
  ar: { title: string; summary: string; input: string; output: string; owner: string };
  en: { title: string; summary: string; input: string; output: string; owner: string };
};

const stages: Stage[] = [
  {
    number: "01",
    icon: BookOpenCheck,
    ar: {
      title: "المبدأ الشرعي والدليل",
      summary:
        "تحديد الأصل الشرعي الحاكم من القرآن والسنة والإجماع والقرارات والمعايير المعتبرة، مع بيان قوة الاستدلال ونطاقه.",
      input: "النصوص والأدلة والقرارات",
      output: "مبدأ موثّق قابل للتطبيق",
      owner: "البحث والفقه",
    },
    en: {
      title: "Shariah principle and evidence",
      summary:
        "Identify the governing principle from the Qur’an, Sunnah, consensus, resolutions and recognized standards, with evidence strength and scope.",
      input: "Texts, evidence and resolutions",
      output: "A documented, applicable principle",
      owner: "Research and fiqh",
    },
  },
  {
    number: "02",
    icon: Scale,
    ar: {
      title: "القاعدة والضابط العام",
      summary: "تحويل المبدأ إلى قاعدة منضبطة تحدد مناط الحكم وحدوده والاستثناءات التي يلزم فحصها.",
      input: "المبدأ وسياقه الفقهي",
      output: "ضابط شرعي عام",
      owner: "الصياغة الشرعية",
    },
    en: {
      title: "General rule and control",
      summary:
        "Translate the principle into a controlled rule defining the effective cause, boundaries and exceptions requiring examination.",
      input: "Principle and fiqh context",
      output: "A general Shariah control",
      owner: "Shariah drafting",
    },
  },
  {
    number: "03",
    icon: Building2,
    ar: {
      title: "توصيف القطاع الاقتصادي",
      summary:
        "فهم سلسلة القيمة والمنتجات والخدمات ونماذج الأعمال والجهات الفاعلة والمخاطر الخاصة بكل قطاع.",
      input: "بيانات القطاع وممارساته",
      output: "ملف قطاعي موصوف",
      owner: "خبراء القطاع",
    },
    en: {
      title: "Economic-sector characterization",
      summary:
        "Map the value chain, products, services, business models, actors and sector-specific risks.",
      input: "Sector data and practice",
      output: "A characterized sector profile",
      owner: "Sector experts",
    },
  },
  {
    number: "04",
    icon: Layers3,
    ar: {
      title: "المعيار القطاعي",
      summary:
        "مواءمة الضوابط العامة مع واقع القطاع لتحديد المتطلبات الجوهرية والمؤشرات والأدلة المطلوبة بصورة قابلة للمقارنة.",
      input: "الضوابط + الملف القطاعي",
      output: "معيار قطاعي منظم",
      owner: "فريق شرعي وقطاعي",
    },
    en: {
      title: "Sector standard",
      summary:
        "Align general controls with sector reality to define material requirements, indicators and evidence in a comparable form.",
      input: "Controls + sector profile",
      output: "A structured sector standard",
      owner: "Shariah and sector team",
    },
  },
  {
    number: "05",
    icon: GitBranch,
    ar: {
      title: "ضوابط النشاط والعقود",
      summary:
        "تفصيل المعيار إلى ضوابط تخص النشاط الفرعي والعقود والإيرادات والتمويل والعمليات والحوكمة والإفصاح.",
      input: "المعيار ونموذج النشاط",
      output: "اختبارات نشاط قابلة للتحقق",
      owner: "خبراء النشاط والتدقيق",
    },
    en: {
      title: "Activity and contract controls",
      summary:
        "Break the standard into controls for the sub-activity, contracts, revenue, financing, operations, governance and disclosure.",
      input: "Standard + activity model",
      output: "Verifiable activity tests",
      owner: "Activity and audit experts",
    },
  },
  {
    number: "06",
    icon: SlidersHorizontal,
    ar: {
      title: "القياس والتصنيف",
      summary:
        "تطبيق بوابة الأهلية، ثم المحاور الستة الموزونة، ثم مستوى المخاطر الشرعية S1–S4 لإنتاج حكم استرشادي متسق.",
      input: "الأدلة والبيانات المالية والتشغيلية",
      output: "درجة ومستوى ومخاطر",
      owner: "المراجع الشرعي والمالي",
    },
    en: {
      title: "Measurement and classification",
      summary:
        "Apply the eligibility gate, six weighted axes and Shariah-risk tier S1–S4 to produce a consistent indicative outcome.",
      input: "Evidence, financial and operating data",
      output: "Score, level and risk tier",
      owner: "Shariah and financial reviewer",
    },
  },
  {
    number: "07",
    icon: ShieldCheck,
    ar: {
      title: "المراجعة وحوكمة الإصدار",
      summary:
        "فحص سلامة الاستدلال واتساق التطبيق وتعارض المصالح، وتوثيق الاعتماد العلمي ورقم الإصدار والتغييرات.",
      input: "المعيار والنتائج والملاحظات",
      output: "إصدار محكوم قابل للتتبع",
      owner: "اللجنة الشرعية والحوكمة",
    },
    en: {
      title: "Review and version governance",
      summary:
        "Examine evidence, consistency and conflicts of interest, then document scholarly approval, version number and changes.",
      input: "Standard, results and observations",
      output: "A governed, traceable edition",
      owner: "Shariah and governance committee",
    },
  },
  {
    number: "08",
    icon: RefreshCw,
    ar: {
      title: "النتيجة والتطوير الدوري",
      summary:
        "نشر نتيجة مفسّرة قابلة للاعتراض والمراجعة، ثم إعادة تغذية المعيار بالتغيرات الفقهية والتنظيمية والقطاعية.",
      input: "المراجعات والاعتراضات والتغيرات",
      output: "نتيجة مفسرة ومعيار مُحدّث",
      owner: "الحوكمة وأصحاب المصلحة",
    },
    en: {
      title: "Outcome and continuous development",
      summary:
        "Publish an explainable, reviewable outcome, then feed jurisprudential, regulatory and sector changes into the next edition.",
      input: "Reviews, objections and changes",
      output: "Explained outcome and updated standard",
      owner: "Governance and stakeholders",
    },
  },
];

const phases = {
  ar: [
    { title: "التأصيل", range: "01—02", description: "من الدليل إلى ضابط شرعي منضبط" },
    { title: "التنزيل القطاعي", range: "03—05", description: "من واقع القطاع إلى اختبارات النشاط" },
    { title: "القياس والحوكمة", range: "06—08", description: "من الأدلة إلى نتيجة وإصدار متجدد" },
  ],
  en: [
    {
      title: "Foundation",
      range: "01—02",
      description: "From evidence to a controlled Shariah rule",
    },
    {
      title: "Sector application",
      range: "03—05",
      description: "From sector reality to activity tests",
    },
    {
      title: "Measurement and governance",
      range: "06—08",
      description: "From evidence to an evolving governed result",
    },
  ],
};

export function MethodologyMapPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const Arrow = en ? ArrowRight : ArrowLeft;
  const route = (ar: string, english: string) => (en ? english : ar);

  return (
    <SiteShell
      lang={lang}
      eyebrow={en ? "From principle to an auditable standard" : "من المبدأ إلى معيار قابل للتدقيق"}
      title={en ? "How SSESBA standards evolve" : "خريطة تطور معايير التصنيف الشرعي"}
    >
      <section className="border-b bg-brand-paper">
        <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
          <p className="max-w-4xl text-xl leading-9 text-brand-navy md:text-2xl">
            {en
              ? "A transparent path linking Shariah evidence to sector reality, activity-level controls, measured outcomes and governed editions."
              : "مسارٌ شفاف يربط الدليل الشرعي بواقع القطاع، ثم بضوابط النشاط والنتيجة المقيسة والإصدار المحكوم."}
          </p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
            {en
              ? "Each transition records its inputs, outputs and responsible expertise so that no score is detached from its evidence or operational context."
              : "توثّق كل مرحلة مدخلاتها ومخرجاتها والخبرة المسؤولة عنها؛ حتى لا تنفصل أي درجة عن دليلها أو سياقها التشغيلي."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:py-16" aria-labelledby="map-heading">
        <div className="grid gap-4 md:grid-cols-3">
          {phases[lang].map((phase) => (
            <div key={phase.range} className="border-t-2 border-brand-gold bg-card px-5 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-brand-navy">{phase.title}</h2>
                <span className="font-mono text-xs text-brand-emerald">{phase.range}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{phase.description}</p>
            </div>
          ))}
        </div>

        <h2 id="map-heading" className="sr-only">
          {en ? "Standards development map" : "خريطة تطور المعايير"}
        </h2>
        <ol className="relative mx-auto mt-12 max-w-5xl">
          <div
            aria-hidden="true"
            className="absolute inset-y-8 start-[1.45rem] w-px bg-brand-gold/50 md:start-1/2"
          />
          {stages.map((stage, index) => {
            const text = stage[lang];
            const Icon = stage.icon;
            const alignStart = index % 2 === 0;
            return (
              <li
                key={stage.number}
                className="relative grid pb-10 md:grid-cols-[1fr_5rem_1fr] md:items-center md:pb-12"
              >
                <div
                  className={`ms-16 border-s-4 bg-card p-5 shadow-sm md:ms-0 md:p-6 ${alignStart ? "border-brand-gold md:col-start-1 md:text-end" : "border-brand-emerald md:col-start-3 md:text-start"}`}
                >
                  <div
                    className={`flex items-center gap-3 ${alignStart ? "md:flex-row-reverse" : ""}`}
                  >
                    <Icon className="size-6 shrink-0 text-brand-emerald" aria-hidden="true" />
                    <div>
                      <span className="font-mono text-xs font-semibold text-brand-gold">
                        {en ? `STAGE ${stage.number}` : `المرحلة ${stage.number}`}
                      </span>
                      <h3 className="mt-1 text-xl font-semibold text-brand-navy md:text-2xl">
                        {text.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{text.summary}</p>
                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                    <div>
                      <dt className="text-xs font-semibold text-brand-emerald">
                        {en ? "Input" : "المدخل"}
                      </dt>
                      <dd className="mt-1 leading-6 text-muted-foreground">{text.input}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-brand-emerald">
                        {en ? "Output" : "المخرج"}
                      </dt>
                      <dd className="mt-1 leading-6 text-muted-foreground">{text.output}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-brand-emerald">
                        {en ? "Expertise" : "الخبرة"}
                      </dt>
                      <dd className="mt-1 leading-6 text-muted-foreground">{text.owner}</dd>
                    </div>
                  </dl>
                </div>
                <div className="absolute start-0 top-6 z-10 grid size-12 place-items-center rounded-full border-2 border-brand-gold bg-brand-navy font-mono text-sm font-bold text-brand-gold md:static md:col-start-2 md:row-start-1 md:mx-auto">
                  {stage.number}
                </div>
                {index < stages.length - 1 && (
                  <ArrowDown
                    aria-hidden="true"
                    className="absolute -bottom-1 start-[1.05rem] z-10 size-5 text-brand-gold md:start-1/2 md:-translate-x-1/2"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="border-y border-brand-gold/25 bg-brand-navy text-brand-paper">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-3 text-brand-gold-soft">
              <BadgeCheck className="size-6" />
              <h2 className="text-2xl font-semibold">
                {en
                  ? "A traceable result, not an isolated score"
                  : "نتيجة قابلة للتتبع، لا درجة منفصلة"}
              </h2>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-paper/75">
              {en
                ? "The map is an indicative methodological explanation. It does not constitute a fatwa or final accreditation; every applied result requires qualified Shariah review and sufficient evidence."
                : "الخريطة شرحٌ منهجي استرشادي، وليست فتوى أو اعتمادًا نهائيًا؛ وكل نتيجة تطبيقية تحتاج مراجعة شرعية مؤهلة وأدلة كافية."}
            </p>
          </div>
          <Button
            asChild
            className="min-h-11 bg-brand-gold text-brand-navy hover:bg-brand-gold-soft"
          >
            <Link to={route("/six", "/en/six")}>
              {en ? "Try the six-level assessment" : "جرّب التقييم السداسي"}
              <Arrow className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-7 flex items-center gap-3">
          <FileSearch className="size-6 text-brand-emerald" />
          <h2 className="text-2xl font-semibold text-brand-navy">
            {en ? "Continue through the methodology" : "تابع المنهجية عمليًا"}
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden border bg-border md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              to: route("/standards", "/en/standards"),
              ar: "اقرأ معايير القطاعات",
              en: "Read sector standards",
              detailAr: "النصوص المرجعية المنظمة",
              detailEn: "Structured reference texts",
            },
            {
              to: "/explorer",
              ar: "استكشف القطاعات والأنشطة",
              en: "Explore sectors and activities",
              detailAr: "العمود التصنيفي والترميز",
              detailEn: "Classification and coding",
            },
            {
              to: route("/six", "/en/six"),
              ar: "طبّق المقياس السداسي",
              en: "Apply the six-level scale",
              detailAr: "الأهلية والمحاور والنتيجة",
              detailEn: "Eligibility, axes and outcome",
            },
            {
              to: route("/waqf", "/en/waqf"),
              ar: "شارك في صياغة المعايير",
              en: "Contribute to the standards",
              detailAr: "دعوة الفقهاء وخبراء القطاعات",
              detailEn: "An invitation to scholars and experts",
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex min-h-36 flex-col justify-between bg-card p-5 transition-colors hover:bg-brand-emerald-soft"
            >
              <span className="text-sm text-muted-foreground">
                {en ? item.detailEn : item.detailAr}
              </span>
              <span className="mt-6 flex items-center justify-between gap-3 font-semibold text-brand-navy">
                {en ? item.en : item.ar}
                <Arrow className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
