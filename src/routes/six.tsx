import { createFileRoute } from "@tanstack/react-router";
import { SixScalePage } from "@/features/ssesba/SixScalePage";

const title = "المقياس السداسي للامتثال الشرعي | معايير التصنيف الشرعي";
const description = "أداة تدقيق شرعي استرشادية تقيّم الشركات وفق المقياس السداسي (100 إلى أقل من 45) مع المعايير القطاعية للقطاعات الأولي والثانوي والخدمي.";

export const Route = createFileRoute("/six")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/six" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/six" }] }),
  component: () => <SixScalePage lang="ar" />,
});
