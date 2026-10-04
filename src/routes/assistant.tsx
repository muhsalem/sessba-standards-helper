import { createFileRoute } from "@tanstack/react-router";
import { AssistantPage } from "@/features/ssesba/AssistantPage";
import { pageHead } from "@/lib/seo";

const title = "المساعد الشرعي لقراءة المعيار | مَشْتَق · SSESBA";
const description =
  "اطرح سؤالًا أو الصق نصًا، فيُنتج المساعد شرحًا مبسطًا وإجابة مرتبطة بمحتوى معايير التصنيف الشرعي (مَشْتَق · SSESBA).";

export const Route = createFileRoute("/assistant")({
  head: () => pageHead({ title, description, path: "/assistant" }),
  component: () => <AssistantPage lang="ar" />,
});
