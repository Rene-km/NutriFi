import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface WorkoutRecord {
  id: string;
  date: string;
  reps: number;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
}

export default function ExerciseHistory() {
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReps: 0,
    bestDay: 0,
    totalWorkouts: 0,
    avgReps: 0,
  });

  useEffect(() => {
    const loadExerciseHistory = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Get all workouts for this exercise
        const { data, error } = await supabase
          .from("workout_session")
          .select(
            `
            id,
            started_at,
            reps,
            duration_minutes,
            calories_burned,
            notes,
            exercise:exercise_id(name)
          `
          )
          .eq("profile_id", user.id)
          .order("started_at", { ascending: false });

        if (error) {
          console.error("Error loading history:", error);
          return;
        }

        // Filter for this exercise
        const exerciseWorkouts = (data as any[])
          .filter((w) => w.exercise?.name === exercise)
          .map((w) => ({
            id: w.id,
            date: new Date(w.started_at).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            reps: w.reps ?? 0,
            duration_minutes: w.duration_minutes,
            calories_burned: w.calories_burned,
            notes: w.notes,
          }));

        setWorkouts(exerciseWorkouts);

        // Calculate stats
        const totalReps = exerciseWorkouts.reduce((sum, w) => sum + w.reps, 0);
        const bestDay = Math.max(...exerciseWorkouts.map((w) => w.reps), 0);
        const avgReps =
          exerciseWorkouts.length > 0
            ? Math.round(totalReps / exerciseWorkouts.length)
            : 0;

        setStats({
          totalReps,
          bestDay,
          totalWorkouts: exerciseWorkouts.length,
          avgReps,
        });
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadExerciseHistory();
  }, [exercise]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>{exercise}</Text>
        <Text style={styles.subtitle}>Workout History</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Reps</Text>
          <Text style={styles.statValue}>{stats.totalReps}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best Day</Text>
          <Text style={styles.statValue}>{stats.bestDay}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Reps</Text>
          <Text style={styles.statValue}>{stats.avgReps}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Workouts</Text>
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
        </View>
      </View>

      {/* Workout List */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Recent Workouts</Text>
        {workouts.length === 0 ? (
          <Text style={styles.emptyText}>No workouts recorded</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={workouts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.workoutItem}>
                <View style={styles.workoutDate}>
                  <Text style={styles.workoutDateText}>{item.date}</Text>
                </View>
                <View style={styles.workoutDetails}>
                  <Text style={styles.repsText}>{item.reps} reps</Text>
                  {item.duration_minutes && (
                    <Text style={styles.detailText}>
                      {item.duration_minutes} mins
                    </Text>
                  )}
                  {item.calories_burned && (
                    <Text style={styles.detailText}>
                      {item.calories_burned} cal
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={styles.notesText}>{item.notes}</Text>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b82f6",
  },
  listSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  workoutItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  workoutDate: {
    marginRight: 16,
    justifyContent: "center",
  },
  workoutDateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    width: 70,
  },
  workoutDetails: {
    flex: 1,
  },
  repsText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 32,
  },
});