const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.abs(b - a) / MS_PER_DAY;
}

export function daysSince(date: string): number {
  const d = new Date(date).getTime();
  const now = Date.now();
  return (now - d) / MS_PER_DAY;
}

export function activeDays(
  createdAt: string,
  pushedAt: string | null
): number {
  if (!pushedAt) return 0;
  return daysBetween(createdAt, pushedAt);
}
