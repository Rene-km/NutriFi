import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import SearchView from "@/components/Recipe/SearchView";
import MealView from "@/components/Recipe/MealView";
import SavedView from "@/components/Recipe/SavedView";
import useRecipeHook from "@/hooks/Recipe/recipe_hook";

const Chip = ({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) => (
  <Pressable
    onPress={onPress}
    testID={testID}
    style={{
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 999,
      backgroundColor: selected ? "#3981f6" : "#f5f5f5",
      borderColor: selected ? "#3981f6" : "#e4e8ef",
    }}
  >
    <Text style={{ color: selected ? "#ffffff" : "#4b5666" }}>{label}</Text>
  </Pressable>
);


export default function Recipe() {
  const { text, onChangeText, isLoading, data, mealPlan, 
    switcher, modalVisible, profileId, plans, navigateToRecipe, recipes,
    onGenerateMealPlan, runSearch, setSwitcher, setModalVisible, isMealPlanLoading } = useRecipeHook();

 

   

    return (
      <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
     

      <View style={styles.header}>
       
        <Text style={styles.headerTitle}>Recipes</Text>

        <View style={styles.switcher}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Chip label="Search" selected={switcher === 1} 
        onPress={() => setSwitcher(1)} 
        testID="search-chip" />
        <Chip label="Meal Plans" selected={switcher === 2} 
        onPress={() => setSwitcher(2)} 
        testID="meal-plans-chip" />
        <Chip label="Saved" selected={switcher === 3} 
        onPress={() => setSwitcher(3)} 
        testID="saved-chip" />
      </View>
        
        </View>
        
      </View>

     

        {switcher == 1 &&  <SearchView
        text={text}
        onChangeText={onChangeText}
        runSearch={runSearch}
        isLoading={isLoading}
        data={data}
        containerStyle={styles.container}
        inputStyle={styles.input}
        onNavigate={navigateToRecipe}
        profile={profileId}
      />}
        {switcher == 2 && (
          <MealView
            onGenerateMealPlan={onGenerateMealPlan}
            mealPlan={mealPlan}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            profile={profileId}
            containerStyle={styles.container}
            inputStyle={styles.input}
            isMealPlanLoading={isMealPlanLoading}
          />
        )}
        {switcher == 3 && (<SavedView
        plans={plans}
        profile={profileId}
        recipes={recipes}
        />
      )}
</SafeAreaView>
        
      </>
    );
  

}




const styles = StyleSheet.create({
  container: {
      
    backgroundColor: "#f5f5f5",
    flex: 1,
    padding: 24
      
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    margin: 20,
    maxWidth: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  item: {
      marginBottom: 16,
      alignContent: 'center'
  },
  text: {
      color: "white",
      fontSize: 24,
      marginBottom: 8,
  },
  textModal: {
    color: "black",
    fontSize: 24,
    marginBottom: 8,
},
  image: {
      width: "70%",
      height: 180,
  },
  input: {
    backgroundColor: 'white',
    borderColor: 'none',
    height: 40,
    padding: 10,
    borderRadius: 4,
    marginBottom: 6
  },
   /** Header */
   header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  switcher: {
    marginHorizontal: -6,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24
   
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginTop: 12
  },
  
})


