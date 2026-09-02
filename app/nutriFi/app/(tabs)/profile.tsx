import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import useProfileHook from "@/hooks/Profile/profile_hook";
import ProfileView from "@/components/Profile/ProfileView";
import ProfileViewWeb from "@/components/Profile/ProfileView.web";

export default function Profile() {
  const { profile, stats, todayReps, loading } = useProfileHook();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  if (Platform.OS === "web") {
    return <ProfileViewWeb profile={profile} stats={stats} todayReps={todayReps} />;
  }

  return <ProfileView profile={profile} stats={stats} todayReps={todayReps} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
});