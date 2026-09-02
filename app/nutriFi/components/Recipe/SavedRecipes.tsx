import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SavedRecipe } from "@/lib/api";
import useRecipeCardHook from "@/hooks/Recipe/recipe_card_hook";


type SavedRecipeCardProps = {
  recipe: SavedRecipe;
  onNavigate: (recipeId: number, title: string, image: string) => void;
  
};

export default function SavedRecipeCard({ recipe, onNavigate }: SavedRecipeCardProps) {

  const { isSaved, handleSaveToggle, isLoading } = useRecipeCardHook(
    Number(recipe.recipe_id),
    recipe.recipe_name,
    recipe.recipe_image ?? ""
  );

  const handlePress = () => {
    if (!recipe?.recipe_id) return;
    onNavigate(Number(recipe.recipe_id), recipe.recipe_name, recipe.recipe_image ?? "");
  };

    return (
        <TouchableOpacity
  testID="saved-recipe-card"
  style={styles.itemWrapper}
  key={recipe?.id}
  onPress={handlePress}
    >
  <View style={styles.card}>
   <View style={styles.cardLikeWrapper}>
   <TouchableOpacity 
   onPress={handleSaveToggle}
   disabled={isLoading}>
        <View style={styles.cardLike}>
          <FontAwesome
            color={isSaved ? '#e74c3c' : '#222'}
            name="heart"
            solid={false}
            size={20} />
        </View>
      </TouchableOpacity>
    </View>
    <View style={styles.cardTop}>
      <Image
        alt=""
        resizeMode="cover"
        style={styles.cardImg}
        source={{ uri: recipe?.recipe_image ? recipe.recipe_image : "Food image" }} />
    </View>
    <View style={styles.cardBody}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {recipe?.recipe_name}
        </Text>
      </View>
    </View>
    </View>
</TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    /** Card */
    card: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#fff',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    cardLikeWrapper: {
      position: 'absolute',
      zIndex: 1,
      top: 12,
      right: 12,
    },
    cardLike: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTop: {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    cardImg: {
      width: '100%',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      height: 150
    },
    cardBody: {
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: '#232425',
      flexShrink: 1,
    },
    itemWrapper: {
      width: '48%',
    },
  });