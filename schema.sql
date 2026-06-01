-- Run this entire script in the Supabase SQL Editor

-- 1. Create Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "specificRules" TEXT,
  redlines TEXT,
  "expectedSchema" TEXT
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
