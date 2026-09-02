import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { router } from "expo-router";
import { getAllTimeWorkoutProgress } from "@/lib/api";

type ExerciseEntry = {
  name: string;
  reps: number;
};

type WorkoutData = {
  date: string;
  dayOfWeek: string;
  exercises: ExerciseEntry[];
};

type ChartPoint = {
  x: number;
  y: number;
  reps: number;
  idx: number;
};

const COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const CHART_HEIGHT = 360;
const HORIZONTAL_PADDING = 30;
const VERTICAL_PADDING = 32;
const POINT_RADIUS = 4;

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const previous = points[i - 1] ?? current;
    const afterNext = points[i + 2] ?? next;

    const cp1x = current.x + (next.x - previous.x) / 6;
    const cp1y = current.y + (next.y - previous.y) / 6;
    const cp2x = next.x - (afterNext.x - current.x) / 6;
    const cp2y = next.y - (afterNext.y - current.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
}

function buildFillPath(points: ChartPoint[]) {
  if (points.length === 0) return "";

  const linePath = buildSmoothPath(points);
  const bottomY = CHART_HEIGHT - VERTICAL_PADDING;
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;

  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
}

function getSeriesPoints(params: {
  workoutData: WorkoutData[];
  exercise: string;
  chartWidth: number;
  maxReps: number;
}): ChartPoint[] {
  const { workoutData, exercise, chartWidth, maxReps } = params;

  if (workoutData.length === 0) return [];

  const usableWidth = chartWidth - HORIZONTAL_PADDING * 2;
  const usableHeight = CHART_HEIGHT - VERTICAL_PADDING * 2;
  const safeMax = Math.max(maxReps, 1);

  return workoutData.map((day, idx) => {
    const found = day.exercises.find((entry) => entry.name === exercise);
    const reps = found?.reps ?? 0;

    const x =
      workoutData.length === 1
        ? chartWidth / 2
        : HORIZONTAL_PADDING + (idx / (workoutData.length - 1)) * usableWidth;

    const y =
      CHART_HEIGHT - VERTICAL_PADDING - (reps / safeMax) * usableHeight;

    return { x, y, reps, idx };
  });
}

