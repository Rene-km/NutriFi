import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

/**
 * Keep this pinned instead of using @latest.
 * Using @latest can sometimes pull a WASM version that does not match your installed package.
 */
const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
};

type PoseCameraWebProps = {
  width: number;
  height: number;
  onLandmark?: (data: { landmarks: Landmark[] }) => void;
};

export function PoseCameraWeb({
  width,
  height,
  onLandmark,
}: PoseCameraWebProps) {
  const containerRef = useRef<View>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const onLandmarkRef = useRef(onLandmark);
  const lastStatusUpdateRef = useRef(0);
  const frameCounterRef = useRef(0);
  const poseCounterRef = useRef(0);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Starting camera...");
  const [framesChecked, setFramesChecked] = useState(0);
  const [posesDetected, setPosesDetected] = useState(0);

  useEffect(() => {
    onLandmarkRef.current = onLandmark;
  }, [onLandmark]);

  const updateStatusThrottled = useCallback(
    (nextStatus: string, force = false) => {
      const now = Date.now();

      if (force || now - lastStatusUpdateRef.current > 500) {
        lastStatusUpdateRef.current = now;
        setStatus(nextStatus);
        setFramesChecked(frameCounterRef.current);
        setPosesDetected(poseCounterRef.current);
      }
    },
    []
  );

  const convertLandmarks = useCallback((poseLandmarks: NormalizedLandmark[]) => {
    if (!poseLandmarks || poseLandmarks.length === 0) return;

    const landmarks: Landmark[] = poseLandmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 0,
      presence: lm.visibility ?? 0,
    }));

    onLandmarkRef.current?.({ landmarks });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const container = containerRef.current as unknown as HTMLElement | null;

    if (!container) {
      setError("Camera container not found");
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;

    const video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    video.setAttribute("playsinline", "true");
    video.setAttribute("muted", "true");

    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.transform = "scaleX(-1)";

    videoRef.current = video;
    container.appendChild(video);

    const init = async () => {
      try {
        console.log("[PoseCameraWeb] Requesting camera...");
        setStatus("Requesting camera permission...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: Math.min(width, 1280),
            height: Math.min(height, 720),
            facingMode: "user",
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        console.log("[PoseCameraWeb] Camera stream received");
        setStatus("Camera started. Loading video...");

        video.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Video failed to load"));
        });

        await video.play();

        console.log("[PoseCameraWeb] Video playing", {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });

        setStatus("Video playing. Loading MediaPipe model...");

        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

        if (cancelled) return;

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.3,
          minPosePresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }

        poseLandmarkerRef.current = landmarker;

        console.log("[PoseCameraWeb] MediaPipe PoseLandmarker ready");
        setReady(true);
        updateStatusThrottled("Pose model ready. Looking for body...", true);
      } catch (e) {
        console.error("[PoseCameraWeb] Init error:", e);

        const message = e instanceof Error ? e.message : String(e);
        setError(message || "Failed to start pose camera");
        setStatus("Pose camera failed");
      }
    };

    void init();

    return () => {
      cancelled = true;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current && container.contains(videoRef.current)) {
        container.removeChild(videoRef.current);
      }

      videoRef.current = null;

      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;

      setReady(false);
    };
  }, [height, updateStatusThrottled, width]);

  useEffect(() => {
    if (Platform.OS !== "web" || !ready) return;

    const video = videoRef.current;
    const landmarker = poseLandmarkerRef.current;

    if (!video || !landmarker) {
      setStatus("Video or pose model missing");
      return;
    }

    let active = true;

    const renderLoop = () => {
      if (!active) return;

      try {
        if (video.readyState >= 2) {
          frameCounterRef.current += 1;

          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;

            const result = landmarker.detectForVideo(
              video,
              performance.now()
            );

            const pose = result?.landmarks?.[0];

            if (pose && pose.length > 0) {
              poseCounterRef.current += 1;

              if (poseCounterRef.current % 15 === 0) {
                console.log("[PoseCameraWeb] Pose detected", {
                  landmarks: pose.length,
                  posesDetected: poseCounterRef.current,
                  framesChecked: frameCounterRef.current,
                });
              }

              updateStatusThrottled("Pose detected");
              convertLandmarks(pose);
            } else {
              updateStatusThrottled(
                "No pose detected. Step back and show full body."
              );
            }
          }
        } else {
          updateStatusThrottled("Waiting for video frames...");
        }
      } catch (e) {
        console.error("[PoseCameraWeb] Frame error:", e);
        updateStatusThrottled("Pose frame error. Check console.", true);
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      active = false;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [convertLandmarks, ready, updateStatusThrottled]);

  if (Platform.OS !== "web") return null;

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <View
        ref={containerRef}
        style={styles.videoContainer}
        collapsable={false}
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  statusBox: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  smallText: {
    color: "#ddd",
    fontSize: 11,
  },
});