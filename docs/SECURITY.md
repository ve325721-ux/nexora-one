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
The initial migration is a starting point and must be reviewed and tested in a separate Supabase project. Review SECURITY DEFINER functions, privileges, role escalation paths, and all CRUD policies before any real customer data is used. Client-side route guards are not authorization. Supabase service-role access bypasses RLS.
