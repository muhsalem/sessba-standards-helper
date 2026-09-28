import { createFileRoute } from "@tanstack/react-router";
import { ObjectionPage } from "@/features/ssesba/ObjectionPage";

const title = "Object to an assessment result | SSESBA";
const description = "Submit a documented objection and request human review of an indicative assessment result.";
export const Route = createFileRoute("/en/objection")({ head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/objection" }] }), component: () => <ObjectionPage lang="en" /> });