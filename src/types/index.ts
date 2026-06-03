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
}

export interface QuestionEntry {
  id: string;
  question: string;
  expectedAnswer: string; // Maps to "response"
  keyPoints: string;
  expectedResources: string;
  categoryId: string; // The Tag
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
