import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/ssesba/LegalPage";
import { pageHead } from "@/lib/seo";

const title = "Privacy policy | SSESBA";
const description = "How assessment-request data is collected, used, protected, and corrected.";

export const Route = createFileRoute("/en/privacy")({
  head: () => pageHead({ title, description, path: "/en/privacy", card: "summary" }),
  component: () => <LegalPage lang="en" kind="privacy" />,
});
