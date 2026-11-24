# Security Baseline

This is a prototype baseline, not a certification or a claim of production readiness.

## Required controls
- Enable Row Level Security on every table exposed through Supabase APIs.
- Enforce organization membership for tenant data reads and writes.
- Keep service-role keys and privileged secrets on trusted servers only. Never put them in Expo public environment variables, mobile bundles or browser code.
- Use only the public anon/publishable key in client code; rely on RLS for authorization.
- Validate inputs and business invariants at trusted database/server boundaries.
- Use organization-aware foreign keys to prevent cross-tenant relationships.
- Restrict team and organization administration to authorized roles.
- Apply storage bucket policies separately from database table policies.
- Do not log passwords, access tokens, payment details or sensitive customer data.
- Use HTTPS, dependency updates, backups and tested restore procedures before production.

## Required tests before pilot
1. Signed-out users cannot read or write tenant data.
2. A user in organization A cannot read or modify organization B data.
3. A member cannot perform owner/admin-only actions.
4. Cross-organization customer, project, invoice and task references are rejected.
5. Organization IDs cannot be changed to escape tenant boundaries.
6. Invoice totals and payment amounts are validated at a trusted boundary.
7. Storage access is scoped to the correct organization.
8. Session expiry and sign-out work on web and Android.

## Review notes
The deployed workspace RPCs `create_business`, `accept_business_invitation`, and `create_business_invitation_v2` are SECURITY DEFINER functions. They are executable only by authenticated users (not `anon`) and validate `auth.uid()` plus workspace role/email rules internally. Supabase's security advisor still flags authenticated execution as a warning because these functions intentionally cross RLS boundaries. Review their definitions and keep the role checks covered by automated tests. Client-side route guards are not authorization. Supabase service-role access bypasses RLS.

Authentication and workspace APIs have been added, but they have not yet passed an end-to-end test using separate verified accounts. Configure the Auth redirect allow-list, test signup/confirmation/password recovery on web and Android, and test two independent businesses before any real customer data is used.
