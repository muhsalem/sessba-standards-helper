import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamText } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableResponsesProvider, safeAiError } from "@/lib/ai-gateway.server";
import { axes, calculateFinancialExposure, complianceLevelForScore, gateChecks } from "@/lib/ssesba-data";

const requestSchema = z.object({
  clientName: z.string().trim().min(2).max(120), organizationName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255), phone: z.string().trim().max(30).optional(), country: z.string().trim().max(100).optional(),
  sector: z.string().trim().min(2).max(160), activity: z.string().trim().min(2).max(240),
  assessmentType: z.enum(["expert", "self", "ai_review"]), notes: z.string().trim().max(2000).optional(), preferredLanguage: z.enum(["ar", "en"]),
  consent: z.literal(true),
});
const translationSchema = z.object({ sectionId: z.string().uuid(), titleAr: z.string().trim().min(2).max(300), bodyAr: z.string().trim().min(10).max(12000) });
const updateSchema = translationSchema.extend({ titleEn: z.string().trim().min(2).max(300), bodyEn: z.string().trim().min(10).max(12000), note: z.string().trim().max(500).optional() });
const aiAssessmentSchema = z.object({ description: z.string().trim().min(20).max(6000) });

function publicClient() {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Cloud configuration is unavailable");
  return createClient<Database>(url, key, { auth: { persistSession: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith('sb_')) headers.delete('Authorization'); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
}
type AuthedContext = { supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> }; userId: string };

/** ضبط الصلاحيات: التحرير مقصور على مستخدم مسجّل يحمل دور مدير في قاعدة البيانات. */
async function assertAdmin(context: AuthedContext) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Unable to verify administrator role.");
  if (data !== true) throw new Error("Forbidden: administrator role required.");
}

function clientIdentifier() {
  const request = getRequest();
  const headers = request?.headers;
  const forwarded = headers?.get("cf-connecting-ip") || headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || headers?.get("x-real-ip");
  return forwarded || "unknown";
}

/** حماية النموذج العام: سقف محاولات لكل مصدر ولكل بريد في نافذة زمنية. */
async function assertWithinLimit(scope: string, identifier: string, limit: number, windowSeconds: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("register_submission_attempt", { _scope: scope, _identifier: identifier.slice(0, 200).toLowerCase(), _limit: limit, _window_seconds: windowSeconds });
  if (error) throw new Error(error.message);
  if (data === false) throw new Error("تم تجاوز عدد الطلبات المسموح خلال الساعة. حاول لاحقًا. / Too many submissions in the last hour. Please try again later.");
}
function aiKey() { const key = process.env['LOVABLE_API_KEY']; if (!key) throw new Error("Lovable AI is not configured."); return key; }
function gatewayMessage(error: unknown, lang: "ar" | "en" = "ar") { return safeAiError(error, lang); }

async function hashIdentifier(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** سقف استخدام الذكاء الاصطناعي العام: 10 طلبات/ساعة و30/يوم لكل مصدر، مع تسجيل كل استدعاء. */
async function guardAi(kind: string) {
  const id = await hashIdentifier(clientIdentifier());
  await assertWithinLimit(`ai_${kind}_hour`, id, 10, 3600);
  await assertWithinLimit(`ai_${kind}_day`, id, 30, 86400);
  return async (outcome: "success" | "error", runId?: string) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("ai_invocation_events").insert({ request_kind: kind, identifier_hash: id, run_id: runId ?? null, outcome });
    } catch (e) { console.error("ai log failed", e); }
  };
}

export const getStandardSections = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("standard_sections").select("id,section_key,sort_order,title_ar,title_en,body_ar,body_en,translation_status,translated_at,updated_at").eq("is_published", true).order("sort_order");
  if (error) throw new Error(error.message); return data;
});

export const getAssessmentExamples = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("assessment_examples").select("id,sector_key,isic_code,title_ar,title_en,activity_ar,activity_en,description_ar,description_en,gate_state,scores,risk_tier,sort_order").eq("is_published", true).order("sort_order");
  if (error) throw new Error(error.message); return data;
});

