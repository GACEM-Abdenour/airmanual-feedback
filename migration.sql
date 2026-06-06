-- Run this script in your Supabase SQL Editor to update your tables

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS "purpose" TEXT,
ADD COLUMN IF NOT EXISTS "category_rules" TEXT,
ADD COLUMN IF NOT EXISTS "category_redlines" TEXT,
ADD COLUMN IF NOT EXISTS "required_context" TEXT,
ADD COLUMN IF NOT EXISTS "escalation_triggers" TEXT,
ADD COLUMN IF NOT EXISTS "answer_structure" TEXT,
ADD COLUMN IF NOT EXISTS "example_question_guidance" TEXT,
ADD COLUMN IF NOT EXISTS "expected_key_points_guidance" TEXT,
ADD COLUMN IF NOT EXISTS "required_sources" TEXT;
