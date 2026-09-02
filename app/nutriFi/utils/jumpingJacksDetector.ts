import { landmarkNames } from "./landmarks";
import { Detecter } from "./MotionDetection";
import type { Landmark } from "./utils";

export class JumpingJacksDetector extends Detecter {
  constructor() {
    super();
  }

  filterFrame(landmarks: Landmark[]): boolean {
    const minRequiredPresence = 0.65;
    const minRequiredVisibility = 0.65;

    const joints = [
      landmarkNames.LEFT_SHOULDER,
      landmarkNames.RIGHT_SHOULDER,
      landmarkNames.LEFT_WRIST,
      landmarkNames.RIGHT_WRIST,
    ];

    for (const j of joints) {
      const lm = landmarks[j];
      if (
        lm.presence < minRequiredPresence ||
        lm.visibility < minRequiredVisibility
      ) {
        return false;
      }
    }

    return true;
  }

  processFrame(landmarks: Landmark[]): void {
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const rightShoulder = landmarks[landmarkNames.RIGHT_SHOULDER];
    const leftWrist = landmarks[landmarkNames.LEFT_WRIST];
    const rightWrist = landmarks[landmarkNames.RIGHT_WRIST];


    const handsUp =
      leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
    const handsDown =
      leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y;

    if (handsUp && this.down && !this.up) {
      this.up = true;
      this.down = false;
    }

    if (handsDown && this.up && !this.down) {
      this.down = true;
      this.up = false;
      this.counter += 1;
    }
  }

  validateSpecificExcercise(_landmarks: Landmark[]): void {
    // No specific validation for jumping jacks
  }

  detectPose(landmarks: Landmark[]): void {
    if (this.isUnstable(landmarks)) return;
    if (this.filterFrame(landmarks) === false) return;
    this.processFrame(landmarks);
  }
}
