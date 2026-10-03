import { createFileRoute } from "@tanstack/react-router";
import { SixScalePage } from "@/features/ssesba/SixScalePage";
import { pageHead } from "@/lib/seo";

const title = "المقياس السداسي للامتثال الشرعي | مَشْتَق · SSESBA";
const description =
  "أداة تدقيق شرعي استرشادية تقيّم الشركات وفق المقياس السداسي (100 إلى أقل من 45) مع المعايير القطاعية للقطاعات الأولي والثانوي والخدمي.";

export const Route = createFileRoute("/six")({
  head: () => pageHead({ title, description, path: "/six" }),
  component: () => <SixScalePage lang="ar" />,
});
