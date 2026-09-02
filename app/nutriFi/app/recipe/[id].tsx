import RecipeDetail from "@/components/Recipe/RecipeDetail";
import useRecipeDetailHook from "@/hooks/Recipe/recipe_detail_hook";
import { getRecipe } from "@/lib/api";
import { useProfileStore } from "@/stores/profileStore";
import { useRecipeStore } from "@/stores/recipeStore";
import { recipeInformation } from "@/utils/utils";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";




export default function Detail() {

   const { recipe, isSaved, profileId, setIsSaved, runSaveRecipe, runDeleteRecipe, isLoading } = useRecipeDetailHook();

      
        return (

        <RecipeDetail 
        recipe={recipe as recipeInformation} 
        profile={profileId ?? null}
        isSaved={isSaved} 
        setIsSaved={setIsSaved}
        runSaveRecipe={runSaveRecipe}
        runDeleteRecipe={runDeleteRecipe}
        isLoading={isLoading}
        />
  );
};
  
const styles = StyleSheet.create({
  container:{
      flex:1,
      backgroundColor:"#ffffff"
  },
  image:{
      width:"100%",
      height:300,
      resizeMode:"cover"
  },
  title:{
      fontSize:25,
      fontWeight:"bold",
      textAlign:"center",
      marginVertical:20,
      color:"#333333"
  },
  section:{
      padding:20
  },
  sectionTitle:{
      fontSize:22,
      fontWeight:"600",
      color:"#3981f6",
      marginBottom:10
  },
  ingredient:{
      fontSize:16,
      color:"#6c727e",
      marginBottom:5,
  },
  step:{
      marginBottom:15,
  },
  stepNumber:{
      fontSize:15,
      fontWeight:"bold",
      color:"#3981f6"
  },
  stepText:{
      fontSize:15,
      color:"#6c727e"
  },
  saveButton:{
      backgroundColor:"#3981f6",
      padding:15,
      borderRadius:25,
      margin:20,
      alignItems:"center"
  },
  saveButtonText:{
      color:"#fff",
      fontSize:16,
      fontWeight:"bold"
  }
});