export const submitAssessmentRequest = createServerFn({ method: "POST" }).inputValidator((input: unknown) => requestSchema.parse(input)).handler(async ({ data }) => {
  await assertWithinLimit("request_ip", clientIdentifier(), 5, 3600);
  await assertWithinLimit("request_email", data.email, 3, 3600);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row, error } = await supabaseAdmin.from("assessment_requests").insert({ client_name: data.clientName, organization_name: data.organizationName, email: data.email, phone: data.phone || null, country: data.country || null, sector: data.sector, activity: data.activity, assessment_type: data.assessmentType, notes: data.notes || null, preferred_language: data.preferredLanguage, consent_version: "privacy-2026-09-23", consented_at: new Date().toISOString() }).select("reference_code").single();
  if (error) throw new Error(error.message); return row;
});

export const translateStandardSection = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => translationSchema.parse(input)).handler(async ({ data, context }) => {
  await assertAdmin(context as unknown as AuthedContext); const gateway = createLovableResponsesProvider(aiKey());
  const { supabaseAdmin: auditClient } = await import("@/integrations/supabase/client.server");
  await auditClient.from("admin_audit_log").insert({ actor_user_id: (context as unknown as AuthedContext).userId, action: "translate_standard_section", target_type: "standard_section", target_id: data.sectionId, details: {} });
  try {
    const result = streamText({ model: gateway.model, maxRetries: 0, system: "You are a senior Arabic-English translator specializing in Islamic finance and Shariah standards. Preserve exact percentages, thresholds, proper names, and normative force. Return exactly two lines: TITLE: ... and BODY: ... with no markdown.", prompt: `Translate accurately into formal professional English.\nArabic title: ${data.titleAr}\nArabic body: ${data.bodyAr}`, providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } } });
    const text = await result.text; const title = text.match(/^TITLE:\s*(.+)$/m)?.[1]?.trim(); const body = text.match(/^BODY:\s*([\s\S]+)$/m)?.[1]?.trim();
    if (!title || !body) throw new Error("The translation response was incomplete.");
    return { title, body, runId: gateway.getRunId() };
  } catch (error) { throw new Error(gatewayMessage(error)); }
});

export const suggestHospitalAssessment = createServerFn({ method: "POST" }).inputValidator((input: unknown) => aiAssessmentSchema.parse(input)).handler(async ({ data }) => {
  const log = await guardAi("hospital"); const gateway = createLovableResponsesProvider(aiKey());
  try {
    const result = streamText({ model: gateway.model, maxRetries: 0, system: "You assist a qualified Shariah reviewer using SSESBA. Never issue a final fatwa. Analyze only the supplied hospital business description. Propose six integer scores from 0 to 100 for contracts, revenues, financing, operations, governance, disclosure. Return one line only: SCORES: contracts,revenues,financing,operations,governance,disclosure | NOTE: concise Arabic rationale. Do not infer a risk tier.", prompt: data.description, providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } } });
    const text = await result.text; const match = text.match(/SCORES:\s*([0-9,\s]+)/i); const values = match?.[1]?.split(',').map((v) => Math.max(0, Math.min(100, Number.parseInt(v.trim(), 10))));
    if (!values || values.length !== 6 || values.some(Number.isNaN)) throw new Error("The AI assessment response was incomplete.");
    await log("success", gateway.getRunId());
    return { scores: values, note: text.match(/NOTE:\s*(.+)$/is)?.[1]?.trim() ?? "", runId: gateway.getRunId() };
  } catch (error) { await log("error", gateway.getRunId()); throw new Error(gatewayMessage(error)); }
});

