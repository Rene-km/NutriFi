import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useGoalCalendar } from "@/hooks/Profile/useGoalCalendar";
import { useProfilePhoto } from "@/hooks/Profile/useProfilePhoto";
import GoalCalendar from "@/components/Profile/GoalCalendar";
import { supabase } from "@/lib/supabase";

type ProfileViewProps = {
  profile: any;
  stats: any;
  todayReps: { exercise_name: string; total_reps: number }[];
};

const ProfileView = ({ profile, stats, todayReps }: ProfileViewProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    year,
    month,
    days,
    loading: calLoading,
    refresh: calRefresh,
    goToPrevMonth,
    goToNextMonth,
  } = useGoalCalendar(profile?.id ?? null);

  const {
    avatarUrl,
    uploading,
    loadAvatar,
    pickAndUpload,
  } = useProfilePhoto(profile?.id ?? null);

  useEffect(() => {
    if (profile?.id) {
      calRefresh();
      loadAvatar();
    }
  }, [profile?.id]);

  // Sync edit fields when profile changes or edit mode opens
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name ?? "");
      setEditPhone(profile.phone ?? "");
    }
  }, [profile]);

  const initials = (profile?.full_name ?? "")
    .split(" ")
    .map((w: string) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayName = profile?.full_name ?? "User";
  const displayPhone = profile?.phone ?? "";

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

    // Update the profile object in place so the view reflects changes
    profile.full_name = editName.trim();
    profile.phone = editPhone.trim();
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile?.full_name ?? "");
    setEditPhone(profile?.phone ?? "");
    setEditing(false);
  };

  // ---------------------------------------------------------------------------
  // Avatar component — tappable only in edit mode
  // ---------------------------------------------------------------------------

  const AvatarView = () => (
    <View style={styles.avatarWrap}>
      {editing ? (
        <TouchableOpacity onPress={pickAndUpload}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
          )}
          {uploading && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {!editing ? (
          <>
            {/* ---- VIEW MODE ---- */}
            <View style={styles.hero}>
              <AvatarView />
              <Text style={styles.name}>{displayName}</Text>
              {displayPhone ? (
                <Text style={styles.phone}>{displayPhone}</Text>
              ) : null}
              {profile?.goal && (
                <View style={styles.goalPill}>
                  <Text style={styles.goalPillText}>{profile.goal}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editLink}>Edit profile</Text>
              </TouchableOpacity>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{stats?.total_workouts ?? 0}</Text>
                <Text style={styles.statLabel}>Weekly workouts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{stats?.total_minutes ?? 0}</Text>
                <Text style={styles.statLabel}>Weekly minutes</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile?.bmi?.toFixed(1) ?? "—"}</Text>
                <Text style={styles.statLabel}>BMI</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{Math.round(stats?.total_calories ?? 0)}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>

            {/* My details card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>My details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>{profile?.age ?? "—"}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Height</Text>
                  <Text style={styles.detailValue}>{profile?.height_cm ?? "—"} cm</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>{profile?.weight_kg ?? "—"} kg</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Gender</Text>
                  <Text style={styles.detailValue}>{profile?.gender ?? "—"}</Text>
                </View>
              </View>
            </View>

            {/* Today's reps card */}
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

            {/* Goal calendar */}
            <GoalCalendar
              year={year}
              month={month}
              days={days}
              loading={calLoading}
              onPrevMonth={goToPrevMonth}
              onNextMonth={goToNextMonth}
            />
          </>
        ) : (
          <>
            {/* ---- EDIT MODE ---- */}
            <View style={styles.hero}>
              <AvatarView />
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
                  placeholderTextColor="#bbb"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Phone number</Text>
                <TextInput
                  style={styles.formInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save changes</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  hero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarWrap: {
    marginBottom: 10,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#0F6E56",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  editBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  phone: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: "#E1F5EE",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 6,
  },
  goalPillText: {
    fontSize: 12,
    color: "#0F6E56",
    fontWeight: "500",
  },
  editLink: {
    fontSize: 13,
    color: "#1D9E75",
    fontWeight: "500",
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  stat: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailItem: {
    width: "46%",
  },
  detailLabel: {
    fontSize: 11,
    color: "#888",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginTop: 1,
  },
  emptyText: {
    fontSize: 13,
    color: "#aaa",
  },
  repRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  repName: {
    fontSize: 13,
    color: "#1a1a1a",
  },
  repCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1D9E75",
  },
  formRow: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 0.5,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  cancelLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginTop: 10,
  },
});

export default ProfileView; 