import { RecipeResult, SavedRecipe } from "@/lib/api";
import { create } from "zustand";

type RecipeStore = {
    recipes: SavedRecipe[];
    setRecipes: (recipes: SavedRecipe[]) => void;
    searchResults: RecipeResult[];
    setSearchResults: (results: RecipeResult[]) => void;
    searchText: string;
    setSearchText: (text: string) => void;
  };

  export const useRecipeStore = create<RecipeStore>((set) => ({
    recipes: [],
    setRecipes: (recipes) => set({ recipes }),
    searchResults: [],
    setSearchResults: (results) => set({ searchResults: results }),
    searchText: '',
    setSearchText: (text) => set({ searchText: text }),
  }));
