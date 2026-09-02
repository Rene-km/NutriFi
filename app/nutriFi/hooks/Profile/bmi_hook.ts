import { supabase } from '@/lib/supabase';
import React, { use, useState } from 'react'

export type BMIResult = {
    bmi: number;
    category: string;
    categoryColor: string;
  };

const useBMIHook = () => {
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [unit, setUnit] = useState<"metric" | "imperial">("metric");
    const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
    const [isSaved, setIsSaved] = useState(false);
  
    const calculateBMI = () => {
      if (!weight || !height) {
        alert("Please enter both weight and height");
        return;
      }

      let bmi: number;

      if (unit === "metric") {
        // BMI = weight (kg) / (height (m))^2
        const heightInMeters = parseFloat(height) / 100;
        bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
      } else {
        // BMI = (weight (lbs) / (height (inches))^2) * 703
        bmi = (parseFloat(weight) / (parseFloat(height) * parseFloat(height))) * 703;
      }
  
      bmi = Math.round(bmi * 10) / 10;
  
      let category: string;
      let categoryColor: string;
  
      if (bmi < 18.5) {
        category = "Underweight";
        categoryColor = "#3498db";
      } else if (bmi < 25) {
        category = "Normal Weight";
        categoryColor = "#2ecc71";
      } else if (bmi < 30) {
        category = "Overweight";
        categoryColor = "#f39c12";
      } else {
        category = "Obese";
        categoryColor = "#e74c3c";
      }
  
      setBmiResult({ bmi, category, categoryColor });
      setIsSaved(false);
    };
  
    const saveBMIToProfile = async () => {
      if (!bmiResult) return;
  
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
  
        if (!user) {
          alert("You must be logged in to save");
          return;
        }
  
        const { error } = await supabase
          .from("profile")
          .update({
            bmi: bmiResult.bmi,
            weight_kg: unit === "metric" ? parseFloat(weight) : parseFloat(weight) * 0.4536,
            height_cm: unit === "metric" ? parseFloat(height) : parseFloat(height) * 2.54,
            unit: unit,
            bmi_updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
  
        if (error) {
          alert("Error saving BMI: " + error.message);
          return;
        }
  
        setIsSaved(true);
        alert("BMI saved successfully!");
      } catch (error) {
        console.error("Error saving BMI:", error);
        alert("Failed to save BMI");
      }
    };
  
    const resetForm = () => {
      setWeight("");
      setHeight("");
      setBmiResult(null);
      setIsSaved(false);
    };
  
  return { weight, height, unit, bmiResult, isSaved,
     calculateBMI, saveBMIToProfile, resetForm,
     setUnit, setWeight, setHeight }
}

export default useBMIHook