"use client";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Null when Supabase isn't configured: the site then works without accounts. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

/** The logged-in user, or null. `undefined` while it is still being checked. */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(supabase ? undefined : null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}

/** Turns Supabase's auth errors into plain words. */
export function authMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match.";
  if (m.includes("email not confirmed")) return "Confirm your email first: check your inbox for the link from Supabase.";
  if (m.includes("already registered")) return "There's already an account with this email. Log in instead.";
  if (m.includes("password") && m.includes("at least")) return "Use a password of at least 6 characters.";
  if (m.includes("rate limit")) return "Too many tries. Wait a minute and try again.";
  if (m.includes("valid email") || m.includes("invalid email")) return "That doesn't look like an email address.";
  return raw;
}
