import standardAr from "@/content/ssesba/standard.body.html?raw";
import standardEn from "@/content/ssesba/standard.en.body.html?raw";

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function toPlainText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => entities[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/** نص المعيار المنشور كما يراه الزائر، ليستند إليه المساعد الشرعي مع الأقسام المعتمدة في قاعدة البيانات. */
export const publishedStandardText = {
  ar: toPlainText(standardAr),
  en: toPlainText(standardEn),
} as const;
