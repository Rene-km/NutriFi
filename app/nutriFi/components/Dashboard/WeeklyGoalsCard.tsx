import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { GoalProgressUI, GoalStatus } from "@/hooks/Dashboard/useWeeklyGoals";
import { CreateWeeklyGoalInput } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Exercise = { id: string; name: string };

type Props = {
  goals: GoalProgressUI[];
  loading: boolean;
  profileId: string;
  exercises: Exercise[];
  onAddGoal: (input: CreateWeeklyGoalInput) => Promise<{ error: unknown }>;
  onRemoveGoal: (goalId: string) => Promise<{ error: unknown }>;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REP_INTERVALS = [10, 25, 50, 75, 100];

const RING_COLORS = [
  "#1D9E75", "#EF9F27", "#378ADD", "#7F77DD", "#D85A30", "#D4537E",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGoalColor(index: number): string {
  return RING_COLORS[index % RING_COLORS.length];
}

function badgeProps(status: GoalStatus) {
  switch (status) {
    case "completed":
      return { label: "Complete", bg: "#E6F1FB", text: "#185FA5" };
    case "on_track":
      return { label: "On track", bg: "#E1F5EE", text: "#0F6E56" };
    case "behind":
      return { label: "Behind", bg: "#FAEEDA", text: "#854F0B" };
    default:
      return { label: "Not started", bg: "#F1EFE8", text: "#5F5E5A" };
  }
}

function getDayState(
  goal: GoalProgressUI,
  iso: number
): "done" | "missed" | "today" | "future" | "no_goal" {
  const todayIso = (() => {
    const wd = new Date().getUTCDay();
    return wd === 0 ? 7 : wd;
  })();

  const scheduled = goal.active_days.includes(iso);
  if (!scheduled) return "no_goal";

  const dailyTarget = goal.target_reps;

  if (iso === todayIso) {
    const repsToday = goal.reps_by_day[iso] ?? 0;
    return repsToday >= dailyTarget ? "done" : "today";
  }
  if (iso < todayIso) {
    const repsDone = goal.reps_by_day[iso] ?? 0;
    return repsDone >= dailyTarget ? "done" : "missed";
  }
  return "future";
}

// ---------------------------------------------------------------------------
// Ring chart
// ---------------------------------------------------------------------------

function GoalRings({
  goals,
  onRingTap,
}: {
  goals: GoalProgressUI[];
  onRingTap: (id: string) => void;
}) {
  const size = 130;
  const cx = size / 2;
  const cy = size / 2;
  const baseR = 52;
  const ringWidth = 8;
  const gap = 2;

  const overall =
    goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.percent, 0) / goals.length)
      : 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {goals.map((goal, i) => {
        const r = baseR - i * (ringWidth + gap);
        const circumference = 2 * Math.PI * r;
        const offset = circumference * (1 - goal.percent / 100);
        const color = getGoalColor(i);

        return (
          <React.Fragment key={goal.id}>
            <Circle
              cx={cx} cy={cy} r={r}
              fill="none" stroke="#E8E6DF" strokeWidth={ringWidth}
            />
            <Circle
              cx={cx} cy={cy} r={r}
              fill="none" stroke={color} strokeWidth={ringWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              rotation={-90} origin={`${cx}, ${cy}`}
              onPress={() => onRingTap(goal.id)}
            />
          </React.Fragment>
        );
      })}
      <SvgText
        x={cx} y={cy - 2} textAnchor="middle"
        fontSize={18} fontWeight="500" fill="#1a1a1a"
      >
        {overall}%
      </SvgText>
      <SvgText
        x={cx} y={cy + 14} textAnchor="middle"
        fontSize={9} fill="#888"
      >
        overall
      </SvgText>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Detail card
// ---------------------------------------------------------------------------

function GoalDetail({
  goal,
  color,
  onRemove,
}: {
  goal: GoalProgressUI;
  color: string;
  onRemove: () => void;
}) {
  const badge = badgeProps(goal.status);
  const dailyTarget = goal.target_reps;
  const weeklyTarget = goal.weekly_target;
  const displayReps = Math.min(goal.reps_this_week, weeklyTarget);

  return (
    <View style={styles.detail}>
      {/* Name + badge */}
      <View style={styles.detTop}>
        <Text style={[styles.detName, { color }]}>{goal.exercise_name}</Text>
        <View style={[styles.detBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.detBadgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Daily reps info */}
      <Text style={styles.detDaily}>
        {dailyTarget} reps daily · {goal.active_days.length} days/week
      </Text>

      {/* Progress bar */}
      <View style={styles.detMid}>
        <Text style={styles.detReps}>
          {displayReps} / {weeklyTarget} reps
        </Text>
        <Text style={styles.detPct}>{goal.percent}%</Text>
      </View>
      <View style={styles.progBg}>
        <View
          style={[
            styles.progFill,
            { width: `${goal.percent}%` as any, backgroundColor: color },
          ]}
        />
      </View>

      {/* Day dots */}
      <View style={styles.dotsRow}>
        {DAY_LABELS.map((lbl, idx) => {
          const iso = idx + 1;
          const state = getDayState(goal, iso);
          return (
            <View key={iso} style={styles.dotWrap}>
              <View
                style={[
                  styles.dot,
                  state === "done" && { backgroundColor: color },
                  state === "missed" && styles.dotMissed,
                  state === "today" && { backgroundColor: "#fff", borderWidth: 1.5, borderColor: color },
                  state === "future" && { backgroundColor: color + "22", borderWidth: 1, borderColor: color },
                  state === "no_goal" && styles.dotNoGoal,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    state === "done" && { color: "#fff" },
                    state === "missed" && { color: "#aaa" },
                    state === "today" && { color },
                    state === "future" && { color },
                    state === "no_goal" && { color: "#ddd" },
                  ]}
                >
                  {lbl}
                </Text>
              </View>
              <Text style={styles.dotLabel}>{DAY_FULL[idx]}</Text>
            </View>
          );
        })}
      </View>

      {/* Remove */}
      <TouchableOpacity onPress={onRemove} style={styles.removeWrap}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Add goal sheet
// ---------------------------------------------------------------------------

function AddGoalSheet({
  visible,
  exercises,
  profileId,
  onSave,
  onClose,
}: {
  visible: boolean;
  exercises: Exercise[];
  profileId: string;
  onSave: (input: CreateWeeklyGoalInput) => Promise<{ error: unknown }>;
  onClose: () => void;
}) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    exercises[0]?.id ?? null
  );
  const [targetReps, setTargetReps] = useState(25);
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set([1, 2, 4, 5]));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleDay = (iso: number) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      next.has(iso) ? next.delete(iso) : next.add(iso);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedExerciseId) return;
    if (activeDays.size === 0) {
      setSaveError("Please select at least one day.");
      return;
    }
    setSaving(true);
    setSaveError(null);

    const { error } = await onSave({
      profile_id: profileId,
      exercise_id: selectedExerciseId,
      target_reps: targetReps,
      active_days: Array.from(activeDays).sort(),
    });

    setSaving(false);
    if (error) {
      setSaveError("Failed to save goal. Please try again.");
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Set a weekly goal</Text>

          {/* Exercise picker */}
          <Text style={styles.formLabel}>Exercise</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {exercises.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => setSelectedExerciseId(ex.id)}
                style={[
                  styles.exercisePill,
                  selectedExerciseId === ex.id && styles.exercisePillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.exercisePillText,
                    selectedExerciseId === ex.id && styles.exercisePillTextSelected,
                  ]}
                >
                  {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Daily rep target */}
          <Text style={styles.formLabel}>Daily rep target</Text>
          <View style={styles.intervalGrid}>
            {REP_INTERVALS.map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => setTargetReps(val)}
                style={[
                  styles.intervalBtn,
                  targetReps === val && styles.intervalBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.intervalBtnText,
                    targetReps === val && styles.intervalBtnTextSelected,
                  ]}
                >
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Active days */}
          <Text style={[styles.formLabel, { marginTop: 14 }]}>Active days</Text>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((lbl, idx) => {
              const iso = idx + 1;
              const on = activeDays.has(iso);
              return (
                <TouchableOpacity
                  key={iso}
                  onPress={() => toggleDay(iso)}
                  style={[styles.dayToggle, on && styles.dayToggleOn]}
                >
                  <Text style={[styles.dayToggleText, on && styles.dayToggleTextOn]}>
                    {lbl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save goal</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WeeklyGoalsCard({
  goals,
  loading,
  profileId,
  exercises,
  onAddGoal,
  onRemoveGoal,
}: Props) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleTap = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectedGoal = goals.find((g) => g.id === selectedId) ?? null;
  const selectedIndex = goals.findIndex((g) => g.id === selectedId);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Weekly goals</Text>
        <TouchableOpacity
          style={styles.addGoalBtn}
          onPress={() => setSheetVisible(true)}
        >
          <Text style={styles.addGoalBtnText}>+ Add goal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} color="#1D9E75" />
      ) : goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No goals set for this week yet.</Text>
          <TouchableOpacity
            style={styles.setGoalBtn}
            onPress={() => setSheetVisible(true)}
          >
            <Text style={styles.setGoalBtnText}>Set a goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.ringRow}>
            <GoalRings goals={goals} onRingTap={handleTap} />
            <View style={styles.legendCol}>
              {goals.map((goal, i) => {
                const color = getGoalColor(i);
                const isSelected = selectedId === goal.id;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => handleTap(goal.id)}
                    style={[
                      styles.legendRow,
                      isSelected && styles.legendRowSelected,
                    ]}
                  >
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <Text style={styles.legendName}>{goal.exercise_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedGoal && selectedIndex >= 0 && (
            <GoalDetail
              goal={selectedGoal}
              color={getGoalColor(selectedIndex)}
              onRemove={() => {
                setSelectedId(null);
                onRemoveGoal(selectedGoal.id);
              }}
            />
          )}
        </>
      )}

      <AddGoalSheet
        visible={sheetVisible}
        exercises={exercises}
        profileId={profileId}
        onSave={onAddGoal}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "500", color: "#1a1a1a" },
  addGoalBtn: {
    backgroundColor: "#E1F5EE",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  addGoalBtnText: { fontSize: 12, fontWeight: "500", color: "#0F6E56" },
  emptyState: { alignItems: "center", paddingVertical: 20 },
  emptyText: { fontSize: 13, color: "#888", marginBottom: 12 },
  setGoalBtn: {
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  setGoalBtnText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  ringRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingBottom: 4 },
  legendCol: { flex: 1, gap: 1 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  legendRowSelected: { backgroundColor: "#F1EFE8" },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { fontSize: 13, color: "#1a1a1a" },
  detail: {
    backgroundColor: "#F1EFE8",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  detTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detName: { fontSize: 14, fontWeight: "500" },
  detBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  detBadgeText: { fontSize: 11, fontWeight: "500" },
  detDaily: { fontSize: 12, color: "#888", marginBottom: 10 },
  detMid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detReps: { fontSize: 12, color: "#888" },
  detPct: { fontSize: 12, color: "#888" },
  progBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 12,
  },
  progFill: { height: "100%", borderRadius: 99 },
  dotsRow: { flexDirection: "row", gap: 3 },
  dotWrap: { flex: 1, alignItems: "center", gap: 3 },
  dot: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  dotMissed: { backgroundColor: "#F1EFE8", borderWidth: 0.5, borderColor: "#ddd" },
  dotToday: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#378ADD" },
  dotFuture: { backgroundColor: "#E1F5EE", borderWidth: 1, borderColor: "#1D9E75" },
  dotNoGoal: { backgroundColor: "#F1EFE8", opacity: 0.25 },
  dotText: { fontSize: 9, fontWeight: "500" },
  dotLabel: { fontSize: 9, color: "#aaa" },
  removeWrap: { alignSelf: "flex-end", marginTop: 8 },
  removeText: { fontSize: 11, color: "#E24B4A" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#ddd", alignSelf: "center", marginBottom: 14,
  },
  sheetTitle: { fontSize: 16, fontWeight: "500", color: "#1a1a1a", marginBottom: 16 },
  formLabel: { fontSize: 12, color: "#888", marginBottom: 6 },
  exercisePill: {
    borderWidth: 0.5, borderColor: "#ddd", borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: "#fff",
  },
  exercisePillSelected: { backgroundColor: "#E1F5EE", borderColor: "#1D9E75" },
  exercisePillText: { fontSize: 13, color: "#888" },
  exercisePillTextSelected: { color: "#0F6E56", fontWeight: "500" },
  intervalGrid: { flexDirection: "row", gap: 6 },
  intervalBtn: {
    flex: 1, borderWidth: 0.5, borderColor: "#ddd", borderRadius: 10,
    paddingVertical: 10, alignItems: "center", backgroundColor: "#fff",
  },
  intervalBtnSelected: { backgroundColor: "#E1F5EE", borderColor: "#1D9E75" },
  intervalBtnText: { fontSize: 13, color: "#888" },
  intervalBtnTextSelected: { color: "#0F6E56", fontWeight: "500" },
  daysRow: { flexDirection: "row", gap: 4 },
  dayToggle: {
    flex: 1, borderWidth: 0.5, borderColor: "#ddd", borderRadius: 8,
    paddingVertical: 8, alignItems: "center", backgroundColor: "#fff",
  },
  dayToggleOn: { backgroundColor: "#E1F5EE", borderColor: "#1D9E75" },
  dayToggleText: { fontSize: 11, color: "#888" },
  dayToggleTextOn: { color: "#0F6E56", fontWeight: "500" },
  errorText: { fontSize: 12, color: "#E24B4A", marginTop: 8 },
  sheetActions: { flexDirection: "row", gap: 8, marginTop: 18 },
  cancelBtn: {
    flex: 1, borderWidth: 0.5, borderColor: "#ddd", borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, color: "#888" },
  saveBtn: {
    flex: 2, backgroundColor: "#1D9E75", borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  saveBtnText: { fontSize: 14, fontWeight: "500", color: "#fff" },
});