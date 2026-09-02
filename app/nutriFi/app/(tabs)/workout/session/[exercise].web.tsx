import { StyleSheet, View, Text, TouchableOpacity, Alert, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDetectorForExercise } from "@/utils/getDetector";
import { startWorkoutSession, endWorkoutSession, updateWorkoutSession } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { PoseCameraWeb } from "@/utils/webCamera";
import { useProfileStore } from "@/stores/profileStore";
import type { LandmarkPayload } from "./MediapipeView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function fmt(n: number | undefined) {
  if (n === undefined || n === null) return "—";
  return n.toFixed(2);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ExerciseScreenWeb() {
  const profileId = useProfileStore((state) => state.profileId);
  const [loading, setLoading] = useState(true);

  // Session state
  const [inSession, setInSession] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<null | string>(null);
  const [reps, setReps] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Debug state
  const [hipVis, setHipVis] = useState(0);
  const [kneeVis, setKneeVis] = useState(0);
  const [ankVis, setAnkVis] = useState(0);
  const [angle, setAngle] = useState(0);
  const [lastEvent, setLastEvent] = useState<string>("—");
  const [skipReason, setSkipReason] = useState<string>("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to avoid stale closures in onLandmark and cleanup
  const sessionIdRef = useRef<string | null>(null);
  const repsRef = useRef<number>(0);
  const inSessionRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { exercise: exerciseName, exerciseId } = useLocalSearchParams<{
    exercise: string;
    exerciseId?: string;
  }>();

  const isSquat = (exerciseName ?? "").toLowerCase().includes("squat");
  const detectorRef = useRef<ReturnType<typeof getDetectorForExercise>>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Fresh detector when exercise changes
  useEffect(() => {
    const freshDetector = getDetectorForExercise(exerciseName ?? "");
    if (freshDetector) freshDetector.reset();
    detectorRef.current = freshDetector;
    setReps(0);
    repsRef.current = 0;
    setLastEvent("—");
    setSkipReason("");
  }, [exerciseName]);

  // Restore session from localStorage only if same exercise and session still open
  useEffect(() => {
    if (!exerciseName) return;

    const savedSessionId = localStorage.getItem("activeSessionId");
    const savedExercise = localStorage.getItem("activeExerciseName");

    if (savedSessionId && savedExercise === exerciseName) {
      const restoreSession = async () => {
        const { data, error } = await supabase
          .from("workout_session")
          .select("reps, started_at")
          .eq("id", savedSessionId)
          .is("ended_at", null)
          .single();

        if (!error && data) {
          const savedReps = data.reps ?? 0;
          const started = new Date(data.started_at).getTime();
          const elapsed = Math.floor((Date.now() - started) / 1000);

          sessionIdRef.current = savedSessionId;
          inSessionRef.current = true;
          isPausedRef.current = true;
          repsRef.current = savedReps;

          setSessionId(savedSessionId);
          setInSession(true);
          setIsPaused(true);
          setReps(savedReps);
          setElapsedSeconds(elapsed);

          if (detectorRef.current) {
            detectorRef.current.counter = savedReps;
          }
        } else {
          localStorage.removeItem("activeSessionId");
          localStorage.removeItem("activeExerciseName");
        }
      };

      restoreSession();
    } else if (savedExercise !== exerciseName) {
      setInSession(false);
      setIsPaused(false);
      setSessionId(null);
      sessionIdRef.current = null;
      inSessionRef.current = false;
      isPausedRef.current = false;
      setReps(0);
      repsRef.current = 0;
      setElapsedSeconds(0);
    }
  }, [exerciseName]);

  // Cleanup timer on unmount and save reps if session still active
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (inSessionRef.current && sessionIdRef.current && repsRef.current > 0) {
        updateWorkoutSession(sessionIdRef.current, { reps: repsRef.current });
      }
    };
  }, []);

  // Auto save reps every 10 reps so data isn't lost
  useEffect(() => {
    if (!sessionId || reps === 0 || reps % 10 !== 0) return;
    updateWorkoutSession(sessionId, { reps });
  }, [reps, sessionId]);

  // Keep refs in sync with state
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { repsRef.current = reps; }, [reps]);
  useEffect(() => { inSessionRef.current = inSession; }, [inSession]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const onLandmark = useCallback((data: LandmarkPayload) => {
    const landmarks = data.landmarks;
    const currentDetector = detectorRef.current;
    if (!landmarks || !currentDetector || isPausedRef.current || !inSessionRef.current) return;

    const prevWentDown = (currentDetector as any).wentDown;
    const prevReps = currentDetector.counter;

    currentDetector.detectPose(landmarks);

    const currWentDown = (currentDetector as any).wentDown;
    const currReps = currentDetector.counter;

    if (isSquat) {
      if (!prevWentDown && currWentDown) {
        setLastEvent(`DOWN — hip=${fmt(landmarks[24]?.visibility)} knee=${fmt(landmarks[26]?.visibility)} ank=${fmt(landmarks[28]?.visibility)}`);
      }
      if (prevWentDown && !currWentDown && currReps > prevReps) {
        setLastEvent(`UP (rep ${currReps}) — hip=${fmt(landmarks[24]?.visibility)} knee=${fmt(landmarks[26]?.visibility)} ank=${fmt(landmarks[28]?.visibility)}`);
      }
      setAngle((currentDetector as any).lastKneeAngle ?? 0);
      setHipVis(landmarks[24]?.visibility ?? 0);
      setKneeVis(landmarks[26]?.visibility ?? 0);
      setAnkVis(landmarks[28]?.visibility ?? 0);
      setSkipReason((currentDetector as any).lastSkipReason ?? "");
    }

    setReps(currReps);
    repsRef.current = currReps;
  }, []);

  const handleStart = async () => {
    if (!profileId || !exerciseId) {
      Alert.alert("Cannot start", "Missing profile or exercise. Please try again.");
      return;
    }
    const { data, error } = await startWorkoutSession(profileId, exerciseId);
    if (error) {
      setSessionId(null);
      Alert.alert("Error", "Could not start the workout session. Please try again.");
      return;
    }
    if (data?.id) {
      setSessionId(data.id);
      sessionIdRef.current = data.id;
      setInSession(true);
      inSessionRef.current = true;
      setIsPaused(false);
      isPausedRef.current = false;
      detectorRef.current?.reset();
      setReps(0);
      repsRef.current = 0;
      setElapsedSeconds(0);
      startTimer();
      localStorage.setItem("activeSessionId", data.id);
      localStorage.setItem("activeExerciseName", exerciseName ?? "");
    }
  };

  const handlePause = async () => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      startTimer();
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      stopTimer();
      if (sessionId) {
        await updateWorkoutSession(sessionId, { reps });
      }
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    stopTimer();

    const { error } = await endWorkoutSession(sessionId, { reps });

    if (error) {
      Alert.alert("Error", "Could not end the session. Please try again.");
      startTimer();
      return;
    }

    localStorage.removeItem("activeSessionId");
    localStorage.removeItem("activeExerciseName");

    setInSession(false);
    inSessionRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setSessionId(null);
    sessionIdRef.current = null;
    detectorRef.current?.reset();
    setReps(0);
    repsRef.current = 0;
    setElapsedSeconds(0);
    setLastEvent("—");
    router.back();
  };

  if (!detectorRef.current && !loading) {
    return (
      <View style={[styles.root, styles.centeredFallback]}>
        <Text style={styles.fallbackText}>
          No detector found for &quot;{exerciseName ?? "unknown"}&quot;.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.cameraLayer} pointerEvents="box-none">
        <PoseCameraWeb width={windowWidth} height={windowHeight} onLandmark={onLandmark} />
      </View>

          <View
            style={[styles.overlayTop, { paddingTop: insets.top + 12, paddingHorizontal: 16 }]}
            pointerEvents="box-none"
          >
            <View style={styles.topBar}>
              <Text style={styles.overlayTitle} numberOfLines={2}>
                {exerciseName} session
              </Text>
              <Text style={styles.overlayTimer}>{formatTime(elapsedSeconds)}</Text>
            </View>
            {isPaused && <Text style={styles.pausedBadge}>Paused</Text>}
          </View>

        {isSquat && (
          <View
            style={[styles.debugPanel, { top: insets.top + 72, right: 12 }]}
            pointerEvents="box-none"
          >
            <Text style={styles.debug}>∠ {angle.toFixed(1)}°</Text>
            <Text style={[styles.debugVis, { color: hipVis > 0.45 ? "#8f8" : "#f88" }]}>
              Hip {fmt(hipVis)}
            </Text>
            <Text style={[styles.debugVis, { color: kneeVis > 0.45 ? "#8f8" : "#f88" }]}>
              Knee {fmt(kneeVis)}
            </Text>
            <Text style={[styles.debugVis, { color: ankVis > 0.45 ? "#8f8" : "#f88" }]}>
              Ank {fmt(ankVis)}
            </Text>
            <Text style={styles.debugSmall} numberOfLines={2}>
              {lastEvent}
            </Text>
            <Text style={styles.debugSmall} numberOfLines={1}>
              {skipReason}
            </Text>
          </View>
        )}

      <View
        style={[styles.overlayBottom, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16 }]}
        pointerEvents="box-none"
      >
        <View style={styles.bottomPanel}>
          <Text style={styles.overlayReps}>{reps}</Text>
          <Text style={styles.overlayRepsLabel}>reps</Text>
          <View style={styles.buttonRow}>
            {!inSession ? (
              <TouchableOpacity style={styles.btnStart} onPress={handleStart} activeOpacity={0.85}>
                <Text style={styles.btnText}>Start</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={isPaused ? styles.btnResume : styles.btnPause}
                  onPress={handlePause}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnText}>{isPaused ? "Resume" : "Pause"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnStop} onPress={handleStop} activeOpacity={0.85}>
                  <Text style={styles.btnText}>Stop</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  centeredFallback: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  fallbackText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  cameraLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  overlayTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayTimer: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pausedBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    color: "#ffb4b4",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  debugPanel: {
    position: "absolute",
    zIndex: 1,
    maxWidth: 180,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  debug: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  debugVis: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  debugSmall: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    marginTop: 4,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  bottomPanel: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
  },
  overlayReps: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  overlayRepsLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  btnStart: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
  },
  btnPause: {
    backgroundColor: "#FF9800",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  btnResume: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  btnStop: {
    backgroundColor: "#f44336",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
