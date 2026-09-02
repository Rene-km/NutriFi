import { supabase } from "@/lib/supabase";
import { mealPlanResult, recipeInformation } from "@/utils/utils";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;

if (!SERVER_URL) {
  throw new Error("Missing EXPO_PUBLIC_SERVER_URL in environment variables");
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type RecipeResult = {
  id: number;
  title: string;
  image: string | null;
  imageType: string;
};

export type SavedRecipe = {
  id: string;
  profile_id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_image: string | null;
  created_at: string;
};

export type WorkoutSession = {
  id: string;
  profile_id: string;
  exercise_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
  reps: number | null;
};

export type EndWorkoutSessionOptions = {
  caloriesBurned?: number;
  notes?: string;
  reps: number;
};

export type UpdateWorkoutSessionOptions = {
  reps?: number;
  caloriesBurned?: number;
  notes?: string;
};

type MealPlanInputs = {
  goal: string;
  days: string;
  mealsPerDay: string;
  anythingElse: string;
};

export type Streak = {
  streak: number;
  bestStreak: number;
  total: number;
};

export type WeeklyGoal = {
  id: string;
  profile_id: string;
  exercise_id: string;
  target_reps: number;
  active_days: number[];
  is_active: boolean;
  created_at: string;
  exercise_name?: string;
};

export type WeeklyGoalProgress = WeeklyGoal & {
  reps_this_week: number;
  reps_by_day: Record<number, number>;
};

export type CreateWeeklyGoalInput = {
  profile_id: string;
  exercise_id: string;
  target_reps: number;
  active_days: number[];
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const loadProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.log("Error loading profile:", profileError);
    return null;
  }

  return profileData;
};

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

