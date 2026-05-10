CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "writing_entries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "original_text" TEXT NOT NULL,
  "improved_text" TEXT,
  "main_advice" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "word_count" INTEGER,
  "overall_score" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "writing_scores" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "writing_entry_id" UUID NOT NULL,
  "grammar" INTEGER,
  "vocabulary" INTEGER,
  "spelling" INTEGER,
  "punctuation" INTEGER,
  "organization" INTEGER,
  "clarity" INTEGER,
  "naturalness" INTEGER,
  "sentence_variety" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "sentence_feedback" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "writing_entry_id" UUID NOT NULL,
  "original_sentence" TEXT NOT NULL,
  "improved_sentence" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "mistake_type" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "writing_scores_writing_entry_id_key"
  ON "writing_scores" ("writing_entry_id");

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key"
  ON "users" ("email");

CREATE INDEX IF NOT EXISTS "writing_entries_user_id_created_at_idx"
  ON "writing_entries" ("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "writing_scores_writing_entry_id_idx"
  ON "writing_scores" ("writing_entry_id");

CREATE INDEX IF NOT EXISTS "sentence_feedback_writing_entry_id_idx"
  ON "sentence_feedback" ("writing_entry_id");

ALTER TABLE "writing_entries"
  DROP CONSTRAINT IF EXISTS "writing_entries_user_id_fkey";

ALTER TABLE "writing_entries"
  ADD CONSTRAINT "writing_entries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "writing_scores"
  DROP CONSTRAINT IF EXISTS "writing_scores_writing_entry_id_fkey";

ALTER TABLE "writing_scores"
  ADD CONSTRAINT "writing_scores_writing_entry_id_fkey"
  FOREIGN KEY ("writing_entry_id") REFERENCES "writing_entries"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sentence_feedback"
  DROP CONSTRAINT IF EXISTS "sentence_feedback_writing_entry_id_fkey";

ALTER TABLE "sentence_feedback"
  ADD CONSTRAINT "sentence_feedback_writing_entry_id_fkey"
  FOREIGN KEY ("writing_entry_id") REFERENCES "writing_entries"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
