-- Single active admin session tracking and persistent admin audit trail.
-- This migration is intentionally idempotent because the Supabase project already
-- contains a legacy admin_audit_logs table.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "activeSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginUserAgent" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_activeSessionId_key"
  ON "users" ("activeSessionId")
  WHERE "activeSessionId" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "deviceName" TEXT,
  "platform" TEXT,
  "language" TEXT,
  "timezone" TEXT,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "revokeReason" TEXT,
  CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "admin_sessions_userId_lastSeenAt_idx"
  ON "admin_sessions" ("userId", "lastSeenAt");
CREATE INDEX IF NOT EXISTS "admin_sessions_deviceId_idx"
  ON "admin_sessions" ("deviceId");

-- Create the complete table for a fresh database, then add missing columns to
-- the legacy Supabase table without removing its existing userEmail/resourceId columns.
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "action" TEXT NOT NULL,
  "method" TEXT,
  "resource" TEXT NOT NULL,
  "details" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "deviceId" TEXT,
  "deviceName" TEXT,
  "platform" TEXT,
  "language" TEXT,
  "timezone" TEXT,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "success" BOOLEAN NOT NULL DEFAULT true,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "admin_audit_logs"
  ADD COLUMN IF NOT EXISTS "sessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "method" TEXT,
  ADD COLUMN IF NOT EXISTS "deviceId" TEXT,
  ADD COLUMN IF NOT EXISTS "deviceName" TEXT,
  ADD COLUMN IF NOT EXISTS "platform" TEXT,
  ADD COLUMN IF NOT EXISTS "language" TEXT,
  ADD COLUMN IF NOT EXISTS "timezone" TEXT,
  ADD COLUMN IF NOT EXISTS "country" TEXT,
  ADD COLUMN IF NOT EXISTS "region" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;

ALTER TABLE "admin_audit_logs"
  ALTER COLUMN "details" SET DEFAULT '{}'::jsonb,
  ALTER COLUMN "success" SET DEFAULT true;
UPDATE "admin_audit_logs" SET "details" = '{}'::jsonb WHERE "details" IS NULL;
UPDATE "admin_audit_logs" SET "success" = true WHERE "success" IS NULL;
ALTER TABLE "admin_audit_logs"
  ALTER COLUMN "details" SET NOT NULL,
  ALTER COLUMN "success" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "admin_audit_logs_createdAt_idx"
  ON "admin_audit_logs" ("createdAt");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_userId_createdAt_idx"
  ON "admin_audit_logs" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_createdAt_idx"
  ON "admin_audit_logs" ("action", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_resource_createdAt_idx"
  ON "admin_audit_logs" ("resource", "createdAt");
