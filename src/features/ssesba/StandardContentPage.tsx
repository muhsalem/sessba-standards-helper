import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ClipboardCheck, Scale } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { Button } from "@/components/ui/button";
import { getStandardSections } from "@/lib/ssesba.functions";
import type { Lang } from "@/lib/ssesba-data";

type Section = Awaited<ReturnType<typeof getStandardSections>>[number];

export function StandardContentPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const get = useServerFn(getStandardSections);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    get().then(setSections).catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [get]);

  return (
    <SiteShell
      lang={lang}
      eyebrow={en ? "Shariah economic classification" : "التقييم والتصنيف الشرعي"}
      title={en ? "The reference standard for assessing economic activities" : "المعيار المرجعي لتقييم وتصنيف الأنشطة الاقتصادية"}
    >
      <section className="border-b bg-brand-paper">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            {en
              ? "A transparent framework combining an eligibility gate, six weighted axes, and an independent Shariah-risk tier."
              : "إطار شفاف يجمع بين بوابة أهلية ملزمة، وستة محاور مرجحة، ومستوى مستقل للمخاطر الشرعية."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-brand-navy text-primary-foreground">
              <Link to={en ? "/en/request" : "/request"}><ClipboardCheck />{en ? "Request assessment" : "اطلب تقييمًا"}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={en ? "/en/assessment" : "/assessment"}><Scale />{en ? "Try the model" : "جرّب النموذج"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={en ? "Sections" : "فهرس الأقسام"} className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <p className="mb-3 text-xs font-semibold tracking-wide text-brand-gold">{en ? "Contents" : "الفهرس"}</p>
          <ol className="space-y-1 border-s border-brand-gold/40 ps-4 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#section-${s.id}`} className="flex gap-2 rounded px-1 py-1.5 leading-6 text-muted-foreground transition-colors hover:text-brand-navy">
                  <span className="font-mono text-xs text-brand-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="line-clamp-2">{en ? s.title_en : s.title_ar}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-3xl">
          {error && <p role="alert" className="text-destructive">{error}</p>}
          <div className="relative border-s border-brand-gold/40">
            {sections.map((s, i) => (
              <article key={s.id} id={`section-${s.id}`} className="relative scroll-mt-28 pb-12 ps-9">
                <span className="absolute -start-4 grid size-8 place-items-center rounded-full border border-brand-gold bg-background font-mono text-xs font-bold text-brand-navy">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display-ar text-2xl font-semibold text-brand-navy">{en ? s.title_en : s.title_ar}</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">{en ? s.body_en : s.body_ar}</p>
              </article>
            ))}
          </div>
          <Button asChild variant="link" className="px-0 text-brand-navy">
            <Link to={en ? "/en/request" : "/request"}>
              {en ? "Start an assessment request" : "ابدأ طلب التقييم"}
              {en ? <ArrowRight /> : <ArrowLeft />}
            </Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