export const updateStandardSection = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => updateSchema.parse(input)).handler(async ({ data, context }) => {
  await assertAdmin(context as unknown as AuthedContext); const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: current, error: readError } = await supabaseAdmin.from("standard_sections").select("*").eq("id", data.sectionId).single();
  if (readError) throw new Error(readError.message);
  const { error: revisionError } = await supabaseAdmin.from("content_revisions").insert({ section_id: current.id, snapshot: current, change_note: data.note || "Content updated" });
  if (revisionError) throw new Error(revisionError.message);
  const { error } = await supabaseAdmin.from("standard_sections").update({ title_ar: data.titleAr, body_ar: data.bodyAr, title_en: data.titleEn, body_en: data.bodyEn, translation_status: "approved", translated_at: new Date().toISOString(), content_version: (current.content_version ?? 1) + 1, reviewed_by: context.userId, reviewed_at: new Date().toISOString() }).eq("id", data.sectionId);
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("admin_audit_log").insert({ actor_user_id: context.userId, action: "update_standard_section", target_type: "standard_section", target_id: data.sectionId, details: { note: data.note ?? null, previous_version: current.content_version ?? 1 } });
  return { ok: true };
});

export const getAdminData = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context as unknown as AuthedContext); const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: sections, error: sectionError }, { data: brand, error: brandError }, { data: revisions, error: revisionError }] = await Promise.all([
    supabaseAdmin.from("standard_sections").select("*").order("sort_order"), supabaseAdmin.from("brand_settings").select("*").order("setting_key"), supabaseAdmin.from("content_revisions").select("id,section_id,change_note,created_at").order("created_at", { ascending: false }).limit(20),
  ]);
  if (sectionError || brandError || revisionError) throw new Error(sectionError?.message || brandError?.message || revisionError?.message); return { sections, brand, revisions };
});

const assistantSchema = z.object({
  question: z.string().trim().min(5).max(1200),
  excerpt: z.string().trim().max(6000).optional(),
  lang: z.enum(["ar", "en"]),
});

export const askStandardAssistant = createServerFn({ method: "POST" }).inputValidator((input: unknown) => assistantSchema.parse(input)).handler(async ({ data }) => {
  const log = await guardAi("assistant");
  const { data: sections, error } = await publicClient().from("standard_sections").select("section_key,title_ar,title_en,body_ar,body_en,sort_order").eq("is_published", true).order("sort_order");
  if (error) throw new Error(error.message);
  const context = (sections ?? []).map((s) => `### ${s.section_key}\nAR: ${s.title_ar}\n${s.body_ar}\nEN: ${s.title_en ?? ""}\n${s.body_en ?? ""}`).join("\n\n").slice(0, 24000);
  const gateway = createLovableResponsesProvider(aiKey());
  const arabic = data.lang === "ar";
  try {
    const result = streamText({
      model: gateway.model, maxRetries: 0,
      system: [
        "You are the SSESBA standards assistant: Shariah Standards for Economic Sectors and Business Activities.",
        "Answer ONLY from the supplied standard content plus the user's own excerpt. Never invent weights, thresholds, verdict rules, fatwas, or fiqh rulings that are not in the supplied material.",
        "Never issue a fatwa or a final accreditation; every answer is indicative and requires a qualified Shariah reviewer.",
        "If the supplied content does not cover the question, say so plainly and point to the closest related section.",
        arabic ? "Reply in formal Arabic." : "Reply in formal English.",
        "Return exactly this plain-text shape, no markdown symbols:",
        "SUMMARY: one short paragraph in simple language.",
        "POINTS: up to five lines, each starting with '- '.",
        "SECTIONS: comma-separated titles of the related standard sections, or '-' if none.",
      ].join("\n"),
      prompt: `${arabic ? "سؤال المستخدم" : "User question"}: ${data.question}\n\n${data.excerpt ? `${arabic ? "نص المعيار المُدخل" : "Pasted standard text"}:\n${data.excerpt}\n\n` : ""}${arabic ? "محتوى المعيار المرجعي" : "Reference standard content"}:\n${context}`,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });
    const text = await result.text;
    const summary = text.match(/SUMMARY:\s*([\s\S]*?)(?=\nPOINTS:|\nSECTIONS:|$)/i)?.[1]?.trim() ?? text.trim();
    const points = (text.match(/POINTS:\s*([\s\S]*?)(?=\nSECTIONS:|$)/i)?.[1] ?? "").split("\n").map((line) => line.replace(/^[-•\s]+/, "").trim()).filter(Boolean).slice(0, 5);
    const related = (text.match(/SECTIONS:\s*(.+)$/i)?.[1] ?? "").split(",").map((v) => v.trim()).filter((v) => v && v !== "-").slice(0, 6);
    if (!summary) throw new Error("The assistant response was incomplete.");
    await log("success", gateway.getRunId());
    return { summary, points, related, runId: gateway.getRunId() };
  } catch (err) { await log("error", gateway.getRunId()); throw new Error(gatewayMessage(err, data.lang)); }
});

const sixScaleSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  sector: z.enum(["primary", "secondary", "services"]),
  activity: z.string().trim().min(10).max(3000),
  financing: z.string().trim().min(5).max(3000),
  notes: z.string().trim().max(3000).optional(),
  lang: z.enum(["ar", "en"]),
  gate: z.object({ riba: z.boolean(), maysir: z.boolean(), prohibited: z.boolean(), gharar: z.boolean() }).optional(),
  totalRevenue: z.number().min(0).max(1e15).optional(),
  nonCompliantRevenue: z.number().min(0).max(1e15).optional(),
  investmentAmount: z.number().min(0).max(1e15).optional(),
});

const SIX_SCALE_RULES = [
  "You are a senior Shariah auditor and certified zakat accountant. Assess the company's Shariah compliance using the Six-Level Shariah Compliance Scale (100 down to below 45), applying the sector-specific standards below BEFORE issuing any score.",
  "Sector standards — PRIMARY (extractive, agriculture, livestock, mining): (1) lawful exploitation and ownership: no trespass on public or private property, lawful extraction concessions; (2) validity of agricultural partnership contracts (muzara'a, musaqah, mugharasa) free of excessive gharar; (3) precise zakat base: zakat on crops and fruits at harvest, and on rikaz and minerals per prescribed nisab; (4) environmental maqasid (no harm): no unjust environmental destruction or resource depletion harming the community.",
  "Sector standards — SECONDARY (manufacturing, processing, construction, real-estate development): (1) inputs and outputs free of intrinsically prohibited elements (pork derivatives, alcohol, materials harmful to public health); (2) istisna' and salam contract discipline: clear specifications and delivery terms removing jahala; (3) workers' rights (ijarat al-ashkhas): fair wages, safe workplace, no exploitation; (4) fixed-asset financing: whether factories and equipment are financed through riba-based loans or Islamic instruments (ijara muntahia bittamleek, murabaha).",
  "Sector standards — SERVICES (financial, technology, commercial, educational, consulting): (1) ijarat al-manafi' free of gharar and jahala in description, duration, and fee; (2) financial flows free of riba al-fadl and riba al-nasi'a, purification of incidental non-compliant income, no trading of debt as a commodity (discounting commercial papers); (3) intellectual-property and data rights respected; no profiting from client data violating privacy; (4) marketing ethics: no deception, taghrir, or najsh; no promotion of immoral services.",
  "Classification levels (with indicative ranges): 95–100 fully compliant; 85–94 substantially compliant; 75–84 compliant with conditions; 60–74 requires structural remediation; 45–59 non-compliant; below 45 prohibited (haram) — and any core prohibited activity is classified prohibited regardless of score.",
  "This is an indicative audit reading, not a fatwa and not a final accreditation; it requires review by a qualified Shariah board.",
].join("\n");

