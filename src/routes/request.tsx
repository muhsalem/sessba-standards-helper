import { createFileRoute } from "@tanstack/react-router";
import { RequestPage } from "@/features/ssesba/RequestPage";

const title = "طلب تقييم | معايير التصنيف الشرعي";
const description = "قدّم طلبًا لتقييم نشاط اقتصادي وفق المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال.";

export const Route = createFileRoute("/request")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/request" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/request" }] }),
  component: () => <RequestPage lang="ar" />,
});