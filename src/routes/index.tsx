import { createFileRoute } from "@tanstack/react-router";

import { LegacyHtmlPage } from "@/components/LegacyHtmlPage";
import { pageHead } from "@/lib/seo";
import standardHtml from "@/content/ssesba/standard.body.html?raw";
import standardScript from "@/content/ssesba/standard.js?raw";
import "@/content/ssesba/standard.css";

const title = "المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال | مَشْتَق · SSESBA";
const description =
  "إطارٌ معياريٌّ موحّد يصنّف القطاعات والأنشطة الاقتصادية ويقيس امتثالها الشرعي بمنهجيةٍ مُرجّحةٍ شفّافة، على ظهر ISIC Rev.4 ومعايير AAOIFI وقرارات مجامع الفقه.";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title,
      description,
      path: "/",
      keywords:
        "المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال, معايير التصنيف الشرعي, مَشْتَق, مشتق, SSESBA, GSCS, الامتثال الشرعي, الاقتصاد الإسلامي, AAOIFI, ISIC",
    }),
  component: StandardPage,
});

function StandardPage() {
  return (
    <LegacyHtmlPage
      html={standardHtml}
      script={standardScript}
      className="standard-page"
      lang="ar"
      dir="rtl"
    />
  );
}