export const evaluateCompanySixScale = createServerFn({ method: "POST" }).inputValidator((input: unknown) => sixScaleSchema.parse(input)).handler(async ({ data }) => {
  const log = await guardAi("six_scale");
  const gateway = createLovableResponsesProvider(aiKey());
  const arabic = data.lang === "ar";
  const sectorLabel = { primary: arabic ? "أولي (استخراجي/زراعي/رعوي/تعدين)" : "Primary (extractive/agriculture/livestock/mining)", secondary: arabic ? "ثانوي (صناعي/تحويلي/بناء/تطوير عقاري)" : "Secondary (manufacturing/construction/real estate)", services: arabic ? "خدمي (مالي/تقني/تجاري/تعليمي/استشاري)" : "Services (financial/tech/commercial/education/consulting)" }[data.sector];
  try {
    const result = streamText({
      model: gateway.model, maxRetries: 0,
      system: SIX_SCALE_RULES + "\n" + (arabic ? "Reply in formal Arabic." : "Reply in formal English.") + "\nReturn exactly this plain-text shape, no markdown:\nAXES: six integers 0-100 in this exact order: contracts,revenues,financing,operations,governance,disclosure\nJUSTIFICATION: up to six lines, each starting with '- ', each citing the sector standard applied.\nPLAN: remediation or purification steps if the score is between 45 and 84, each starting with '- ', or '-' if not applicable.",
      prompt: `${arabic ? "اسم الشركة" : "Company"}: ${data.companyName}\n${arabic ? "القطاع" : "Sector"}: ${sectorLabel}\n${arabic ? "وصف النشاط" : "Activity"}: ${data.activity}\n${arabic ? "الهيكل التمويلي والإيرادات" : "Financing and revenue"}: ${data.financing}\n${data.notes ? `${arabic ? "ملاحظات استثنائية" : "Notes"}: ${data.notes}` : ""}`,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });
    const text = await result.text;
    const values = text.match(/AXES:\s*([0-9,\s]+)/i)?.[1]?.split(",").map((v) => Math.max(0, Math.min(100, Number.parseInt(v.trim(), 10))));
    const splitLines = (block: RegExpMatchArray | null) => (block?.[1] ?? "").split("\n").map((l) => l.replace(/^[-•\s]+/, "").trim()).filter((l) => l && l !== "-").slice(0, 8);
    const justification = splitLines(text.match(/JUSTIFICATION:\s*([\s\S]*?)(?=\nPLAN:|$)/i));
    const aiPlan = splitLines(text.match(/PLAN:\s*([\s\S]*?)$/i));
    if (!values || values.length !== 6 || values.some(Number.isNaN) || justification.length === 0) throw new Error("The six-scale assessment response was incomplete.");
    const scores = Object.fromEntries(axes.map((a, idx) => [a.id, values[idx]!])) as Record<string, number>;
    const gatePassed = !data.gate || gateChecks.every((c) => data.gate?.[c.id as keyof typeof data.gate] === true);
    // الحساب الحتمي: الأوزان المعتمدة 25/25/20/15/10/5، والذكاء الاصطناعي يقترح درجات المحاور فقط.
    const weighted = Math.round(axes.reduce((t, a) => t + scores[a.id]! * a.weight / 100, 0) * 10) / 10;
    const score = gatePassed ? weighted : 0;
    const level = complianceLevelForScore(score)[data.lang];
    const financialExposure = calculateFinancialExposure(data.totalRevenue ?? 0, data.nonCompliantRevenue ?? 0, data.investmentAmount ?? 0);
    const plan = score >= 45 && score < 85 ? aiPlan : [];
    await log("success", gateway.getRunId());
    return { score, level, justification, plan, scores, financialExposure, gatePassed, runId: gateway.getRunId() };
  } catch (err) { await log("error", gateway.getRunId()); throw new Error(gatewayMessage(err, data.lang)); }
});

const objectionSchema = z.object({ referenceCode: z.string().trim().min(4).max(40), requesterName: z.string().trim().min(2).max(120), email: z.string().trim().email().max(255), reason: z.string().trim().min(20).max(3000), preferredLanguage: z.enum(["ar", "en"]) });

export const submitAssessmentObjection = createServerFn({ method: "POST" }).inputValidator((input: unknown) => objectionSchema.parse(input)).handler(async ({ data }) => {
  await assertWithinLimit("objection_ip", clientIdentifier(), 5, 3600);
  await assertWithinLimit("objection_email", data.email, 3, 3600);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("assessment_objections").insert({ reference_code: data.referenceCode, requester_name: data.requesterName, email: data.email, reason: data.reason, preferred_language: data.preferredLanguage });
  if (error) throw new Error(error.message); return { ok: true };
});
