import { createFileRoute } from "@tanstack/react-router";
import { SixScalePage } from "@/features/ssesba/SixScalePage";

const title = "Six-Level Shariah Compliance Scale | SSESBA";
const description = "An indicative Shariah audit tool assessing companies on the six-level scale (100 down to below 45) with sector standards for primary, secondary, and services sectors.";

export const Route = createFileRoute("/en/six")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/en/six" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/six" }] }),
  component: () => <SixScalePage lang="en" />,
});
