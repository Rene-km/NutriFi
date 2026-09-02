import { landmarkNames } from "./landmarks";
import { Detecter } from "./MotionDetection";
import { GetAngle, Landmark } from "./utils";

type Side = "left" | "right";

export class SitupDetector extends Detecter {
  // Lying flat: shoulder-hip-knee close to a straight line.
  // Crunched up: torso folded toward thighs.
  LYING_ANGLE = 150;
  CRUNCHED_ANGLE = 100;
  MIN_VIS = 0.45;

  lastHipAngle = 0;
  wentUp = false;
  sideUsed: Side = "right";
  lastSkipReason = "";

  // Sit ups are usually filmed side-on (phone propped on the floor).
  // Pick whichever side has the most visible hip - that's the side facing
  // the camera.
  private chooseSide(landmarks: Landmark[]): Side {
    const lHip = landmarks[landmarkNames.LEFT_HIP];
    const rHip = landmarks[landmarkNames.RIGHT_HIP];
    const lv = lHip?.visibility ?? 0;
    const rv = rHip?.visibility ?? 0;
    return lv >= rv ? "left" : "right";
  }

  private ok(lm?: Landmark) {
    return !!lm && (lm.visibility ?? 0) >= this.MIN_VIS;
  }

  reset() {
    super.reset();
    this.wentUp = false;
    this.lastHipAngle = 0;
    this.lastSkipReason = "";
  }

  detectPose(landmarks: Landmark[]) {
    if (!landmarks || landmarks.length < 33) {
      this.lastSkipReason = "no landmarks";
      return;
    }

    const side = this.chooseSide(landmarks);
    this.sideUsed = side;

    const shoulder = side === "left"
      ? landmarks[landmarkNames.LEFT_SHOULDER]
      : landmarks[landmarkNames.RIGHT_SHOULDER];
    const hip = side === "left"
      ? landmarks[landmarkNames.LEFT_HIP]
      : landmarks[landmarkNames.RIGHT_HIP];
    const knee = side === "left"
      ? landmarks[landmarkNames.LEFT_KNEE]
      : landmarks[landmarkNames.RIGHT_KNEE];

    if (!shoulder || !hip || !knee) {
      this.lastSkipReason = "missing landmark";
      return;
    }
    if (!this.ok(shoulder)) { this.lastSkipReason = "shoulder vis low"; return; }
    if (!this.ok(hip)) { this.lastSkipReason = "hip vis low"; return; }
    if (!this.ok(knee)) { this.lastSkipReason = "knee vis low"; return; }

    // Angle at the hip joint, between the torso (shoulder->hip) and
    // the thigh (hip->knee). This is what closes when the user crunches up.
    const angle = GetAngle(shoulder, hip, knee);
    if (!Number.isFinite(angle)) {
      this.lastSkipReason = "angle NaN";
      return;
    }

    this.lastHipAngle = angle;
    this.lastSkipReason = "";

    // Crunched up - wait for return to lying before counting
    if (!this.wentUp && angle <= this.CRUNCHED_ANGLE) {
      this.wentUp = true;
      return;
    }

    // Returned to lying flat - that's one rep
    if (this.wentUp && angle >= this.LYING_ANGLE) {
      this.counter++;
      this.wentUp = false;
    }
  }
}