import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CalendarDay, CalendarDayStatus } from "@/lib/api";

type Props = {
  year: number;
  month: number;
  days: CalendarDay[];
  loading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

function cellColors(status: CalendarDayStatus) {
  switch (status) {
    case "met":
      return { bg: "#dff9f0", text: "#0F6E56" };
    case "partial":
      return { bg: "#FAEEDA", text: "#854F0B" };
    case "missed":
      return { bg: "#f7d8d8", text: "#A32D2D" };
    default:
      return { bg: "#F5F4F0", text: "#B8B7B0" };
  }
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function GoalCalendar({
  year,
  month,
  days,
  loading,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const todayStr = `${today.getUTCFullYear()}-${String(
    today.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;

  const dayMap = useMemo(() => {
    const map: Record<string, CalendarDay> = {};
    for (const day of days) {
      map[day.date] = day;
    }
    return map;
  }, [days]);

  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstIso = (() => {
    const wd = firstDayOfMonth.getUTCDay();
    return wd === 0 ? 7 : wd;
  })();

  const leadingBlanks = firstIso - 1;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  const selectedDay = selectedDate ? dayMap[selectedDate] : null;

  return (
    <View style={styles.card}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>{"‹"}</Text>
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month - 1]} {year}
        </Text>

        <TouchableOpacity onPress={onNextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>{"›"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {DAY_HEADERS.map((header, index) => (
          <View key={`${header}-${index}`} style={styles.headerCell}>
            <Text style={styles.headerText}>{header}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 28 }} color="#1D9E75" />
      ) : (
        <View style={styles.grid}>
          {Array.from({ length: totalCells }).map((_, idx) => {
            const dayNumber = idx - leadingBlanks + 1;
            const isValid = dayNumber >= 1 && dayNumber <= daysInMonth;

            if (!isValid) {
              return <View key={`blank-${idx}`} style={styles.cell} />;
            }

            const dateStr = `${year}-${String(month).padStart(
              2,
              "0"
            )}-${String(dayNumber).padStart(2, "0")}`;

            const dayData = dayMap[dateStr];
            const status = dayData?.status ?? "no_goal";
            const colors = cellColors(status);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                style={[
                  styles.cell,
                  {
                    backgroundColor: colors.bg,
                  },
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    { color: colors.text },
                    isSelected && styles.selectedText,
                  ]}
                >
                  {dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#bef4e0" }]} />
          <Text style={styles.legendText}>Met</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#edd3a1" }]} />
          <Text style={styles.legendText}>Partial</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f1c9c9" }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f3edd8" }]} />
          <Text style={styles.legendText}>No goal</Text>
        </View>
      </View>

      {selectedDay && (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>{formatDate(selectedDay.date)}</Text>

          {selectedDay.detail.length === 0 ? (
            <Text style={styles.detailEmpty}>No goal scheduled</Text>
          ) : (
            selectedDay.detail.map((item, index) => {
              // Check if selected date is in the future
              const isFuture = selectedDate! > todayStr;
              
              // Determine label and color
              let label = "Missed";
              let statusStyle = styles.detailMissed;
              
              if (item.met) {
                label = "Met";
                statusStyle = styles.detailMet;
              } else if (isFuture) {
                label = "In Progress";
                statusStyle = styles.detailInProgress;
              }
              
              return (
                <View
                  key={`${item.exercise_name}-${index}`}
                  style={styles.detailRow}
                >
                  <Text style={styles.detailName}>{item.exercise_name}</Text>

                  <View style={styles.detailRight}>
                    <Text style={styles.detailReps}>
                      {item.reps_done}/{item.target}
                    </Text>

                    <Text style={[styles.detailStatus, statusStyle]}>
                      {label}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnText: {
    fontSize: 22,
    color: "#64748b",
    fontWeight: "400",
  },
  monthTitle: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  headerCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  cell: {
    width: `${100 / 7}%`,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  cellText: {
    fontSize: 12,
    fontWeight: "500",
  },
  todayCell: {
    borderColor: "#93c5fd",
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  selectedText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#64748b",
  },
  detailBox: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    padding: 12,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  detailEmpty: {
    fontSize: 12,
    color: "#94a3b8",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailName: {
    fontSize: 12,
    color: "#111827",
  },
  detailRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailReps: {
    fontSize: 12,
    color: "#64748b",
  },
  detailStatus: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailMet: {
    color: "#0f766e",
  },
  detailMissed: {
    color: "#dc2626",
  },
  detailInProgress: {
    color: "#1967D2",
  },
});