export async function getStreaksData(): Promise<Streak> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { streak: 0, bestStreak: 0, total: 0 };

  const { data, error } = await supabase
    .from("workout_session")
    .select("started_at")
    .eq("profile_id", user.id)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return { streak: 0, bestStreak: 0, total: 0 };
  }

  const uniqueDates = [
    ...new Set(
      (data as any[]).map((row) => {
        const d = new Date(row.started_at);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      })
    ),
  ].sort((a, b) => (a > b ? -1 : 1));

  const total = uniqueDates.length;

  const today = new Date();
  const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, "0")}-${String(yesterday.getUTCDate()).padStart(2, "0")}`;

  let streak = 0;
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    let prev = new Date(uniqueDates[0]);
    for (const dateStr of uniqueDates) {
      const curr = new Date(dateStr);
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 1) {
        streak++;
        prev = curr;
      } else {
        break;
      }
    }
  }

  let bestStreak = 0;
  let current = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      current++;
    } else {
      bestStreak = Math.max(bestStreak, current);
      current = 1;
    }
  }
  bestStreak = Math.max(bestStreak, current);

  return { streak, bestStreak, total };
}

// ---------------------------------------------------------------------------
// Workout sessions
// ---------------------------------------------------------------------------

export async function startWorkoutSession(
  profileId: string,
  exerciseId: string
): Promise<{ data: WorkoutSession | null; error: unknown }> {
  const startedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("workout_session")
    .insert({
      profile_id: profileId,
      exercise_id: exerciseId,
      started_at: startedAt,
      ended_at: null,
      duration_minutes: null,
      calories_burned: null,
      notes: null,
      reps: null,
    })
    .select()
    .single();

  return { data: data as WorkoutSession | null, error: error ?? null };
}

export async function updateWorkoutSession(
  sessionId: string,
  options: UpdateWorkoutSessionOptions
): Promise<{ data: WorkoutSession | null; error: unknown }> {
  const updates: Record<string, unknown> = {};

  if (options.reps != null) updates.reps = options.reps;
  if (options.caloriesBurned != null) updates.calories_burned = options.caloriesBurned;
  if (options.notes != null) updates.notes = options.notes;

  const { data, error } = await supabase
    .from("workout_session")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  return { data: data as WorkoutSession | null, error: error ?? null };
}

export async function endWorkoutSession(
  sessionId: string,
  options?: EndWorkoutSessionOptions
): Promise<{ data: WorkoutSession | null; error: unknown }> {
  const { data: existing, error: fetchError } = await supabase
    .from("workout_session")
    .select("started_at")
    .eq("id", sessionId)
    .single();

  if (fetchError || !existing) {
    return { data: null, error: fetchError ?? new Error("Session not found") };
  }

  const endedAt = new Date().toISOString();
  const started = new Date(existing.started_at).getTime();
  const durationMinutes = Math.round(
    (new Date(endedAt).getTime() - started) / (60 * 1000)
  );

  const updates: Record<string, unknown> = {
    ended_at: endedAt,
    duration_minutes: durationMinutes,
  };

  if (options?.caloriesBurned != null) updates.calories_burned = options.caloriesBurned;
  if (options?.notes != null) updates.notes = options.notes;
  if (options?.reps != null) updates.reps = options.reps;

  const { data, error } = await supabase
    .from("workout_session")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  return { data: data as WorkoutSession | null, error: error ?? null };
}

export async function getTodayReps(
  profileId: string
): Promise<{ data: { exercise_name: string; total_reps: number }[]; error: unknown }> {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );

  const { data, error } = await supabase
    .from("workout_session")
    .select("reps, exercise:exercise_id(name)")
    .eq("profile_id", profileId)
    .gte("started_at", startOfDay.toISOString())
    .not("ended_at", "is", null)
    .gt("reps", 0);

  if (error || !data) return { data: [], error };

  const grouped: Record<string, number> = {};
  for (const row of data as any[]) {
    const name = row.exercise?.name ?? "Unknown";
    grouped[name] = (grouped[name] ?? 0) + (row.reps ?? 0);
  }

  const result = Object.entries(grouped).map(([exercise_name, total_reps]) => ({
    exercise_name,
    total_reps,
  }));

  return { data: result, error: null };
}

// ---------------------------------------------------------------------------
// Exercise details
// ---------------------------------------------------------------------------

export async function getExerciseDetails(id: string) {
  if (!RAPIDAPI_KEY) {
    return {
      data: null,
      error: new Error("Missing EXPO_PUBLIC_RAPIDAPI_KEY in environment variables"),
    };
  }

  const url = `https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/exercises/${id}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com",
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ---------------------------------------------------------------------------
// Workout progress charts
// ---------------------------------------------------------------------------

export async function get7DayWorkoutProgress(
  profileId: string
): Promise<{ data: { date: string; dayOfWeek: string; exercises: { name: string; reps: number }[] }[]; error: unknown }> {
  const now = new Date();
  const sevenDaysAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6, 0, 0, 0, 0)
  );

  const { data, error } = await supabase
    .from("workout_session")
    .select("reps, started_at, exercise:exercise_id(name)")
    .eq("profile_id", profileId)
    .gte("started_at", sevenDaysAgo.toISOString())
    .not("ended_at", "is", null)
    .gt("reps", 0)
    .order("started_at", { ascending: true });

  if (error || !data) return { data: [], error };

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byDate: Record<string, Record<string, number>> = {};

  for (const row of data as any[]) {
    const d = new Date(row.started_at);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const name = row.exercise?.name ?? "Unknown";
    if (!byDate[dateStr]) byDate[dateStr] = {};
    byDate[dateStr][name] = (byDate[dateStr][name] ?? 0) + (row.reps ?? 0);
  }

  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6 + i)
    );
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const dayOfWeek = DAY_NAMES[d.getUTCDay()];
    const exerciseMap = byDate[dateStr] ?? {};
    const exercises = Object.entries(exerciseMap).map(([name, reps]) => ({ name, reps }));
    result.push({ date: dateStr, dayOfWeek, exercises });
  }

  return { data: result, error: null };
}

