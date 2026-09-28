import { createFileRoute } from "@tanstack/react-router";
import { AssistantPage } from "@/features/ssesba/AssistantPage";

const title = "المساعد الشرعي لقراءة المعيار | معايير التصنيف الشرعي";
const description = "اطرح سؤالًا أو الصق نصًا، فيُنتج المساعد شرحًا مبسطًا وإجابة مرتبطة بمحتوى معايير التصنيف الشرعي (م.ش.ت.ق.أ · SSESBA).";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/assistant" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/assistant" }] }),
  component: () => <AssistantPage lang="ar" />,
});
