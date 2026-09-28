import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";

const title = "سياسة الخصوصية | معايير التصنيف الشرعي";
const description = "سياسة جمع بيانات طلبات التقييم واستخدامها وحمايتها وحقوق أصحاب البيانات.";
export const Route = createFileRoute("/privacy")({ head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/privacy" }] }), component: () => <LegalPage lang="ar" kind="privacy" /> });