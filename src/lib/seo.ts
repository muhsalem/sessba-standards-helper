/** النطاق الرسمي المعتمد للمنصة. */
export const siteUrl = "https://ssesba.lovable.app";

/** المسارات المتقابلة بين العربية والإنجليزية لروابط hreflang. */
const arToEn: Record<string, string> = {
  "/": "/en",
  "/assessment": "/en/assessment",
  "/six": "/en/six",
  "/assistant": "/en/assistant",
  "/request": "/en/request",
  "/standards": "/en/standards",
  "/objection": "/en/objection",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
};
const enToAr = Object.fromEntries(Object.entries(arToEn).map(([ar, en]) => [en, ar]));

type HeadOptions = {
  title: string;
  description: string;
  path: string;
  card?: "summary" | "summary_large_image";
  keywords?: string;
};

/** وسوم الرأس الموحدة: العنوان والوصف وOpen Graph والرابط الأساسي وروابط اللغة البديلة. */
export function pageHead({
  title,
  description,
  path,
  card = "summary_large_image",
  keywords,
}: HeadOptions) {
  const url = `${siteUrl}${path}`;
  const english = path === "/en" || path.startsWith("/en/");
  const ar = english ? enToAr[path] : path;
  const en = english ? path : arToEn[path];
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(keywords ? [{ name: "keywords", content: keywords }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: english ? "en_US" : "ar_AR" },
      { name: "twitter:card", content: card },
    ],
    links: [
      { rel: "canonical", href: url },
      ...(ar && en
        ? [
            { rel: "alternate", hrefLang: "ar", href: `${siteUrl}${ar}` },
            { rel: "alternate", hrefLang: "en", href: `${siteUrl}${en}` },
            { rel: "alternate", hrefLang: "x-default", href: `${siteUrl}${ar}` },
          ]
        : []),
    ],
  };
}
