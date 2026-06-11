const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env or .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const OUTPUT_FILE = path.resolve(__dirname, '../data/symptom-pattern-eval-questions.json');

async function run() {
  console.log('--- Pulling Live Questions from Supabase ---');
  
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Failed to fetch questions:', error);
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.log('No questions found in Supabase.');
    process.exit(0);
  }

  const evalCases = questions.map(q => ({
    id: q.id,
    question: q.question || '',
    expectedAnswer: q.expectedAnswer || '',
    category: q.categoryId || '',
    tags: [],
    notes: `Imported from live DB. Key Points: ${q.keyPoints || 'None'}`
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(evalCases, null, 2));
  console.log(`Successfully exported ${evalCases.length} questions to: ${OUTPUT_FILE}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
