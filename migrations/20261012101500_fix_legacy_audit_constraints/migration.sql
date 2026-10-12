-- The existing Supabase audit table predates the persistent audit model.
-- Failed logins can be anonymous, so both identity columns must accept NULL.
ALTER TABLE "public"."admin_audit_logs"
  ADD COLUMN IF NOT EXISTS "userEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "resourceId" TEXT;

ALTER TABLE "public"."admin_audit_logs"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "userEmail" DROP NOT NULL;
