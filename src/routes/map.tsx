import { createFileRoute } from "@tanstack/react-router";
import { MethodologyMapPage } from "@/features/ssesba/MethodologyMapPage";

const title = "خريطة تطور المعايير | معايير التصنيف الشرعي";
const description = "كيف تتطور معايير التصنيف الشرعي من المبدأ الشرعي إلى معايير القطاعات وأنشطة الأعمال.";
export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/map" }] }),
  component: () => <MethodologyMapPage lang="ar" />,
});
