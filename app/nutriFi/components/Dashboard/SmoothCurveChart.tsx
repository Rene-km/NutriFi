import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Line, Rect } from "react-native-svg";

type DataPoint = {
  reps: number;
  dayOfWeek: string;
};

type SmoothCurveChartProps = {
  data: DataPoint[];
  max: number;
  color: string;
  height?: number;
};

function getPoints(
  data: DataPoint[],
  max: number,
  width: number,
  chartHeight: number,
  padding: number
) {
  const usableH = chartHeight - padding * 2;
  return data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: max > 0
      ? padding + (1 - d.reps / max) * usableH
      : chartHeight - padding,
  }));
}

function buildCurvePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const t = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function buildAreaPath(pts: { x: number; y: number }[], bottom: number): string {
  const curve = buildCurvePath(pts);
  if (!curve) return "";
  return `${curve} L${pts[pts.length - 1].x},${bottom} L${pts[0].x},${bottom} Z`;
}

const SVG_WIDTH = 300;
const PADDING = 12;

export function SmoothCurveChart({
  data,
  max,
  color,
  height = 100,
}: SmoothCurveChartProps) {
  if (max === 0) {
    return (
      <View style={{ height, justifyContent: "center" }}>
        <Text style={styles.noDataText}>No activity this week</Text>
      </View>
    );
  }

  // SVG chart area only — labels are rendered as RN Views below
  const svgHeight = height;
  const pts = getPoints(data, max, SVG_WIDTH, svgHeight, PADDING);
  const curvePath = buildCurvePath(pts);
  const areaPath = buildAreaPath(pts, svgHeight);

  return (
    <View>
      {/* SVG curve */}
      <Svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        preserveAspectRatio="none"
      >
        <Rect x={0} y={0} width={SVG_WIDTH} height={svgHeight} rx={4} fill={color} opacity={0.06} />
        <Line
          x1={0} y1={svgHeight / 2} x2={SVG_WIDTH} y2={svgHeight / 2}
          stroke="#d1d5db" strokeWidth={0.5} strokeDasharray="4 3"
        />
        {areaPath ? <Path d={areaPath} fill={color} opacity={0.12} /> : null}
        {curvePath ? (
          <Path
            d={curvePath}
            fill="none" stroke={color} strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round"
          />
        ) : null}
      </Svg>

      {/* Day labels — own row, clear of chart */}
      <View style={styles.labelRow}>
        {data.map((d, i) => (
          <Text
            key={`label-${i}`}
            style={[styles.dayLabel, { color: d.reps > 0 ? color : "#d1d5db" }]}
          >
            {d.dayOfWeek[0]}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noDataText: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    width: 14,
  },
});