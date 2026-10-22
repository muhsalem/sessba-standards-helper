import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "./SiteShell";
import type { Lang } from "@/lib/ssesba-data";

export function AuthPage({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const text = (ar: string, english: string) => en ? english : ar;
  const reviewPath = en ? "/en/review" : "/review";
  const authPath = en ? "/en/auth" : "/auth";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: reviewPath, replace: true });
    });
    return () => { active = false; };
  }, [navigate, reviewPath]);

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
      if (error) return setErr(text("تعذر الدخول: تحقق من البريد وكلمة المرور. / Sign-in failed.", "Sign-in failed. Check your email and password."));
      navigate({ to: reviewPath });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + authPath,
          data: {
            display_name: String(f.get("name") || ""),
            specialty: String(f.get("specialty") || ""),
          },
        },
      });
      setBusy(false);
      if (error) return setErr(text("تعذر إنشاء الحساب. تحقق من البيانات وحاول مجددًا.", "Could not create your account. Check your details and try again."));
      setMsg(
        text("أُرسل رابط التأكيد إلى بريدك. بعد التأكيد يمنحك المشرف صلاحية مراجع أو خبير. / Check your email to confirm your account.", "Check your email to confirm your account. An administrator will grant reviewer or expert access after verification."),
      );
    }
  }
  async function google() {
    setErr("");
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + authPath,
    });
    if (r.error) setErr(text("تعذر الدخول عبر Google.", "Google sign-in failed."));
    else if (!r.redirected) navigate({ to: reviewPath });
  }

  return (
    <SiteShell
      lang={lang}
      eyebrow={text("حسابات المراجعين والخبراء", "Reviewer and expert accounts")}
      title={mode === "in" ? text("تسجيل الدخول", "Sign in") : text("إنشاء حساب", "Create an account")}
    >
      <section className="mx-auto max-w-md px-5 py-12">
        <div className="border-t-4 border-brand-emerald bg-card p-6 shadow-sm md:p-8">
          <p className="text-sm leading-7 text-muted-foreground">
            {text("للمراجعين الشرعيين والخبراء المعتمدين من فريق المنصة. إنشاء الحساب لا يمنح صلاحيات المراجعة تلقائيًا.", "For Shariah reviewers and experts approved by the platform team. Creating an account does not automatically grant review permissions.")}
          </p>
          <Button type="button" variant="outline" onClick={google} className="mt-6 min-h-11 w-full">
            {text("المتابعة عبر Google", "Continue with Google")}
          </Button>
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {mode === "up" && (
              <>
                <div>
                  <Label htmlFor="a-name">{text("الاسم", "Name")}</Label>
                  <Input id="a-name" name="name" required maxLength={120} className="mt-2 h-11" />
                </div>
                <div>
                  <Label htmlFor="a-spec">{text("التخصص", "Specialty")}</Label>
                  <Input id="a-spec" name="specialty" maxLength={120} className="mt-2 h-11" />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="a-email">{text("البريد الإلكتروني", "Email address")}</Label>
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
              <Label htmlFor="a-pass">{text("كلمة المرور", "Password")}</Label>
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
              {busy ? text("جارٍ…", "Please wait…") : mode === "in" ? text("دخول", "Sign in") : text("إنشاء الحساب", "Create account")}
            </Button>
          </form>
          <Button variant="link"
            type="button"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setErr("");
              setMsg("");
            }}
            className="mt-5 text-sm underline"
          >
            {mode === "in" ? text("ليس لديك حساب؟ أنشئ حسابًا", "No account? Create one") : text("لديك حساب؟ سجّل الدخول", "Already have an account? Sign in")}
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
