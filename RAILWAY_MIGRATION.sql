-- ===================================================================
-- COPY THIS ENTIRE FILE AND PASTE INTO RAILWAY'S QUERY CONSOLE
-- ===================================================================
-- Migration: Add session_user_id for user isolation
-- Date: 2026-01-14
-- Time to run: < 1 second
-- ===================================================================

-- Step 1: Add session_user_id column to base_resumes
ALTER TABLE base_resumes
ADD COLUMN IF NOT EXISTS session_user_id VARCHAR;

-- Step 2: Add session_user_id column to tailored_resumes
ALTER TABLE tailored_resumes
ADD COLUMN IF NOT EXISTS session_user_id VARCHAR;

-- Step 3: Create index on base_resumes for fast lookups
CREATE INDEX IF NOT EXISTS idx_base_resumes_session_user_id
ON base_resumes(session_user_id);

-- Step 4: Create index on tailored_resumes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_session_user_id
ON tailored_resumes(session_user_id);

-- ===================================================================
-- VERIFICATION (run this after the above commands complete)
-- ===================================================================

-- Check base_resumes column
SELECT
    'base_resumes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'base_resumes'
AND column_name = 'session_user_id';

-- Check tailored_resumes column
SELECT
    'tailored_resumes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tailored_resumes'
AND column_name = 'session_user_id';

-- Check indexes
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE indexname IN (
    'idx_base_resumes_session_user_id',
    'idx_tailored_resumes_session_user_id'
);

-- ===================================================================
-- EXPECTED OUTPUT:
-- ===================================================================
-- table_name        | column_name      | data_type          | is_nullable
-- base_resumes      | session_user_id  | character varying  | YES
-- tailored_resumes  | session_user_id  | character varying  | YES
--
-- tablename         | indexname
-- base_resumes      | idx_base_resumes_session_user_id
-- tailored_resumes  | idx_tailored_resumes_session_user_id
-- ===================================================================
