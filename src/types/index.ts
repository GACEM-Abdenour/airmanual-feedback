export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface CategoryTag {
  id: string;
  name: string;
  specificRules: string;
  redlines: string;
  expectedSchema: string;
  purpose?: string;
  category_rules?: string;
  category_redlines?: string;
  required_context?: string;
  escalation_triggers?: string;
  answer_structure?: string;
  example_question_guidance?: string;
  expected_key_points_guidance?: string;
  required_sources?: string;
}

export interface QuestionEntry {
  id: string;
  question: string;
  expectedAnswer: string; // Maps to "response"
  keyPoints: string;
  expectedResources: string;
  categoryId: string | null; // The Tag
  likes: number;
  dislikes: number;
  userReaction?: 'like' | 'dislike';
  comments: Comment[];
  suggestedBy?: string; // Used for incoming requests
}

export interface GlobalSettings {
  generalRules: string;
  redlines: string;
  expectedSchema: string;
}
