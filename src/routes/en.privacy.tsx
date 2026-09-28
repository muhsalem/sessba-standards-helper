import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";

const title = "Privacy policy | SSESBA";
const description = "How assessment-request data is collected, used, protected, and corrected.";
export const Route = createFileRoute("/en/privacy")({ head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/privacy" }] }), component: () => <LegalPage lang="en" kind="privacy" /> });