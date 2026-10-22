import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteShell } from "@/features/ssesba/SiteShell";
import { SectorRulesPanel } from "@/features/ssesba/SectorRulesPanel";
import {
  contributionStatuses,
  getMyRoles,
  grantReviewerRole,
  listContributions,
  updateContribution,
} from "@/lib/waqf-review.functions";

import type { Lang } from "@/lib/ssesba-data";

const statusEn: Record<string, string> = { received: "Received", under_review: "Under review", accepted: "Accepted", needs_revision: "Needs revision", declined: "Declined" };
const roleEn: Record<string, string> = { admin: "Administrator", reviewer: "Shariah reviewer", expert: "Expert", user: "User" };
const statusLabel: Record<string, string> = {
  received: "مستلمة",
  under_review: "قيد المراجعة",
  accepted: "مقبولة",
  needs_revision: "تحتاج تعديلًا",
  declined: "مرفوضة",
};
const roleLabel: Record<string, string> = {
  admin: "مشرف",
  reviewer: "مراجع شرعي",
  expert: "خبير",
  user: "مستخدم",
};
type Row = Awaited<ReturnType<typeof listContributions>>[number];

export function ReviewPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const text = (ar: string, english: string) => en ? english : ar;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchRoles = useServerFn(getMyRoles);
  const fetchList = useServerFn(listContributions);
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const canReview = roles.data?.some((r) => ["admin", "reviewer", "expert"].includes(r)) ?? false;
  const list = useQuery({
    queryKey: ["waqf-contributions"],
    queryFn: () => fetchList(),
    enabled: canReview,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: en ? "/en/auth" : "/auth", replace: true });
  }

  return (
    <SiteShell lang={lang} eyebrow={text("حساب المراجع والخبير", "Reviewer and expert account")} title={text("لوحة مراجعة مساهمات الوقف", "Knowledge endowment review desk")}>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <p className="text-sm text-muted-foreground">
            {text("صلاحياتك:", "Your roles:")}{" "}
            {roles.isLoading
              ? "…"
              : (roles.data ?? []).map((r) => (en ? roleEn[r] : roleLabel[r]) ?? r).join(en ? ", " : "، ") || "—"}
          </p>
          <Button variant="outline" onClick={signOut}>
            {text("تسجيل الخروج", "Sign out")}
          </Button>
        </div>
        <nav aria-label={text("التقييمات", "Assessments")} className="mt-5 flex flex-wrap gap-4 text-sm underline">
          <Link to={en ? "/en/six" : "/six"}>{text("تقييم الشركة السداسي", "Six-level company assessment")}</Link>
          <Link to={en ? "/en/assessment" : "/assessment"}>{text("التقييم المرجّح", "Weighted assessment")}</Link>
        </nav>
        {roles.data?.includes("admin") && (
          <Link to="/git-sync" className="mt-5 inline-block text-sm underline">
            {text("أداة تشخيص مزامنة GitHub ←", "GitHub sync diagnostics (Arabic) →")}
          </Link>
        )}
        {roles.data?.includes("admin") && <GrantRole lang={lang} />}
        {!roles.isLoading && !canReview && (
          <p className="mt-10 border-s-2 border-brand-gold ps-4 leading-8">
            {text("حسابك قيد التفعيل. سيمنحك مشرف المنصة صلاحية «مراجع» أو «خبير» بعد التحقق من تخصصك، وعندها تظهر المساهمات هنا.", "Your account is awaiting activation. An administrator will grant reviewer or expert access after verifying your specialty; contributions will then appear here.")}
          </p>
        )}
        {canReview && (
          <div className="mt-8 grid gap-5">
            {list.isLoading && <p>{text("جارٍ تحميل المساهمات…", "Loading contributions…")}</p>}
            {list.error && (
              <p role="alert" className="text-destructive">
                {text("تعذر تحميل المساهمات.", "Could not load contributions.")}
              </p>
            )}
            {list.data?.length === 0 && (
              <p className="text-muted-foreground">{text("لا توجد مساهمات بعد.", "No contributions yet.")}</p>
            )}
            {list.data?.map((row) => (
              <ContributionCard key={row.id} row={row} lang={lang} />
            ))}
          </div>
        )}
        {canReview && (
          <SectorRulesPanel
            canApprove={roles.data?.some((r) => r === "admin" || r === "reviewer") ?? false}
          />
        )}
      </section>
    </SiteShell>
  );
}

