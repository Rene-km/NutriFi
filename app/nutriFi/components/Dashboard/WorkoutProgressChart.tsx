import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import useWorkoutProgressHook from "@/hooks/Workout/workout_progress_hook";
import { SmoothCurveChart } from "./SmoothCurveChart";

const CHART_HEIGHT = 180;

export function WorkoutProgressChart() {
  const {
    loading,
    error,
    chartData,
    selectedDay,
    setSelectedDay,
    allExercises,
    exerciseColors,
    dayTotals,
    maxTotal,
    exerciseTrends,
  } = useWorkoutProgressHook();

  const [showTrends, setShowTrends] = useState(false);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No workout data for the past 7 days</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Main Bar Chart ── */}
      <View style={styles.mainChartSection}>
        <Text style={styles.title}>Overall Workout Trend</Text>

        <View style={styles.barsRow}>
          {dayTotals.map((day) => {
            const barHeight = maxTotal > 0
              ? (day.total / maxTotal) * CHART_HEIGHT
              : 0;
            const isSelected = selectedDay?.date === day.date;

            return (
              <Pressable
                key={day.date}
                onPress={() => setSelectedDay(isSelected ? null : day)}
                style={styles.barColumn}
              >
                <View style={styles.barSpacer} pointerEvents="none" />

                <View
                  pointerEvents="none"
                  style={[
                    styles.bar,
                    { height: Math.max(barHeight, 6) },
                    isSelected ? styles.barSelected : styles.barDefault,
                  ]}
                >
                  {day.total > 0 && (
                    <Text style={styles.barValue}>{day.total}</Text>
                  )}
                </View>

                <Text
                  pointerEvents="none"
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected,
                  ]}
                >
                  {day.dayOfWeek}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.chartHint}>
          {selectedDay ? "Tap again to close" : "Tap a bar to see breakdown"}
        </Text>
      </View>

      {/* ── Inline Breakdown Panel ── */}
      {!!selectedDay && (
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {selectedDay.dayOfWeek}
              <Text style={styles.sheetTotalInline}>
                {"  ·  "}{selectedDay.total} reps
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedDay(null)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeButton}>✕ close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exerciseList}>
            {!selectedDay.exercises || selectedDay.exercises.length === 0 ? (
              <View style={styles.restDayContainer}>
                <Text style={styles.restDayEmoji}>🛌</Text>
                <Text style={styles.restDayText}>Rest day — no workouts logged</Text>
              </View>
            ) : (
              selectedDay.exercises.map((exercise) => {
                const pct =
                  selectedDay.total > 0
                    ? (exercise.reps / selectedDay.total) * 100
                    : 0;
                return (
                  <View key={exercise.name} style={styles.exerciseRow}>
                    <View style={styles.exerciseRowTop}>
                      <View
                        style={[
                          styles.exerciseDot,
                          { backgroundColor: exerciseColors[exercise.name] ?? "#888" },
                        ]}
                      />
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseReps}>{exercise.reps} reps</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: exerciseColors[exercise.name] ?? "#888",
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {selectedDay.exercises && selectedDay.exercises.length > 0 && (
            <View style={styles.sheetTotalRow}>
              <Text style={styles.sheetTotalLabel}>Total</Text>
              <Text style={styles.sheetTotalValue}>{selectedDay.total} reps</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Collapsible Exercise Trends ── */}
      <View style={styles.trendsCard}>
        {/* Toggle header */}
        <Pressable
          style={styles.trendsHeader}
          onPress={() => setShowTrends((prev) => !prev)}
        >
          <Text style={styles.trendsTitle}>Exercise Trends</Text>
          <Text style={styles.trendsToggle}>
            {showTrends ? "Hide ▴" : "Show ▾"}
          </Text>
        </Pressable>

        {/* Expandable content */}
        {showTrends && (
          <>
            <View style={styles.trendsDivider} />

            <View style={styles.miniChartsGrid}>
              {exerciseTrends.map((exercise) => (
                <View key={exercise.name} style={styles.miniChartCard}>
                  <View style={styles.miniChartHeader}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: exerciseColors[exercise.name] },
                      ]}
                    />
                    <Text style={styles.miniChartTitle}>{exercise.name}</Text>
                  </View>
                  <SmoothCurveChart
                    data={exercise.data}
                    max={exercise.max}
                    color={exerciseColors[exercise.name]}
                    height={100}
                  />
                  <Text style={styles.miniChartStats}>
                    Peak: {exercise.max} reps
                  </Text>
                </View>
              ))}
            </View>

            {/* Legend inside the card */}
            <View style={styles.legendContainer}>
              <View style={styles.legendGrid}>
                {allExercises.map((exercise) => (
                  <View key={exercise} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: exerciseColors[exercise] },
                      ]}
                    />
                    <Text style={styles.legendText}>{exercise}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },

  /* ── Main chart ── */
  mainChartSection: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1f2937",
  },

  barsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    height: CHART_HEIGHT + 40,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  barSpacer: {
    flex: 1,
    width: "100%",
  },
  bar: {
    width: 36,
    borderRadius: 6,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 6,
  },
  barDefault: { backgroundColor: "#3b82f6" },
  barSelected: { backgroundColor: "#f59e0b" },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 2,
  },
  dayLabelSelected: {
    color: "#f59e0b",
    fontWeight: "700",
  },
  chartHint: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  /* ── Inline breakdown ── */
  sheet: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sheetTitle: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  sheetTotalInline: { fontSize: 15, fontWeight: "400", color: "#6b7280" },
  closeButton: { fontSize: 13, color: "#3b82f6", fontWeight: "600" },

  exerciseList: { gap: 14, marginBottom: 16 },
  exerciseRow: { gap: 6 },
  exerciseRowTop: { flexDirection: "row", alignItems: "center" },
  exerciseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  exerciseName: { flex: 1, fontSize: 14, color: "#374151", fontWeight: "500" },
  exerciseReps: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  progressTrack: {
    height: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 2,
    overflow: "hidden",
    marginLeft: 18,
  },
  progressFill: { height: "100%", borderRadius: 2 },

  restDayContainer: { alignItems: "center", paddingVertical: 20, gap: 8 },
  restDayEmoji: { fontSize: 32 },
  restDayText: { fontSize: 14, color: "#9ca3af" },

  sheetTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  sheetTotalLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  sheetTotalValue: { fontSize: 16, fontWeight: "700", color: "#3b82f6" },

  /* ── Collapsible trends card ── */
  trendsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  trendsHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  trendsToggle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3b82f6",
    position: "absolute",
    right: 16,
  },
  trendsDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },

  /* ── Mini charts (inside collapsible) ── */
  miniChartsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 12,
  },
  miniChartCard: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  miniChartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  colorDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  miniChartTitle: { fontSize: 11, fontWeight: "600", color: "#374151" },
  miniChartStats: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },

  /* ── Legend (inside collapsible) ── */
  legendContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 4,
  },
  legendColor: { width: 10, height: 10, borderRadius: 2, marginRight: 5 },
  legendText: { fontSize: 11, color: "#6b7280" },

  /* ── Error / empty ── */
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  emptyText: { color: "#6b7280", fontSize: 14, textAlign: "center", paddingVertical: 32 },
});