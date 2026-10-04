import { createFileRoute } from "@tanstack/react-router";
import { SixScalePage } from "@/features/ssesba/SixScalePage";
import { pageHead } from "@/lib/seo";

const title = "Six-Level Shariah Compliance Scale | SSESBA";
const description =
  "An indicative Shariah audit tool assessing companies on the six-level scale (100 down to below 45) with sector standards for primary, secondary, and services sectors.";

export const Route = createFileRoute("/en/six")({
  head: () => pageHead({ title, description, path: "/en/six" }),
  component: () => <SixScalePage lang="en" />,
});
