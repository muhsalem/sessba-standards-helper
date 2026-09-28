import { createFileRoute } from "@tanstack/react-router";
import { AssessmentPage } from "@/features/ssesba/AssessmentPage";

const title = "Assessment Model | SSESBA";
const description = "An interactive hospital example applying the SSESBA weighted assessment model and Shariah risk matrix.";

export const Route = createFileRoute("/en/assessment")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/en/assessment" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/assessment" }] }),
  component: () => <AssessmentPage lang="en" />,
});