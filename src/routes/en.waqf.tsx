import { createFileRoute } from "@tanstack/react-router";
import { WaqfPage } from "@/features/ssesba/WaqfPage";

const title = "Knowledge Waqf & Expert Contributions | SSESBA";
const description = "An invitation to Shariah scholars, jurists, industry practitioners and business experts to help draft and review the Shariah Standards for Economic Sectors & Business Activities.";
export const Route = createFileRoute("/en/waqf")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/waqf" }] }),
  component: () => <WaqfPage lang="en" />,
});