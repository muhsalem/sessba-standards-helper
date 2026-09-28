import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { LegacyHtmlPage } from "@/components/LegacyHtmlPage";
import standardEnglishHtml from "@/content/ssesba/standard.en.body.html?raw";
import standardScript from "@/content/ssesba/standard.js?raw";
import "@/content/ssesba/standard.css";

const title = "SSESBA — Shariah Standards for Economic Sectors & Business Activities";
const description =
  "A unified reference framework for classifying economic sectors and measuring Shariah compliance across business activities.";

export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ssesba.lovable.app/en" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en" }],
  }),
  component: EnglishStandardPage,
});

function EnglishStandardPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname !== "/en" && pathname !== "/en/") return <Outlet />;
  return (
    <LegacyHtmlPage
      html={standardEnglishHtml}
      script={standardScript}
      className="standard-page"
      lang="en"
      dir="ltr"
    />
  );
}