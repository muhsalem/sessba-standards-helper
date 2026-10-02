import { createFileRoute } from "@tanstack/react-router";
import { MethodologyMapPage } from "@/features/ssesba/MethodologyMapPage";

const title = "Standards Evolution Map | SSESBA";
const description = "How SSESBA standards evolve from Shariah principles to sector and business-activity standards.";
export const Route = createFileRoute("/en/map")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/map" }] }),
  component: () => <MethodologyMapPage lang="en" />,
});
