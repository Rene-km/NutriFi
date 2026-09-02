import React from 'react'
import { recipeInformation } from "@/utils/utils";

import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";

type RecipeDetailProps = {
    recipe: recipeInformation;
    profile: string | null;
    isSaved: boolean;
    setIsSaved: (isSaved: boolean) => void;
    runSaveRecipe: () => void;
    runDeleteRecipe: () => void;
    isLoading: boolean;
}

const RecipeDetail = ({recipe, profile, isSaved, setIsSaved,
     runSaveRecipe, runDeleteRecipe, isLoading}: RecipeDetailProps) => {

   
  return (
    <ScrollView style={styles.container}>
    <Image source={{uri:recipe?.image}} style={styles.image}/>
    <Text style={styles.title}>{recipe?.title}</Text>

    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe?.extendedIngredients?.map((ingredient:any,index:number) => (
            <Text style={styles.ingredient} key={index}>{ingredient.original}</Text>
        ))}
    </View>

    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Steps</Text>
        {recipe?.analyzedInstructions?.[0]?.steps.map((step:any,index:number) => (
            <View style={styles.step} key={step.number ?? index}>
                <Text style={styles.stepNumber}>Step {step.number}</Text>
                <Text style={styles.stepText}>{step.step}</Text>
            </View>
        ))}
    </View>
    <TouchableOpacity 
    testID="save-recipe-button"
    onPress={isSaved ? runDeleteRecipe : runSaveRecipe}
    disabled={isLoading}
    style={styles.saveButton}>
        <Text style={styles.saveButtonText}>{isSaved ? "Remove recipe" : "Save Recipe"}</Text>
    </TouchableOpacity>
  </ScrollView>
  )
}

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
  
  

export default RecipeDetail