export async function getAllTimeWorkoutProgress(
  profileId: string
): Promise<{ data: { date: string; dayOfWeek: string; exercises: { name: string; reps: number }[] }[]; error: unknown }> {
  const { data, error } = await supabase
    .from("workout_session")
    .select("reps, started_at, exercise:exercise_id(name)")
    .eq("profile_id", profileId)
    .not("ended_at", "is", null)
    .gt("reps", 0)
    .order("started_at", { ascending: true });

  if (error || !data) return { data: [], error };

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byDate: Record<string, Record<string, number>> = {};

  for (const row of data as any[]) {
    const d = new Date(row.started_at);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const name = row.exercise?.name ?? "Unknown";
    if (!byDate[dateStr]) byDate[dateStr] = {};
    byDate[dateStr][name] = (byDate[dateStr][name] ?? 0) + (row.reps ?? 0);
  }

  const result = Object.entries(byDate).map(([dateStr, exerciseMap]) => {
    const d = new Date(dateStr);
    const dayOfWeek = DAY_NAMES[d.getUTCDay()];
    const exercises = Object.entries(exerciseMap).map(([name, reps]) => ({ name, reps }));
    return { date: dateStr, dayOfWeek, exercises };
  });

  return { data: result, error: null };
}

// ---------------------------------------------------------------------------
// Weekly goals
// ---------------------------------------------------------------------------

export async function getWeeklyGoals(
  profileId: string
): Promise<{ data: WeeklyGoal[]; error: unknown }> {
  const { data, error } = await supabase
    .from("weekly_goal")
    .select("*, exercise:exercise_id(name)")
    .eq("profile_id", profileId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) return { data: [], error };

  const goals = (data as any[]).map((row) => ({
    ...row,
    exercise_name: row.exercise?.name ?? "Unknown",
  })) as WeeklyGoal[];

  return { data: goals, error: null };
}

export async function createWeeklyGoal(
  input: CreateWeeklyGoalInput
): Promise<{ data: WeeklyGoal | null; error: unknown }> {
  await supabase
    .from("weekly_goal")
    .update({ is_active: false })
    .eq("profile_id", input.profile_id)
    .eq("exercise_id", input.exercise_id)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("weekly_goal")
    .insert({
      profile_id: input.profile_id,
      exercise_id: input.exercise_id,
      target_reps: input.target_reps,
      active_days: input.active_days,
    })
    .select()
    .single();

  return { data: data as WeeklyGoal | null, error: error ?? null };
}

export async function deleteWeeklyGoal(
  goalId: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from("weekly_goal")
    .update({ is_active: false })
    .eq("id", goalId);

  return { error: error ?? null };
}

export async function getWeeklyGoalProgress(
  profileId: string
): Promise<{ data: WeeklyGoalProgress[]; error: unknown }> {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const monday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - (isoDay - 1),
      0, 0, 0, 0
    )
  );

  const { data: goals, error: goalsError } = await getWeeklyGoals(profileId);
  if (goalsError || goals.length === 0) return { data: [], error: goalsError };

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_session")
    .select("exercise_id, reps, started_at")
    .eq("profile_id", profileId)
    .gte("started_at", monday.toISOString())
    .not("ended_at", "is", null)
    .gt("reps", 0);

  if (sessionsError) return { data: [], error: sessionsError };

  const repsByExerciseAndDay: Record<string, Record<number, number>> = {};
  for (const session of (sessions ?? []) as any[]) {
    const exId = session.exercise_id as string;
    const date = new Date(session.started_at);
    const wd = date.getUTCDay();
    const iso = wd === 0 ? 7 : wd;

    if (!repsByExerciseAndDay[exId]) repsByExerciseAndDay[exId] = {};
    repsByExerciseAndDay[exId][iso] =
      (repsByExerciseAndDay[exId][iso] ?? 0) + (session.reps ?? 0);
  }

  const progress: WeeklyGoalProgress[] = goals.map((goal) => {
    const byDay = repsByExerciseAndDay[goal.exercise_id] ?? {};
    const repsThisWeek = Object.values(byDay).reduce((sum, r) => sum + r, 0);
    return {
      ...goal,
      reps_this_week: repsThisWeek,
      reps_by_day: byDay,
    };
  });

  return { data: progress, error: null };
}

