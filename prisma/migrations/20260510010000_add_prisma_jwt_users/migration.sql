CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key"
  ON "users" ("email");

DO $$
BEGIN
  IF to_regclass('public.writing_entries') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM "writing_entries" AS entry
      LEFT JOIN "users" AS app_user
        ON app_user."id" = entry."user_id"
      WHERE app_user."id" IS NULL
    )
  THEN
    ALTER TABLE "writing_entries"
      DROP CONSTRAINT IF EXISTS "writing_entries_user_id_fkey";

    ALTER TABLE "writing_entries"
      ADD CONSTRAINT "writing_entries_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
