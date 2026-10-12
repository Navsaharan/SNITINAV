ALTER TABLE "public"."faculty"
  ADD COLUMN IF NOT EXISTS "staffType" TEXT NOT NULL DEFAULT 'FACULTY';

CREATE TABLE IF NOT EXISTS "public"."api_credentials" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "encryptedValue" TEXT NOT NULL,
  "maskedValue" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "api_credentials_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "api_credentials_key_key"
  ON "public"."api_credentials" ("key");

ALTER TABLE "public"."api_credentials" ENABLE ROW LEVEL SECURITY;
