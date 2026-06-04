-- Run this entire script in the Supabase SQL Editor

-- 1. Create Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "specificRules" TEXT,
  redlines TEXT,
  "expectedSchema" TEXT,
  "whenToUse" TEXT,
  "checksBeforeAnswering" TEXT,
  "primaryResources" TEXT,
  "mandatoryMentions" TEXT,
  avoidances TEXT,
  "followUpTriggers" TEXT,
  "escalationTriggers" TEXT,
  "uncertaintyHandling" TEXT,
  "answerStyle" TEXT,
  "exampleQuestions" TEXT,
  "expectedKeyPoints" TEXT
);

-- 2. Create Questions table
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  "expectedAnswer" TEXT,
  "keyPoints" TEXT,
  "expectedResources" TEXT,
  "categoryId" TEXT REFERENCES categories(id) ON DELETE SET NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  "userReaction" TEXT,
  comments JSONB DEFAULT '[]'::jsonb
);

-- 3. Create Settings table
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  "generalRules" TEXT,
  redlines TEXT,
  "expectedSchema" TEXT
);

-- 4. Insert initial global settings row
INSERT INTO settings (id, "generalRules", redlines, "expectedSchema") 
VALUES ('global', '', '', '');

-- 5. Enable RLS and Create Public Policies (Allows anonymous reads/writes)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to questions" ON questions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- 6. Create Question Requests (Staging) table
CREATE TABLE question_requests (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  "expectedAnswer" TEXT,
  "keyPoints" TEXT,
  "expectedResources" TEXT,
  "categoryId" TEXT,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  "userReaction" TEXT,
  comments JSONB DEFAULT '[]'::jsonb,
  "suggestedBy" TEXT
);

ALTER TABLE question_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to question_requests" ON question_requests FOR ALL USING (true) WITH CHECK (true);
