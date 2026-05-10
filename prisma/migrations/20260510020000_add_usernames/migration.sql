ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "username" TEXT;

WITH username_candidates AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(
        TRIM(BOTH '_' FROM LOWER(REGEXP_REPLACE(SPLIT_PART("email", '@', 1), '[^a-zA-Z0-9_]+', '_', 'g'))),
        ''
      ),
      'writer'
    ) AS base_username,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(
        NULLIF(
          TRIM(BOTH '_' FROM LOWER(REGEXP_REPLACE(SPLIT_PART("email", '@', 1), '[^a-zA-Z0-9_]+', '_', 'g'))),
          ''
        ),
        'writer'
      )
      ORDER BY "created_at", "id"
    ) AS duplicate_number
  FROM "users"
  WHERE "username" IS NULL OR BTRIM("username") = ''
)
UPDATE "users"
SET "username" =
  CASE
    WHEN username_candidates.duplicate_number = 1 THEN username_candidates.base_username
    ELSE username_candidates.base_username || '_' || username_candidates.duplicate_number::TEXT
  END
FROM username_candidates
WHERE "users"."id" = username_candidates."id";

ALTER TABLE "users"
  ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key"
  ON "users" ("username");
