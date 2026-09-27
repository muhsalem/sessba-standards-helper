import { createFileRoute } from "@tanstack/react-router";
import { AssessmentPage } from "@/features/ssesba/AssessmentPage";
import { pageHead } from "@/lib/seo";

const title = "نموذج التقييم | مَشْتَق · SSESBA";
const description =
  "نموذج تفاعلي لتطبيق معايير التصنيف الشرعي على نماذج قطاعية واقعية مع بوابة الأهلية وحدود الفرز المالي وعرض النتيجة المرجحة.";

export const Route = createFileRoute("/assessment")({
  head: () => pageHead({ title, description, path: "/assessment" }),
  component: () => <AssessmentPage lang="ar" />,
});
