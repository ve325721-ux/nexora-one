-- Nexora One: organization settings and invitation foundation.
-- Requires 0002_auth_org_foundation.sql to run first.

-- 1. Create invitation status enum safely.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'invitation_status'
  ) THEN
    CREATE TYPE public.invitation_status AS ENUM (
      'pending',
      'accepted',
      'expired',
      'revoked'
    );
  END IF;
END
$$;

-- 2. Shared updated_at trigger function.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_updated_at()
FROM PUBLIC, anon, authenticated;

-- 3. Organization settings table.
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_email text,
  country text,
  currency char(3) NOT NULL DEFAULT 'USD',
  time_zone text NOT NULL DEFAULT 'UTC',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Organization invitations table.
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL
    REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.organization_role NOT NULL DEFAULT 'member',
  status public.invitation_status NOT NULL DEFAULT 'pending',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_invitations_org_status_idx
ON public.organization_invitations(
  organization_id,
  status,
  expires_at
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_invitations_pending_email_idx
ON public.organization_invitations(
  organization_id,
  lower(email)
)
WHERE status = 'pending';

-- 5. Remove the old three-argument function to prevent RPC ambiguity.
DROP FUNCTION IF EXISTS public.create_organization(text, text, text);

-- 6. Internal settings initializer.
CREATE OR REPLACE FUNCTION public.initialize_organization_settings(
  org_id uuid,
  org_country text,
  org_currency text,
  org_timezone text,
  org_email text,
  org_logo_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.organization_settings (
    organization_id,
    country,
    currency,
    time_zone,
    business_email,
    logo_url
  )
  VALUES (
    org_id,
    org_country,
    upper(coalesce(org_currency, 'USD')),
    coalesce(org_timezone, 'UTC'),
    org_email,
    org_logo_url
  )
  ON CONFLICT (organization_id)
  DO UPDATE SET
    country = EXCLUDED.country,
    currency = EXCLUDED.currency,
    time_zone = EXCLUDED.time_zone,
    business_email = EXCLUDED.business_email,
    logo_url = EXCLUDED.logo_url,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_organization_settings(
  uuid, text, text, text, text, text
)
FROM PUBLIC, anon, authenticated;

-- 7. Organization creation function.
CREATE OR REPLACE FUNCTION public.create_organization(
  org_name text,
  org_slug text,
  org_currency text DEFAULT 'USD',
  org_country text DEFAULT 'US',
  org_timezone text DEFAULT 'UTC',
  org_email text DEFAULT NULL,
  org_logo_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_org_id uuid;
  clean_currency text := upper(coalesce(org_currency, 'USD'));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF org_name IS NULL
     OR char_length(trim(org_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Invalid organization name';
  END IF;

  IF org_slug IS NULL
     OR org_slug !~ '^[a-z0-9-]{3,60}$' THEN
    RAISE EXCEPTION 'Invalid organization slug';
  END IF;

  IF clean_currency !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Invalid currency code';
  END IF;

  INSERT INTO public.organizations (
    name,
    slug,
    currency,
    created_by
  )
  VALUES (
    trim(org_name),
    org_slug,
    clean_currency,
    auth.uid()
  )
  RETURNING id INTO new_org_id;

  INSERT INTO public.memberships (
    organization_id,
    user_id,
    role
  )
  VALUES (
    new_org_id,
    auth.uid(),
    'owner'
  );

  PERFORM public.initialize_organization_settings(
    new_org_id,
    org_country,
    clean_currency,
    org_timezone,
    org_email,
    org_logo_url
  );

  RETURN new_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization(
  text, text, text, text, text, text, text
)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_organization(
  text, text, text, text, text, text, text
)
TO authenticated;

-- 8. Updated-at triggers.
DROP TRIGGER IF EXISTS organizations_updated_at
ON public.organizations;

CREATE TRIGGER organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS organization_settings_updated_at
ON public.organization_settings;

CREATE TRIGGER organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS organization_invitations_updated_at
ON public.organization_invitations;

CREATE TRIGGER organization_invitations_updated_at
BEFORE UPDATE ON public.organization_invitations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 9. Enable row-level security.
ALTER TABLE public.organization_settings
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_invitations
ENABLE ROW LEVEL SECURITY;

-- 10. Settings policies.
DROP POLICY IF EXISTS organization_settings_select_member
ON public.organization_settings;

CREATE POLICY organization_settings_select_member
ON public.organization_settings
FOR SELECT TO authenticated
USING (
  public.is_org_member(organization_id)
);

DROP POLICY IF EXISTS organization_settings_update_admin
ON public.organization_settings;

CREATE POLICY organization_settings_update_admin
ON public.organization_settings
FOR UPDATE TO authenticated
USING (
  public.has_org_role(
    organization_id,
    ARRAY['owner', 'admin']::public.organization_role[]
  )
)
WITH CHECK (
  public.has_org_role(
    organization_id,
    ARRAY['owner', 'admin']::public.organization_role[]
  )
);

-- 11. Invitation read policy.
DROP POLICY IF EXISTS organization_invitations_select_admin
ON public.organization_invitations;

CREATE POLICY organization_invitations_select_admin
ON public.organization_invitations
FOR SELECT TO authenticated
USING (
  public.has_org_role(
    organization_id,
    ARRAY['owner', 'admin']::public.organization_role[]
  )
);

-- 12. Restrict table permissions.
REVOKE ALL ON TABLE public.organization_settings
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON TABLE public.organization_invitations
FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE
ON public.organization_settings
TO authenticated;

GRANT SELECT
ON public.organization_invitations
TO authenticated;

-- 13. Refresh PostgREST schema cache.
NOTIFY pgrst, 'reload schema';