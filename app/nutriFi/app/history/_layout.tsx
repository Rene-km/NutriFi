import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[exercise]"
        options={{
          title: "Exercise History",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}