import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  ActivityIndicator
} from "react-native";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { mealPlanResult } from "@/utils/utils";
import BottomSheetSelector from "../BottomSheet";
import PlanModal from "./PlanModal";
import useMealPlanHook from "@/hooks/Recipe/meal_plan_hook";

type MealViewProps = {
  onGenerateMealPlan: (data: MealPlanInputs) => void | Promise<void>;
  mealPlan: mealPlanResult | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  profile:  string| null;
  containerStyle: StyleProp<ViewStyle>;
  inputStyle: StyleProp<TextStyle>;
  isMealPlanLoading: boolean;
};

type MealPlanInputs = {
  goal: string;
  days: "1" | "2" | "3";
  mealsPerDay: "2" | "3" | "4";
  anythingElse: string;
};

export default function MealView({
  onGenerateMealPlan,
  mealPlan,
  modalVisible,
  setModalVisible,
  profile,
  containerStyle,
  inputStyle,
  isMealPlanLoading,
}: MealViewProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MealPlanInputs>({
    defaultValues: {
      goal: "",
      days: "1",
      mealsPerDay: "2",
      anythingElse: "",
    },
  });

  const { previewDay, setPreviewDay, onSubmit, navigateToRecipe, isSaved, handleSavePlan, handleDeletePlan } = useMealPlanHook({
    mealPlan,
    modalVisible,
    profile,
    onGenerateMealPlan,
  });

  return (
    <View style={containerStyle}>
       <Text style={styles.label}>Meals plan details</Text>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="meal-plan-details-input"
            placeholder="High protein diet"
            placeholderTextColor="#6b7280"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={inputStyle}
          />
        )}
        name="goal"
      />

      <Text style={styles.label}>Number of days</Text>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <BottomSheetSelector
            testID="meal-plan-days-selector"
            label="Choose days"
            selectedValue={value}
            options={["1", "2", "3"]}
            onSelect={(selected) => onChange(selected as MealPlanInputs["days"])}
          />
        )}
        name="days"
      />

     <Text style={styles.label}>Meals per day</Text>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <BottomSheetSelector
          testID="meal-plan-meals-per-day-selector"
          label="Meals per day"
          selectedValue={value}
          options={["2", "3", "4"]}
          onSelect={(selected) => onChange(selected as MealPlanInputs["mealsPerDay"])}
        />
        )}
        name="mealsPerDay"
      />

       <Text style={styles.label}>Extra details/allergies</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="extra-details-input"
            placeholder="Allergic to nuts"
            placeholderTextColor="#6b7280"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={inputStyle}
          />
        )}
        name="anythingElse"
      />
      {errors.goal && <Text>This field is required</Text>}

      {isMealPlanLoading ? (
        <ActivityIndicator size="large" color="#3981f6" />
      ) : (
        <Pressable testID="generate-plan-button" onPress={handleSubmit(onSubmit)} 
        accessible={true} style={styles.btn}>
        <Text style={styles.btnText}>Generate Plan</Text></Pressable>
      )}
      {mealPlan ?
      <Pressable testID="preview-plan-button" onPress={() => setModalVisible(true)} 
      accessible={true} style={styles.previewBtn}>
      <Text style={styles.previewBtnText}>Preview meal plan</Text>
    </Pressable>
      : null}

     <PlanModal
     modalVisible={modalVisible}
     setModalVisible={setModalVisible}
     mealPlan={mealPlan} 
     previewDay={previewDay}
     setPreviewDay={setPreviewDay}
     navigateToRecipe={navigateToRecipe}
     isSaved={isSaved}
     onSave={handleSavePlan}
     onDelete={handleDeletePlan}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    color: "#1d1d1d",
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "#3981f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3981f6",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: "#fff",
  },
  previewBtn: {
    marginTop: 12,
    backgroundColor: "#3981f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3981f6",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  previewBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});