export const AllTimeByExerciseChart: React.FC<{ profileId: string }> = ({
  profileId,
}) => {
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set()
  );
  const [chartAreaWidth, setChartAreaWidth] = useState(900);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAllTimeWorkoutProgress(profileId);

        if (cancelled) return;

        if (result.error) {
          setError("Failed to load workout data");
          setWorkoutData([]);
          return;
        }

        const data = result.data ?? [];
        setWorkoutData(data);

        const exercises = Array.from(
          new Set(
            data.flatMap((day) =>
              day.exercises.map((exercise) => exercise.name)
            )
          )
        );

        setSelectedExercises(new Set(exercises));
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("An error occurred while loading data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const allExercises = useMemo(() => {
    return Array.from(
      new Set(
        workoutData.flatMap((day) =>
          day.exercises.map((exercise) => exercise.name)
        )
      )
    );
  }, [workoutData]);

  const exerciseColors = useMemo(() => {
    return allExercises.reduce<Record<string, string>>((acc, exercise, idx) => {
      acc[exercise] = COLORS[idx % COLORS.length];
      return acc;
    }, {});
  }, [allExercises]);

  const maxReps = useMemo(() => {
    const values = workoutData.flatMap((day) =>
      day.exercises
        .filter((exercise) => selectedExercises.has(exercise.name))
        .map((exercise) => exercise.reps)
    );

    const max = values.length > 0 ? Math.max(...values) : 1;
    return Math.max(Math.ceil(max * 1.15), 1);
  }, [workoutData, selectedExercises]);

  const chartWidth = Math.max(chartAreaWidth - 8, 500);

  const toggleExercise = (exercise: string) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);

      if (next.has(exercise)) {
        next.delete(exercise);
      } else {
        next.add(exercise);
      }

      return next;
    });
  };

  const handleExerciseTap = (exercise: string) => {
    router.push({
      pathname: "/history/[exercise]",
      params: { exercise },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>All-Time Progress by Exercise</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (workoutData.length === 0 || allExercises.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>All-Time Progress by Exercise</Text>
        <Text style={styles.emptyText}>No workout data available yet</Text>
      </View>
    );
  }

  const yAxisRatios = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All-Time Progress by Exercise</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        <View style={styles.filterRow}>
          {allExercises.map((exercise) => {
            const active = selectedExercises.has(exercise);

            return (
              <TouchableOpacity
                key={exercise}
                onPress={() => toggleExercise(exercise)}
                style={[
                  styles.filterButton,
                  active && {
                    backgroundColor: exerciseColors[exercise],
                    borderColor: exerciseColors[exercise],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {exercise}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedExercises.size > 0 ? (
        <View
          style={styles.chartWrap}
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            if (width > 0) {
              setChartAreaWidth(width);
            }
          }}
        >
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Defs>
              {allExercises.map((exercise) => (
                <LinearGradient
                  key={`gradient-${exercise}`}
                  id={`gradient-${safeId(exercise)}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop
                    offset="0"
                    stopColor={exerciseColors[exercise]}
                    stopOpacity="0.22"
                  />
                  <Stop
                    offset="1"
                    stopColor={exerciseColors[exercise]}
                    stopOpacity="0.04"
                  />
                </LinearGradient>
              ))}
            </Defs>

            {yAxisRatios.map((ratio, index) => {
              const y =
                VERTICAL_PADDING +
                ratio * (CHART_HEIGHT - VERTICAL_PADDING * 2);

              const label = Math.round(maxReps * (1 - ratio));

              return (
                <React.Fragment key={`grid-${index}`}>
                  <Line
                    x1={HORIZONTAL_PADDING}
                    y1={y}
                    x2={chartWidth - HORIZONTAL_PADDING}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />

                  <SvgText x={8} y={y + 4} fontSize="11" fill="#94a3b8">
                    {label}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {workoutData.map((day, idx) => {
              const usableWidth = chartWidth - HORIZONTAL_PADDING * 2;
              const x =
                workoutData.length === 1
                  ? chartWidth / 2
                  : HORIZONTAL_PADDING +
                    (idx / (workoutData.length - 1)) * usableWidth;

              return (
                <SvgText
                  key={`x-label-${idx}`}
                  x={x}
                  y={CHART_HEIGHT - 8}
                  fontSize="11"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {day.dayOfWeek}
                </SvgText>
              );
            })}

            {allExercises.map((exercise) => {
              if (!selectedExercises.has(exercise)) return null;

              const points = getSeriesPoints({
                workoutData,
                exercise,
                chartWidth,
                maxReps,
              });

              const stroke = exerciseColors[exercise];
              const path = buildSmoothPath(points);
              const fillPath = buildFillPath(points);

              return (
                <React.Fragment key={`series-${exercise}`}>
                  <Path
                    d={fillPath}
                    fill={`url(#gradient-${safeId(exercise)})`}
                  />

                  <Path
                    d={path}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((point) => (
                    <React.Fragment key={`${exercise}-${point.idx}`}>
                      <Circle
                        cx={point.x}
                        cy={point.y}
                        r={POINT_RADIUS + 8}
                        fill="transparent"
                        onPress={() => handleExerciseTap(exercise)}
                      />

                      <Circle
                        cx={point.x}
                        cy={point.y}
                        r={POINT_RADIUS}
                        fill={stroke}
                        stroke="#ffffff"
                        strokeWidth={2}
                        onPress={() => handleExerciseTap(exercise)}
                      />

                      {point.reps > 0 && (
                        <SvgText
                          x={point.x}
                          y={point.y - 12}
                          fontSize="10"
                          fontWeight="600"
                          fill={stroke}
                          textAnchor="middle"
                        >
                          {String(point.reps)}
                        </SvgText>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      ) : (
        <View style={styles.noSelectionBox}>
          <Text style={styles.emptyText}>Select an exercise to show graph</Text>
        </View>
      )}

      <View style={styles.legend}>
        {allExercises.map((exercise) => (
          <View key={`legend-${exercise}`} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: exerciseColors[exercise] },
              ]}
            />
            <Text style={styles.legendText}>{exercise}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Tap any point to view detailed history</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 14,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f1f5f9",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  chartWrap: {
    width: "100%",
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    marginTop: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  noSelectionBox: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
  },
  hint: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 10,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
  },
});