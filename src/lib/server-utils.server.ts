import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/* أدوات الخادم المشتركة بين دوال الخادم: الأخطاء الآمنة، وعملاء قاعدة البيانات، والصلاحيات، وحدود الاستخدام. */

/** خطأ رسالته آمنة للعرض على المستخدم؛ ما عداه يُسجَّل في الخادم ويُستبدل برسالة عامة. */
export class UserFacingError extends Error {}

export const genericFailure =
  "تعذّر إكمال الطلب. حاول لاحقًا. / The request could not be completed. Please try again later.";

export function failure(context: string, error: unknown): never {
  if (error instanceof UserFacingError) throw error;
  console.error(`[ssesba] ${context}`, error);
  throw new UserFacingError(genericFailure);
}

export function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) failure("public client", new Error("Cloud configuration is unavailable"));
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_")) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
export async function adminClient() {
  try {
    return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  } catch (error) {
    return failure("admin client", error);
  }
}
export type AuthedContext = {
  supabase: {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  userId: string;
};

/** ضبط الصلاحيات: التحرير مقصور على مستخدم مسجّل يحمل دور مدير في قاعدة البيانات. */
export async function assertAdmin(context: AuthedContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new UserFacingError("Unable to verify administrator role.");
  if (data !== true) throw new UserFacingError("Forbidden: administrator role required.");
}

/**
 * معرّف المصدر لحدود الاستخدام. تُقدَّم الترويسات التي يضعها الوسيط (Cloudflare ثم x-real-ip)،
 * ثم آخر عنوان في x-forwarded-for لأنه الذي أضافه الوسيط، لا الأول الذي يستطيع العميل تزويره.
 */
export function clientIdentifier() {
  const headers = getRequest()?.headers;
  const forwarded = headers
    ?.get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return (
    headers?.get("cf-connecting-ip") || headers?.get("x-real-ip") || forwarded?.at(-1) || "unknown"
  );
}

export async function hashIdentifier(value: string) {
  const salt = process.env["AI_IDENTIFIER_SALT"] ?? "ssesba-rate-limit";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${value}`),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const limitMessage =
  "تم تجاوز عدد الطلبات المسموح. حاول لاحقًا. / Too many requests. Please try again later.";

/** سقف محاولات لكل نطاق ومعرّف في نافذة زمنية، عبر دالة قاعدة البيانات المركزية. */
export async function withinLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
) {
  const supabaseAdmin = await adminClient();
  const { data, error } = await supabaseAdmin.rpc("register_submission_attempt", {
    _scope: scope,
    _identifier: identifier.slice(0, 200).toLowerCase(),
    _limit: limit,
    _window_seconds: windowSeconds,
  });
  if (error) failure(`rate limit ${scope}`, error);
  return data !== false;
}
export async function assertWithinLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
) {
  if (!(await withinLimit(scope, identifier, limit, windowSeconds)))
    throw new UserFacingError(limitMessage);
}
