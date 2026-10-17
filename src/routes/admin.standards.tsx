import { createFileRoute } from "@tanstack/react-router";
import { StandardsEditorPage } from "@/features/ssesba/StandardsEditorPage";

export const Route = createFileRoute("/admin/standards")({
  head: () => ({
    meta: [
      { title: "تحرير المعايير | مَشْتَق · SSESBA" },
      { name: "description", content: "مراجعة وتحرير معايير التصنيف الشرعي وإدارة اعتماد نسخها." },
      { property: "og:title", content: "تحرير المعايير | SSESBA" },
      { property: "og:description", content: "مراجعة وتحرير معايير التصنيف الشرعي وإدارة اعتماد نسخها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StandardsEditorPage,
});
