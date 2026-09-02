function calculateStreaks(workouts: { ended_at: string | null }[]) {
  const filtered = workouts
    .filter((w): w is { ended_at: string } => w.ended_at != null)
    .sort(
      (a, b) =>
        new Date(a.ended_at).getTime() - new Date(b.ended_at).getTime()
    );

  if (filtered.length === 0) {
    return { streak: 0, bestStreak: 0, total: 0 };
  }

  const total = filtered.length;
  let currentStreak = 1;
  let bestStreak = 1;
  let lastDate = new Date(filtered[0].ended_at);

  for (let i = 1; i < filtered.length; i++) {
    const date = new Date(filtered[i].ended_at);
    const sameCalendarDay =
      date.getFullYear() === lastDate.getFullYear() &&
      date.getMonth() === lastDate.getMonth() &&
      date.getDate() === lastDate.getDate();

    if (sameCalendarDay) continue;

    const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diff <= 1.5) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;
    lastDate = date;
  }

  return { streak: currentStreak, bestStreak, total };
}

describe('Dashboard - Streak Calculation Unit Tests', () => {

  it('UT-STREAK-001: returns zeros when no workouts exist', () => {
    const result = calculateStreaks([]);

    expect(result.streak).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.total).toBe(0);
  });

  it('UT-STREAK-002: calculates correct streak for consecutive days', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

    const result = calculateStreaks([
      { ended_at: twoDaysAgo.toISOString() },
      { ended_at: yesterday.toISOString() },
      { ended_at: today.toISOString() },
    ]);

    expect(result.streak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.total).toBe(3);
  });

  it('UT-STREAK-003: resets streak when there is a gap between workouts', () => {
    const today = new Date();
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

    const result = calculateStreaks([
      { ended_at: fiveDaysAgo.toISOString() },
      { ended_at: today.toISOString() },
    ]);

    expect(result.streak).toBe(1);
    expect(result.total).toBe(2);
  });

  it('UT-STREAK-004: filters out workouts with null ended_at', () => {
    const result = calculateStreaks([
      { ended_at: null },
      { ended_at: null },
    ]);

    expect(result.streak).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.total).toBe(0);
  });
});