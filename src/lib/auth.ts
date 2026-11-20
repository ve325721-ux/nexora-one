import { getSupabaseClient } from "./supabase";

export type AuthCredentials = {
  email: string;
  password: string;
};

export async function signUpWithEmail({
  email,
  password,
  fullName,
}: AuthCredentials & { fullName?: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signInWithEmail({ email, password }: AuthCredentials) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}