function ContributionCard({ row, lang }: { row: Row; lang: Lang }) {
  const en = lang === "en";
  const text = (ar: string, english: string) => en ? english : ar;
  const qc = useQueryClient();
  const save = useServerFn(updateContribution);
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.review_notes ?? "");
  const [proposal, setProposal] = useState(row.proposal);
  const [busy, setBusy] = useState(false);
  async function onSave() {
    setBusy(true);
    try {
      await save({
        data: {
          id: row.id,
          status: status as (typeof contributionStatuses)[number],
          reviewNotes: notes,
          proposal,
        },
      });
      toast.success(text("حُفظت التعديلات", "Changes saved"));
      qc.invalidateQueries({ queryKey: ["waqf-contributions"] });
    } catch (e) {
      toast.error(text("تعذر الحفظ. تحقق من البيانات والصلاحيات.", "Could not save. Check your details and permissions."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {row.full_name}{" "}
          <span className="text-sm font-normal text-muted-foreground">— {row.organization}</span>
        </h2>
        <span className="text-xs text-muted-foreground" dir="ltr">
          {row.email} · {new Date(row.created_at).toLocaleDateString(lang)}
        </span>
      </header>
      <p className="mt-2 text-sm text-muted-foreground">
        {text("التخصص:", "Specialty:")} {row.specialty} · {text("المجال:", "Area:")} {row.contribution_area}
      </p>
      <p className="mt-3 text-sm leading-7">
        <b>{text("الخبرة:", "Experience:")}</b> {row.experience}
      </p>
      <label className="mt-4 block text-sm font-medium" htmlFor={`p-${row.id}`}>
        {text("نص المساهمة (قابل للتحرير)", "Contribution text (editable)")}
      </label>
      <Textarea
        id={`p-${row.id}`}
        value={proposal}
        onChange={(e) => setProposal(e.target.value)}
        className="mt-2 min-h-28"
      />
      <div className="mt-4 grid gap-4 md:grid-cols-[200px_1fr]">
        <div>
          <label className="text-sm font-medium" htmlFor={`s-${row.id}`}>
            {text("الحالة", "Status")}
          </label>
          <select
            id={`s-${row.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 h-11 w-full rounded-md border bg-background px-3"
          >
            {contributionStatuses.map((s) => (
              <option key={s} value={s}>
                {en ? statusEn[s] : statusLabel[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor={`n-${row.id}`}>
            {text("ملاحظات المراجعة", "Review notes")}
          </label>
          <Textarea
            id={`n-${row.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>
      </div>
      <Button
        onClick={onSave}
        disabled={busy}
        className="mt-4 bg-brand-emerald text-primary-foreground hover:bg-brand-navy"
      >
        {busy ? text("جارٍ الحفظ…", "Saving…") : text("حفظ التعديلات", "Save changes")}
      </Button>
    </article>
  );
}

function GrantRole({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const text = (ar: string, english: string) => en ? english : ar;
  const grant = useServerFn(grantReviewerRole);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"reviewer" | "expert">("reviewer");
  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3 border-s-2 border-brand-emerald ps-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await grant({ data: { email, role } });
          toast.success(text("مُنحت الصلاحية", "Access granted"));
          setEmail("");
        } catch (err) {
          toast.error(text("تعذر منح الصلاحية. تحقق من الحساب والصلاحيات.", "Could not grant access. Check the account and your permissions."));
        }
      }}
    >
      <div className="grow">
        <label className="text-sm font-medium" htmlFor="g-email">
          {text("منح صلاحية لحساب (بريد)", "Grant account access (email)")}
        </label>
        <Input
          id="g-email"
          type="email"
          required
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-11"
        />
      </div>
      <select
        aria-label={text("الدور", "Role")}
        value={role}
        onChange={(e) => setRole(e.target.value as "reviewer" | "expert")}
        className="h-11 rounded-md border bg-background px-3"
      >
        <option value="reviewer">{text("مراجع شرعي", "Shariah reviewer")}</option>
        <option value="expert">{text("خبير", "Expert")}</option>
      </select>
      <Button type="submit">{text("منح", "Grant")}</Button>
    </form>
  );
}
