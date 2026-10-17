import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPage } from "@/features/ssesba/AuthPage";
const title = "دخول المراجعين والخبراء | معايير التصنيف الشرعي";
const description =
  "تسجيل الدخول وإنشاء حساب للمراجعين الشرعيين والخبراء لمراجعة مساهمات الوقف المعرفي.";
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && localStorage.getItem("ssesba-language") === "en") throw redirect({ to: "/en/auth" });
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AuthPage lang="ar" />,
});
