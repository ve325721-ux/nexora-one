import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseClient } from "./supabase";

export type OrganizationRole = "owner" | "admin" | "manager" | "member";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  role: OrganizationRole;
};

const ACTIVE_ORG_STORAGE_KEY = "nexora-active-org-id";

export async function getCurrentUserOrganizations(): Promise<OrganizationSummary[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("memberships").select("role, organization_id, organizations(name, slug, currency)");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => ({
    id: row.organization_id,
    name: row.organizations?.name ?? "Untitled organization",
    slug: row.organizations?.slug ?? "",
    currency: row.organizations?.currency ?? "USD",
    role: row.role,
  }));
}

export async function setActiveOrganizationId(organizationId: string) {
  await AsyncStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
}

export async function getActiveOrganizationId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    || "workspace";
}

export async function createOrganization(input: {
  name: string;
  slug: string;
  currency?: string;
  country?: string;
  timeZone?: string;
  businessEmail?: string;
  logoUrl?: string | null;
}) {
  const supabase = getSupabaseClient();
  const payload = {
    org_name: input.name,
    org_slug: input.slug,
    org_currency: (input.currency ?? "USD").toUpperCase(),
    org_country: input.country ?? "US",
    org_timezone: input.timeZone ?? "UTC",
    org_email: input.businessEmail ?? null,
    org_logo_url: input.logoUrl ?? null,
  };

  const { data, error } = await supabase.rpc("create_organization", payload);

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}
