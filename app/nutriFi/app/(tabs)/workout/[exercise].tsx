import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import useWorkoutDetailHook from "../../../hooks/Workout/workout_deatil_hook";
import WorkoutDetailView from "@/components/Workout/WorkoutDetailView";

export default function Exercise() {
  const { exercise, exerciseDetail } = useWorkoutDetailHook();

  if (!exercise) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3981f6" />
      </View>
    );
  }

  return (
    <WorkoutDetailView
      exercise={exercise}
      exerciseDetail={exerciseDetail}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});