// ---------------------------------------------------------------------------
// Goal calendar
// ---------------------------------------------------------------------------

export type CalendarDayStatus = "met" | "partial" | "missed" | "no_goal";

export type CalendarDay = {
  date: string;
  status: CalendarDayStatus;
  detail: { exercise_name: string; reps_done: number; target: number; met: boolean }[];
};

// Returns goal status per day for a given month.
// Only marks days as "missed" if they are AFTER the goal's created_at date.
// Days before any goal existed are always "no_goal".
export async function getGoalCalendar(
  profileId: string,
  year: number,
  month: number
): Promise<{ data: CalendarDay[]; error: unknown }> {
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 1));

  const { data: allGoalsRaw, error: goalsError } = await supabase
    .from("weekly_goal")
    .select("*, exercise:exercise_id(name)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (goalsError) return { data: [], error: goalsError };

  const allGoals = (allGoalsRaw as any[]).map((row) => ({
    ...row,
    exercise_name: row.exercise?.name ?? "Unknown",
  })) as WeeklyGoal[];

  if (allGoals.length === 0) {
    // No goals ever created — every day is no_goal
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const result: CalendarDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      result.push({ date: dateStr, status: "no_goal", detail: [] });
    }
    return { data: result, error: null };
  }

  // Fetch sessions for the month
  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_session")
    .select("exercise_id, reps, started_at")
    .eq("profile_id", profileId)
    .gte("started_at", startOfMonth.toISOString())
    .lt("started_at", endOfMonth.toISOString())
    .not("ended_at", "is", null)
    .gt("reps", 0);

  if (sessionsError) return { data: [], error: sessionsError };

  // Build lookup: "YYYY-MM-DD" -> exercise_id -> reps
  const repsByDateAndExercise: Record<string, Record<string, number>> = {};
  for (const s of (sessions ?? []) as any[]) {
    const d = new Date(s.started_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const exId = s.exercise_id as string;
    if (!repsByDateAndExercise[key]) repsByDateAndExercise[key] = {};
    repsByDateAndExercise[key][exId] =
      (repsByDateAndExercise[key][exId] ?? 0) + (s.reps ?? 0);
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const result: CalendarDay[] = [];
  const todayUTC = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
  );

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const wd = date.getUTCDay();
    const isoDay = wd === 0 ? 7 : wd;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isPastDay = date < todayUTC;

    // Find goals that existed on this day (created_at <= end of this day)
    // and were scheduled for this weekday.
    // For today and future dates, skip inactive (deleted) goals.
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const candidateGoals = allGoals.filter((g) => {
      const createdAt = new Date(g.created_at);
      if (createdAt > endOfDay) return false;
      if (!g.active_days.includes(isoDay)) return false;
      if (!isPastDay && !g.is_active) return false;
      return true;
    });

    // Deduplicate: keep only the most recent goal per exercise
    const goalsByExercise = new Map<string, WeeklyGoal>();
    for (const goal of candidateGoals) {
      const existing = goalsByExercise.get(goal.exercise_id);
      if (!existing || new Date(goal.created_at) > new Date(existing.created_at)) {
        goalsByExercise.set(goal.exercise_id, goal);
      }
    }
    const goalsForDay = Array.from(goalsByExercise.values());

    if (goalsForDay.length === 0) {
      result.push({ date: dateStr, status: "no_goal", detail: [] });
      continue;
    }

    const repsThatDay = repsByDateAndExercise[dateStr] ?? {};
    let metCount = 0;

    const detail = goalsForDay.map((goal) => {
      const repsDone = repsThatDay[goal.exercise_id] ?? 0;
      const dailyTarget = goal.target_reps;
      const met = repsDone >= dailyTarget;
      if (met) metCount++;
      return {
        exercise_name: goal.exercise_name ?? "Unknown",
        reps_done: repsDone,
        target: dailyTarget,
        met,
      };
    });

    let status: CalendarDayStatus;
    if (metCount === goalsForDay.length) {
      status = "met";
    } else if (metCount > 0) {
      status = "partial";
    } else {
      status = isPastDay ? "missed" : "no_goal";
    }

    result.push({ date: dateStr, status, detail });
  }

  return { data: result, error: null };
}

