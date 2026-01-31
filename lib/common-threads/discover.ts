import { GoogleGenAI } from '@google/genai';
import { getSql } from '@/lib/neon/client';
import { calculateHealthScore } from '@/lib/health-score';
import type { CommonThread } from '@/types';

const DISCOVERY_PROMPT = `You are analyzing shared reflections between two people in a family relationship. Identify 1-3 recurring themes or patterns you notice across their shared writings.

Return ONLY a JSON array of objects with a "theme" field. Each theme should be a short phrase (2-5 words) describing the pattern. Examples: "Gratitude for support", "Navigating change together", "Shared humor".

If there aren't clear patterns, return an empty array [].

Shared reflections:
`;

export async function discoverThreads(relationshipId: string): Promise<CommonThread[]> {
  const sql = getSql();

  // Get the relational heart and its shared reflection IDs
  const heartResult = await sql`
    SELECT id, shared_reflections, common_threads, last_check_in
    FROM relational_hearts
    WHERE relationship_id = ${relationshipId}
    LIMIT 1
  `;

  if (!heartResult || heartResult.length === 0) return [];

  const heart = heartResult[0] as any;
  const reflectionIds: string[] = heart.shared_reflections ?? [];

  if (reflectionIds.length < 3) return [];

  // Fetch the actual reflection texts
  const reflections = await sql`
    SELECT content FROM reflections
    WHERE id = ANY(${reflectionIds})
    ORDER BY created_at DESC
    LIMIT 20
  `;

  if (!reflections || reflections.length === 0) return [];

  const texts = reflections
    .map((r: any) => {
      const content = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
      return content.text;
    })
    .filter(Boolean);

  if (texts.length < 3) return [];

  // Call Gemini 1.5 Pro for analysis
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: [{ role: 'user', parts: [{ text: DISCOVERY_PROMPT + texts.join('\n\n---\n\n') }] }],
  });

  const replyText = response.text ?? '[]';

  // Parse the JSON response
  let themes: { theme: string }[];
  try {
    const jsonMatch = replyText.match(/\[[\s\S]*\]/);
    themes = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }

  if (!Array.isArray(themes) || themes.length === 0) return [];

  const now = new Date().toISOString();
  const discoveredThreads: CommonThread[] = themes.slice(0, 3).map((t, i) => ({
    id: `${relationshipId}-${Date.now()}-${i}`,
    theme: t.theme,
    discoveredAt: now,
  }));

  // Write to database and recalculate health score
  const newScore = calculateHealthScore({
    sharedReflectionCount: reflectionIds.length,
    lastCheckIn: heart.last_check_in,
    commonThreadCount: discoveredThreads.length,
  });

  await sql`
    UPDATE relational_hearts SET
      common_threads = ${JSON.stringify(discoveredThreads)},
      health_score = ${newScore}
    WHERE id = ${heart.id}
  `;

  return discoveredThreads;
}
