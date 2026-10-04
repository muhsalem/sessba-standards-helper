import { createFileRoute } from "@tanstack/react-router";
import { RequestPage } from "@/features/ssesba/RequestPage";
import { pageHead } from "@/lib/seo";

const title = "طلب تقييم | مَشْتَق · SSESBA";
const description =
  "قدّم طلبًا لتقييم نشاط اقتصادي وفق المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال.";

export const Route = createFileRoute("/request")({
  head: () => pageHead({ title, description, path: "/request" }),
  component: () => <RequestPage lang="ar" />,
});
