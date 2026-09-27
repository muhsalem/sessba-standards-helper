import { createFileRoute } from "@tanstack/react-router";

import { LegacyHtmlPage } from "@/components/LegacyHtmlPage";
import { pageHead } from "@/lib/seo";
import standardEnglishHtml from "@/content/ssesba/standard.en.body.html?raw";
import standardScript from "@/content/ssesba/standard.js?raw";
import "@/content/ssesba/standard.css";

const title = "SSESBA — Shariah Standards for Economic Sectors & Business Activities";
const description =
  "A unified reference framework for classifying economic sectors and measuring Shariah compliance across business activities.";

export const Route = createFileRoute("/en/")({
  head: () => pageHead({ title, description, path: "/en" }),
  component: EnglishStandardPage,
});

function EnglishStandardPage() {
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
