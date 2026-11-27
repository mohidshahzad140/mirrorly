"use client";
import { useEffect, useRef, useState } from "react";
import { moveDeviceHistoryToAccount } from "@/lib/history";
import { authMessage, supabase, useUser } from "@/lib/supabase";

/** "Log in" pill in the nav. Opens a small panel to log in, sign up or log out. */
export function AccountButton() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const prevUser = useRef<string | null | undefined>(undefined);

  // When someone logs in, bring their device history into the account.
  useEffect(() => {
    const id = user?.id ?? null;
    if (user !== undefined && prevUser.current !== undefined && id && prevUser.current !== id) {
      moveDeviceHistoryToAccount().then((n) => n && setMsg({ kind: "info", text: `Moved ${n} try-on${n > 1 ? "s" : ""} from this device to your account.` }));
    }
    if (user !== undefined) prevUser.current = id;
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!supabase || user === undefined) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === "login"
        ? await supabase!.auth.signInWithPassword({ email, password })
        : await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (res.error) return setMsg({ kind: "error", text: authMessage(res.error.message) });
    if (mode === "signup" && !res.data.session) {
      return setMsg({ kind: "info", text: "Almost done: open the email from Supabase and click the link to confirm your account." });
    }
    setPassword("");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMsg(null);
          setOpen(true);
        }}
        className="pill h-11 max-w-44 truncate rounded-full border-2 border-white/20 px-4 text-sm font-medium text-white"
      >
        {user ? user.email : "Log in"}
      </button>

      {open && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-title"
            className="overlay-card flex w-full max-w-sm flex-col gap-5 rounded-[32px] bg-card p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {user ? (
              <>
                <h2 id="account-title" className="text-2xl font-extrabold tracking-tight">Your account</h2>
                <p className="text-sm text-white/70">Logged in as <strong className="text-white">{user.email}</strong>. Your try-ons are saved to this account, so History shows them on any device.</p>
                {msg && <p role="status" className="text-sm text-yellow">{msg.text}</p>}
                <div className="flex gap-2">
                  <button onClick={() => supabase!.auth.signOut().then(() => setOpen(false))} className="pill h-12 flex-1 rounded-full bg-yellow font-bold text-void">Log out</button>
                  <button onClick={() => setOpen(false)} className="pill h-12 flex-1 rounded-full border-2 border-white/20 font-medium">Close</button>
                </div>
              </>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 id="account-title" className="text-2xl font-extrabold tracking-tight">{mode === "login" ? "Log in" : "Create an account"}</h2>
                <p className="text-sm text-white/70">Save your try-ons to an account, so History follows you to any device. You can still try on without one.</p>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Email
                  <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-full bg-well px-5 text-white focus:outline-2 focus:outline-yellow" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-full bg-well px-5 text-white focus:outline-2 focus:outline-yellow"
                  />
                </label>
                {msg && (
                  <p role={msg.kind === "error" ? "alert" : "status"} className={`text-sm ${msg.kind === "error" ? "font-bold text-yellow" : "text-white/80"}`}>
                    {msg.text}
                  </p>
                )}
                <button type="submit" disabled={busy} className="pill h-12 rounded-full bg-yellow font-bold text-void disabled:opacity-50">
                  {busy ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setMsg(null);
                  }}
                  className="text-sm font-medium text-white/80 underline-offset-4 hover:underline"
                >
                  {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
