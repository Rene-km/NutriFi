import { Detecter } from "../../../utils/MotionDetection";
import type { Landmark } from "../../../utils/utils";

function lm(x: number, y: number): Landmark {
  return { x, y, z: 0, visibility: 1, presence: 1 };
}

describe("Detecter", () => {
  it("returns false on first frame and sets baseline", () => {
    const detector = new Detecter();
    const frame = [lm(0, 0), lm(1, 1)];

    expect(detector.isUnstable(frame)).toBe(false);
    expect(detector.previousLandmarks).not.toBeNull();
    expect(detector.previousLandmarks).toEqual(frame);
    expect(detector.previousLandmarks).not.toBe(frame);
  });

  it("returns false when movement is at or below threshold", () => {
    const detector = new Detecter();
    detector.isUnstable([lm(0, 0)]);

    expect(detector.isUnstable([lm(0.2, 0)])).toBe(false); 
    expect(detector.isUnstable([lm(0.19, 0)])).toBe(false);
  });

  it("returns true when any landmark moves above threshold", () => {
    const d = new Detecter();
    d.isUnstable([lm(0, 0), lm(1, 1)]);

    expect(d.isUnstable([lm(0.21, 0), lm(1, 1)])).toBe(true);
  });

  it("returns false and resets baseline when landmark count changes", () => {
    const d = new Detecter();
    d.isUnstable([lm(0, 0), lm(1, 1)]);

    expect(d.isUnstable([lm(0, 0)])).toBe(false);
  });

  it("reset restores default state", () => {
    const detector = new Detecter();
    detector.counter = 5;
    detector.up = true;
    detector.down = false;
    detector.previousLandmarks = [lm(1, 1)];

    detector.reset();

    expect(detector.counter).toBe(0);
    expect(detector.up).toBe(false);
    expect(detector.down).toBe(true);
    expect(detector.previousLandmarks).toBeNull();
  });
});