import type { GeneratedPrompt, GeneratedExercise } from '@/types';

type Season = 'growth' | 'rest' | 'transition' | 'healing' | 'exploration';

interface FallbackPrompt {
  text: string;
  seasons: Season[];
}

interface FallbackExercise {
  title: string;
  steps: string[];
  closingQuestion: string;
  seasons: Season[];
}

const FALLBACK_PROMPTS: FallbackPrompt[] = [
  // General (all seasons)
  {
    text: 'What is one thing you noticed about yourself today that surprised you?',
    seasons: ['growth', 'rest', 'transition', 'healing', 'exploration'],
  },
  {
    text: 'When did you last feel truly seen by someone? What made that moment stand out?',
    seasons: ['growth', 'rest', 'transition', 'healing', 'exploration'],
  },
  {
    text: "What does your body need right now that you haven't given it?",
    seasons: ['growth', 'rest', 'transition', 'healing', 'exploration'],
  },

  // Growth
  {
    text: "What is something you're learning about yourself in this season of growth?",
    seasons: ['growth'],
  },
  {
    text: 'Where are you stretching beyond your comfort zone right now? How does that feel?',
    seasons: ['growth'],
  },
  { text: "What new pattern are you building that you're proud of?", seasons: ['growth'] },

  // Rest
  {
    text: 'What would it look like to give yourself full permission to rest today?',
    seasons: ['rest'],
  },
  {
    text: 'What are you holding onto that you could set down, even temporarily?',
    seasons: ['rest'],
  },
  {
    text: 'When do you feel most at peace? What elements of that could you bring into today?',
    seasons: ['rest'],
  },

  // Transition
  { text: 'What are you leaving behind, and what are you moving toward?', seasons: ['transition'] },
  { text: 'What feels uncertain right now? What feels steady?', seasons: ['transition'] },
  { text: 'If this transition had a color, what would it be and why?', seasons: ['transition'] },

  // Healing
  { text: 'What is one small kindness you can offer yourself today?', seasons: ['healing'] },
  { text: "Where do you notice healing happening, even if it's slow?", seasons: ['healing'] },
  {
    text: "What would you say to a friend going through what you're going through?",
    seasons: ['healing'],
  },

  // Exploration
  {
    text: 'What are you curious about right now? Where does that curiosity lead?',
    seasons: ['exploration'],
  },
  {
    text: 'If you could try anything without fear of failure, what would you explore?',
    seasons: ['exploration'],
  },
  {
    text: "What question are you sitting with lately that doesn't have an easy answer?",
    seasons: ['exploration'],
  },
];

const FALLBACK_EXERCISES: FallbackExercise[] = [
  {
    title: 'Three Breaths Check-In',
    steps: [
      'Close your eyes and take one deep breath. Notice where you feel tension.',
      "Take a second breath. As you exhale, name one emotion you're carrying right now.",
      'Take a third breath. As you exhale, let your shoulders drop and soften your jaw.',
    ],
    closingQuestion: 'What did you notice during those three breaths?',
    seasons: ['growth', 'rest', 'transition', 'healing', 'exploration'],
  },
  {
    title: 'Gratitude Inventory',
    steps: [
      'Think of one person who showed up for you recently, even in a small way.',
      'Picture the specific moment — what did they do or say?',
      'Notice what you feel in your body when you recall that moment.',
    ],
    closingQuestion: 'What would you want that person to know about how their action affected you?',
    seasons: ['growth', 'rest', 'exploration'],
  },
  {
    title: 'Letter to Your Future Self',
    steps: [
      'Imagine yourself six months from now. Where are you? What has changed?',
      'Think about what your future self needs to hear from you right now.',
      'Write a short letter to that future version of yourself — honest and kind.',
    ],
    closingQuestion: 'What surprised you about what you wanted to say?',
    seasons: ['growth', 'transition', 'exploration'],
  },
  {
    title: 'Body Scan for Emotions',
    steps: [
      'Starting from the top of your head, slowly scan down through your body.',
      'Pause wherever you notice sensation — tightness, warmth, heaviness, lightness.',
      'For each spot, ask: "What emotion lives here right now?" Don\'t judge, just notice.',
    ],
    closingQuestion: 'Where in your body did you find the strongest feeling, and what was it?',
    seasons: ['rest', 'healing'],
  },
  {
    title: 'The Relationship Mirror',
    steps: [
      "Choose one relationship that's been on your mind.",
      'Think about what you appreciate most about this person.',
      'Now think about one thing that feels hard or unspoken between you.',
      'Ask yourself: "What do I need in this relationship that I haven\'t asked for?"',
    ],
    closingQuestion: 'What did this reflection show you about what you value in connection?',
    seasons: ['growth', 'healing', 'exploration'],
  },
  {
    title: 'Permission Slip',
    steps: [
      "Think of something you've been denying yourself — rest, fun, saying no, asking for help.",
      'Write yourself a permission slip: "I give myself permission to..."',
      'Read it back to yourself slowly, as if a trusted friend wrote it for you.',
    ],
    closingQuestion: 'How did it feel to give yourself that permission?',
    seasons: ['rest', 'healing'],
  },
  {
    title: 'Naming the Season',
    steps: [
      'Consider where you are in life right now. Is this a time of growth, rest, transition, healing, or exploration?',
      'Think about what this season is asking of you.',
      'Identify one thing you can do today that honors this season instead of fighting it.',
    ],
    closingQuestion: "What would it look like to fully accept the season you're in?",
    seasons: ['transition', 'healing', 'exploration'],
  },
  {
    title: 'The Unsent Message',
    steps: [
      "Think of someone you've wanted to say something to but haven't.",
      "Write the message you'd send if there were no consequences — be completely honest.",
      "Now rewrite it as the version you'd actually feel good about sending.",
    ],
    closingQuestion: "What's the difference between the two versions, and what does that tell you?",
    seasons: ['growth', 'transition', 'healing'],
  },
];

let promptIndex = 0;
let exerciseIndex = 0;

export function getRandomFallbackPrompt(season?: string): GeneratedPrompt {
  const filtered = season
    ? FALLBACK_PROMPTS.filter(p => p.seasons.includes(season as Season))
    : FALLBACK_PROMPTS;
  const pool = filtered.length > 0 ? filtered : FALLBACK_PROMPTS;
  const item = pool[promptIndex % pool.length];
  promptIndex++;
  return {
    id: `fallback-prompt-${promptIndex}`,
    text: item.text,
    generatedAt: new Date().toISOString(),
  };
}

export function getRandomFallbackExercise(season?: string): GeneratedExercise {
  const filtered = season
    ? FALLBACK_EXERCISES.filter(e => e.seasons.includes(season as Season))
    : FALLBACK_EXERCISES;
  const pool = filtered.length > 0 ? filtered : FALLBACK_EXERCISES;
  const item = pool[exerciseIndex % pool.length];
  exerciseIndex++;
  return {
    id: `fallback-exercise-${exerciseIndex}`,
    title: item.title,
    steps: item.steps,
    closingQuestion: item.closingQuestion,
    generatedAt: new Date().toISOString(),
  };
}
