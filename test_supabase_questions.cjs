const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kqvjrnkxhpkwrvjlexub.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxdmpybmt4aHBrd3J2amxleHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjg2ODgsImV4cCI6MjA5NTg0NDY4OH0.L5BBtgwNm-gT7FTKSui1KokHhzULs4IkO5l62iGa1wY'
);

async function run() {
  const req = {
    id: `q-${Date.now()}-test`,
    question: "Test question",
    expectedAnswer: "Test response",
    keyPoints: "Test points",
    expectedResources: "Test resources",
    categoryId: "",
    likes: 0,
    dislikes: 0,
    userReaction: undefined,
    comments: []
  };

  const { data, error } = await supabase.from('questions').upsert([req]).select();
  if (error) {
    console.error('ERROR inserting:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

run();
