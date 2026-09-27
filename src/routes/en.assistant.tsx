import { createFileRoute } from "@tanstack/react-router";
import { AssistantPage } from "@/features/ssesba/AssistantPage";
import { pageHead } from "@/lib/seo";

const title = "Standards Reading Assistant | SSESBA";
const description =
  "Ask a question or paste standard text to get a plain-language explanation grounded in the SSESBA standard content.";

export const Route = createFileRoute("/en/assistant")({
  head: () => pageHead({ title, description, path: "/en/assistant" }),
  component: () => <AssistantPage lang="en" />,
});
