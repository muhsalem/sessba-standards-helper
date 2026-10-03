import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";
import { pageHead } from "@/lib/seo";

const title = "شروط الاستخدام | مَشْتَق · SSESBA";
const description = "شروط استخدام أدوات ونتائج معايير التصنيف الشرعي وحدود الاعتماد والمسؤولية.";

export const Route = createFileRoute("/terms")({
  head: () => pageHead({ title, description, path: "/terms", card: "summary" }),
  component: () => <LegalPage lang="ar" kind="terms" />,
});
