-- The Drizzle migrations were authored against Supabase, which provides an
-- `auth` schema and an `auth.uid()` helper used by row-level-security policies
-- (see db/drizzle/0007_wise_korg.sql). A plain PostgreSQL image has neither, so
-- this script creates a minimal stand-in that lets every migration apply
-- cleanly for local development. It is run once, when the data volume is first
-- initialised.

CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
