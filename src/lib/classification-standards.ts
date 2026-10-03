import { z } from "zod";
import taxonomyData from "@/content/ssesba/taxonomy.json";
import type { Lang } from "@/lib/ssesba-data";

/**
 * معايير التصنيف المتدرّجة: معيار القطاع يسري على صناعاته، ومعيار الصناعة يسري على أنشطتها،
 * ومعيار النشاط يضيف أحكامه الخاصة. وتبقى بوابة الأهلية والفرز المالي حاكمة على الجميع.
 */

export type Taxonomy = {
  sectors: Array<{ id: string; ar: string; en: string; description: string }>;
  industries: Array<{
    key: string;
    letter: string;
    isic: string;
    ar: string;
    sectors: string[];
    subsectors: Array<{
      ar: string;
      sector: string;
      activities: Array<{ key: string; ar: string }>;
    }>;
  }>;
};

/** مستخرجة من مستكشف التصنيف عبر scripts/extract-taxonomy.mjs؛ لا تُعدَّل يدويًا. */
export const taxonomy = taxonomyData as Taxonomy;

export const standardLevels = [
  { id: "sector", ar: "قطاع", en: "Sector" },
  { id: "industry", ar: "صناعة", en: "Industry" },
  { id: "activity", ar: "نشاط", en: "Activity" },
] as const;
export type StandardLevel = (typeof standardLevels)[number]["id"];

export const standardStatuses = [
  { id: "draft", ar: "مسودة", en: "Draft" },
  { id: "pending_review", ar: "بانتظار المراجعة", en: "Pending review" },
  { id: "approved", ar: "معتمد", en: "Approved" },
  { id: "rejected", ar: "مرفوض — يحتاج تعديلًا", en: "Rejected — needs changes" },
] as const;
export type StandardStatus = (typeof standardStatuses)[number]["id"];

export const requirementKinds = [
  { id: "mandatory", ar: "واجب", en: "Mandatory" },
  { id: "prohibition", ar: "محظور", en: "Prohibited" },
  { id: "condition", ar: "ضابط وشرط", en: "Condition" },
  { id: "recommended", ar: "مستحسن", en: "Recommended" },
] as const;
export type RequirementKind = (typeof requirementKinds)[number]["id"];

const text = (max: number) => z.string().trim().max(max);

export const requirementSchema = z.object({
  kind: z.enum(["mandatory", "prohibition", "condition", "recommended"]),
  ar: text(1200).min(5),
  en: text(1200).optional(),
  ref: text(400).optional(),
});
export type Requirement = z.infer<typeof requirementSchema>;

/** المحتوى القابل للنشر: هو ما يُحفظ لقطةً عند الاعتماد ويُعرض للعموم. */
export const standardContentSchema = z.object({
  titleAr: text(200).min(3),
  titleEn: text(200).optional(),
  summaryAr: text(2000).min(10),
  summaryEn: text(2000).optional(),
  requirements: z.array(requirementSchema).min(1).max(40),
  sources: z.array(text(400).min(2)).max(30),
});
export type StandardContent = z.infer<typeof standardContentSchema>;

export type StandardNode = { level: StandardLevel; key: string };

export function findIndustry(key: string) {
  return taxonomy.industries.find((industry) => industry.key === key);
}

export function findActivity(key: string) {
  for (const industry of taxonomy.industries) {
    for (const subsector of industry.subsectors) {
      const activity = subsector.activities.find((item) => item.key === key);
      if (activity) return { industry, subsector, activity };
    }
  }
  return undefined;
}

export function nodeExists({ level, key }: StandardNode) {
  if (level === "sector") return taxonomy.sectors.some((sector) => sector.id === key);
  if (level === "industry") return Boolean(findIndustry(key));
  return Boolean(findActivity(key));
}

export function nodeLabel({ level, key }: StandardNode, lang: Lang) {
  if (level === "sector") {
    const sector = taxonomy.sectors.find((item) => item.id === key);
    return sector ? sector[lang] : key;
  }
  if (level === "industry") {
    const industry = findIndustry(key);
    return industry ? `${industry.ar} (${industry.isic})` : key;
  }
  return findActivity(key)?.activity.ar ?? key;
}

/**
 * سلسلة المعايير السارية على عقدة: النشاط يرث صناعته وقطاعه الفرعي،
 * والصناعة ترث قطاعاتها (قد تمتد الصناعة على أكثر من قطاع).
 */
export function inheritanceChain(node: StandardNode): StandardNode[] {
  if (node.level === "sector") return [node];
  if (node.level === "industry") {
    const industry = findIndustry(node.key);
    return [
      ...(industry?.sectors ?? []).map((id) => ({ level: "sector" as const, key: id })),
      node,
    ];
  }
  const found = findActivity(node.key);
  if (!found) return [node];
  return [
    { level: "sector", key: found.subsector.sector },
    { level: "industry", key: found.industry.key },
    node,
  ];
}

export function industriesForSector(sectorId: string) {
  return taxonomy.industries.filter((industry) => industry.sectors.includes(sectorId));
}

export function label<T extends { ar: string; en: string }>(
  items: readonly T[],
  id: string,
  lang: Lang,
) {
  return items.find((item) => (item as unknown as { id: string }).id === id)?.[lang] ?? id;
}
