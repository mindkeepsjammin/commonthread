import { useState, useEffect, useCallback } from 'react';
import type { GeneratedExercise } from '@/types';

interface PromptSuggestion {
  id: string;
  text: string;
}

type Suggestion = PromptSuggestion | GeneratedExercise | null;

const SAMPLE_PROMPTS: PromptSuggestion[] = [
  { id: 'p1', text: 'What moment today made you feel most connected to someone you care about?' },
  {
    id: 'p2',
    text: 'Describe a challenge you faced recently and what it taught you about yourself.',
  },
  { id: 'p3', text: 'What is something you are grateful for in your family right now?' },
  { id: 'p4', text: 'How did you show care for someone today, and how did it make you feel?' },
  { id: 'p5', text: 'What boundary do you want to set or maintain in your relationships?' },
];

const SAMPLE_EXERCISES: GeneratedExercise[] = [
  {
    id: 'e1',
    title: 'Gratitude Reflection',
    steps: [
      'Think of three things you appreciate about a family member.',
      'Write down why each one matters to you.',
      'Consider sharing one of these with them today.',
    ],
    closingQuestion: 'How might expressing gratitude change your relationship?',
    generatedAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    title: 'Active Listening Practice',
    steps: [
      'Choose a conversation you had today.',
      'Recall what the other person said without judgment.',
      'Identify one feeling they might have been expressing.',
    ],
    closingQuestion: 'What would change if you listened this way more often?',
    generatedAt: new Date().toISOString(),
  },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function useSuggestion(type: 'prompt' | 'exercise', enabled: boolean) {
  const [suggestion, setSuggestion] = useState<Suggestion>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!enabled) return;
    setIsLoading(true);
    // Simulate a brief loading state
    setTimeout(() => {
      setSuggestion(type === 'prompt' ? pickRandom(SAMPLE_PROMPTS) : pickRandom(SAMPLE_EXERCISES));
      setIsLoading(false);
    }, 300);
  }, [type, enabled]);

  useEffect(() => {
    if (enabled && !suggestion) {
      refresh();
    }
    if (!enabled) {
      setSuggestion(null);
    }
  }, [enabled, refresh]);

  return { suggestion, isLoading, refresh };
}
