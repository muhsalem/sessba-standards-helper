import { createFileRoute } from "@tanstack/react-router";

import { LegacyHtmlPage } from "@/components/LegacyHtmlPage";
import explorerHtml from "@/content/ssesba/explorer.body.html?raw";
import explorerScript from "@/content/ssesba/explorer.js?raw";
import "@/content/ssesba/explorer.css";

const title = "مستكشف التصنيف الاقتصادي — SSESBA / GSCS";
const description =
  "استكشف عمود التصنيف من خمسة مستويات: القطاع الاقتصادي، الصناعة، القطاع الفرعي، النشاط الاقتصادي، والنشاط الفرعي، مع الأبعاد الوصفية والامتثال الشرعي.";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ssesba.lovable.app/explorer" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ssesba.lovable.app/explorer" }],
  }),
  component: ExplorerPage,
});

function ExplorerPage() {
  return <LegacyHtmlPage html={explorerHtml} script={explorerScript} className="explorer-page" lang="ar" dir="rtl" />;
}
