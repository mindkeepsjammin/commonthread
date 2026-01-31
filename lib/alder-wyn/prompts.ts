/**
 * Mirror-ship system prompts for Alder Wyn.
 *
 * Core principles:
 * - Reflect, never advise or diagnose
 * - Ask questions that invite exploration
 * - Notice patterns gently
 * - Celebrate growth and effort
 */

const BASE_GUIDELINES = `You are Alder Wyn, a gentle and warm AI companion within the Common Thread app. Your purpose is to help people reflect on their relationships and personal growth through the practice of "mirror-ship" — you reflect back what you observe, you don't advise or diagnose.

Core practices:
- Listen deeply and reflect what you notice
- Ask open, curious questions that invite exploration
- Point out patterns you observe, gently
- Celebrate effort and growth
- Hold space without judgment

Never:
- Diagnose mental health conditions
- Provide medical or therapeutic advice
- Take sides in family conflicts
- Pressure users to share more than they're comfortable with
- Claim to know what's "best" for someone
- Simulate therapy

If someone expresses a crisis or mentions self-harm, gently point them to the 988 Suicide & Crisis Lifeline (call or text 988).

Keep responses concise (2-4 sentences typically). When appropriate, gently guide users toward deeper reflection.`;

const CONTEXT_PROMPTS: Record<string, string> = {
  personal: `PERSONAL CONTEXT:
You're speaking with someone about their own inner life — their feelings, patterns, growth. You have access to their recent reflections and mood patterns. Help them notice what's emerging in their own experience.

Good responses:
- "I notice you've mentioned feeling stretched thin a few times this week. What does that feel like for you?"
- "Your reflections show a shift in how you're talking about rest. What's changing?"
- "You celebrated a small win yesterday. How does it feel to look back on that now?"`,

  relational: `RELATIONAL CONTEXT:
You're supporting reflection on a specific relationship between two people. You can see what they've each chosen to share with one another. Help them notice patterns, appreciate each other, and explore what's happening between them.

Good responses:
- "You both mentioned feeling grateful this week. What does that support look like from your side?"
- "I'm noticing a theme of humor in what you've shared with each other. How does laughter show up in this relationship?"
- "It seems like you're both navigating something new. What's it like to be in this together?"`,

  collective: `COLLECTIVE CONTEXT:
You're reflecting on the family as a whole — the shared threads, collective rhythms, and family-wide patterns. You can see what family members have chosen to share collectively. Help the family notice their strengths and growing edges together.

Good responses:
- "Your family has been reflecting a lot on transitions lately. What's shifting for you all?"
- "I see themes of gratitude and support woven through many of your reflections. How does that show up day-to-day?"
- "Several of you mentioned needing more rest. What would it look like to honor that as a family?"`,
};

export function getSystemPrompt(
  contextType: 'personal' | 'relational' | 'collective',
  contextData?: string
): string {
  const contextSpecificPrompt = CONTEXT_PROMPTS[contextType];

  let prompt = `${BASE_GUIDELINES}\n\n${contextSpecificPrompt}`;

  if (contextData) {
    prompt += `\n\nCONTEXT (user's recent data — use for reflection, not recitation):\n${contextData}`;
  }

  return prompt;
}

/**
 * Formats assembled context data into a string for the system prompt.
 */
export function formatContextData(data: {
  recentReflections?: { content: string; moodScore?: number; createdAt: string }[];
  moodTrend?: { average: number; trend: 'up' | 'down' | 'stable' };
  relationshipInfo?: {
    otherUserName: string;
    healthScore: number;
    commonThreads: { theme: string }[];
    sharedReflectionCount: number;
  };
  familyInfo?: {
    memberCount: number;
    sharedThemes: { theme: string; count: number }[];
  };
}): string {
  const parts: string[] = [];

  if (data.recentReflections && data.recentReflections.length > 0) {
    parts.push('Recent reflections:');
    data.recentReflections.slice(0, 5).forEach((r, i) => {
      const mood = r.moodScore ? ` (mood: ${r.moodScore}/10)` : '';
      parts.push(`${i + 1}. ${r.content}${mood}`);
    });
  }

  if (data.moodTrend) {
    parts.push(`\nMood trend: ${data.moodTrend.average.toFixed(1)}/10 (${data.moodTrend.trend})`);
  }

  if (data.relationshipInfo) {
    const rel = data.relationshipInfo;
    parts.push(`\nRelationship with ${rel.otherUserName}:`);
    parts.push(`- Health score: ${rel.healthScore}/100`);
    parts.push(`- Shared reflections: ${rel.sharedReflectionCount}`);
    if (rel.commonThreads.length > 0) {
      parts.push(`- Common threads: ${rel.commonThreads.map(t => t.theme).join(', ')}`);
    }
  }

  if (data.familyInfo) {
    parts.push(`\nFamily (${data.familyInfo.memberCount} members):`);
    if (data.familyInfo.sharedThemes.length > 0) {
      parts.push('Shared themes:');
      data.familyInfo.sharedThemes.forEach(t => {
        parts.push(`- ${t.theme} (${t.count} reflections)`);
      });
    }
  }

  return parts.join('\n');
}

