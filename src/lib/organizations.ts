import {
  createWorkspace,
  getActiveWorkspaceId,
  getCurrentUserWorkspaces,
  setActiveWorkspaceId,
  type WorkspaceRole,
  type WorkspaceSummary,
} from "./workspaces";

export type OrganizationRole = WorkspaceRole;
export type OrganizationSummary = WorkspaceSummary;

export const getCurrentUserOrganizations = getCurrentUserWorkspaces;
export const setActiveOrganizationId = setActiveWorkspaceId;
export const getActiveOrganizationId = getActiveWorkspaceId;

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "workspace";
}

export async function createOrganization(input: {
  name: string;
  slug?: string;
  currency?: string;
  country?: string;
  timeZone?: string;
  businessEmail?: string;
  logoUrl?: string | null;
}) {
  const workspace = await createWorkspace({
    name: input.name,
    currency: input.currency,
    country: input.country,
    timezone: input.timeZone,
    businessEmail: input.businessEmail,
    logoUrl: input.logoUrl,
  });
  return workspace.id;
}
