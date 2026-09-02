import { getStreaksData, Streak } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from '@/stores/profileStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

type Exercise = { id: string; name: string };

const useDashboardHook = () => {
  const [streaks, setStreaks] = useState<Streak>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const profileId = useProfileStore((state) => state.profileId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Fetch streaks
      const res = await getStreaksData();
      if (!cancelled) setStreaks(res ?? {});

      // Fetch exercises for the goal picker
      const { data, error } = await supabase
        .from('exercise')
        .select('id, name')
        .order('name', { ascending: true });

      if (!cancelled && !error && data) {
        setExercises(data as Exercise[]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    streaks,
    profileId,
    exercises,
    handleLogout,
  };
};

export default useDashboardHook;