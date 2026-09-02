import { getMealPlan, getSavedMealPlans, RecipeResult, searchRecipe, getSavedRecipes, SavedRecipe } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from '@/stores/profileStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { mealPlanResult } from '@/utils/utils';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react'

export type MealPlanInputs = {
    goal: string;
    days: string;
    mealsPerDay: string;
    anythingElse: string;
  };



const useRecipeHook = () => {
    const [isLoading, setLoading] = useState(false);
    const [mealPlan, setMealPlan] = useState<mealPlanResult | null>(null);
    const [switcher, setSwitcher] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const plans = useMealPlanStore((state) => state.plans);
    const setPlans = useMealPlanStore((state) => state.setPlans);
    const setRecipes = useRecipeStore(state => state.setRecipes);
    const recipes = useRecipeStore(state => state.recipes);
    const data = useRecipeStore(state => state.searchResults);
    const setData = useRecipeStore(state => state.setSearchResults);
    const text = useRecipeStore(state => state.searchText);
    const setSearchText = useRecipeStore(state => state.setSearchText);
    const profileId = useProfileStore((state) => state.profileId);
    const [isMealPlanLoading, setMealPlanLoading] = useState(false);

    const onChangeText = (value: string) => setSearchText(value);

    const runSearch = async () => {
        setLoading(true);
        const res = await searchRecipe(text);
        setLoading(false);
        setData(res);
      };

      const navigateToRecipe = (id: number, title: string, image: string) => {
        router.push({ pathname: '/recipe/[id]',
           params: { id: String(id), title, image } });
      };
      
    
  
    
  
    useEffect(() => {
      let cancelled = false;

      (async () => {
        const res = await getSavedMealPlans();
        if (!cancelled) {
          setPlans(res ?? []);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      let cancelled = false;
    
      (async () => {
        const res = await getSavedRecipes();
        if (!cancelled) {
          setRecipes(res ?? []);
        }
      })();
      
    
      return () => {
        cancelled = true;
      };
  
      
    }, []);
  
  useEffect(() => {
    
  const channels = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'meal_plan' },
    (payload) => {
      console.log('Change received!', payload)
      void (async () => {
        const res = await getSavedMealPlans();
        setPlans(res ?? []);
      })();
    }
  )
  .subscribe()
  
    return () => {channels.unsubscribe()};
  }, []);

  useEffect(() => {

  const channels = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'saved_recipe' },
    (payload) => {
      console.log('Change received!', payload)
      void (async () => {
        const res = await getSavedRecipes();
        setRecipes(res ?? []);
      })();
    }
  )
  .subscribe()


  return () => {channels.unsubscribe()};
}, []);
  
  
    
      
  
      const onGenerateMealPlan = async (data: {
        goal: string;
        days: "1" | "2" | "3";
        mealsPerDay: "2" | "3" | "4";
        anythingElse: string;
      }) => {
        setMealPlanLoading(true);
        try {
          const res = await getMealPlan(data);
          setMealPlan(res);
        } finally {
          setMealPlanLoading(false);
        }
      };
    
  
  return (
   {text, onChangeText, isLoading, data, mealPlan, switcher, modalVisible, 
    profileId, plans, recipes, onGenerateMealPlan, runSearch,
     setSwitcher, setModalVisible, navigateToRecipe, isMealPlanLoading
}
  )
}

export default useRecipeHook;