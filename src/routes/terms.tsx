import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";

const title = "شروط الاستخدام | معايير التصنيف الشرعي";
const description = "شروط استخدام أدوات ونتائج معايير التصنيف الشرعي وحدود الاعتماد والمسؤولية.";
export const Route = createFileRoute("/terms")({ head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/terms" }] }), component: () => <LegalPage lang="ar" kind="terms" /> });