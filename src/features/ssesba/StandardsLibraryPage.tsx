import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookMarked, FileClock, Layers } from "lucide-react";
import { SiteShell } from "./SiteShell";
import {
  findIndustry,
  industriesForSector,
  inheritanceChain,
  nodeLabel,
  requirementKinds,
  standardLevels,
  taxonomy,
  type StandardLevel,
  type StandardNode,
} from "@/lib/classification-standards";
import { copy, type Lang } from "@/lib/ssesba-data";
import { getPublishedClassificationStandards } from "@/lib/standards.functions";

type Library = Awaited<ReturnType<typeof getPublishedClassificationStandards>>;
type Published = Library["published"][number];

const l10n = {
  ar: {
    eyebrow: "المعايير المتدرّجة",
    title: "معايير القطاعات والصناعات والأنشطة",
    intro:
      "تتدرّج المعايير الشرعية على شجرة التصنيف: معيار القطاع يسري على كل صناعاته، ومعيار الصناعة يسري على أنشطتها، ومعيار النشاط يضيف أحكامه الخاصة. وعند التعارض يُقدَّم الأخص. وتبقى بوابة الأهلية وحدود الفرز المالي والمحاور الستة حاكمةً على جميع المستويات.",
    sector: "القطاع",
    industry: "الصناعة",
    activity: "النشاط",
    any: "— كل الصناعات —",
    anyActivity: "— كل الأنشطة —",
    chain: "المعايير السارية على الاختيار",
    none: "لا يوجد معيار معتمد لهذا المستوى بعد؛ تنطبق بوابة الأهلية والمحاور العامة.",
    drafting: "مسودة قيد الإعداد والمراجعة لدى الهيئة الشرعية.",
    sources: "المراجع",
    version: "الإصدار",
    published: "اعتُمد في",
    coverage: "التغطية",
    approvedCount: "معيار معتمد",
    inProgressCount: "قيد الإعداد أو المراجعة",
    loading: "جارٍ التحميل…",
    namesNote: "",
  },
  en: {
    eyebrow: "Tiered standards",
    title: "Sector, industry and activity standards",
    intro:
      "Shariah standards are tiered along the classification tree: a sector standard applies to all its industries, an industry standard to its activities, and an activity standard adds its own rulings. Where they differ, the more specific one prevails. The eligibility gate, financial screens and six axes govern every level.",
    sector: "Sector",
    industry: "Industry",
    activity: "Activity",
    any: "— All industries —",
    anyActivity: "— All activities —",
    chain: "Standards applying to this selection",
    none: "No approved standard for this level yet; the eligibility gate and general axes apply.",
    drafting: "A draft is being prepared and reviewed by the Shariah board.",
    sources: "Sources",
    version: "Version",
    published: "Approved on",
    coverage: "Coverage",
    approvedCount: "approved standards",
    inProgressCount: "in drafting or review",
    loading: "Loading…",
    namesNote: "Industry and activity names are shown in Arabic, as in the classification source.",
  },
} as const;

