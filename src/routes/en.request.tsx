import { createFileRoute } from "@tanstack/react-router";
import { RequestPage } from "@/features/ssesba/RequestPage";

const title = "Request an Assessment | SSESBA";
const description = "Request an assessment of an economic activity under SSESBA — Shariah Standards for Economic Sectors & Business Activities.";

export const Route = createFileRoute("/en/request")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/en/request" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/request" }] }),
  component: () => <RequestPage lang="en" />,
});