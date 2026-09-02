import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { type Streak } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useWeeklyGoals } from "@/hooks/Dashboard/useWeeklyGoals";
import WeeklyGoalsCard from "@/components/Dashboard/WeeklyGoalsCard";
import { AllTimeByExerciseChart } from "@/components/Dashboard/AllTimeByExerciseChart";
import { WorkoutProgressChart } from "@/components/Dashboard/WorkoutProgressChart";
import Streaks from "@/components/Dashboard/Streaks";
import MiniBMICard from "@/components/Dashboard/MiniBMICard";

type Exercise = {
  id: string;
  name: string;
};

type IndexPageProps = {
  streaks: Streak | undefined;
  profileId: string | null;
  exercises: Exercise[];
  handleLogout: () => void;
};

function MetricTile({
  value,
  label,
  delta,
  color,
}: {
  value: string;
  label: string;
  delta: string;
  color: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Text style={[styles.metricVal, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDelta}>{delta}</Text>
    </View>
  );
}

const RING_COLORS = [
  "#1D9E75",
  "#EF9F27",
  "#378ADD",
  "#7F77DD",
  "#D85A30",
  "#D4537E",
];

const IndexPage = ({
  streaks,
  profileId,
  exercises,
  handleLogout,
}: IndexPageProps) => {
  const [accountName, setAccountName] = useState<string>("");

  const { goals, loading, refresh, addGoal, removeGoal } =
    useWeeklyGoals(profileId);

  useFocusEffect(
    useCallback(() => {
      if (profileId) refresh();
    }, [profileId, refresh])
  );

  useEffect(() => {
    const loadAccountName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from("profile")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileData?.full_name) {
        setAccountName(profileData.full_name);
        return;
      }

      if (user.email) {
        setAccountName(user.email.split("@")[0]);
      }
    };

    loadAccountName();
  }, []);

  const averageGoalProgress =
    goals.length > 0
      ? `${Math.round(
          goals.reduce((sum, goal) => sum + goal.percent, 0) / goals.length
        )}%`
      : "—";

  const welcomeName = accountName.trim() || "there";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Welcome back, {welcomeName}</Text>
          <Text style={styles.pageSub}>
            Track your workouts, monitor progress, and stay on top of your
            goals.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricStrip}>
        <MetricTile
          value={String(streaks?.total ?? 0)}
          label="Total workouts"
          delta="All time"
          color="#1D9E75"
        />

        <MetricTile
          value={String(streaks?.streak ?? 0)}
          label="Current streak"
          delta={`Best: ${streaks?.bestStreak ?? 0}`}
          color="#D4537E"
        />

        <MetricTile
          value={String(goals.length)}
          label="Active goals"
          delta="This week"
          color="#378ADD"
        />

        <MetricTile
          value={averageGoalProgress}
          label="Goals progress"
          delta="Weekly average"
          color="#EF9F27"
        />
      </View>

      <View style={styles.twoCol}>
        <View style={styles.leftCol}>
          <Streaks
            streak={streaks?.streak ?? 0}
            bestStreak={streaks?.bestStreak ?? 0}
            total={streaks?.total ?? 0}
          />

          <WorkoutProgressChart />
        </View>

        <View style={styles.rightCol}>
          <MiniBMICard />

          {profileId && (
            <WeeklyGoalsCard
              goals={goals}
              loading={loading}
              profileId={profileId}
              exercises={exercises}
              onAddGoal={addGoal}
              onRemoveGoal={removeGoal}
            />
          )}

          {goals.length > 0 && (
            <View style={styles.glanceCard}>
              <Text style={styles.glanceTitle}>This week at a glance</Text>

              {goals.map((goal, index) => (
                <View key={goal.id} style={styles.glanceRow}>
                  <View style={styles.glanceLeft}>
                    <View
                      style={[
                        styles.glanceDot,
                        {
                          backgroundColor:
                            RING_COLORS[index % RING_COLORS.length],
                        },
                      ]}
                    />
                    <Text style={styles.glanceName}>
                      {goal.exercise_name}
                    </Text>
                  </View>

                  <Text style={styles.glancePct}>{goal.percent}%</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {profileId && (
        <View style={styles.fullWidthChart}>
          <AllTimeByExerciseChart profileId={profileId} />
        </View>
      )}

      <View style={{ height: 36 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  pageHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fffafa",
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ef4444",
  },
  metricStrip: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricTile: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  metricVal: {
    fontSize: 28,
    fontWeight: "600",
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
  },
  metricDelta: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
  twoCol: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  rightCol: {
    width: 390,
    flexShrink: 0,
    gap: 14,
  },
  glanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  glanceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  glanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  glanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  glanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  glanceName: {
    fontSize: 13,
    color: "#111827",
  },
  glancePct: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  fullWidthChart: {
    width: "100%",
    marginTop: 16,
  },
});

export default IndexPage;