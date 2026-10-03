import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "@/features/ssesba/SiteShell";

const title = "دخول المراجعين والخبراء | معايير التصنيف الشرعي";
const description =
  "تسجيل الدخول وإنشاء حساب للمراجعين الشرعيين والخبراء لمراجعة مساهمات الوقف المعرفي.";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setBusy(true);
    setErr("");
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setErr("تعذر الدخول: تحقق من البريد وكلمة المرور. / Sign-in failed.");
      navigate({ to: "/review" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/review",
          data: {
            display_name: String(f.get("name") || ""),
            specialty: String(f.get("specialty") || ""),
          },
        },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      setMsg(
        "أُرسل رابط التأكيد إلى بريدك. بعد التأكيد يمنحك المشرف صلاحية مراجع أو خبير. / Check your email to confirm your account.",
      );
    }
  }
  async function google() {
    setErr("");
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (r.error) setErr("تعذر الدخول عبر Google.");
    else if (!r.redirected) navigate({ to: "/review" });
  }

  return (
    <SiteShell
      lang="ar"
      eyebrow="حسابات المراجعين والخبراء"
      title={mode === "in" ? "تسجيل الدخول" : "إنشاء حساب"}
    >
      <section className="mx-auto max-w-md px-5 py-12">
        <div className="border-t-4 border-brand-emerald bg-card p-6 shadow-sm md:p-8">
          <p className="text-sm leading-7 text-muted-foreground">
            للمراجعين الشرعيين والخبراء المعتمدين من فريق المنصة. إنشاء الحساب لا يمنح صلاحيات
            المراجعة تلقائيًا.
          </p>
          <Button type="button" variant="outline" onClick={google} className="mt-6 min-h-11 w-full">
            المتابعة عبر Google
          </Button>
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {mode === "up" && (
              <>
                <div>
                  <Label htmlFor="a-name">الاسم</Label>
                  <Input id="a-name" name="name" required maxLength={120} className="mt-2 h-11" />
                </div>
                <div>
                  <Label htmlFor="a-spec">التخصص</Label>
                  <Input id="a-spec" name="specialty" maxLength={120} className="mt-2 h-11" />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="a-email">البريد الإلكتروني</Label>
              <Input
                id="a-email"
                name="email"
                type="email"
                required
                className="mt-2 h-11"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="a-pass">كلمة المرور</Label>
              <Input
                id="a-pass"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-2 h-11"
                dir="ltr"
              />
            </div>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
            {msg && (
              <p role="status" className="text-sm text-brand-emerald">
                {msg}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="min-h-12 bg-brand-emerald text-primary-foreground hover:bg-brand-navy"
            >
              {busy ? "جارٍ…" : mode === "in" ? "دخول" : "إنشاء الحساب"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setErr("");
              setMsg("");
            }}
            className="mt-5 text-sm underline"
          >
            {mode === "in" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
          </button>
        </div>
      </section>
    </SiteShell>
  );
}
