import { supabase } from '@/lib/supabase';
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

export const useWorkoutHook = () => {
  const [excercises, setExercises] = useState<exercise[]>([]);

  useEffect(() => {
      const getExercises = async () => {
          try {
              let { data: exercises, error } = await supabase
                  .from('exercise')
                  .select('*');

              if (error) {
                  console.error('Error fetching exercises:', error.message);
                  return;
              }

              if (exercises && exercises.length > 0) {
                  setExercises(exercises);
              }
          } catch (error) {
              if (error instanceof Error) {
                  console.error('Error fetching exercises:', error.message);
              } else {
                  console.error('Error fetching exercises:', error);
              }
          }
      };

      getExercises();
  }, []);

  return { excercises, setExercises };
};