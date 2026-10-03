import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import {
  UserFacingError,
  adminClient,
  failure,
  type AuthedContext,
} from "@/lib/server-utils.server";
import {
  nodeExists,
  standardContentSchema,
  type StandardContent,
} from "@/lib/classification-standards";

/* ───────────────────────── الصلاحيات ───────────────────────── */

async function editorRoles(context: AuthedContext) {
  const check = async (role: "admin" | "reviewer") => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (error) throw new UserFacingError("تعذّر التحقق من الصلاحيات. / Unable to verify roles.");
    return data === true;
  };
  const [admin, reviewer] = await Promise.all([check("admin"), check("reviewer")]);
  return { admin, reviewer };
}

/** التحرير والمراجعة مقصوران على من يحمل دور مدير أو مراجع شرعي. */
async function requireEditor(context: unknown) {
  const authed = context as AuthedContext;
  const roles = await editorRoles(authed);
  if (!roles.admin && !roles.reviewer) {
    throw new UserFacingError(
      "هذه الصفحة للمراجعين الشرعيين والمديرين فقط. / Reviewer or administrator role required.",
    );
  }
  return { userId: authed.userId, ...roles };
}

/* ───────────────────────── العرض العام ───────────────────────── */

/**
 * يرى العموم اللقطة المعتمدة فقط، لا النسخة العاملة. ويُعرض عدد المسودات
 * قيد العمل دون محتواها، إفصاحًا عن أن المعايير قيد الإعداد.
 */
export const getPublishedClassificationStandards = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabaseAdmin = await adminClient();
    const { data, error } = await supabaseAdmin
      .from("classification_standards")
      .select("level,node_key,status,published_snapshot,published_version,published_at");
    if (error) failure("published classification standards", error);
    const rows = data ?? [];
    const published = rows
      .filter((row) => row.published_snapshot !== null)
      .map((row) => ({
        level: row.level,
        nodeKey: row.node_key,
        version: row.published_version ?? 1,
        publishedAt: row.published_at,
        content: row.published_snapshot as unknown as StandardContent,
      }));
    const inProgress = rows
      .filter((row) => row.status !== "approved")
      .map((row) => ({ level: row.level, nodeKey: row.node_key }));
    return { published, inProgress };
  },
);

/* ───────────────────────── التحرير ───────────────────────── */

const editorSelect =
  "id,level,node_key,title_ar,title_en,summary_ar,summary_en,requirements,sources,status,version,review_note,published_version,published_at,created_by,updated_by,reviewed_by,reviewed_at,updated_at";

export const getClassificationStandardsForEditor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const editor = await requireEditor(context);
    const supabaseAdmin = await adminClient();
    const { data, error } = await supabaseAdmin
      .from("classification_standards")
      .select(editorSelect)
      .order("level")
      .order("node_key");
    if (error) failure("editor classification standards", error);
    return { editor, standards: data ?? [] };
  });

const saveSchema = standardContentSchema.extend({
  id: z.string().uuid().optional(),
  level: z.enum(["sector", "industry", "activity"]),
  nodeKey: z.string().trim().min(1).max(200),
  note: z.string().trim().max(1000).optional(),
});

function contentSnapshot(content: StandardContent) {
  return {
    titleAr: content.titleAr,
    titleEn: content.titleEn || undefined,
    summaryAr: content.summaryAr,
    summaryEn: content.summaryEn || undefined,
    requirements: content.requirements,
    sources: content.sources,
  };
}

async function recordRevision(
  standardId: string,
  action: "create" | "update" | "submit" | "approve" | "reject",
  snapshot: unknown,
  actor: string,
  note?: string,
) {
  const supabaseAdmin = await adminClient();
  const { error } = await supabaseAdmin.from("classification_standard_revisions").insert({
    standard_id: standardId,
    action,
    snapshot: snapshot as Json,
    actor_user_id: actor,
    note: note ?? null,
  });
  if (error) failure("standard revision", error);
  const { error: auditError } = await supabaseAdmin.from("admin_audit_log").insert({
    actor_user_id: actor,
    action: `classification_standard.${action}`,
    target_type: "classification_standard",
    target_id: standardId,
    details: { note: note ?? null },
  });
  if (auditError) console.error("[ssesba] audit log", auditError);
}

async function loadStandard(id: string) {
  const supabaseAdmin = await adminClient();
  const { data, error } = await supabaseAdmin
    .from("classification_standards")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) failure("load standard", error);
  if (!data) throw new UserFacingError("المعيار غير موجود. / Standard not found.");
  return data;
}

/**
 * حفظ مسودة: إنشاء معيار جديد، أو تعديل مسودة أو معيار مرفوض أو معتمد.
 * تعديل المعتمد يعيده مسودةً برقم إصدار جديد، وتبقى لقطته المنشورة كما هي حتى يُعتمد التعديل.
 */
