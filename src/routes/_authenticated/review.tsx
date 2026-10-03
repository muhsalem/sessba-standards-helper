import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell } from "@/features/ssesba/SiteShell";
import { SectorRulesPanel } from "@/features/ssesba/SectorRulesPanel";
import { contributionStatuses, getMyRoles, grantReviewerRole, listContributions, updateContribution } from "@/lib/waqf-review.functions";

const title = "لوحة مراجعة مساهمات الوقف | معايير التصنيف الشرعي";
export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({ meta: [{ title }, { name: "description", content: "لوحة خاصة بالمراجعين والخبراء لعرض مساهمات الوقف المعرفي وتعديلها." }, { property: "og:title", content: title }, { property: "og:description", content: "لوحة مراجعة مساهمات الخبراء." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ReviewPage,
});

const statusLabel: Record<string, string> = { received: "مستلمة", under_review: "قيد المراجعة", accepted: "مقبولة", needs_revision: "تحتاج تعديلًا", declined: "مرفوضة" };
const roleLabel: Record<string, string> = { admin: "مشرف", reviewer: "مراجع شرعي", expert: "خبير", user: "مستخدم" };
type Row = Awaited<ReturnType<typeof listContributions>>[number];

function ReviewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchRoles = useServerFn(getMyRoles);
  const fetchList = useServerFn(listContributions);
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const canReview = roles.data?.some((r) => ["admin", "reviewer", "expert"].includes(r)) ?? false;
  const list = useQuery({ queryKey: ["waqf-contributions"], queryFn: () => fetchList(), enabled: canReview });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteShell lang="ar" eyebrow="حساب المراجع والخبير" title="لوحة مراجعة مساهمات الوقف">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <p className="text-sm text-muted-foreground">صلاحياتك: {roles.isLoading ? "…" : (roles.data ?? []).map((r) => roleLabel[r] ?? r).join("، ") || "—"}</p>
          <Button variant="outline" onClick={signOut}>تسجيل الخروج</Button>
        </div>
        {roles.data?.includes("admin") && <GrantRole />}
        {!roles.isLoading && !canReview && <p className="mt-10 border-s-2 border-brand-gold ps-4 leading-8">حسابك قيد التفعيل. سيمنحك مشرف المنصة صلاحية «مراجع» أو «خبير» بعد التحقق من تخصصك، وعندها تظهر المساهمات هنا.</p>}
        {canReview && <div className="mt-8 grid gap-5">
          {list.isLoading && <p>جارٍ تحميل المساهمات…</p>}
          {list.error && <p role="alert" className="text-destructive">تعذر تحميل المساهمات.</p>}
          {list.data?.length === 0 && <p className="text-muted-foreground">لا توجد مساهمات بعد.</p>}
          {list.data?.map((row) => <ContributionCard key={row.id} row={row} />)}
        </div>}
        {canReview && <SectorRulesPanel canApprove={roles.data?.some((r) => r === "admin" || r === "reviewer") ?? false} />}
      </section>
    </SiteShell>
  );
}

function ContributionCard({ row }: { row: Row }) {
  const qc = useQueryClient();
  const save = useServerFn(updateContribution);
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.review_notes ?? "");
  const [proposal, setProposal] = useState(row.proposal);
  const [busy, setBusy] = useState(false);
  async function onSave() {
    setBusy(true);
    try {
      await save({ data: { id: row.id, status: status as (typeof contributionStatuses)[number], reviewNotes: notes, proposal } });
      toast.success("حُفظت التعديلات");
      qc.invalidateQueries({ queryKey: ["waqf-contributions"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "تعذر الحفظ"); } finally { setBusy(false); }
  }
  return (
    <article className="border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{row.full_name} <span className="text-sm font-normal text-muted-foreground">— {row.organization}</span></h2>
        <span className="text-xs text-muted-foreground" dir="ltr">{row.email} · {new Date(row.created_at).toLocaleDateString("ar")}</span>
      </header>
      <p className="mt-2 text-sm text-muted-foreground">التخصص: {row.specialty} · المجال: {row.contribution_area}</p>
      <p className="mt-3 text-sm leading-7"><b>الخبرة:</b> {row.experience}</p>
      <label className="mt-4 block text-sm font-medium" htmlFor={`p-${row.id}`}>نص المساهمة (قابل للتحرير)</label>
      <Textarea id={`p-${row.id}`} value={proposal} onChange={(e) => setProposal(e.target.value)} className="mt-2 min-h-28" />
      <div className="mt-4 grid gap-4 md:grid-cols-[200px_1fr]">
        <div>
          <label className="text-sm font-medium" htmlFor={`s-${row.id}`}>الحالة</label>
          <select id={`s-${row.id}`} value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 h-11 w-full rounded-md border bg-background px-3">
            {contributionStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor={`n-${row.id}`}>ملاحظات المراجعة</label>
          <Textarea id={`n-${row.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 min-h-20" />
        </div>
      </div>
      <Button onClick={onSave} disabled={busy} className="mt-4 bg-brand-emerald text-primary-foreground hover:bg-brand-navy">{busy ? "جارٍ الحفظ…" : "حفظ التعديلات"}</Button>
    </article>
  );
}

function GrantRole() {
  const grant = useServerFn(grantReviewerRole);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"reviewer" | "expert">("reviewer");
  return (
    <form className="mt-6 flex flex-wrap items-end gap-3 border-s-2 border-brand-emerald ps-4" onSubmit={async (e) => {
      e.preventDefault();
      try { await grant({ data: { email, role } }); toast.success("مُنحت الصلاحية"); setEmail(""); } catch (err) { toast.error(err instanceof Error ? err.message : "تعذر منح الصلاحية"); }
    }}>
      <div className="grow"><label className="text-sm font-medium" htmlFor="g-email">منح صلاحية لحساب (بريد)</label><Input id="g-email" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11" /></div>
      <select aria-label="الدور" value={role} onChange={(e) => setRole(e.target.value as "reviewer" | "expert")} className="h-11 rounded-md border bg-background px-3"><option value="reviewer">مراجع شرعي</option><option value="expert">خبير</option></select>
      <Button type="submit">منح</Button>
    </form>
  );
}
