import { createFileRoute } from "@tanstack/react-router";
import { StandardsEditorPage } from "@/features/ssesba/StandardsEditorPage";

export const Route = createFileRoute("/admin/standards")({
  head: () => ({
    meta: [
      { title: "تحرير المعايير | مَشْتَق · SSESBA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StandardsEditorPage,
});
