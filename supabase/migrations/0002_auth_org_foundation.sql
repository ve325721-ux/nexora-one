-- Add the manager role before later migrations use it.
ALTER TYPE public.organization_role
ADD VALUE IF NOT EXISTS 'manager';
