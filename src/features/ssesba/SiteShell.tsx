import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  FileCheck2,
  Languages,
  Layers,
  Menu,
  MessagesSquare,
  Scale,
  Search,
  Send,
  ShieldCheck,
  HandHeart,
  ListTree,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AccountLink } from "./AccountLink";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brand, copy, type Lang } from "@/lib/ssesba-data";

export function SiteShell({
  lang,
  title,
  eyebrow,
  children,
}: {
  lang: Lang;
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  const t = copy[lang];
  const en = lang === "en";
  const base = en ? "/en" : "/";
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const languagePath = en
    ? pathname.replace(/^\/en/, "") || "/"
    : `/en${pathname === "/" ? "" : pathname}`;
  const links = [
    { to: base, label: t.standard, icon: BookOpenText },
    { to: en ? "/en/assessment" : "/assessment", label: t.assessment, icon: FileCheck2 },
    { to: en ? "/en/request" : "/request", label: t.request, icon: Send },
    { to: en ? "/en/assistant" : "/assistant", label: t.assistant, icon: MessagesSquare },
    { to: en ? "/en/six" : "/six", label: t.six, icon: Scale },
    { to: en ? "/en/standards" : "/standards", label: t.sectorStandards, icon: Layers },
    {
      to: en ? "/en/classification-standards" : "/classification-standards",
      label: t.tieredStandards,
      icon: ListTree,
    },
    { to: "/explorer", label: t.explorer, icon: Search },
    { to: en ? "/en/map" : "/map", label: en ? "Evolution map" : "خريطة التطور", icon: Layers },
    { to: en ? "/en/waqf" : "/waqf", label: t.waqf, icon: HandHeart },
  ];
  // في الشريط العلوي تُعرض الروابط في صف واحد بلا التفاف؛ وفي القائمة الجانبية عمودًا.
  const renderNav = (label: string, inline = false) => (
    <nav
      aria-label={label}
      className={inline ? "flex flex-wrap items-center gap-0.5" : "grid gap-1"}
    >
      {links.map(({ to, label: linkLabel, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2 rounded-md py-2 text-sm transition-colors ${inline ? "whitespace-nowrap px-2.5" : "px-3"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold ${active ? "bg-brand-gold text-brand-navy" : "text-brand-paper/80 hover:bg-brand-paper/10 hover:text-brand-paper"}`}
          >
            {!inline && <Icon className="size-4" />}
            {linkLabel}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <div
      className="brand-surface min-h-screen bg-background text-foreground"
      dir={en ? "ltr" : "rtl"}
    >
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-background px-4 py-3 text-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {en ? "Skip to main content" : "تخطَّ إلى المحتوى الرئيسي"}
      </a>
      <header className="sticky top-0 z-50 border-b border-brand-gold/30 bg-brand-navy text-brand-paper shadow-sm">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5">
          <Link
            to={base}
            className="flex min-w-0 items-center gap-3"
            title={`${brand[lang].short} — ${brand[lang].full}`}
          >
            <span className="relative grid size-12 shrink-0 place-items-center rounded-md border border-brand-gold text-brand-gold">
              <span className="font-display-ar text-2xl font-bold">{en ? "S" : "م"}</span>
              <span className="absolute inset-1 rounded-sm border border-brand-gold/25" />
            </span>
            <span className="min-w-0">
              <b className="block truncate font-display-ar text-xl leading-none">
                {brand[lang].short}
              </b>
              <small className="mt-1 block text-xs text-brand-gold-soft">
                {lang === "en" ? "Shariah classification standards" : brand.ar.acronym}
              </small>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <AccountLink en={en} />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="min-h-11 border-brand-gold/60 bg-transparent text-brand-paper hover:bg-brand-gold hover:text-brand-navy"
            >
              <Link
                to={languagePath}
                aria-label={en ? "التبديل إلى العربية" : "Switch to English"}
                lang={en ? "ar" : "en"}
              >
                <Languages />
                <span className="hidden sm:inline">{t.language}</span>
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11 border-brand-gold/60 bg-transparent text-brand-paper hover:bg-brand-gold hover:text-brand-navy xl:hidden"
                  aria-label={en ? "Open menu" : "فتح القائمة"}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={en ? "left" : "right"}
                className="border-brand-gold/30 bg-brand-navy text-brand-paper"
              >
                <SheetHeader>
                  <SheetTitle className="text-start text-brand-gold">
                    {brand[lang].short}
                  </SheetTitle>
                </SheetHeader>
                <div className="px-4 py-6">
                  {renderNav(en ? "Mobile navigation" : "تنقل الهاتف")}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* الروابط في صف ثانٍ على الشاشات العريضة، فتتسع بالإنجليزية والعربية دون تمرير أفقي. */}
        <div className="hidden border-t border-brand-gold/20 xl:block">
          <div className="mx-auto max-w-7xl px-5 py-1">
            {renderNav(en ? "Primary navigation" : "التنقل الرئيسي", true)}
          </div>
        </div>
      </header>
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-brand-gold/20 bg-brand-navy text-brand-paper">
          <div className="absolute inset-x-0 bottom-0 h-px brand-rule" />
          <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
            <div className="mb-5 flex items-center gap-3 text-xs font-semibold text-brand-gold-soft">
              <span className="h-px w-8 bg-brand-gold" />
              {eyebrow}
            </div>
            <h1 className="max-w-4xl text-balance font-display-ar text-3xl sm:text-4xl font-semibold leading-tight md:text-6xl">
              {title}
            </h1>
          </div>
        </section>
        {children}
      </main>
      <footer className="mt-16 border-t border-brand-gold/25 bg-brand-navy text-brand-paper">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-9 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2 font-display-ar text-lg text-brand-gold-soft">
              <ShieldCheck className="size-5" />
              {brand[lang].short === brand[lang].acronym
                ? brand[lang].short
                : `${brand[lang].short} · ${brand[lang].acronym}`}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-brand-paper/80">
              {copy[lang].advisory}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-brand-paper/80">
              {en
                ? "A knowledge endowment for the Muslim ummah; no registered legal waqf deed is claimed."
                : "وقف معرفي لخدمة الأمة الإسلامية؛ لا يُدّعى به إنشاء صك وقف قانوني مسجل."}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-gold-soft [&_a]:underline-offset-4 [&_a:hover]:underline">
              <Link to={en ? "/en/waqf" : "/waqf"}>{t.waqf}</Link>
              <Link to={en ? "/en/privacy" : "/privacy"}>{en ? "Privacy" : "الخصوصية"}</Link>
              <Link to={en ? "/en/terms" : "/terms"}>{en ? "Terms" : "الشروط"}</Link>
              <Link to={en ? "/en/objection" : "/objection"}>
                {en ? "Object to a result" : "الاعتراض على نتيجة"}
              </Link>
            </div>
          </div>
          <Link to={base} className="flex items-center gap-2 text-sm text-brand-gold-soft">
            {en ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            {t.back}
          </Link>
        </div>
      </footer>
    </div>
  );
}
