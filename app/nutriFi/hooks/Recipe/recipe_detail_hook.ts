import { deleteRecipe, getRecipe, saveRecipe } from '@/lib/api';
import { useProfileStore } from '@/stores/profileStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { recipeInformation } from '@/utils/utils';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react'

const useRecipeDetailHook = () => {
    const profileId = useProfileStore((state) => state.profileId);
    const setRecipes = useRecipeStore(state => state.setRecipes);
    const [isSaved, setIsSaved] = useState(false);
    const recipes = useRecipeStore(state => state.recipes);
    const [isLoading, setIsLoading] = useState(false);
    const { id, title, image } = useLocalSearchParams<{
        id: string; title: string; image: string;
    }>();
    const [recipe, setRecipe] = useState<recipeInformation>({ 
        id: Number(id), title, image 
    } as recipeInformation);


   
      const runSaveRecipe = async () => {
        if (!recipe || !profileId || isLoading) return;
        setIsLoading(true);
        try {
            await saveRecipe(String(recipe.id), profileId, recipe.title, recipe.image);
            setIsSaved(true);
        } finally {
            setIsLoading(false);
        }
    }
    
    const runDeleteRecipe = async () => {
        if (!recipe || !profileId || isLoading) return;
        setIsLoading(true);
        try {
            await deleteRecipe(String(recipe.id), profileId);
            setIsSaved(false);
        } finally {
            setIsLoading(false);
        }
    }
      
     

      useEffect(() => {
        setIsSaved(recipes.some(recipe => recipe.recipe_id === id));
      }, [recipes, id]);


      useEffect(() => {
        let cancelled = false;
      
        (async () => {
          const res = await getRecipe(id);
          if (!cancelled) {
            setRecipe(res ?? []);
          }
        })();
        
      
        return () => {
          cancelled = true;
        };
    
        
      }, []);

      return { recipe, isSaved, profileId, setIsSaved, runSaveRecipe, runDeleteRecipe, isLoading };
  
}

export default useRecipeDetailHook