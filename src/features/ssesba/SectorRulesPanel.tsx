import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { axes } from "@/lib/ssesba-data";
import { decideSectorRule, listSectorRules, proposeSectorRule } from "@/lib/waqf-review.functions";

const sectors = { primary: "أولي", secondary: "ثانوي", services: "خدمي" } as const;
const statusAr: Record<string, string> = {
  proposed: "مقترحة",
  approved: "معتمدة",
  rejected: "مرفوضة",
};
const sel = "h-11 w-full rounded-md border bg-background px-3";

export function SectorRulesPanel({ canApprove }: { canApprove: boolean }) {
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
      toast.success("أُرسلت القاعدة للاعتماد");
      form.reset();
      qc.invalidateQueries({ queryKey: ["sector-rules"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر الإرسال");
    } finally {
      setBusy(false);
    }
  }
  async function onDecide(id: string, status: "approved" | "rejected") {
    try {
      await decide({ data: { id, status } });
      toast.success(status === "approved" ? "اعتُمدت القاعدة" : "رُفضت القاعدة");
      qc.invalidateQueries({ queryKey: ["sector-rules"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر الحفظ");
    }
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="font-display-ar text-2xl font-semibold text-brand-navy">
        النموذج الشرعي المفتوح: قواعد التقييم القطاعية
      </h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        يقترح الخبراء قواعد لكل قطاع ومحور، ولا تدخل في حساب «التقييم السداسي» إلا بعد اعتماد مراجع
        شرعي. عند ثبوت مخالفة الشركة لقاعدة معتمدة يُخصم أثرها آليًا من درجة المحور.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 border bg-card p-5 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium" htmlFor="r-sector">
            القطاع
          </label>
          <select id="r-sector" name="sector" className={`mt-2 ${sel}`}>
            {Object.entries(sectors).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="r-axis">
            المحور
          </label>
          <select id="r-axis" name="axis" className={`mt-2 ${sel}`}>
            {axes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ar}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="r-ded">
            أقصى خصم عند المخالفة (0–40)
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
            عنوان القاعدة
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
            نص القاعدة وضابط المخالفة
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
            الدليل أو المستند (اختياري)
          </label>
          <Textarea id="r-ev" name="evidence" maxLength={2000} className="mt-2 min-h-16" />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="bg-brand-emerald text-primary-foreground hover:bg-brand-navy md:w-fit"
        >
          {busy ? "جارٍ…" : "اقتراح القاعدة"}
        </Button>
      </form>
      <div className="mt-6 grid gap-3">
        {rules.isLoading && <p>جارٍ التحميل…</p>}
        {rules.data?.length === 0 && <p className="text-muted-foreground">لا توجد قواعد بعد.</p>}
        {rules.data?.map((r) => (
          <article key={r.id} className="border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">
                <span className="font-mono text-xs text-muted-foreground">{r.code}</span> {r.title}
              </h3>
              <span className="text-sm">
                {statusAr[r.status]} · {sectors[r.sector as keyof typeof sectors]} ·{" "}
                {axes.find((a) => a.id === r.axis)?.ar} · خصم {r.max_deduction}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7">{r.rule_text}</p>
            {r.evidence && (
              <p className="mt-1 text-xs text-muted-foreground">الدليل: {r.evidence}</p>
            )}
            {canApprove && r.status !== "approved" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => onDecide(r.id, "approved")}>
                  اعتماد
                </Button>
                {r.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => onDecide(r.id, "rejected")}>
                    رفض
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
                إلغاء الاعتماد
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
