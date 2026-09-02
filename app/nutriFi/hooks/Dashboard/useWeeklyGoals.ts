import { useState, useCallback } from "react";
import {
  getWeeklyGoalProgress,
  createWeeklyGoal,
  deleteWeeklyGoal,
  WeeklyGoalProgress,
  CreateWeeklyGoalInput,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GoalStatus = "on_track" | "behind" | "completed" | "not_started";

export type GoalProgressUI = WeeklyGoalProgress & {
  percent: number;
  status: GoalStatus;
  weekly_target: number;
  dayState: Record<number, "done" | "missed" | "today" | "no_goal">;
};

// ---------------------------------------------------------------------------
// Helper: derive per-day state for the week strip
// ---------------------------------------------------------------------------

function buildDayState(
  goal: WeeklyGoalProgress
): Record<number, "done" | "missed" | "today" | "no_goal"> {
  const now = new Date();
  const todayIso = (() => {
    const wd = now.getUTCDay();
    return wd === 0 ? 7 : wd;
  })();

  const dailyTarget = goal.target_reps;
  const state: Record<number, "done" | "missed" | "today" | "no_goal"> = {};

  for (let iso = 1; iso <= 7; iso++) {
    const isScheduled = goal.active_days.includes(iso);

    if (!isScheduled) {
      state[iso] = "no_goal";
      continue;
    }

    if (iso === todayIso) {
      const repsToday = goal.reps_by_day[iso] ?? 0;
      state[iso] = repsToday >= dailyTarget ? "done" : "today";
    } else if (iso < todayIso) {
      const repsDone = goal.reps_by_day[iso] ?? 0;
      state[iso] = repsDone >= dailyTarget ? "done" : "missed";
    } else {
      state[iso] = "no_goal";
    }
  }

  return state;
}

// ---------------------------------------------------------------------------
// Helper: derive status badge label
// ---------------------------------------------------------------------------

function deriveStatus(goal: WeeklyGoalProgress): GoalStatus {
  const weeklyTotal = goal.target_reps * goal.active_days.length;
  if (goal.reps_this_week >= weeklyTotal) return "completed";

  const now = new Date();
  const todayIso = (() => {
    const wd = now.getUTCDay();
    return wd === 0 ? 7 : wd;
  })();

  const daysPassed = goal.active_days.filter((d) => d <= todayIso).length;
  if (daysPassed === 0) return "not_started";

  const expectedReps = goal.target_reps * daysPassed;

  return goal.reps_this_week >= expectedReps * 0.8 ? "on_track" : "behind";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWeeklyGoals(profileId: string | null) {
  const [goals, setGoals] = useState<GoalProgressUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getWeeklyGoalProgress(profileId);

    if (fetchError) {
      setError("Failed to load goals");
      setLoading(false);
      return;
    }

    const ui: GoalProgressUI[] = data.map((goal) => {
      const weeklyTotal = goal.target_reps * goal.active_days.length;
      return {
        ...goal,
        weekly_target: weeklyTotal,
        percent: Math.min(100, Math.round((goal.reps_this_week / weeklyTotal) * 100)),
        status: deriveStatus(goal),
        dayState: buildDayState(goal),
      };
    });

    setGoals(ui);
    setLoading(false);
  }, [profileId]);

  // input.exercise_id is a uuid string — matches exercise.id in schema
  const addGoal = useCallback(
    async (input: CreateWeeklyGoalInput) => {
      const { error: createError } = await createWeeklyGoal(input);
      if (createError) return { error: createError };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      const { error: deleteError } = await deleteWeeklyGoal(goalId);
      if (deleteError) return { error: deleteError };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return {
    goals,
    loading,
    error,
    refresh,
    addGoal,
    removeGoal,
  };
}