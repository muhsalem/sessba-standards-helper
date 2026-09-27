// يولّد ترحيل SQL يُدرج مسودات معايير من ملف JSON.
// الاستخدام: node scripts/generate-draft-migration.mjs <level> <drafts.json> <out.sql>
// لا يستبدل معيارًا موجودًا للعقدة نفسها (ON CONFLICT DO NOTHING)، فلا يمسّ عمل المحرّرين.
import fs from "node:fs";

const [level, input, output] = process.argv.slice(2);
if (!["sector", "industry", "activity"].includes(level) || !input || !output) {
  console.error(
    "usage: node scripts/generate-draft-migration.mjs <sector|industry|activity> <drafts.json> <out.sql>",
  );
  process.exit(1);
}
const drafts = JSON.parse(fs.readFileSync(input, "utf8"));
const quote = (value) => {
  if (value.includes("$v$")) throw new Error("text contains the $v$ delimiter");
  return `$v$${value}$v$`;
};
const note =
  "مسودة أولية أُعدّت بمساعدة الذكاء الاصطناعي على نهج خبير المعايير الشرعية؛ تحتاج مراجعة الهيئة الشرعية وتوثيق الإحالات قبل الاعتماد.";
const rows = drafts.map(
  (d) =>
    `  ('${level}', ${[d.key, d.titleAr, d.titleEn, d.summaryAr, d.summaryEn].map(quote).join(", ")}, ${quote(JSON.stringify(d.requirements))}::jsonb, ${quote(JSON.stringify(d.sources))}::jsonb, 'draft', ${quote(note)})`,
);
const sql = `-- مسودات معايير المستوى «${level}» (${drafts.length}): غير منشورة، وتنتظر مراجعة الهيئة الشرعية.
-- مولَّد من ${input.replace(/^.*scripts\//, "scripts/")} عبر scripts/generate-draft-migration.mjs.
INSERT INTO public.classification_standards (level, node_key, title_ar, title_en, summary_ar, summary_en, requirements, sources, status, review_note) VALUES
${rows.join(",\n")}
ON CONFLICT (level, node_key) DO NOTHING;
`;
fs.writeFileSync(output, sql);
console.log(`${drafts.length} drafts -> ${output}`);
