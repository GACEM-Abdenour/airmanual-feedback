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
  whenToUse?: string;
  checksBeforeAnswering?: string;
  primaryResources?: string;
  mandatoryMentions?: string;
  avoidances?: string;
  followUpTriggers?: string;
  escalationTriggers?: string;
  uncertaintyHandling?: string;
  answerStyle?: string;
  exampleQuestions?: string;
  expectedKeyPoints?: string;
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
