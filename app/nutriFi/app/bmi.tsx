import useBMIHook from "@/hooks/Profile/bmi_hook";
import BMICalculator from "@/components/Profile/BMI";

export default function BMI() {
  const { weight, height, unit, bmiResult, isSaved,
    calculateBMI, saveBMIToProfile, resetForm,
    setUnit, setWeight, setHeight } = useBMIHook();
 
  return (
    <BMICalculator weight={weight} height={height} unit={unit} bmiResult={bmiResult} isSaved={isSaved}
    calculateBMI={calculateBMI} saveBMIToProfile={saveBMIToProfile} resetForm={resetForm}
    setUnit={setUnit} setWeight={setWeight} setHeight={setHeight} />
  );
}

