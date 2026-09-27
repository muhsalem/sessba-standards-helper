import { createFileRoute } from "@tanstack/react-router";
import { StandardsLibraryPage } from "@/features/ssesba/StandardsLibraryPage";
import { pageHead } from "@/lib/seo";

const title = "معايير القطاعات والصناعات والأنشطة | مَشْتَق · SSESBA";
const description =
  "معايير شرعية متدرّجة على شجرة التصنيف: معيار القطاع ثم الصناعة ثم النشاط، مع ما اعتمدته الهيئة الشرعية من ضوابط وأحكام.";

export const Route = createFileRoute("/standards")({
  head: () => pageHead({ title, description, path: "/standards" }),
  component: () => <StandardsLibraryPage lang="ar" />,
});
