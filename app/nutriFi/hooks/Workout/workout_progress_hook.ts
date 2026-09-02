import { useEffect, useState } from 'react';
import { get7DayWorkoutProgress } from "@/lib/api";
import { useProfileStore } from '@/stores/profileStore';

export interface ChartData {
  date: string;
  dayOfWeek: string;
  exercises: Array<{ name: string; reps: number }>;
}

export interface SelectedDay {
  date: string;
  dayOfWeek: string;
  exercises: Array<{ name: string; reps: number }>;
  total: number;
}

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const useWorkoutProgressHook = () => {
  const profileId = useProfileStore((state) => state.profileId);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);

  useEffect(() => {
    if (!profileId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await get7DayWorkoutProgress(profileId);

        if (result.error) {
          setError("Failed to load workout data");
          return;
        }

        setChartData(result.data);
      } catch (err) {
        setError("An error occurred while loading data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileId]);

  const allExercises = Array.from(
    new Set(chartData.flatMap((day) => day.exercises.map((ex) => ex.name)))
  );

  const exerciseColors = allExercises.reduce(
    (acc, exercise, idx) => {
      acc[exercise] = COLORS[idx % COLORS.length];
      return acc;
    },
    {} as Record<string, string>
  );

  const dayTotals = chartData.map((day) => ({
    date: day.date,
    dayOfWeek: day.dayOfWeek,
    total: day.exercises.reduce((sum, ex) => sum + ex.reps, 0),
    exercises: day.exercises,
  }));

  const maxTotal = dayTotals.length > 0 ? Math.max(...dayTotals.map((d) => d.total)) : 0;

  const exerciseTrends = allExercises.map((exercise) => ({
    name: exercise,
    data: dayTotals.map((day) => ({
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      reps: day.exercises.find((e) => e.name === exercise)?.reps ?? 0,
    })),
    max: Math.max(
      ...dayTotals.map((day) => day.exercises.find((e) => e.name === exercise)?.reps ?? 0)
    ),
  }));

  return {
    loading,
    error,
    chartData,
    selectedDay,
    setSelectedDay,
    allExercises,
    exerciseColors,
    dayTotals,
    maxTotal,
    exerciseTrends,
  };
};

export default useWorkoutProgressHook;
