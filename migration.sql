-- Run this script in your Supabase SQL Editor to update your tables

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS "whenToUse" TEXT,
ADD COLUMN IF NOT EXISTS "checksBeforeAnswering" TEXT,
ADD COLUMN IF NOT EXISTS "primaryResources" TEXT,
ADD COLUMN IF NOT EXISTS "mandatoryMentions" TEXT,
ADD COLUMN IF NOT EXISTS "avoidances" TEXT,
ADD COLUMN IF NOT EXISTS "followUpTriggers" TEXT,
ADD COLUMN IF NOT EXISTS "escalationTriggers" TEXT,
ADD COLUMN IF NOT EXISTS "uncertaintyHandling" TEXT,
ADD COLUMN IF NOT EXISTS "answerStyle" TEXT,
ADD COLUMN IF NOT EXISTS "exampleQuestions" TEXT,
ADD COLUMN IF NOT EXISTS "expectedKeyPoints" TEXT;
