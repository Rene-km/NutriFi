import React, { useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import { type Streak } from "@/lib/api";
import { AllTimeByExerciseChart } from "@/components/Dashboard/AllTimeByExerciseChart";
import Streaks from "@/components/Dashboard/Streaks";
import MiniBMICard from "@/components/Dashboard/MiniBMICard";
import { WorkoutProgressChart } from "@/components/Dashboard/WorkoutProgressChart";
import { useWeeklyGoals } from "@/hooks/Dashboard/useWeeklyGoals";
import WeeklyGoalsCard from "@/components/Dashboard/WeeklyGoalsCard";

type Exercise = { id: string; name: string };

type IndexPageProps = {
  streaks: Streak | undefined;
  profileId: string | null;
  exercises: Exercise[];
  handleLogout: () => void;
};

const IndexPage = ({ streaks, profileId, exercises, handleLogout }: IndexPageProps) => {
  const { goals, loading, refresh, addGoal, removeGoal } = useWeeklyGoals(profileId);

  // Fetch goal progress when profileId becomes available
  useEffect(() => {
    if (profileId) refresh();
  }, [profileId]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerSection}>
        <Text style={styles.welcomeTitle}>Welcome to NutriFi</Text>
        <Text style={styles.welcomeSubtitle}>
          Track your workouts, monitor your progress, and get AI-powered meal
          recommendations all in one place.
        </Text>
      </View>

      {/* Streaks Section */}
      <Streaks
        streak={streaks?.streak ?? 0}
        bestStreak={streaks?.bestStreak ?? 0}
        total={streaks?.total ?? 0}
      />

      {/* Weekly Goals Card — sits below Streaks, above BMI */}
      {profileId && (
        <View style={styles.contentSection}>
          <WeeklyGoalsCard
            goals={goals}
            loading={loading}
            profileId={profileId}
            exercises={exercises}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
          />
        </View>
      )}

      {/* BMI Card Section */}
      <View style={styles.contentSection}>
        <MiniBMICard />
      </View>

      {/* 7-Day Workout Progress Chart */}
      <View style={styles.chartSection}>
        <WorkoutProgressChart />
      </View>

      {/* All-Time Exercise Progress Chart */}
      {profileId && (
        <View style={styles.chartSection}>
          <AllTimeByExerciseChart profileId={profileId} />
        </View>
      )}

      {/* Logout Button */}
      <View style={styles.footerSection}>
        <Button title="Log out" onPress={handleLogout} color="#ef4444" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingVertical: 24,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6b7280",
  },
  contentSection: {
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  chartSection: {
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 24,
  },
});

export default IndexPage;