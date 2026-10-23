import { createFileRoute } from "@tanstack/react-router";
import { ReviewerModelsPage } from "@/features/ssesba/ReviewerModelsPage";
import { pageHead } from "@/lib/seo";
const head = () => pageHead({ title: "Documented reviewer assessment models | SSESBA", description: "Private reviewer assessment files with founding, governance and implementation evidence documents and six-level calculation.", path: "/en/models" });
export const Route = createFileRoute("/_authenticated/en/models")({
  head: () => ({ ...head(), meta: [...head().meta, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <ReviewerModelsPage lang="en" />,
});