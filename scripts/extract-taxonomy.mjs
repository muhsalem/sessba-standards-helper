// يستخرج شجرة التصنيف (القطاعات ← الصناعات ← القطاعات الفرعية ← الأنشطة) من مستكشف التصنيف،
// ليبقى explorer.js المصدر الوحيد. التشغيل: node scripts/extract-taxonomy.mjs
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(
  new URL("../src/content/ssesba/explorer.js", import.meta.url),
  "utf8",
);
const head = source.slice(0, source.indexOf("const SUB = {"));
const context = {};
vm.runInNewContext(`${head}\nthis.FUNC = FUNC; this.S = S;`, context);

const sectors = context.FUNC.map((f) => ({ id: f.id, ar: f.ar, en: f.en, description: f.d }));
const seen = new Set();
const letterCount = {};
const industries = context.S.map((s) => {
  const letter = (s.i.match(/[A-U]/) || ["X"])[0];
  // بعض أقسام ISIC تتكرر لأكثر من صناعة (J وS وN)، فيُضاف رقم ترتيبي للمفتاح: J ثم J2.
  letterCount[letter] = (letterCount[letter] ?? 0) + 1;
  const key = letterCount[letter] === 1 ? letter : `${letter}${letterCount[letter]}`;
  return {
    key,
    letter,
    isic: s.i,
    ar: s.n,
    sectors: s.f,
    subsectors: s.ind.map(([name, activities, sector]) => ({
      ar: name,
      // مثل subF في المستكشف: القطاع الفرعي بلا قطاع صريح يتبع أول قطاعات صناعته.
      sector: sector || s.f[0],
      activities: activities.map((activity) => {
        const activityKey = `${key}:${activity}`;
        if (seen.has(activityKey)) throw new Error(`Duplicate activity key ${activityKey}`);
        seen.add(activityKey);
        return { key: activityKey, ar: activity };
      }),
    })),
  };
});

const out = new URL("../src/content/ssesba/taxonomy.json", import.meta.url);
fs.writeFileSync(out, JSON.stringify({ sectors, industries }, null, 1) + "\n");
console.log(
  `sectors=${sectors.length} industries=${industries.length} subsectors=${industries.reduce((n, i) => n + i.subsectors.length, 0)} activities=${seen.size}`,
);
