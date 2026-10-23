import { createFileRoute } from "@tanstack/react-router";
import { ReviewerModelsPage } from "@/features/ssesba/ReviewerModelsPage";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/models")({
  head: () => ({ ...pageHead({ title: "نماذج التقييم الموثقة للمراجع | SSESBA", description: "ملفات تقييم خاصة بالمراجع مع الوثيقة التأسيسية والحوكمة وأدلة التنفيذ والحساب السداسي.", path: "/models" }), meta: [...pageHead({ title: "نماذج التقييم الموثقة للمراجع | SSESBA", description: "ملفات تقييم خاصة بالمراجع مع الوثيقة التأسيسية والحوكمة وأدلة التنفيذ والحساب السداسي.", path: "/models" }).meta, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <ReviewerModelsPage lang="ar" />,
});