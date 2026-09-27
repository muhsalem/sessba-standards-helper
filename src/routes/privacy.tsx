import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";
import { pageHead } from "@/lib/seo";

const title = "سياسة الخصوصية | مَشْتَق · SSESBA";
const description = "سياسة جمع بيانات طلبات التقييم واستخدامها وحمايتها وحقوق أصحاب البيانات.";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead({ title, description, path: "/privacy", card: "summary" }),
  component: () => <LegalPage lang="ar" kind="privacy" />,
});