function StandardCard({
  node,
  published,
  drafting,
  lang,
}: {
  node: StandardNode;
  published?: Published | undefined;
  drafting: boolean;
  lang: Lang;
}) {
  const t = l10n[lang];
  const levelName = standardLevels.find((level) => level.id === node.level)?.[lang];
  const content = published?.content;
  const pick = (ar?: string, en?: string) => (lang === "en" && en ? en : (ar ?? ""));
  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold text-muted-foreground">
        {levelName} · {nodeLabel(node, lang)}
      </p>
      {content ? (
        <>
          <h3 className="mt-2 text-lg font-semibold text-brand-navy">
            {pick(content.titleAr, content.titleEn)}
          </h3>
          <p className="mt-2 text-sm leading-7 text-foreground/85">
            {pick(content.summaryAr, content.summaryEn)}
          </p>
          {requirementKinds.map((kind) => {
            const items = content.requirements.filter((item) => item.kind === kind.id);
            if (items.length === 0) return null;
            return (
              <section key={kind.id} className="mt-4">
                <h4 className="text-sm font-semibold text-brand-navy">{kind[lang]}</h4>
                <ul className="mt-2 grid gap-2 text-sm leading-7">
                  {items.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-md border-s-4 border-brand-gold/70 bg-brand-parchment/40 px-3 py-2"
                    >
                      {pick(item.ar, item.en)}
                      {item.ref && (
                        <span className="mt-1 block text-xs text-muted-foreground">{item.ref}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {content.sources.length > 0 && (
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              <b>{t.sources}:</b> {content.sources.join(lang === "ar" ? "، " : ", ")}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {t.version} {published?.version}
            {published?.publishedAt
              ? ` · ${t.published} ${new Date(published.publishedAt).toLocaleDateString(lang)}`
              : ""}
          </p>
        </>
      ) : (
        <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
          <p>{t.none}</p>
          {drafting && (
            <p className="flex items-center gap-2 font-medium text-brand-navy">
              <FileClock className="size-4 text-brand-gold" />
              {t.drafting}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export function StandardsLibraryPage({ lang }: { lang: Lang }) {
  const t = l10n[lang];
  const load = useServerFn(getPublishedClassificationStandards);
  const [library, setLibrary] = useState<Library | null>(null);
  const [error, setError] = useState("");
  const [sector, setSector] = useState(taxonomy.sectors[0]!.id);
  const [industry, setIndustry] = useState("");
  const [activity, setActivity] = useState("");

  useEffect(() => {
    load()
      .then(setLibrary)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [load]);

  const industries = industriesForSector(sector);
  const subsectors = useMemo(
    () =>
      (findIndustry(industry)?.subsectors ?? []).filter((subsector) => subsector.sector === sector),
    [industry, sector],
  );
  const node: StandardNode = activity
    ? { level: "activity", key: activity }
    : industry
      ? { level: "industry", key: industry }
      : { level: "sector", key: sector };
  const chain = inheritanceChain(node);
  const find = (item: StandardNode) =>
    library?.published.find((row) => row.level === item.level && row.nodeKey === item.key);
  const drafting = (item: StandardNode) =>
    Boolean(
      library?.inProgress.some((row) => row.level === item.level && row.nodeKey === item.key),
    );
  const count = (level: StandardLevel) =>
    library?.published.filter((row) => row.level === level).length ?? 0;
  const field = "mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <SiteShell lang={lang} eyebrow={t.eyebrow} title={t.title}>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="max-w-3xl leading-8 text-muted-foreground">{t.intro}</p>
        {t.namesNote && <p className="mt-2 text-xs text-muted-foreground">{t.namesNote}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm" aria-live="polite">
          <Layers className="size-5 text-brand-gold" />
          <span className="font-semibold">{t.coverage}:</span>
          {library ? (
            <>
              {standardLevels.map((level) => (
                <span key={level.id} className="rounded-full border px-3 py-1">
                  {level[lang]}: {count(level.id)} {t.approvedCount}
                </span>
              ))}
              <span className="rounded-full border border-brand-gold/50 bg-brand-parchment px-3 py-1">
                {library.inProgress.length} {t.inProgressCount}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{error || t.loading}</span>
          )}
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-3">
          <div>
            <label htmlFor="std-sector" className="text-sm font-semibold text-brand-navy">
              {t.sector}
            </label>
            <select
              id="std-sector"
              className={field}
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setIndustry("");
                setActivity("");
              }}
            >
              {taxonomy.sectors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item[lang]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="std-industry" className="text-sm font-semibold text-brand-navy">
              {t.industry}
            </label>
            <select
              id="std-industry"
              className={field}
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setActivity("");
              }}
            >
              <option value="">{t.any}</option>
              {industries.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.ar} ({item.isic})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="std-activity" className="text-sm font-semibold text-brand-navy">
              {t.activity}
            </label>
            <select
              id="std-activity"
              className={field}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              disabled={!industry}
            >
              <option value="">{t.anyActivity}</option>
              {subsectors.map((subsector) => (
                <optgroup key={subsector.ar} label={subsector.ar}>
                  {subsector.activities.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.ar}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-10 flex items-center gap-2 text-xl font-semibold text-brand-navy">
          <BookMarked className="size-5 text-brand-gold" />
          {t.chain}
        </h2>
        <div className="mt-4 grid gap-4" aria-live="polite">
          {chain.map((item) => (
            <StandardCard
              key={`${item.level}:${item.key}`}
              node={item}
              published={find(item)}
              drafting={drafting(item)}
              lang={lang}
            />
          ))}
        </div>
        <p className="mt-8 border-t pt-4 text-xs leading-6 text-muted-foreground">
          {copy[lang].advisory}
        </p>
      </section>
    </SiteShell>
  );
}
