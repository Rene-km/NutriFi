import { useState, useCallback } from "react";
import { getGoalCalendar, CalendarDay } from "@/lib/api";

export function useGoalCalendar(profileId: string | null) {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1); // 1-indexed
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = useCallback(
    async (y: number, m: number) => {
      if (!profileId) return;
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getGoalCalendar(profileId, y, m);

      if (fetchError) {
        setError("Failed to load calendar");
        setLoading(false);
        return;
      }

      setDays(data);
      setLoading(false);
    },
    [profileId]
  );

  const goToPrevMonth = useCallback(() => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchMonth(newYear, newMonth);
  }, [month, year, fetchMonth]);

  const goToNextMonth = useCallback(() => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchMonth(newYear, newMonth);
  }, [month, year, fetchMonth]);

  // Call this once when the calendar mounts
  const refresh = useCallback(() => {
    fetchMonth(year, month);
  }, [fetchMonth, year, month]);

  return {
    year,
    month,
    days,
    loading,
    error,
    refresh,
    goToPrevMonth,
    goToNextMonth,
  };
}