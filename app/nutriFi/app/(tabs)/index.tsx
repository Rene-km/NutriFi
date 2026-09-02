import { Platform } from "react-native";
import IndexPage from "@/components/Dashboard/IndexPage";
import IndexPageWeb from "@/components/Dashboard/IndexPage.web";
import useDashboardHook from "@/hooks/Dashboard/dashboard_hook";

export default function Index() {
  const { streaks, profileId, exercises, handleLogout } = useDashboardHook();

  if (Platform.OS === "web") {
    return (
      <IndexPageWeb
        streaks={streaks}
        profileId={profileId}
        exercises={exercises}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <IndexPage
      streaks={streaks}
      profileId={profileId}
      exercises={exercises}
      handleLogout={handleLogout}
    />
  );
}