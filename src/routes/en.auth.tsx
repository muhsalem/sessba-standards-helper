import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/features/ssesba/AuthPage";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/en/auth")({
 head: () => pageHead({ title: "Reviewer and expert sign in | SSESBA", description: "Sign in or create a reviewer or expert account for the SSESBA knowledge endowment.", path: "/en/auth" }),
 component: () => <AuthPage lang="en" />,
});
