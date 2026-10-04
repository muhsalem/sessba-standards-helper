import { createFileRoute } from "@tanstack/react-router";
import { AssessmentPage } from "@/features/ssesba/AssessmentPage";
import { pageHead } from "@/lib/seo";

const title = "Assessment Model | SSESBA";
const description =
  "Interactive sector models applying the SSESBA eligibility gate, financial screens, weighted axes, and Shariah risk matrix.";

export const Route = createFileRoute("/en/assessment")({
  head: () => pageHead({ title, description, path: "/en/assessment" }),
  component: () => <AssessmentPage lang="en" />,
});
