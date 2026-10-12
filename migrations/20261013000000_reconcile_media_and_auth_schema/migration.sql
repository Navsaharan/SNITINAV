-- Reconcile production Supabase schema with the Prisma model.
ALTER TABLE "public"."media"
  ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."admin_audit_logs"
  ADD COLUMN IF NOT EXISTS "userEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "resourceId" TEXT;
ALTER TABLE "public"."admin_audit_logs"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "userEmail" DROP NOT NULL;
