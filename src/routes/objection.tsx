import { createFileRoute } from "@tanstack/react-router";
import { ObjectionPage } from "@/features/ssesba/ObjectionPage";
import { pageHead } from "@/lib/seo";

const title = "الاعتراض على نتيجة | مَشْتَق · SSESBA";
const description = "تقديم اعتراض موثق وطلب مراجعة بشرية لنتيجة تقييم استرشادية.";

export const Route = createFileRoute("/objection")({
  head: () => pageHead({ title, description, path: "/objection", card: "summary" }),
  component: () => <ObjectionPage lang="ar" />,
});
