import { getSupabaseClient } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

export type AuthCredentials = {
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function signUpWithEmail({
  email,
  password,
  fullName,
}: AuthCredentials & { fullName?: string }) {
  if (password.length < 8) throw new Error("Password must be at least 8 characters long.");
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: normalizeEmail(email),
    password,
    options: {
      data: fullName?.trim() ? { full_name: fullName.trim() } : undefined,
    },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithEmail({ email, password }: AuthCredentials) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut({ scope: "global" });
  if (error) throw new Error(error.message);
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) {
    if (error.message.toLowerCase().includes("session")) return null;
    throw new Error(error.message);
  }
  return data.user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session) return null;

  const { data: verified, error: userError } = await supabase.auth.getUser();
  if (userError || !verified.user) return null;
  return data.session;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(normalizeEmail(email));
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters long.");
  const { error } = await getSupabaseClient().auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
