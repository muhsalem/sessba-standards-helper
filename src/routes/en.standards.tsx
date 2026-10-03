import { createFileRoute } from "@tanstack/react-router";
import { StandardContentPage } from "@/features/ssesba/StandardContentPage";

const title = "Sector Standards | SSESBA";
const description =
  "The reference standard for assessing and classifying economic activities under the Shariah Standards for Economic Sectors & Business Activities.";

export const Route = createFileRoute("/en/standards")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ssesba.lovable.app/en/standards" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/standards" }],
  }),
  component: () => <StandardContentPage lang="en" />,
});
