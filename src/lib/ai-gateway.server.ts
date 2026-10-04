import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableResponsesProvider(apiKey: string) {
  let runId: string | undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  const runIdReady = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      const next = response.headers.get(RUN_ID_HEADER) ?? undefined;
      if (!runId) {
        runId = next;
        resolveRunId(next);
      }
      return response;
    },
  });
  return {
    model: provider.responses("openai/gpt-6-astra"),
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : runIdReady),
  };
}

export function safeAiError(error: unknown, lang: "ar" | "en" = "ar") {
  const fallback =
    lang === "ar"
      ? "تعذّر إكمال الطلب. حاول لاحقًا."
      : "The request could not be completed. Please try again later.";
  if (!(error instanceof Error)) return fallback;
  const e = error as {
    statusCode?: unknown;
    status?: unknown;
    cause?: { statusCode?: unknown; status?: unknown };
  };
  const raw = e.statusCode ?? e.status ?? e.cause?.statusCode ?? e.cause?.status;
  const status = typeof raw === "number" ? raw : undefined;
  if (status === 400)
    return lang === "ar"
      ? "المدخلات غير صالحة أو طويلة جدًا."
      : "The input is invalid or too long.";
  if (status === 401)
    return lang === "ar" ? "خدمة الذكاء الاصطناعي غير مهيأة." : "The AI service is not configured.";
  if (status === 402)
    return lang === "ar"
      ? "رصيد الذكاء الاصطناعي غير كافٍ حاليًا."
      : "AI credits are currently insufficient.";
  if (status === 403)
    return lang === "ar"
      ? "الخدمة غير متاحة وفق سياسة مساحة العمل."
      : "The service is unavailable under the workspace policy.";
  if (status === 429)
    return lang === "ar"
      ? "الخدمة مشغولة أو تجاوزت حد الاستخدام. حاول لاحقًا."
      : "The service is busy or rate-limited. Please try later.";
  // لا تُعرض رسائل الأخطاء الداخلية للمستخدم.
  return fallback;
}
