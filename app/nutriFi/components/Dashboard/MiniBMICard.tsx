import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

type BMIData = {
  bmi: number;
  category: string;
  categoryColor: string;
  weight: number;
  height: number;
  unit: string;
};

export default function MiniBMICard() {
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBMIData();
  }, []);

  const loadBMIData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profile")
        .select("bmi, weight_kg, height_cm, unit")
        .eq("id", user.id)
        .single();

      if (error || !profile || !profile.bmi) {
        setLoading(false);
        return;
      }

      let category: string;
      let categoryColor: string;

      if (profile.bmi < 18.5) {
        category = "Underweight";
        categoryColor = "#3498db";
      } else if (profile.bmi < 25) {
        category = "Normal";
        categoryColor = "#2ecc71";
      } else if (profile.bmi < 30) {
        category = "Overweight";
        categoryColor = "#f39c12";
      } else {
        category = "Obese";
        categoryColor = "#e74c3c";
      }

      setBmiData({
        bmi: profile.bmi,
        category,
        categoryColor,
        weight: profile.weight_kg,
        height: profile.height_cm,
        unit: profile.unit || "metric",
      });
    } catch (error) {
      console.error("Error loading BMI data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push("/bmi")}
      activeOpacity={0.8}
    >
      {bmiData ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>BMI Status 📊</Text>
            <Text style={styles.updatePrompt}>Tap to update</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.bmiDisplay}>
              <Text style={[styles.bmiValue, { color: bmiData.categoryColor }]}>
                {bmiData.bmi}
              </Text>
              <Text style={[styles.category, { color: bmiData.categoryColor }]}>
                {bmiData.category}
              </Text>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>
                  {bmiData.weight} {bmiData.unit === "metric" ? "kg" : "lbs"}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Height</Text>
                <Text style={styles.statValue}>
                  {bmiData.height} {bmiData.unit === "metric" ? "cm" : "in"}
                </Text>
              </View>
            </View>
          </View>

          {/* Mini Chart */}
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
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>BMI Status 📊</Text>
          </View>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>No BMI data yet</Text>
            <Text style={styles.emptySubtext}>Tap to calculate your BMI</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  updatePrompt: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  content: {
    marginBottom: 12,
  },
  bmiDisplay: {
    alignItems: "center",
    marginBottom: 12,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  category: {
    fontSize: 14,
    fontWeight: "600",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#eee",
  },
  chart: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  chartBar: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    height: 16,
    marginBottom: 6,
  },
  chartSegment: {
    flex: 1,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartLabel: {
    fontSize: 9,
    color: "#999",
    fontWeight: "600",
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#999",
  },
});