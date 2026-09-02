import { getExerciseDetails } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export type exercise = {
    id: number;
    name: string;
    description: string;
    image_url: string;
    video_url: string;
    api_id: string;
    created_at: string;
};

const useWorkoutDetailHook = () => {
  const local = useLocalSearchParams();
  const [exercise, setExercise] = useState<exercise | null>(null);
  const [exerciseDetail, setExerciseDetail] = useState<any | null>(null);

  useEffect(() => {
    const getExercise = async () => {
      try {
        const { data, error } = await supabase
          .from("exercise")
          .select("*")
          .eq("name", local.exercise)
          .single();

        if (error) {
          console.error("Error fetching exercise:", error.message);
          return;
        }

        if (data) {
          setExercise(data);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching exercise:", error.message);
        } else {
          console.error("Error fetching exercise:", error);
        }
      }
    };
    getExercise();
  }, [local.exercise]);

  useEffect(() => {
    if (!exercise?.api_id) return;

    const fetchDetail = async () => {
      const { data, error } = await getExerciseDetails(exercise.api_id);

      if (error) {
        console.error("Error fetching exercise details:", error.message);
        return;
      }

      if (data) {
        setExerciseDetail(data);
      }
    };
    fetchDetail();
  }, [exercise?.api_id]);

  return { exercise, exerciseDetail };
};

export default useWorkoutDetailHook;
