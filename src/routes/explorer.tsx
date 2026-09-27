import { createFileRoute } from "@tanstack/react-router";

import { LegacyHtmlPage } from "@/components/LegacyHtmlPage";
import { pageHead } from "@/lib/seo";
import explorerHtml from "@/content/ssesba/explorer.body.html?raw";
import explorerScript from "@/content/ssesba/explorer.js?raw";
import "@/content/ssesba/explorer.css";

const title = "مستكشف التصنيف الاقتصادي — مَشْتَق · SSESBA";
const description =
  "استكشف عمود التصنيف من خمسة مستويات: القطاع الاقتصادي، الصناعة، القطاع الفرعي، النشاط الاقتصادي، والنشاط الفرعي، مع الأبعاد الوصفية والامتثال الشرعي.";

export const Route = createFileRoute("/explorer")({
  head: () => pageHead({ title, description, path: "/explorer" }),
  component: ExplorerPage,
});

function ExplorerPage() {
  return (
    <LegacyHtmlPage
      html={explorerHtml}
      script={explorerScript}
      className="explorer-page"
      lang="ar"
      dir="rtl"
    />
  );
}
