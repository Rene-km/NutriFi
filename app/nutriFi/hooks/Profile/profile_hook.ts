import { useState, useCallback } from "react";
import { getTodayReps } from "@/lib/api";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";

const useProfileHook = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [todayReps, setTodayReps] = useState<
    { exercise_name: string; total_reps: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    const now = new Date();
    const isoDay = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
    const monday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (isoDay - 1))
    );

    const { data: sessions } = await supabase
      .from("workout_session")
      .select("duration_minutes, calories_burned")
      .eq("profile_id", user.id)
      .gte("started_at", monday.toISOString())
      .not("ended_at", "is", null);

    setStats({
      total_workouts: sessions?.length ?? 0,
      total_minutes: sessions?.reduce((s, r) => s + (r.duration_minutes ?? 0), 0) ?? 0,
      total_calories: sessions?.reduce((s, r) => s + (r.calories_burned ?? 0), 0) ?? 0,
    });

    const { data: repsData } = await getTodayReps(user.id);

    if (repsData) setTodayReps(repsData);

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return { profile, stats, todayReps, loading };
};

export default useProfileHook;