import { createFileRoute } from "@tanstack/react-router";
import { AssessmentPage } from "@/features/ssesba/AssessmentPage";

const title = "نموذج التقييم | معايير التصنيف الشرعي";
const description = "نموذج تفاعلي لتطبيق معايير التصنيف الشرعي على نشاط مستشفى عام وعرض النتيجة المرجحة.";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/assessment" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/assessment" }] }),
  component: () => <AssessmentPage lang="ar" />,
});