export const saveClassificationStandard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const editor = await requireEditor(context);
    if (!nodeExists({ level: data.level, key: data.nodeKey })) {
      throw new UserFacingError(
        "العقدة المختارة غير موجودة في شجرة التصنيف. / Unknown taxonomy node.",
      );
    }
    const supabaseAdmin = await adminClient();
    const fields = {
      title_ar: data.titleAr,
      title_en: data.titleEn || null,
      summary_ar: data.summaryAr,
      summary_en: data.summaryEn || null,
      requirements: data.requirements as unknown as Json,
      sources: data.sources as unknown as Json,
    };
    if (!data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("classification_standards")
        .insert({
          ...fields,
          level: data.level,
          node_key: data.nodeKey,
          status: "draft",
          created_by: editor.userId,
          updated_by: editor.userId,
        })
        .select("id")
        .single();
      if (error?.code === "23505")
        throw new UserFacingError(
          "يوجد معيار لهذه العقدة؛ عدّله بدل إنشاء معيار جديد. / A standard already exists for this node.",
        );
      if (error || !row) failure("create standard", error);
      await recordRevision(row.id, "create", contentSnapshot(data), editor.userId, data.note);
      return { id: row.id };
    }
    const current = await loadStandard(data.id);
    if (current.status === "pending_review") {
      throw new UserFacingError(
        "المعيار بانتظار المراجعة؛ يُعتمد أو يُرفض قبل تعديله. / The standard is pending review.",
      );
    }
    if (current.level !== data.level || current.node_key !== data.nodeKey) {
      throw new UserFacingError(
        "لا يمكن نقل معيار إلى عقدة أخرى. / A standard cannot be moved to another node.",
      );
    }
    const { error } = await supabaseAdmin
      .from("classification_standards")
      .update({
        ...fields,
        status: "draft",
        version: current.status === "approved" ? current.version + 1 : current.version,
        updated_by: editor.userId,
        review_note: null,
      })
      .eq("id", data.id);
    if (error) failure("update standard", error);
    await recordRevision(data.id, "update", contentSnapshot(data), editor.userId, data.note);
    return { id: data.id };
  });

export const submitClassificationStandard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const editor = await requireEditor(context);
    const current = await loadStandard(data.id);
    if (current.status !== "draft" && current.status !== "rejected") {
      throw new UserFacingError("لا تُرسل للمراجعة إلا المسودات. / Only drafts can be submitted.");
    }
    const supabaseAdmin = await adminClient();
    const { error } = await supabaseAdmin
      .from("classification_standards")
      .update({ status: "pending_review", updated_by: editor.userId })
      .eq("id", data.id);
    if (error) failure("submit standard", error);
    await recordRevision(data.id, "submit", { version: current.version }, editor.userId);
    return { ok: true };
  });

/**
 * قرار المراجعة: مبدأ «العينين الأربع» — لا يعتمد المحرِّرُ الأخيرُ ما كتبه.
 * الاعتماد يحدّث اللقطة المنشورة، والرفض يستلزم ملاحظة تُعاد إلى المحرّر.
 */
export const reviewClassificationStandard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approve", "reject"]),
        note: z.string().trim().max(1000).optional(),
      })
      .refine((value) => value.decision === "approve" || (value.note ?? "").length >= 5, {
        message: "Rejection requires a note.",
        path: ["note"],
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const editor = await requireEditor(context);
    const current = await loadStandard(data.id);
    if (current.status !== "pending_review") {
      throw new UserFacingError(
        "المعيار ليس بانتظار المراجعة. / The standard is not pending review.",
      );
    }
    if (current.updated_by && current.updated_by === editor.userId) {
      throw new UserFacingError(
        "لا يعتمد المحرّر ما كتبه بنفسه؛ يلزم مراجع آخر. / The last editor cannot review their own change.",
      );
    }
    const supabaseAdmin = await adminClient();
    const now = new Date().toISOString();
    const content = standardContentSchema.parse({
      titleAr: current.title_ar,
      titleEn: current.title_en ?? undefined,
      summaryAr: current.summary_ar,
      summaryEn: current.summary_en ?? undefined,
      requirements: current.requirements,
      sources: current.sources,
    });
    const update =
      data.decision === "approve"
        ? {
            status: "approved",
            published_snapshot: contentSnapshot(content) as unknown as Json,
            published_version: current.version,
            published_at: now,
            reviewed_by: editor.userId,
            reviewed_at: now,
            review_note: data.note || null,
          }
        : {
            status: "rejected",
            reviewed_by: editor.userId,
            reviewed_at: now,
            review_note: data.note ?? null,
          };
    const { error } = await supabaseAdmin
      .from("classification_standards")
      .update(update)
      .eq("id", data.id);
    if (error) failure("review standard", error);
    await recordRevision(
      data.id,
      data.decision === "approve" ? "approve" : "reject",
      { version: current.version },
      editor.userId,
      data.note,
    );
    return { ok: true };
  });
