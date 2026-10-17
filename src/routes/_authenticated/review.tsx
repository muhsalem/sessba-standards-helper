import { createFileRoute } from "@tanstack/react-router";
import { ReviewPage } from "@/features/ssesba/ReviewPage";
const title = "لوحة مراجعة مساهمات الوقف | معايير التصنيف الشرعي";
export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title },
      {
        name: "description",
        content: "لوحة خاصة بالمراجعين والخبراء لعرض مساهمات الوقف المعرفي وتعديلها.",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: "لوحة مراجعة مساهمات الخبراء." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ReviewPage lang="ar" />,
});

