import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, FilePlus2, LogOut, Plus, Save, Send, Trash2, XCircle } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { SiteShell } from "./SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  findActivity,
  nodeLabel,
  requirementKinds,
  standardLevels,
  standardStatuses,
  taxonomy,
  type Requirement,
  type RequirementKind,
  type StandardLevel,
} from "@/lib/classification-standards";
import {
  getClassificationStandardsForEditor,
  reviewClassificationStandard,
  saveClassificationStandard,
  submitClassificationStandard,
} from "@/lib/standards.functions";

type EditorData = Awaited<ReturnType<typeof getClassificationStandardsForEditor>>;
type Row = EditorData["standards"][number];

type Draft = {
  id?: string;
  level: StandardLevel;
  nodeKey: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  requirements: Requirement[];
  sources: string;
  note: string;
};

const emptyDraft = (): Draft => ({
  level: "sector",
  nodeKey: taxonomy.sectors[0]!.id,
  titleAr: "",
  titleEn: "",
  summaryAr: "",
  summaryEn: "",
  requirements: [{ kind: "mandatory", ar: "", en: "", ref: "" }],
  sources: "",
  note: "",
});

function toDraft(row: Row): Draft {
  return {
    id: row.id,
    level: row.level as StandardLevel,
    nodeKey: row.node_key,
    titleAr: row.title_ar,
    titleEn: row.title_en ?? "",
    summaryAr: row.summary_ar,
    summaryEn: row.summary_en ?? "",
    requirements: ((row.requirements as unknown as Requirement[]) ?? []).map((item) => ({
      ...item,
      en: item.en ?? "",
      ref: item.ref ?? "",
    })),
    sources: ((row.sources as unknown as string[]) ?? []).join("\n"),
    note: "",
  };
}

const statusTone: Record<string, string> = {
  draft: "bg-muted text-foreground",
  pending_review: "bg-brand-parchment text-brand-navy",
  approved: "bg-brand-emerald-soft text-brand-emerald",
  rejected: "bg-destructive/10 text-destructive",
};

function SignIn({ onError }: { onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    onError("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) onError("تعذّر تسجيل الدخول. تحقق من البريد وكلمة المرور.");
    setBusy(false);
  }
  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-md gap-4 rounded-lg border bg-card p-6">
      <p className="text-sm leading-7 text-muted-foreground">
        تحرير المعايير ومراجعتها مقصوران على المراجعين الشرعيين والمديرين. سجّل الدخول بحسابك.
      </p>
      <div>
        <Label htmlFor="editor-email">البريد الإلكتروني</Label>
        <Input
          id="editor-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="editor-password">كلمة المرور</Label>
        <Input
          id="editor-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2"
        />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </Button>
    </form>
  );
}

