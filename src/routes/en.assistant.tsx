import { createFileRoute } from "@tanstack/react-router";
import { AssistantPage } from "@/features/ssesba/AssistantPage";

const title = "Standards Reading Assistant | SSESBA";
const description = "Ask a question or paste standard text to get a plain-language explanation grounded in the SSESBA standard content.";

export const Route = createFileRoute("/en/assistant")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://ssesba.lovable.app/en/assistant" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "https://ssesba.lovable.app/en/assistant" }] }),
  component: () => <AssistantPage lang="en" />,
});
