import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const contributionStatuses = [
  "received",
  "under_review",
  "accepted",
  "needs_revision",
  "declined",
] as const;

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("my_roles");
    if (error) throw new Error("Unable to load roles.");
    return (data ?? []) as string[];
  });

export const listContributions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("waqf_expert_contributions")
      .select(
        "id, full_name, email, organization, specialty, experience, contribution_area, proposal, preferred_language, status, review_notes, reviewed_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Unable to load contributions.");
    return data ?? [];
  });

export const updateContribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(contributionStatuses),
        reviewNotes: z.string().trim().max(3000).optional(),
        proposal: z.string().trim().min(20).max(3000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("waqf_expert_contributions")
      .update({
        status: data.status,
        review_notes: data.reviewNotes || null,
        proposal: data.proposal,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error("Could not save changes.");
    if (!rows?.length) throw new Error("Forbidden: reviewer or expert role required.");
    return { ok: true };
  });

/** Admin only: grant reviewer/expert role to an existing account by email. */
export const grantReviewerRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ email: z.string().trim().email().max(255), role: z.enum(["reviewer", "expert"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden: administrator role required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const target = data.email.toLowerCase();
    let userId: string | undefined;
    for (let page = 1; page <= 10 && !userId; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw new Error("Unable to look up accounts.");
      userId = list.users.find((u) => u.email?.toLowerCase() === target)?.id;
      if (list.users.length < 200) break;
    }
    if (!userId) throw new Error("No account found for this email. Ask them to sign up first.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role as never }, { onConflict: "user_id,role" });
    if (error) throw new Error("Could not grant role.");
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_user_id: context.userId,
      action: "grant_role",
      target_type: "user",
      target_id: userId,
      details: { role: data.role },
    });
    return { ok: true };
  });

const ruleInput = z.object({
  sector: z.enum(["primary", "secondary", "services"]),
  axis: z.enum(["contracts", "revenues", "financing", "operations", "governance", "disclosure"]),
  title: z.string().trim().min(3).max(200),
  ruleText: z.string().trim().min(20).max(2000),
  evidence: z.string().trim().max(2000).optional(),
  maxDeduction: z.number().int().min(0).max(40),
});

export const listSectorRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sector_rules")
      .select(
        "id, code, sector, axis, title, rule_text, evidence, max_deduction, status, proposed_by, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Unable to load rules.");
    return data ?? [];
  });

export const proposeSectorRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ruleInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sector_rules").insert({
      sector: data.sector,
      axis: data.axis,
      title: data.title,
      rule_text: data.ruleText,
      evidence: data.evidence || null,
      max_deduction: data.maxDeduction,
      proposed_by: context.userId,
    });
    if (error) throw new Error("Forbidden or invalid rule: reviewer or expert role required.");
    return { ok: true };
  });

export const decideSectorRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "proposed"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const approved = data.status === "approved";
    const { data: rows, error } = await context.supabase
      .from("sector_rules")
      .update({
        status: data.status,
        approved_by: approved ? context.userId : null,
        approved_at: approved ? new Date().toISOString() : null,
      })
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length)
      throw new Error("Forbidden: Shariah reviewer or admin role required.");
    await context.supabase.from("admin_audit_log").insert({
      actor_user_id: context.userId,
      action: `rule_${data.status}`,
      target_type: "sector_rule",
      target_id: data.id,
      details: {},
    });
    return { ok: true };
  });
