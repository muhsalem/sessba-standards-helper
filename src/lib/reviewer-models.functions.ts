import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateModel, modelPayloadSchema } from "./reviewer-models";
import { methodologyVersion } from "./ssesba-data";
import type { Json } from "@/integrations/supabase/types";

export const listReviewerModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("reviewer_assessment_files")
      .select("*").eq("owner_user_id", context.userId).order("updated_at", { ascending: false }).limit(100);
    if (error) throw new Error("Unable to load assessment files");
    return data ?? [];
  });

export const saveReviewerModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string().uuid().optional(), version: z.number().int().min(1),
    templateKey: z.enum(["dates", "food", "hospital"]), language: z.enum(["ar", "en"]),
    payload: modelPayloadSchema, evaluate: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles, error: roleError } = await context.supabase.rpc("my_roles");
    if (roleError || !roles?.some(r => ["admin", "reviewer", "expert"].includes(r))) throw new Error("Reviewer or expert access required");
    const { assertWithinLimit } = await import("./server-utils.server");
    await assertWithinLimit("reviewer-model-save", context.userId, 60, 3600);
    const result = data.evaluate ? calculateModel(data.payload) : null;
    const values = { title: data.payload.company || (data.language === "en" ? "Untitled assessment" : "تقييم غير مسمى"), template_key: data.templateKey, language: data.language,
      payload: data.payload as unknown as Json, result: result as unknown as Json, methodology_version: methodologyVersion, version: data.id ? data.version + 1 : 1 };
    const query = data.id
      ? context.supabase.from("reviewer_assessment_files").update(values).eq("id", data.id).eq("owner_user_id", context.userId).eq("version", data.version)
      : context.supabase.from("reviewer_assessment_files").insert({ ...values, owner_user_id: context.userId });
    const { data: row, error } = await query.select("*").maybeSingle();
    if (error || !row) throw new Error("Could not save: access denied or another version exists. Reload your saved file.");
    return row;
  });