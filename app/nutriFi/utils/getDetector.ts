import type { Detecter } from "./MotionDetection";
import { PushupDetector } from "./pushupDetector";
import { JumpingJacksDetector } from "./jumpingJacksDetector";
import { SquatDetector } from "./squatDetector";
import { SitupDetector } from "./situpDetector";

export function getDetectorForExercise(exerciseName: string): Detecter | null {
  const name = (exerciseName ?? "").toLowerCase().trim();

  if (
    name.includes("pushup") ||
    name.includes("push-up") ||
    name === "push-ups"
  ) {
    return new PushupDetector();
  }

  if (name.includes("jumping jacks") || name === "jumping jacks") {
    return new JumpingJacksDetector();
  }

  if (name.includes("squat")) {
    return new SquatDetector();
  }

  if (
    name.includes("situp") ||
    name.includes("sit-up") ||
    name.includes("sit up")
  ) {
    return new SitupDetector();
  }

  return null;
}