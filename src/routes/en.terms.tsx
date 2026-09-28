import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";

const title = "Terms of use | SSESBA";
const description = "Terms governing indicative SSESBA tools and results, including reliance limitations.";
export const Route = createFileRoute("/en/terms")({ head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/terms" }] }), component: () => <LegalPage lang="en" kind="terms" /> });