import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGoalCalendar } from "@/hooks/Profile/useGoalCalendar";
import { useProfilePhoto } from "@/hooks/Profile/useProfilePhoto";
import { useWeeklyGoals } from "@/hooks/Dashboard/useWeeklyGoals";
import GoalCalendar from "@/components/Profile/GoalCalendar";
import WeeklyGoalsCard from "@/components/Dashboard/WeeklyGoalsCard";
import { supabase } from "@/lib/supabase";

type ProfileViewProps = {
  profile: any;
  stats: any;
  todayReps: { exercise_name: string; total_reps: number }[];
};

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

type Exercise = { id: string; name: string };

const ProfileView = ({ profile, stats, todayReps }: ProfileViewProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const {
    year,
    month,
    days,
    loading: calLoading,
    refresh: calRefresh,
    goToPrevMonth,
    goToNextMonth,
  } = useGoalCalendar(profile?.id ?? null);

  const { avatarUrl, uploading, loadAvatar, pickAndUpload } =
    useProfilePhoto(profile?.id ?? null);

  const {
    goals,
    loading: goalsLoading,
    refresh: goalsRefresh,
    addGoal,
    removeGoal,
  } = useWeeklyGoals(profile?.id ?? null);

  useEffect(() => {
    if (profile?.id) {
      calRefresh();
      loadAvatar();
      goalsRefresh();
    }
  }, [profile?.id, calRefresh, loadAvatar, goalsRefresh]);

  useEffect(() => {
    supabase
      .from("exercise")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (data) setExercises(data as Exercise[]);
      });
  }, []);

  const handleAddGoal = async (input: Parameters<typeof addGoal>[0]) => {
    const result = await addGoal(input);
    calRefresh();
    return result;
  };

  const handleRemoveGoal = async (goalId: string) => {
    const result = await removeGoal(goalId);
    calRefresh();
    return result;
  };

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name ?? "");
      setEditPhone(profile.phone ?? "");
    }
  }, [profile]);

  const initials = (profile?.full_name ?? "")
    .split(" ")
    .map((word: string) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);

    const { error } = await supabase
      .from("profile")
      .update({
        full_name: editName.trim(),
        phone: editPhone.trim(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      alert("Failed to save. Please try again.");
      return;
    }

    profile.full_name = editName.trim();
    profile.phone = editPhone.trim();
    setEditing(false);
  };

  const AvatarView = ({ editable = false }: { editable?: boolean }) => (
    <View style={styles.avatarWrap}>
      <TouchableOpacity
        onPress={editable ? pickAndUpload : undefined}
        activeOpacity={editable ? 0.7 : 1}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{initials || "?"}</Text>
          </View>
        )}

        {uploading && (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator color="#ffffff" size="small" />
          </View>
        )}

        {editable && (
          <View style={styles.cameraBadge}>
            <Text style={styles.cameraBadgeText}>Edit</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  if (editing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.editScroll}
        >
          <View style={styles.editCard}>
            <View style={styles.heroCard}>
              <AvatarView editable />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Edit profile</Text>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Full name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Phone number</Text>
                <TextInput
                  style={styles.formInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save changes</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.viewScroll}
      >
        <View style={styles.pageInner}>
          <View style={styles.leftCol}>
            <View style={styles.heroCard}>
              <AvatarView />

              <Text style={styles.heroName}>{profile?.full_name ?? "User"}</Text>

              {profile?.phone ? (
                <Text style={styles.heroPhone}>{profile.phone}</Text>
              ) : null}

              {profile?.goal ? (
                <View style={styles.goalPill}>
                  <Text style={styles.goalPillText}>{profile.goal}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
              <StatTile value={stats?.total_workouts ?? 0} label="Weekly workouts" />
              <StatTile value={stats?.total_minutes ?? 0} label="Weekly minutes" />
              <StatTile value={profile?.bmi?.toFixed(1) ?? "—"} label="BMI" />
              <StatTile
                value={Math.round(stats?.total_calories ?? 0)}
                label="Calories"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>My details</Text>

              <View style={styles.detailsGrid}>
                <DetailItem label="Age" value={`${profile?.age ?? "—"}`} />
                <DetailItem
                  label="Height"
                  value={`${profile?.height_cm ?? "—"} cm`}
                />
                <DetailItem
                  label="Weight"
                  value={`${profile?.weight_kg ?? "—"} kg`}
                />
                <DetailItem label="Gender" value={profile?.gender ?? "—"} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's reps</Text>

              {todayReps.length === 0 ? (
                <Text style={styles.emptyText}>No workouts yet today</Text>
              ) : (
                todayReps.map((item) => (
                  <View key={item.exercise_name} style={styles.repRow}>
                    <Text style={styles.repName}>{item.exercise_name}</Text>
                    <Text style={styles.repCount}>{item.total_reps} reps</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.rightCol}>
            {profile?.id && (
              <WeeklyGoalsCard
                goals={goals}
                loading={goalsLoading}
                profileId={profile.id}
                exercises={exercises}
                onAddGoal={handleAddGoal}
                onRemoveGoal={handleRemoveGoal}
              />
            )}

            <View style={styles.calendarWrap}>
              <GoalCalendar
                year={year}
                month={month}
                days={days}
                loading={calLoading}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9eef4",
  },
  viewScroll: {
    padding: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  pageInner: {
    width: "100%",
    maxWidth: 1240,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },
  editScroll: {
    padding: 24,
    alignItems: "center",
  },
  editCard: {
    width: 480,
    gap: 12,
  },
  leftCol: {
    width: 340,
    flexShrink: 0,
    gap: 12,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  calendarWrap: {
    width: "100%",
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dfe5ec",
    alignItems: "center",
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImg: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#dff7ef",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: "600",
    color: "#0f766e",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cameraBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#ffffff",
  },
  heroName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  heroPhone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: "#dff7ef",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  goalPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0f766e",
  },
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f8fafc",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0f766e",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statTile: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: "#dfe5ec",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dfe5ec",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailItem: {
    width: "46%",
  },
  detailLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  repRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  repName: {
    fontSize: 13,
    color: "#111827",
  },
  repCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0f766e",
  },
  formRow: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  saveBtn: {
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  cancelLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginTop: 12,
  },
});

export default ProfileView;