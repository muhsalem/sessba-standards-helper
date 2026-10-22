import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { axes, type Lang } from "@/lib/ssesba-data";
import { decideSectorRule, listSectorRules, proposeSectorRule } from "@/lib/waqf-review.functions";

const sectors = { primary: "أولي", secondary: "ثانوي", services: "خدمي" } as const;
const statusAr: Record<string, string> = {
  proposed: "مقترحة",
  approved: "معتمدة",
  rejected: "مرفوضة",
};
const sel = "h-11 w-full rounded-md border bg-background px-3";

export function SectorRulesPanel({ canApprove, lang }: { canApprove: boolean; lang: Lang }) {
  const text = (ar: string, en: string) => lang === "en" ? en : ar;
  const sectorLabels = lang === "en" ? { primary: "Primary", secondary: "Secondary", services: "Services" } : sectors;
  const statusLabels: Record<string, string> = lang === "en" ? { proposed: "Proposed", approved: "Approved", rejected: "Rejected" } : statusAr;
  const qc = useQueryClient();
  const list = useServerFn(listSectorRules);
  const propose = useServerFn(proposeSectorRule);
  const decide = useServerFn(decideSectorRule);
  const rules = useQuery({ queryKey: ["sector-rules"], queryFn: () => list() });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    try {
      await propose({
        data: {
          sector: f.get("sector") as "primary",
          axis: f.get("axis") as "contracts",
          title: String(f.get("title")),
          ruleText: String(f.get("ruleText")),
          evidence: String(f.get("evidence") || ""),
          maxDeduction: Number(f.get("maxDeduction")),
        },
      });
      toast.success(text("أُرسلت القاعدة للاعتماد", "Rule submitted for approval"));
      form.reset();
      qc.invalidateQueries({ queryKey: ["sector-rules"] });
    } catch (err) {
      toast.error(text("تعذر الإرسال. تحقق من البيانات والصلاحيات.", "Could not submit. Check your details and permissions."));
    } finally {
      setBusy(false);
    }
  }
  async function onDecide(id: string, status: "approved" | "rejected") {
    try {
      await decide({ data: { id, status } });
      toast.success(status === "approved" ? text("اعتُمدت القاعدة", "Rule approved") : text("رُفضت القاعدة", "Rule rejected"));
      qc.invalidateQueries({ queryKey: ["sector-rules"] });
    } catch (err) {
      toast.error(text("تعذر الحفظ. تحقق من صلاحياتك.", "Could not save. Check your permissions."));
    }
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="font-display-ar text-2xl font-semibold text-brand-navy">
        {text("النموذج الشرعي المفتوح: قواعد التقييم القطاعية", "Open Shariah model: sector assessment rules")}
      </h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {text("يقترح الخبراء قواعد لكل قطاع ومحور، ولا تدخل في حساب «التقييم السداسي» إلا بعد اعتماد مراجع شرعي. عند ثبوت مخالفة الشركة لقاعدة معتمدة يُخصم أثرها آليًا من درجة المحور.", "Experts propose rules for each sector and axis. Rules enter the six-level assessment only after approval by a Shariah reviewer. A verified breach of an approved rule is deducted automatically from the relevant axis score.")}
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 border bg-card p-5 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium" htmlFor="r-sector">
            {text("القطاع", "Sector")}
          </label>
          <select id="r-sector" name="sector" className={`mt-2 ${sel}`}>
            {Object.entries(sectorLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="r-axis">
            {text("المحور", "Axis")}
          </label>
          <select id="r-axis" name="axis" className={`mt-2 ${sel}`}>
            {axes.map((a) => (
              <option key={a.id} value={a.id}>
                {a[lang]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="r-ded">
            {text("أقصى خصم عند المخالفة (0–40)", "Maximum breach deduction (0–40)")}
          </label>
          <Input
            id="r-ded"
            name="maxDeduction"
            type="number"
            min={0}
            max={40}
            defaultValue={10}
            required
            className="mt-2 h-11"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium" htmlFor="r-title">
            {text("عنوان القاعدة", "Rule title")}
          </label>
          <Input
            id="r-title"
            name="title"
            required
            minLength={3}
            maxLength={200}
            className="mt-2 h-11"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium" htmlFor="r-text">
            {text("نص القاعدة وضابط المخالفة", "Rule text and breach criteria")}
          </label>
          <Textarea
            id="r-text"
            name="ruleText"
            required
            minLength={20}
            maxLength={2000}
            className="mt-2 min-h-24"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium" htmlFor="r-ev">
            {text("الدليل أو المستند (اختياري)", "Evidence or supporting reference (optional)")}
          </label>
          <Textarea id="r-ev" name="evidence" maxLength={2000} className="mt-2 min-h-16" />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="bg-brand-emerald text-primary-foreground hover:bg-brand-navy md:w-fit"
        >
          {busy ? text("جارٍ…", "Please wait…") : text("اقتراح القاعدة", "Propose rule")}
        </Button>
      </form>
      <div className="mt-6 grid gap-3">
        {rules.isLoading && <p>{text("جارٍ التحميل…", "Loading rules…")}</p>}
        {rules.error && <p role="alert" className="text-destructive">{text("تعذر تحميل القواعد.", "Could not load rules.")}</p>}
        {rules.data?.length === 0 && <p className="text-muted-foreground">{text("لا توجد قواعد بعد.", "No rules yet.")}</p>}
        {rules.data?.map((r) => (
          <article key={r.id} className="border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">
                <span className="font-mono text-xs text-muted-foreground">{r.code}</span> {r.title}
              </h3>
              <span className="text-sm">
                {statusLabels[r.status]} · {sectorLabels[r.sector as keyof typeof sectors]} ·{" "}
                {axes.find((a) => a.id === r.axis)?.[lang]} · {text("خصم", "Deduction")} {r.max_deduction}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7">{r.rule_text}</p>
            {r.evidence && (
              <p className="mt-1 text-xs text-muted-foreground">{text("الدليل:", "Evidence:")} {r.evidence}</p>
            )}
            {canApprove && r.status !== "approved" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => onDecide(r.id, "approved")}>
                  {text("اعتماد", "Approve")}
                </Button>
                {r.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => onDecide(r.id, "rejected")}>
                    {text("رفض", "Reject")}
                  </Button>
                )}
              </div>
            )}
            {canApprove && r.status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => onDecide(r.id, "rejected")}
              >
                {text("إلغاء الاعتماد", "Withdraw approval")}
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
