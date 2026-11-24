import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@supabase/supabase-js";
import type { TablesUpdate } from "@/types/database";
import { getSupabaseClient } from "./supabase";

export type WorkspaceRole = "owner" | "admin" | "manager" | "staff";
export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  country: string;
  timezone: string;
  businessEmail: string | null;
  logoUrl: string | null;
  role: WorkspaceRole;
};

export type WorkspaceMember = {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: string;
};

export type WorkspaceInvitation = {
  id: string;
  token: string;
  expiresAt: string;
};

const ACTIVE_WORKSPACE_STORAGE_KEY = "nexora-active-workspace-id";

function asOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function getCurrentUser(): Promise<User> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("You must be signed in to access a workspace.");
  return data.user;
}

export async function getCurrentUserWorkspaces(): Promise<WorkspaceSummary[]> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("business_memberships")
    .select("business_id, role, businesses!inner(id, name, slug, currency, country, timezone, business_email, logo_url)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).flatMap((row: any) => {
    const business = asOne(row.businesses);
    if (!business) return [];
    return [{
      id: business.id,
      name: business.name,
      slug: business.slug,
      currency: String(business.currency ?? "USD").trim(),
      country: String(business.country ?? "US").trim(),
      timezone: business.timezone ?? "UTC",
      businessEmail: business.business_email ?? null,
      logoUrl: business.logo_url ?? null,
      role: row.role as WorkspaceRole,
    }];
  });
}

export async function createWorkspace(input: {
  name: string;
  currency?: string;
  country?: string;
  timezone?: string;
  businessEmail?: string | null;
  logoUrl?: string | null;
}): Promise<WorkspaceSummary> {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) {
    throw new Error("Workspace name must be between 2 and 120 characters.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_business", { p_name: name });
  if (error) throw new Error(error.message);

  const created = Array.isArray(data) ? data[0] : data;
  const businessId = created?.business_id;
  if (!businessId) throw new Error("Workspace was created but its ID was not returned.");

  const updates = {
    currency: (input.currency ?? "USD").trim().toUpperCase().slice(0, 3),
    country: (input.country ?? "US").trim().toUpperCase().slice(0, 2),
    timezone: (input.timezone ?? "UTC").trim(),
    business_email: input.businessEmail?.trim() || null,
    logo_url: input.logoUrl ?? null,
  };

  const { error: updateError } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", businessId);

  if (updateError) throw new Error(updateError.message);

  await setActiveWorkspaceId(businessId);
  const workspace = (await getCurrentUserWorkspaces()).find((item) => item.id === businessId);
  if (!workspace) throw new Error("Workspace was created, but could not be loaded for this account.");
  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  updates: Partial<Pick<WorkspaceSummary, "name" | "currency" | "country" | "timezone" | "businessEmail" | "logoUrl">>,
): Promise<void> {
  const payload: TablesUpdate<"businesses"> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.currency !== undefined) payload.currency = updates.currency.trim().toUpperCase();
  if (updates.country !== undefined) payload.country = updates.country.trim().toUpperCase();
  if (updates.timezone !== undefined) payload.timezone = updates.timezone.trim();
  if (updates.businessEmail !== undefined) payload.business_email = updates.businessEmail?.trim() || null;
  if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;

  if (!Object.keys(payload).length) return;
  const { error } = await getSupabaseClient().from("businesses").update(payload).eq("id", workspaceId);
  if (error) throw new Error(error.message);
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = getSupabaseClient();
  const { data: memberships, error } = await supabase
    .from("business_memberships")
    .select("user_id, role, joined_at")
    .eq("business_id", workspaceId)
    .order("joined_at", { ascending: true });
  if (error) throw new Error(error.message);

  const userIds = (memberships ?? []).map((item: any) => item.user_id);
  if (!userIds.length) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);
  if (profileError) throw new Error(profileError.message);

  const profileById = new Map((profiles ?? []).map((profile: any) => [profile.id, profile]));
  return (memberships ?? []).map((membership: any) => {
    const profile = profileById.get(membership.user_id);
    return {
      userId: membership.user_id,
      fullName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      role: membership.role as WorkspaceRole,
      joinedAt: membership.joined_at,
    };
  });
}

export async function createWorkspaceInvitation(input: {
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
}): Promise<WorkspaceInvitation> {
  const email = input.email.trim().toLowerCase();
  if (!email || email.length > 254 || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const { data, error } = await getSupabaseClient().rpc("create_business_invitation_v2", {
    p_business_id: input.workspaceId,
    p_email: email,
    p_role: input.role,
  });
  if (error) throw new Error(error.message);

  const invitation = Array.isArray(data) ? data[0] : data;
  if (!invitation?.invitation_id || !invitation?.invitation_token) {
    throw new Error("The invitation was created, but no invitation token was returned.");
  }
  return {
    id: invitation.invitation_id,
    token: invitation.invitation_token,
    expiresAt: invitation.expires_at,
  };
}

export async function acceptWorkspaceInvitation(token: string): Promise<string> {
  if (!token || token.length < 32) throw new Error("The invitation link is invalid.");
  const { data, error } = await getSupabaseClient().rpc("accept_business_invitation", { p_token: token });
  if (error) throw new Error(error.message);
  if (typeof data !== "string") throw new Error("The invitation was accepted, but no workspace ID was returned.");
  await setActiveWorkspaceId(data);
  return data;
}

export async function setActiveWorkspaceId(workspaceId: string): Promise<void> {
  const workspaces = await getCurrentUserWorkspaces();
  if (!workspaces.some((workspace) => workspace.id === workspaceId)) {
    throw new Error("You are not a member of that workspace.");
  }
  await AsyncStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
}

export async function getActiveWorkspaceId(): Promise<string | null> {
  const savedId = await AsyncStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  const workspaces = await getCurrentUserWorkspaces();
  if (savedId && workspaces.some((workspace) => workspace.id === savedId)) return savedId;
  const fallbackId = workspaces[0]?.id ?? null;
  if (fallbackId) await AsyncStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, fallbackId);
  else await AsyncStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  return fallbackId;
}
