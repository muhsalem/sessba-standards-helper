import { createFileRoute } from "@tanstack/react-router";
import { ObjectionPage } from "@/features/ssesba/ObjectionPage";

const title = "الاعتراض على نتيجة | معايير التصنيف الشرعي";
const description = "تقديم اعتراض موثق وطلب مراجعة بشرية لنتيجة تقييم استرشادية.";
export const Route = createFileRoute("/objection")({ head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/objection" }] }), component: () => <ObjectionPage lang="ar" /> });