function NodePicker({
  draft,
  locked,
  onChange,
}: {
  draft: Draft;
  locked: boolean;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const field =
    "mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60";
  const activityIndustry =
    draft.level === "activity"
      ? (findActivity(draft.nodeKey)?.industry.key ?? taxonomy.industries[0]!.key)
      : taxonomy.industries[0]!.key;
  const [industryForActivity, setIndustryForActivity] = useState(activityIndustry);
  useEffect(() => setIndustryForActivity(activityIndustry), [activityIndustry]);
  const industry = taxonomy.industries.find((item) => item.key === industryForActivity);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Label htmlFor="editor-level">المستوى</Label>
        <select
          id="editor-level"
          className={field}
          disabled={locked}
          value={draft.level}
          onChange={(e) => {
            const level = e.target.value as StandardLevel;
            const nodeKey =
              level === "sector"
                ? taxonomy.sectors[0]!.id
                : level === "industry"
                  ? taxonomy.industries[0]!.key
                  : taxonomy.industries[0]!.subsectors[0]!.activities[0]!.key;
            onChange({ level, nodeKey });
          }}
        >
          {standardLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.ar}
            </option>
          ))}
        </select>
      </div>
      {draft.level === "sector" && (
        <div className="md:col-span-2">
          <Label htmlFor="editor-node">القطاع</Label>
          <select
            id="editor-node"
            className={field}
            disabled={locked}
            value={draft.nodeKey}
            onChange={(e) => onChange({ nodeKey: e.target.value })}
          >
            {taxonomy.sectors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ar}
              </option>
            ))}
          </select>
        </div>
      )}
      {draft.level === "industry" && (
        <div className="md:col-span-2">
          <Label htmlFor="editor-node">الصناعة</Label>
          <select
            id="editor-node"
            className={field}
            disabled={locked}
            value={draft.nodeKey}
            onChange={(e) => onChange({ nodeKey: e.target.value })}
          >
            {taxonomy.industries.map((item) => (
              <option key={item.key} value={item.key}>
                {item.ar} ({item.isic})
              </option>
            ))}
          </select>
        </div>
      )}
      {draft.level === "activity" && (
        <>
          <div>
            <Label htmlFor="editor-activity-industry">الصناعة</Label>
            <select
              id="editor-activity-industry"
              className={field}
              disabled={locked}
              value={industryForActivity}
              onChange={(e) => {
                setIndustryForActivity(e.target.value);
                const first = taxonomy.industries.find((item) => item.key === e.target.value)
                  ?.subsectors[0]?.activities[0];
                if (first) onChange({ nodeKey: first.key });
              }}
            >
              {taxonomy.industries.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.ar} ({item.isic})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="editor-node">النشاط</Label>
            <select
              id="editor-node"
              className={field}
              disabled={locked}
              value={draft.nodeKey}
              onChange={(e) => onChange({ nodeKey: e.target.value })}
            >
              {industry?.subsectors.map((subsector) => (
                <optgroup key={subsector.ar} label={subsector.ar}>
                  {subsector.activities.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.ar}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export function StandardsEditorPage() {
  const loadEditor = useServerFn(getClassificationStandardsForEditor);
  const save = useServerFn(saveClassificationStandard);
  const submit = useServerFn(submitClassificationStandard);
  const review = useServerFn(reviewClassificationStandard);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<EditorData | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: current }) => {
      setSession(current.session);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    try {
      setData(await loadEditor());
      setError("");
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "تعذّر التحميل");
    }
  }, [loadEditor]);

  useEffect(() => {
    if (session) void refresh();
  }, [session, refresh]);

  const current = useMemo(
    () => data?.standards.find((row) => row.id === draft?.id),
    [data, draft?.id],
  );
  const rows = (data?.standards ?? []).filter((row) => filter === "all" || row.status === filter);
  const patch = (value: Partial<Draft>) =>
    setDraft((prev) => (prev ? { ...prev, ...value } : prev));
  const patchRequirement = (index: number, value: Partial<Requirement>) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            requirements: prev.requirements.map((item, i) =>
              i === index ? { ...item, ...value } : item,
            ),
          }
        : prev,
    );

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تنفيذ العملية");
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    if (!draft) return;
    await run(async () => {
      const result = await save({
        data: {
          id: draft.id,
          level: draft.level,
          nodeKey: draft.nodeKey,
          titleAr: draft.titleAr,
          titleEn: draft.titleEn || undefined,
          summaryAr: draft.summaryAr,
          summaryEn: draft.summaryEn || undefined,
          requirements: draft.requirements
            .filter((item) => item.ar.trim())
            .map((item) => ({
              kind: item.kind,
              ar: item.ar,
              en: item.en || undefined,
              ref: item.ref || undefined,
            })),
          sources: draft.sources
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          note: draft.note || undefined,
        },
      });
      patch({ id: result.id, note: "" });
    }, "حُفظت المسودة.");
  }

  const locked = current?.status === "pending_review";
  const canReview =
    current?.status === "pending_review" && data?.editor.userId !== current.updated_by;

  return (
    <SiteShell
      lang="ar"
      eyebrow="إدارة المعايير"
      title="تحرير معايير القطاعات والصناعات والأنشطة ومراجعتها"
    >
      <section className="mx-auto max-w-7xl px-5 py-10">
        {!ready ? (
          <p className="text-muted-foreground">جارٍ التحقق من الجلسة…</p>
        ) : !session ? (
          <>
            <SignIn onError={setError} />
            {error && (
              <p role="alert" className="mx-auto mt-4 max-w-md text-sm text-destructive">
                {error}
              </p>
            )}
          </>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.3fr]">
            <aside className="grid content-start gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setDraft(emptyDraft());
                    setMessage("");
                    setError("");
                  }}
                >
                  <FilePlus2 />
                  معيار جديد
                </Button>
                <Button type="button" variant="outline" onClick={() => supabase.auth.signOut()}>
                  <LogOut />
                  خروج
                </Button>
              </div>
              <div>
                <Label htmlFor="editor-filter">تصفية حسب الحالة</Label>
                <select
                  id="editor-filter"
                  className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">الكل</option>
                  {standardStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.ar}
                    </option>
                  ))}
                </select>
              </div>
              {error && !data && (
                <p
                  role="alert"
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <ul className="grid gap-2">
                {rows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(toDraft(row));
                        setReviewNote("");
                        setMessage("");
                        setError("");
                      }}
                      className={`w-full rounded-md border p-3 text-start text-sm transition hover:border-brand-gold ${draft?.id === row.id ? "border-brand-gold bg-brand-parchment/60" : "bg-card"}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {standardLevels.find((l) => l.id === row.level)?.ar} ·{" "}
                          {nodeLabel(
                            { level: row.level as StandardLevel, key: row.node_key },
                            "ar",
                          )}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${statusTone[row.status] ?? ""}`}
                        >
                          {standardStatuses.find((s) => s.id === row.status)?.ar}
                        </span>
                      </span>
                      <span className="mt-1 block font-semibold">{row.title_ar}</span>
                      <span className="text-xs text-muted-foreground">
                        الإصدار {row.version}
                        {row.published_version
                          ? ` · المنشور ${row.published_version}`
                          : " · غير منشور"}
                      </span>
                    </button>
                  </li>
                ))}
                {data && rows.length === 0 && (
                  <li className="text-sm text-muted-foreground">لا توجد معايير بهذه الحالة.</li>
                )}
              </ul>
            </aside>

            {draft ? (
              <div className="grid content-start gap-5 rounded-lg border bg-card p-6">
                {current && (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`rounded-full px-3 py-1 ${statusTone[current.status] ?? ""}`}>
                      {standardStatuses.find((s) => s.id === current.status)?.ar}
                    </span>
                    <span className="text-muted-foreground">الإصدار {current.version}</span>
                    {current.review_note && (
                      <p className="w-full rounded-md border border-brand-gold/40 bg-brand-parchment p-3 text-sm leading-6">
                        ملاحظة: {current.review_note}
                      </p>
                    )}
                  </div>
                )}
                <NodePicker draft={draft} locked={Boolean(draft.id)} onChange={patch} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="editor-title-ar">العنوان (عربي)</Label>
                    <Input
                      id="editor-title-ar"
                      className="mt-2"
                      value={draft.titleAr}
                      disabled={locked}
                      onChange={(e) => patch({ titleAr: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editor-title-en">العنوان (إنجليزي)</Label>
                    <Input
                      id="editor-title-en"
                      dir="ltr"
                      className="mt-2"
                      value={draft.titleEn}
                      disabled={locked}
                      onChange={(e) => patch({ titleEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editor-summary-ar">الملخص (عربي)</Label>
                    <Textarea
                      id="editor-summary-ar"
                      className="mt-2 min-h-28"
                      value={draft.summaryAr}
                      disabled={locked}
                      onChange={(e) => patch({ summaryAr: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editor-summary-en">الملخص (إنجليزي)</Label>
                    <Textarea
                      id="editor-summary-en"
                      dir="ltr"
                      className="mt-2 min-h-28"
                      value={draft.summaryEn}
                      disabled={locked}
                      onChange={(e) => patch({ summaryEn: e.target.value })}
                    />
                  </div>
                </div>

                <fieldset className="grid gap-3 rounded-md border p-4">
                  <legend className="px-2 text-sm font-semibold text-brand-navy">
                    الضوابط والأحكام
                  </legend>
                  {draft.requirements.map((item, index) => (
                    <div key={index} className="grid gap-2 rounded-md border bg-background p-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`req-kind-${index}`} className="sr-only">
                          نوع البند {index + 1}
                        </Label>
                        <select
                          id={`req-kind-${index}`}
                          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                          value={item.kind}
                          disabled={locked}
                          onChange={(e) =>
                            patchRequirement(index, { kind: e.target.value as RequirementKind })
                          }
                        >
                          {requirementKinds.map((kind) => (
                            <option key={kind.id} value={kind.id}>
                              {kind.ar}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-muted-foreground">البند {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ms-auto"
                          disabled={locked || draft.requirements.length === 1}
                          aria-label={`حذف البند ${index + 1}`}
                          onClick={() =>
                            patch({
                              requirements: draft.requirements.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <Textarea
                        aria-label={`نص البند ${index + 1} بالعربية`}
                        placeholder="نص الضابط بالعربية"
                        value={item.ar}
                        disabled={locked}
                        onChange={(e) => patchRequirement(index, { ar: e.target.value })}
                      />
                      <Textarea
                        aria-label={`نص البند ${index + 1} بالإنجليزية`}
                        dir="ltr"
                        placeholder="English text (optional)"
                        value={item.en ?? ""}
                        disabled={locked}
                        onChange={(e) => patchRequirement(index, { en: e.target.value })}
                      />
                      <Input
                        aria-label={`مرجع البند ${index + 1}`}
                        placeholder="المرجع أو الدليل (معيار أيوفي، قرار مجمع، نص…)"
                        value={item.ref ?? ""}
                        disabled={locked}
                        onChange={(e) => patchRequirement(index, { ref: e.target.value })}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={locked}
                    onClick={() =>
                      patch({
                        requirements: [
                          ...draft.requirements,
                          { kind: "mandatory", ar: "", en: "", ref: "" },
                        ],
                      })
                    }
                  >
                    <Plus />
                    إضافة بند
                  </Button>
                </fieldset>

                <div>
                  <Label htmlFor="editor-sources">المراجع العامة (سطر لكل مرجع)</Label>
                  <Textarea
                    id="editor-sources"
                    className="mt-2 min-h-24"
                    value={draft.sources}
                    disabled={locked}
                    onChange={(e) => patch({ sources: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editor-note">ملاحظة التعديل (تُحفظ في سجل المراجعات)</Label>
                  <Input
                    id="editor-note"
                    className="mt-2"
                    value={draft.note}
                    disabled={locked}
                    onChange={(e) => patch({ note: e.target.value })}
                  />
                </div>

                <div className="flex flex-wrap gap-3 border-t pt-4">
                  <Button type="button" onClick={onSave} disabled={busy || locked}>
                    <Save />
                    حفظ كمسودة
                  </Button>
                  {current && (current.status === "draft" || current.status === "rejected") && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(() => submit({ data: { id: current.id } }), "أُرسل المعيار للمراجعة.")
                      }
                    >
                      <Send />
                      إرسال للمراجعة
                    </Button>
                  )}
                </div>

                {current?.status === "pending_review" && (
                  <div className="grid gap-3 rounded-md border border-brand-gold/40 bg-brand-parchment/50 p-4">
                    <p className="text-sm font-semibold text-brand-navy">قرار المراجعة</p>
                    {canReview ? (
                      <>
                        <Label htmlFor="editor-review-note">
                          ملاحظة المراجع (إلزامية عند الرفض)
                        </Label>
                        <Textarea
                          id="editor-review-note"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              run(
                                () =>
                                  review({
                                    data: {
                                      id: current.id,
                                      decision: "approve",
                                      note: reviewNote || undefined,
                                    },
                                  }),
                                "اعتُمد المعيار ونُشر.",
                              )
                            }
                          >
                            <CheckCircle2 />
                            اعتماد ونشر
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              run(
                                () =>
                                  review({
                                    data: { id: current.id, decision: "reject", note: reviewNote },
                                  }),
                                "أُعيد المعيار إلى المحرّر.",
                              )
                            }
                          >
                            <XCircle />
                            رفض وإعادة
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        أنت آخر من عدّل هذا المعيار؛ يلزم مراجع آخر لاعتماده (مبدأ العينين الأربع).
                      </p>
                    )}
                  </div>
                )}
                {message && (
                  <p role="status" className="text-sm text-brand-emerald">
                    {message}
                  </p>
                )}
                {error && data && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                اختر معيارًا من القائمة أو أنشئ معيارًا جديدًا.
              </p>
            )}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
