import { landmarkNames } from "./landmarks";
import { Detecter } from "./MotionDetection";
import { GetAngle, Landmark } from "./utils";

type Side = "left" | "right";

export class SquatDetector extends Detecter {
  STAND_ANGLE = 160;
  SQUAT_ANGLE = 110;
  MIN_VIS = 0.45;

  lastKneeAngle = 0;
  wentDown = false;
  sideUsed: Side = "right";

  private chooseSide(landmarks: Landmark[]): Side {
    const lKnee = landmarks[landmarkNames.LEFT_KNEE];
    const rKnee = landmarks[landmarkNames.RIGHT_KNEE];
    const lv = lKnee?.visibility ?? 0;
    const rv = rKnee?.visibility ?? 0;
    return lv >= rv ? "left" : "right";
  }

  private ok(lm?: Landmark) {
    return !!lm && (lm.visibility ?? 0) >= this.MIN_VIS;
  }

  reset() {
    super.reset();
    this.wentDown = false;
    this.lastKneeAngle = 0;
  }

  detectPose(landmarks: Landmark[]) {
    if (!landmarks || landmarks.length < 33) return;

    const side = this.chooseSide(landmarks);
    this.sideUsed = side;

    const hip = side === "left"
      ? landmarks[landmarkNames.LEFT_HIP]
      : landmarks[landmarkNames.RIGHT_HIP];
    const knee = side === "left"
      ? landmarks[landmarkNames.LEFT_KNEE]
      : landmarks[landmarkNames.RIGHT_KNEE];
    const ankle = side === "left"
      ? landmarks[landmarkNames.LEFT_ANKLE]
      : landmarks[landmarkNames.RIGHT_ANKLE];

    if (!hip || !knee || !ankle) return;
    if (!this.ok(hip) || !this.ok(knee) || !this.ok(ankle)) return;

    const angle = GetAngle(hip, knee, ankle);
    if (!Number.isFinite(angle)) return;

    this.lastKneeAngle = angle;

    if (!this.wentDown && angle <= this.SQUAT_ANGLE) {
      this.wentDown = true;
      return;
    }

    if (this.wentDown && angle >= this.STAND_ANGLE) {
      this.counter++;
      this.wentDown = false;
    }
  }
}