import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";
import { pageHead } from "@/lib/seo";

const title = "Terms of use | SSESBA";
const description =
  "Terms governing indicative SSESBA tools and results, including reliance limitations.";

export const Route = createFileRoute("/en/terms")({
  head: () => pageHead({ title, description, path: "/en/terms", card: "summary" }),
  component: () => <LegalPage lang="en" kind="terms" />,
});
