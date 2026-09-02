import { deleteRecipe, saveRecipe } from "@/lib/api";
import { useProfileStore } from "@/stores/profileStore";
import { useRecipeStore } from "@/stores/recipeStore";
import { useState } from "react";

const useRecipeCardHook = (itemId: number, title: string, image: string) => {
    const recipes = useRecipeStore(state => state.recipes);
    const setRecipes = useRecipeStore(state => state.setRecipes);
    const profileId = useProfileStore(state => state.profileId);
    const [isLoading, setIsLoading] = useState(false);


    const isSaved = recipes.some(r => r.recipe_id === String(itemId));

    const handleSaveToggle = async () => {
        if (!profileId || isLoading) return;
        setIsLoading(true);
        try {
            if (isSaved) {
                setRecipes(recipes.filter(r => r.recipe_id !== String(itemId)));
                try {
                    await deleteRecipe(String(itemId), profileId);
                } catch {
                    setRecipes(recipes)
                }
            } else {
            const saved = await saveRecipe(String(itemId), profileId, title, image);
            setRecipes([...recipes, saved]);
        } 
    } catch (error) {
        console.error(error);
    } finally {
            setIsLoading(false);
        }
    };

    return { isSaved, handleSaveToggle, isLoading };
};


  export default useRecipeCardHook;