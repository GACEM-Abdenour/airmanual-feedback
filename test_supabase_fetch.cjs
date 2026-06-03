const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kqvjrnkxhpkwrvjlexub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxdmpybmt4aHBrd3J2amxleHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjg2ODgsImV4cCI6MjA5NTg0NDY4OH0.L5BBtgwNm-gT7FTKSui1KokHhzULs4IkO5l62iGa1wY'
);

async function run() {
  const { data, error } = await supabase.from('question_requests').select('*').order('id', { ascending: false });
  console.log('FETCH RESULTS:', data);
  if (error) console.error('ERROR:', error);
}

run();
