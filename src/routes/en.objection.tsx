import { createFileRoute } from "@tanstack/react-router";
import { ObjectionPage } from "@/features/ssesba/ObjectionPage";
import { pageHead } from "@/lib/seo";

const title = "Object to an assessment result | SSESBA";
const description =
  "Submit a documented objection and request human review of an indicative assessment result.";

export const Route = createFileRoute("/en/objection")({
  head: () => pageHead({ title, description, path: "/en/objection", card: "summary" }),
  component: () => <ObjectionPage lang="en" />,
});
