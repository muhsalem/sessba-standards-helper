import { createFileRoute } from "@tanstack/react-router";
import { StandardContentPage } from "@/features/ssesba/StandardContentPage";

const title = "معايير القطاعات | معايير التصنيف الشرعي";
const description = "المعيار المرجعي لتقييم وتصنيف الأنشطة الاقتصادية وفق المعايير الشرعية للقطاعات الاقتصادية وأنشطة الأعمال.";

export const Route = createFileRoute("/standards")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/standards" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/standards" }] }),
  component: () => <StandardContentPage lang="ar" />,
});
