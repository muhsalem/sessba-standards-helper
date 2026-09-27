import { createFileRoute } from "@tanstack/react-router";
import { StandardsLibraryPage } from "@/features/ssesba/StandardsLibraryPage";
import { pageHead } from "@/lib/seo";

const title = "Sector, industry and activity standards | SSESBA";
const description =
  "Shariah standards tiered along the classification tree: sector, then industry, then activity, as approved by the Shariah board.";

export const Route = createFileRoute("/en/standards")({
  head: () => pageHead({ title, description, path: "/en/standards" }),
  component: () => <StandardsLibraryPage lang="en" />,
});
