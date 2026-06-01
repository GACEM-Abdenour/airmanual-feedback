import type { QuestionEntry, CategoryTag, GlobalSettings } from '../types';

export const mockCategories: CategoryTag[] = [
  {
    id: 'cat-1',
    name: 'Troubleshooting',
    specificRules: 'Must include diagnostic steps, expected causes, and required manuals to reference.',
    redlines: '- Mention of component failure without mitigation\n- Safety limits exceeded without grounding recommendations',
    expectedSchema: '1. Root Cause Analysis\n2. Diagnostic Actions\n3. Replacement Steps'
  },
  {
    id: 'cat-2',
    name: 'Compliance',
    specificRules: 'Must explicitly state Airworthiness Directives or Service Bulletins. Do not guess.',
    redlines: '- Recommending unapproved parts\n- Ignoring AD compliance times',
    expectedSchema: '1. Applicable ADs/SBs\n2. Compliance Date\n3. Required Action'
  }
];

export const mockQuestions: QuestionEntry[] = [
  {
    id: 'q-1',
    question: 'Helicopter is vibrating in forward flight, what to check?',
    expectedAnswer: 'Check main rotor track and balance. Verify pitch links and trim tabs.',
    keyPoints: '- Pitch link adjustments\n- Trim tab bending\n- Mass adjustments',
    expectedResources: 'AMM Chapter 18, Vibration limits table',
    categoryId: 'cat-1',
    likes: 12,
    dislikes: 1,
    comments: [
      {
        id: 'c-1',
        author: 'John Doe',
        text: 'This is a very common issue, good to have it documented.',
        timestamp: '2026-05-10T10:00:00Z'
      }
    ]
  }
];

export const mockGlobalSettings: GlobalSettings = {
  generalRules: 'Always prioritize safety. Never hallucinate part numbers. If unsure, recommend consulting the AMM.',
  redlines: '- Rotor strike\n- Hydraulic failure\n- Engine fire\nIf these are mentioned, escalate immediately to a human supervisor.',
  expectedSchema: '1. Direct Answer\n2. Safety Warning (if applicable)\n3. Step-by-step resolution\n4. Sources Cited'
};
