import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { BMIResult } from "@/hooks/Profile/bmi_hook";


type Unit = "metric" | "imperial";

type BMIProps = {
  weight: string;
  setWeight: (weight: string) => void;
  height: string;
  setHeight: (height: string) => void;
  unit: Unit;
  setUnit: (unit: Unit) => void;
  bmiResult: BMIResult | null;
  isSaved: boolean;
  calculateBMI: () => void;
  saveBMIToProfile: () => void;
  resetForm: () => void;
}
const BMICalculator = ({ weight, height, unit, bmiResult, isSaved,
     calculateBMI, saveBMIToProfile, resetForm, 
     setUnit, setWeight, setHeight }: BMIProps) => {
  return (
    <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>BMI Calculator </Text>
      <Text style={styles.subtitle}>
        Calculate your Body Mass Index and track your health
      </Text>
    </View>

    {/* Unit Toggle */}
    <View style={styles.unitToggle}>
      <TouchableOpacity
        onPress={() => setUnit("metric")}
        style={[
          styles.unitButton,
          unit === "metric" && styles.unitButtonActive,
        ]}
      >
        <Text
          style={[
            styles.unitButtonText,
            unit === "metric" && styles.unitButtonTextActive,
          ]}
        >
          Metric (kg/cm)
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setUnit("imperial")}
        style={[
          styles.unitButton,
          unit === "imperial" && styles.unitButtonActive,
        ]}
      >
        <Text
          style={[
            styles.unitButtonText,
            unit === "imperial" && styles.unitButtonTextActive,
          ]}
        >
          Imperial (lbs/in)
        </Text>
      </TouchableOpacity>
    </View>

    {/* Input Fields */}
    <View style={styles.inputSection}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Weight ({unit === "metric" ? "kg" : "lbs"})
        </Text>
        <TextInput
          style={styles.input}
          placeholder={unit === "metric" ? "e.g., 70" : "e.g., 154"}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          editable={!isSaved}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Height ({unit === "metric" ? "cm" : "inches"})
        </Text>
        <TextInput
          style={styles.input}
          placeholder={unit === "metric" ? "e.g., 175" : "e.g., 69"}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          editable={!isSaved}
        />
      </View>
    </View>

    {/* Calculate Button */}
    <TouchableOpacity
      style={styles.calculateButton}
      onPress={calculateBMI}
      disabled={isSaved}
    >
      <Text style={styles.calculateButtonText}>Calculate BMI</Text>
    </TouchableOpacity>

    {/* Results */}
    {bmiResult && (
      <View style={[styles.resultContainer, { borderColor: bmiResult.categoryColor }]}>
        <Text style={styles.resultLabel}>Your BMI</Text>
        <Text style={[styles.bmiValue, { color: bmiResult.categoryColor }]}>
          {bmiResult.bmi}
        </Text>
        <Text style={[styles.categoryText, { color: bmiResult.categoryColor }]}>
          {bmiResult.category}
        </Text>

        {/* BMI Chart */}
        <View style={styles.chart}>
          <View style={styles.chartBar}>
            <View style={[styles.chartSegment, { backgroundColor: "#3498db", flex: 1 }]} />
            <View style={[styles.chartSegment, { backgroundColor: "#2ecc71", flex: 1 }]} />
            <View style={[styles.chartSegment, { backgroundColor: "#f39c12", flex: 1 }]} />
            <View style={[styles.chartSegment, { backgroundColor: "#e74c3c", flex: 1 }]} />
          </View>
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>Under 18.5</Text>
            <Text style={styles.chartLabel}>18.5-25</Text>
            <Text style={styles.chartLabel}>25-30</Text>
            <Text style={styles.chartLabel}>30+</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaved && styles.saveButtonDisabled]}
          onPress={saveBMIToProfile}
          disabled={isSaved}
        >
          <Text style={styles.saveButtonText}>
            {isSaved ? "✓ Saved to Profile" : "Save to Profile"}
          </Text>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetForm}
        >
          <Text style={styles.resetButtonText}>Calculate Again</Text>
        </TouchableOpacity>
      </View>
    )}

    {/* Info Section */}
    <View style={styles.infoSection}>
      <Text style={styles.infoTitle}>What is BMI?</Text>
      <Text style={styles.infoText}>
        Body Mass Index (BMI) is a measure of body fat based on height and weight. It's commonly used as a screening tool for health risks.
      </Text>
      <Text style={styles.infoSubtitle}>BMI Categories:</Text>
      <View style={styles.infoItem}>
        <Text style={[styles.infoDot, { color: "#3498db" }]}>●</Text>
        <Text style={styles.infoLabel}>Underweight: BMI below 18.5</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={[styles.infoDot, { color: "#2ecc71" }]}>●</Text>
        <Text style={styles.infoLabel}>Normal: BMI 18.5 - 24.9</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={[styles.infoDot, { color: "#f39c12" }]}>●</Text>
        <Text style={styles.infoLabel}>Overweight: BMI 25.0 - 29.9</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={[styles.infoDot, { color: "#e74c3c" }]}>●</Text>
        <Text style={styles.infoLabel}>Obese: BMI 30.0 and above</Text>
      </View>
    </View>
  </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
      padding: 16,
    },
    header: {
      marginBottom: 24,
      marginTop: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: "#666",
    },
    unitToggle: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    unitButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#fff",
    },
    unitButtonActive: {
      backgroundColor: "#2ecc71",
      borderColor: "#27ae60",
    },
    unitButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#666",
      textAlign: "center",
    },
    unitButtonTextActive: {
      color: "#fff",
    },
    inputSection: {
      gap: 16,
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1a1a1a",
      marginBottom: 6,
    },
    input: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    calculateButton: {
      backgroundColor: "#2ecc71",
      paddingVertical: 14,
      borderRadius: 8,
      marginBottom: 24,
    },
    calculateButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    resultContainer: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      borderLeftWidth: 4,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    resultLabel: {
      fontSize: 14,
      color: "#999",
      fontWeight: "600",
      marginBottom: 8,
    },
    bmiValue: {
      fontSize: 48,
      fontWeight: "700",
      marginBottom: 4,
    },
    categoryText: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
    },
    chart: {
      marginVertical: 16,
    },
    chartBar: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden",
      height: 24,
      marginBottom: 8,
    },
    chartSegment: {
      flex: 1,
    },
    chartLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    chartLabel: {
      fontSize: 10,
      color: "#999",
      fontWeight: "600",
    },
    saveButton: {
      backgroundColor: "#2ecc71",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    saveButtonDisabled: {
      backgroundColor: "#27ae60",
    },
    resetButton: {
      backgroundColor: "#ecf0f1",
      paddingVertical: 12,
      borderRadius: 8,
    },
    resetButtonText: {
      color: "#333",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    infoSection: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
      marginBottom: 12,
    },
    infoSubtitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1a1a1a",
      marginBottom: 8,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      gap: 8,
    },
    infoDot: {
      fontSize: 16,
    },
    infoLabel: {
      fontSize: 13,
      color: "#555",
      flex: 1,
    },
  });

export default BMICalculator