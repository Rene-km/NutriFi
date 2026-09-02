import React from 'react';
import Card from "../Card";
import type { Streak } from "@/lib/api";
import { Text, StyleSheet, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";

export type { Streak };

type StreaksProps = Streak;

const FlameLarge = () => (
  <Svg width={100} height={110} viewBox="0 0 100 110">
    <Ellipse cx={50} cy={100} rx={38} ry={8} fill="#FFD700" opacity={0.35} />
    <Path
      d="M50 100 C30 100 16 88 16 74 C16 58 26 50 22 36 C28 46 26 56 28 66 C34 52 32 36 30 22 C38 36 38 54 34 68 C40 52 40 32 38 16 C46 34 46 56 42 72 C48 54 48 32 46 14 C50 32 54 54 54 72 C58 56 58 34 62 16 C60 32 60 52 66 68 C62 54 62 36 70 22 C68 36 66 52 72 66 C74 56 72 46 78 36 C74 50 84 58 84 74 C84 88 70 100 50 100Z"
      fill="#FF6B00"
    />
    <Path
      d="M50 100 C34 100 22 90 22 78 C22 66 30 60 28 48 C32 56 31 64 33 72 C37 60 36 48 34 36 C40 48 40 62 37 74 C42 62 43 46 41 32 C46 46 46 62 44 76 C48 62 48 44 47 28 C50 44 53 62 52 76 C56 62 54 46 59 32 C57 46 57 62 63 74 C60 62 60 48 66 36 C64 48 63 60 67 72 C69 64 68 56 72 48 C70 60 78 66 78 78 C78 90 66 100 50 100Z"
      fill="#FFA500"
    />
    <Path
      d="M50 98 C38 98 30 90 30 82 C30 72 36 67 35 57 C38 63 37 70 39 76 C42 67 41 56 40 46 C44 56 44 68 42 78 C45 68 46 54 45 42 C48 54 51 68 50 80 C49 68 52 54 55 42 C54 54 55 68 58 78 C56 68 56 56 60 46 C59 56 59 67 62 76 C64 70 63 63 66 57 C65 67 70 72 70 82 C70 90 62 98 50 98Z"
      fill="#FFD700"
    />
    <Path
      d="M50 94 C43 94 38 88 38 82 C38 76 42 72 42 65 C44 69 43 74 44 78 C46 72 46 64 45 56 C48 64 48 74 47 82 C49 74 51 64 55 56 C54 64 54 72 56 78 C57 74 56 69 58 65 C58 72 62 76 62 82 C62 88 57 94 50 94Z"
      fill="#FFF176"
    />
  </Svg>
);

const FlameSmall = () => (
  <Svg width={11} height={14} viewBox="0 0 100 110">
    <Path
      d="M50 100 C30 100 16 88 16 74 C16 58 26 50 22 36 C28 46 26 56 28 66 C34 52 32 36 30 22 C38 36 38 54 34 68 C40 52 40 32 38 16 C46 34 46 56 42 72 C48 54 48 32 46 14 C50 32 54 54 54 72 C58 56 58 34 62 16 C60 32 60 52 66 68 C62 54 62 36 70 22 C68 36 66 52 72 66 C74 56 72 46 78 36 C74 50 84 58 84 74 C84 88 70 100 50 100Z"
      fill="#854F0B"
    />
    <Path
      d="M50 98 C38 98 30 90 30 82 C30 72 36 67 35 57 C38 63 37 70 39 76 C42 67 41 56 40 46 C44 56 44 68 42 78 C45 68 46 54 45 42 C48 54 51 68 50 80 C49 68 52 54 55 42 C54 54 55 68 58 78 C56 68 56 56 60 46 C59 56 59 67 62 76 C64 70 63 63 66 57 C65 67 70 72 70 82 C70 90 62 98 50 98Z"
      fill="#BA7517"
    />
  </Svg>
);

const Streaks = ({ streak, bestStreak, total }: StreaksProps) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Current Streak</Text>

      <FlameLarge />

      <Text style={styles.heroNumber}>{streak ?? 0}</Text>
      <Text style={styles.subLabel}>days in a row</Text>

      <View style={styles.divider} />

      <View style={styles.pill}>
        <FlameSmall />
        <Text style={styles.pillText}>My Best</Text>
        <Text style={styles.pillNumber}>{bestStreak ?? 0}</Text>
      </View>
    </Card>
  );
};

export default Streaks;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    alignItems: "center",
    borderRadius: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  heroNumber: {
    fontSize: 52,
    fontWeight: "800",
    color: "#1A1A1A",
    lineHeight: 58,
    marginTop: 6,
  },
  subLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 16,
    marginTop: 2,
  },
  divider: {
    width: "100%",
    height: 0.5,
    backgroundColor: "#E8E8E8",
    marginBottom: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAEEDA",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#854F0B",
  },
  pillNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#854F0B",
  },
});