import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { mealPlanResult } from "@/utils/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import MealCard from "./MealCard";

type PlanModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  mealPlan: mealPlanResult | null;
  previewDay: number;
  setPreviewDay: (day: number) => void;
  navigateToRecipe: (id: number, title: string, image: string, closeModal?: () => void) => void;
  isSaved: boolean;
  onSave: () => void;
  onDelete: () => void;
};

export default function PlanModal({
    modalVisible,
    setModalVisible,
    mealPlan,
    previewDay,
    setPreviewDay,
    navigateToRecipe,
    isSaved,
    onSave,
    onDelete,
  }: PlanModalProps) {


   

    const DayChip = ({
        dayNum,
        selected,
        onPress,
      }: {
        dayNum: number;
        selected: boolean;
        onPress: () => void;
      }) => (
        <Pressable
          onPress={onPress}
          style={[
            styles.DayChip,
            selected ? styles.DayChipSelected : styles.DayChipUnselected,
          ]}
        >
          <Text style={[styles.DayChipText, selected && styles.DayChipTextSelected]}>
            {dayNum}
          </Text>
        </Pressable>
      );  



      return (
        <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
     
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalCard}>
          <SafeAreaView style={{ width: "100%" }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorScroll}>
              <View style={styles.daySelectorView}>
                {(mealPlan?.days ?? []).map((d) => (
                  <DayChip
                    key={d.day}
                    dayNum={d.day}
                    selected={previewDay === d.day}
                    onPress={() => setPreviewDay(d.day)}
                  />
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
            <Text style={styles.textModal}>{mealPlan?.summary}</Text>
            <FlatList
              data={
                (mealPlan?.days ?? [])
                  .filter((d) => d.day === previewDay)
                  .flatMap((d) => d.meals ?? [])
              }
              numColumns={2}
              columnWrapperStyle={styles.mealRow}
              keyExtractor={(item, index) => `${item.mealType}-${item.recipe?.id ?? "none"}-${index}`}
              extraData={previewDay}
              contentContainerStyle={styles.mealList}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  onNavigate={(recipeId, title, image) => {
                    navigateToRecipe(recipeId, title, image, () => setModalVisible(false));
                  }}
                />
              )}
            />



<View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton} >
              <Text>Close</Text>
              </TouchableOpacity>


            {mealPlan && !isSaved ? (
    <TouchableOpacity onPress={onSave} style={styles.saveButton} testID="save-plan-button" accessible={true}>
      <Text>Save</Text>
    </TouchableOpacity>
) : null}

{mealPlan && isSaved ? (
  <TouchableOpacity onPress={() => { onDelete(); setModalVisible(false); }} style={styles.deleteButton} testID="delete-plan-button" accessible={true}>
    <Text>Delete</Text>
  </TouchableOpacity>
) : null}
</View>
          </View>
        </View>
      </Modal>
      )
}

const styles = StyleSheet.create({
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
    textModal: {
      color: "black",
      fontSize: 24,
      marginBottom: 8,
    },
    daySelectorScroll: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      gap: 10,
    },
    daySelectorView: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    DayChip: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    DayChipSelected: {
      backgroundColor: "#3981f6",
      borderColor: "#3981f6",
    },
    DayChipUnselected: {
      backgroundColor: "#f5f5f5",
      borderColor: "#e4e8ef",
    },
    DayChipText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#4b5666",
    },
    DayChipTextSelected: {
      color: "#ffffff",
    },
    mealRow: {
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    mealList: {
      paddingVertical: 8,
    },
    saveButton: {
      backgroundColor: "#2ecc71",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
      paddingHorizontal: 12,
    },
    deleteButton: {
      backgroundColor: "#f14444",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
      paddingHorizontal: 12,
    },
    closeButton: {
      backgroundColor: "#6c727e",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
      paddingHorizontal: 12,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      gap: 10,
    },

})