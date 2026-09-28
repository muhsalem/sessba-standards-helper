import { createFileRoute } from "@tanstack/react-router";

import { LegacyHtmlPage } from "@/components/LegacyHtmlPage";
import standardHtml from "@/content/ssesba/standard.body.html?raw";
import standardScript from "@/content/ssesba/standard.js?raw";
import "@/content/ssesba/standard.css";

const title = "المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال | معايير التصنيف الشرعي";
const description =
  "إطارٌ معياريٌّ موحّد يصنّف القطاعات والأنشطة الاقتصادية ويقيس امتثالها الشرعي بمنهجيةٍ مُرجّحةٍ شفّافة، على ظهر ISIC Rev.4 ومعايير AAOIFI وقرارات مجامع الفقه.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال, معايير التصنيف الشرعي, م.ش.ت.ق.أ, SSESBA, GSCS, الامتثال الشرعي, الاقتصاد الإسلامي, AAOIFI, ISIC",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ssesba.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ssesba.lovable.app/" }],
  }),
  component: StandardPage,
});

function StandardPage() {
  return <LegacyHtmlPage html={standardHtml} script={standardScript} className="standard-page" lang="ar" dir="rtl" />;
}
