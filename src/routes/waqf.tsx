import { createFileRoute } from "@tanstack/react-router";
import { WaqfPage } from "@/features/ssesba/WaqfPage";

const title = "الوقف المعرفي ومشاركة الخبراء | معايير التصنيف الشرعي";
const description =
  "دعوة للفقهاء والمدققين الشرعيين وخبراء الصناعة وأنشطة الأعمال للمشاركة في صياغة المعايير الشرعية لتصنيف القطاعات الاقتصادية وأنشطة الأعمال.";
export const Route = createFileRoute("/waqf")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://ssesba.lovable.app/waqf" }],
  }),
  component: () => <WaqfPage lang="ar" />,
});
