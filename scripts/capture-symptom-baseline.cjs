const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const INPUT_FILE = path.resolve(__dirname, '../data/symptom-pattern-eval-questions.json');
const OUTPUT_FILE = path.resolve(__dirname, '../data/symptom-pattern-baseline-render.json');

const BACKEND_URL = process.env.VITE_EVAL_BACKEND_URL || 'https://airmanual.onrender.com';
const API_KEY = process.env.VITE_GAME_API_KEY || '';

async function run() {
  console.log('--- AeroMind Baseline Capture ---');
  console.log(`Targeting Backend: ${BACKEND_URL}`);

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Input file not found at ${INPUT_FILE}`);
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const q of questions) {
    console.log(`\nProcessing [${q.id}]: ${q.question}`);
    
    const endpoint = BACKEND_URL.endsWith('/api/chat') ? BACKEND_URL : `${BACKEND_URL.replace(/\/$/, '')}/api/chat`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
      headers['x-api-key'] = API_KEY;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          message: q.question, 
          question: q.question,
          session_id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        })
      });

      const data = await response.json();
      
      const answerText = data.answer || data.response || data.text || data.reply || (typeof data === 'string' ? data : 'No text extracted');
      const sources = data.sources || data.documents || data.context || [];

      results.push({
        id: q.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        question: q.question,
        expectedAnswer: q.expectedAnswer || q.expectedBehavior || '',
        category: q.category || '',
        tags: q.tags || [],
        notes: q.notes || '',
        
        currentBackendUrl: BACKEND_URL,
        currentAnswerText: answerText,
        currentSources: sources,
        currentRawJson: data,
        currentCapturedAt: new Date().toISOString()
      });

      console.log(`  -> Success! Captured ${sources.length} sources.`);
      successCount++;
    } catch (error) {
      console.error(`  -> Failed to capture: ${error.message}`);
      
      results.push({
        id: q.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        question: q.question,
        expectedAnswer: q.expectedAnswer || q.expectedBehavior || '',
        category: q.category || '',
        tags: q.tags || [],
        notes: q.notes || '',
        
        currentBackendUrl: BACKEND_URL,
        currentAnswerText: 'Error fetching from backend.',
        currentRawJson: { error: error.message },
        currentCapturedAt: new Date().toISOString()
      });
      failCount++;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n--- Capture Complete ---`);
  console.log(`Total: ${questions.length} | Success: ${successCount} | Failed: ${failCount}`);
  console.log(`Results saved to: ${OUTPUT_FILE}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
