import {  mealPlanResult } from "@/utils/utils";
import { View, FlatList, StyleSheet} from "react-native";
import PlanCard from "./PlanCard";
import PlanModal from "./PlanModal";
import TabButton from "./TabButton";
import useSavedViewHook from "@/hooks/Recipe/saved_view_hook";
import useMealPlanHook from "@/hooks/Recipe/meal_plan_hook";
import { SavedRecipe } from "@/lib/api";
import SavedRecipeCard from "./SavedRecipes";


type SavedViewProps = {
    plans: mealPlanResult[]
    profile:  string | null;
    recipes: SavedRecipe[]
}


export default function SavedView({plans, profile, recipes}: SavedViewProps){

    const { modalVisible, setModalVisible, modalPlan, setModalPlan, 
        savedViewTab, setSavedViewTab } = useSavedViewHook();    

    
        const { previewDay, setPreviewDay, navigateToRecipe, isSaved, handleSavePlan, handleDeletePlan } = useMealPlanHook({
            mealPlan: modalPlan,
            modalVisible,
            profile,
            onGenerateMealPlan: async () => {},
          });
        
    const renderPlanCard = ({ item }: { item: mealPlanResult }) => (
    
        <PlanCard 
        plan={item}
        setModalVisible={setModalVisible}
        setModalPlan={setModalPlan}
        />
     
       );

       const renderRecipeCard = ({ item }: { item: SavedRecipe }) => (
    
        <SavedRecipeCard
        recipe={item}
        onNavigate={(id, title, image) => navigateToRecipe(id, title, image)}
        />
     
       );

    
    return(
    
    <View style={{ flex: 1 }}>
        <View style={{padding: 24}}>
       <TabButton
                selectedIndex={savedViewTab}
                onChange={setSavedViewTab} 
                labels={["Meal plans", "Recipes"]} 
                testIDPrefix="saved-view"
                 />
        </View>
        {savedViewTab === 0 && (
            <>
        <FlatList
            style={styles.list}
            data={plans}
            keyExtractor={({id}) => id}
            renderItem={renderPlanCard}
            contentContainerStyle={styles.container}
            />
    <PlanModal
    modalVisible={modalVisible}
    setModalVisible={setModalVisible}
    mealPlan={modalPlan}
    previewDay={previewDay}
    setPreviewDay={setPreviewDay}
    navigateToRecipe={navigateToRecipe}
    isSaved={isSaved}
    onSave={handleSavePlan}
    onDelete={handleDeletePlan}
    />


    </>)}
    {savedViewTab === 1 && (
        <>
        <FlatList
        style={styles.list}
        data={recipes}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={({id}) => id}
        renderItem={renderRecipeCard}
        contentContainerStyle={styles.container}
        />
    </>
)}

    </View>
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    container: {
        padding: 24,
        paddingTop: 0,
      },
      row: {
        gap: 16,
      },
})


