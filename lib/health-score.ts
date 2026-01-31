interface HealthScoreInput {
  sharedReflectionCount: number;
  lastCheckIn: string | null;
  commonThreadCount: number;
}

export function calculateHealthScore({
  sharedReflectionCount,
  lastCheckIn,
  commonThreadCount,
}: HealthScoreInput): number {
  // Shared reflections: 0-40 pts (5 reflections = max)
  const reflectionPoints = Math.min(sharedReflectionCount * 8, 40);

  // Recency of last check-in: 0-30 pts
  // Full 30 if within 7 days, linear decay to 0 over 90 days
  let recencyPoints = 0;
  if (lastCheckIn) {
    const daysSince =
      (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 7) {
      recencyPoints = 30;
    } else if (daysSince < 90) {
      recencyPoints = Math.round(30 * (1 - (daysSince - 7) / (90 - 7)));
    }
  }

  // Common threads: 0-30 pts (3 threads = max)
  const threadPoints = Math.min(commonThreadCount * 10, 30);

  const total = reflectionPoints + recencyPoints + threadPoints;
  return Math.max(1, Math.min(100, total));
}
