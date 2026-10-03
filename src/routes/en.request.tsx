import { createFileRoute } from "@tanstack/react-router";
import { RequestPage } from "@/features/ssesba/RequestPage";
import { pageHead } from "@/lib/seo";

const title = "Request an Assessment | SSESBA";
const description =
  "Request an assessment of an economic activity under SSESBA — Shariah Standards for Economic Sectors & Business Activities.";

export const Route = createFileRoute("/en/request")({
  head: () => pageHead({ title, description, path: "/en/request" }),
  component: () => <RequestPage lang="en" />,
});