// ---------------------------------------------------------------------------
// Recipes & meal plans
// ---------------------------------------------------------------------------

export async function searchRecipe(query: string): Promise<RecipeResult[]> {
  const response = await fetch(`${SERVER_URL}/recipes/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const res = await response.json();
  return res;
}

export async function getRecipe(id: string): Promise<recipeInformation> {
  let { data: recipe_data, error } = await supabase
  .from('recipe_data')
  .select("*")
  .eq('recipe_id', id)
  .maybeSingle();
  if (error) {
   console.error(error);
  }

  if (recipe_data) {
    return recipe_data.data
  } 

  const response = await fetch(`${SERVER_URL}/recipes/${id}/information`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const res = await response.json();
  return res;
}

export async function getMealPlan(query: MealPlanInputs): Promise<mealPlanResult> {
  const response = await fetch(`${SERVER_URL}/mealPlan`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      goal: query.goal,
      days: query.days,
      mealsPerDay: query.mealsPerDay,
      anythingElse: query.anythingElse,
    }),
  });
  const res = await response.json();
  return res;
}

export async function saveMealPlan(mealPlan: mealPlanResult, profileId: string): Promise<string> {
  const { data, error } = await supabase
    .from("meal_plan")
    .insert({
      profile_id: profileId,
      summary: mealPlan.summary,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const plan = data;
  const id = plan.id;

  for (const day of mealPlan.days) {
    const { data, error } = await supabase
      .from("meal_plan_day")
      .insert({
        meal_plan_id: id,
        day: day.day,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const meal_plan_day_id = data.id;
    let pos = 1;

    for (const meal of day.meals) {
      const { error } = await supabase.from("meal_plan_meal").insert([
        {
          meal_type: meal.mealType,
          search_query: meal.searchQuery,
          reason: meal.reason,
          position: pos,
          meal_plan_day_id: meal_plan_day_id,
          recipe: meal.recipe,
        },
      ]);
      if (error) {
        throw error;
      }
      pos = pos + 1;
    }
  }

  return id;
}


export async function getSavedMealPlans() {
  const { data, error } = await supabase
    .from("meal_plan")
    .select(`
      id,
      summary,
      created_at,
      days:meal_plan_day(
        day,
        meals:meal_plan_meal(
          mealType:meal_type,
          searchQuery:search_query,
          reason,
          recipe
        )
      )
    `)
    .order("created_at", { ascending: false })
    .order("day", { referencedTable: "meal_plan_day", ascending: true })
    .order("position", {
      referencedTable: "meal_plan_day.meal_plan_meal",
      ascending: true,
    });

  if (error) {
    console.log("Error fetching meal plans:", error);
    return [];
  }

  return data ?? [];
}

export async function deleteMealPlan(id: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from("meal_plan")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}

export async function saveRecipe(
  recipeId: string,
  profileId: string,
  recipeName: string,
  recipeImage: string | null
): Promise<SavedRecipe> {
  const { data, error } = await supabase
    .from("saved_recipe")
    .insert({
      profile_id: profileId,
      recipe_id: recipeId,
      recipe_name: recipeName,
      recipe_image: recipeImage,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as SavedRecipe;
}

export async function deleteRecipe(recipeId: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_recipe")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}

export async function getSavedRecipes() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_recipe")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching saved recipes:", error);
    return [];
  }

  return data ?? [];
}