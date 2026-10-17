import { createFileRoute } from "@tanstack/react-router";
import { ReviewPage } from "@/features/ssesba/ReviewPage";
const title = "Knowledge endowment review desk | SSESBA";
const description = "Private workspace for authorized Shariah reviewers and industry experts to review contributions and sector assessment rules.";
export const Route = createFileRoute("/_authenticated/en/review")({
 head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
 component: () => <ReviewPage lang="en" />,
});