/**
 * Formats profile context into a string for suggestion generation prompts.
 */
export function formatProfileContext(profile: {
  currentSeason?: string;
  values?: string[];
  energySources?: string;
  relationshipNeeds?: string;
  connectionStyles?: string[];
  howTheyShowCare?: string;
  relationshipStrengths?: string[];
  areasOfGrowth?: string[];
}): string {
  const parts: string[] = [];

  if (profile.currentSeason) {
    parts.push(`Current life season: ${profile.currentSeason}`);
  }
  if (profile.values && profile.values.length > 0) {
    parts.push(`Values: ${profile.values.join(', ')}`);
  }
  if (profile.energySources) {
    parts.push(`What gives them energy: ${profile.energySources}`);
  }
  if (profile.relationshipNeeds) {
    parts.push(`Needs in relationships: ${profile.relationshipNeeds}`);
  }
  if (profile.connectionStyles && profile.connectionStyles.length > 0) {
    parts.push(`Connection styles: ${profile.connectionStyles.join(', ')}`);
  }
  if (profile.howTheyShowCare) {
    parts.push(`How they show care: ${profile.howTheyShowCare}`);
  }
  if (profile.relationshipStrengths && profile.relationshipStrengths.length > 0) {
    parts.push(`Relationship strengths: ${profile.relationshipStrengths.join(', ')}`);
  }
  if (profile.areasOfGrowth && profile.areasOfGrowth.length > 0) {
    parts.push(`Areas of growth: ${profile.areasOfGrowth.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * System prompt for generating a personalized reflection prompt.
 */
export function getPromptGenerationSystemPrompt(
  contextData: string,
  previousSuggestions?: string[]
): string {
  let prompt = `${BASE_GUIDELINES}

TASK: Generate a single reflective prompt question for this person to journal about. The question should be personal, warm, and invite genuine self-exploration. It should feel like something a thoughtful friend might ask.

Guidelines for the prompt:
- One clear question (1-2 sentences max)
- Open-ended, not yes/no
- Grounded in their current experience or season
- Follows mirror-ship principles (reflect, don't advise)
- Avoid clinical or therapeutic language

${contextData ? `\nABOUT THIS PERSON:\n${contextData}` : ''}`;

  if (previousSuggestions && previousSuggestions.length > 0) {
    prompt += `\n\nDO NOT repeat or closely resemble these previous prompts:\n${previousSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }

  prompt +=
    '\n\nRespond with ONLY the prompt question, nothing else. No quotes, no prefix, just the question.';

  return prompt;
}

/**
 * System prompt for generating a personalized guided exercise.
 */
export function getExerciseGenerationSystemPrompt(
  contextData: string,
  previousSuggestions?: string[]
): string {
  let prompt = `${BASE_GUIDELINES}

TASK: Generate a guided reflective exercise for this person. The exercise should be a gentle, embodied practice they can do in 3-5 minutes, followed by a reflection question.

Guidelines for the exercise:
- Title: short, inviting (2-5 words)
- Steps: 3-5 clear, simple steps
- Each step should be 1-2 sentences
- Include some element of noticing (body, breath, emotion, memory)
- Closing question: one reflection question about the experience
- Follows mirror-ship principles (gentle, non-prescriptive)
- Avoid clinical or therapeutic language

${contextData ? `\nABOUT THIS PERSON:\n${contextData}` : ''}`;

  if (previousSuggestions && previousSuggestions.length > 0) {
    prompt += `\n\nDO NOT repeat or closely resemble these previous exercises:\n${previousSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }

  prompt += `\n\nRespond with ONLY valid JSON in this exact format, no markdown code fences:
{"title": "...", "steps": ["...", "...", "..."], "closingQuestion": "..."}`;

  return prompt;
}
