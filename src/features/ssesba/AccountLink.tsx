import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Header account affordance driven by the live session. */
export function AccountLink({ en }: { en: boolean }) {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <Link
      to={signedIn ? "/review" : "/auth"}
      className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm text-brand-paper/85 hover:bg-brand-paper/10 sm:flex"
    >
      <UserRound className="size-4" />
      {signedIn
        ? en
          ? "Review desk"
          : "لوحة المراجعة"
        : en
          ? "Reviewer sign in"
          : "دخول المراجعين"}
    </Link>
  );
}
