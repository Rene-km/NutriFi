import { SquatDetector } from "../../../utils/squatDetector";
import { landmarkNames } from "../../../utils/landmarks";
import type { Landmark } from "../../../utils/utils";

const mockLandmark = (
  x = 0,
  y = 0,
  visibility = 0.7,
  presence = 0.7,
): Landmark => ({
  x,
  y,
  z: 0,
  visibility,
  presence,
})

const mockFrame = (
  side: "left" | "right" = "right",
  visibility = 1,
  hip = { x: 0, y: 1 },
  knee = { x: 0, y: 0 },
  ankle = { x: 0, y: -1 },
): Landmark[] => {
  const arr = Array.from({ length: 33 }, () => mockLandmark())

  const hipLandmark = side === "left" ? landmarkNames.LEFT_HIP : landmarkNames.RIGHT_HIP
  const kneeLandmark = side === "left" ? landmarkNames.LEFT_KNEE : landmarkNames.RIGHT_KNEE
  const ankleLandmark = side === "left" ? landmarkNames.LEFT_ANKLE : landmarkNames.RIGHT_ANKLE

  arr[hipLandmark] = mockLandmark(hip.x, hip.y, visibility)
  arr[kneeLandmark] = mockLandmark(knee.x, knee.y, visibility)
  arr[ankleLandmark] = mockLandmark(ankle.x, ankle.y, visibility)

  return arr

}

describe("squatDetector", () => {
  it("it increments counter after a full squat", () => {
    const detector = new SquatDetector()

    detector.detectPose(
        mockFrame("right", 1, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }),
    )
    expect(detector.counter).toBe(0)

    detector.detectPose(mockFrame("right", 1))
     expect(detector.counter).toBe(1)
  })


  it("it does not increment counter when visibility is too low", () => {
    const detector = new SquatDetector()

    detector.detectPose(
      mockFrame("right", 0.3, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }),
    )
    detector.detectPose(mockFrame("right", 0.3))

    expect(detector.counter).toBe(0)
  })


  it("it does not increment counter when the user does not go down first", () => {
    const detector = new SquatDetector()

    detector.detectPose(mockFrame("right", 1))
    detector.detectPose(mockFrame("right", 1))

    expect(detector.counter).toBe(0)
  })



  it("it can count a squat using the left side landmarks", () => {
    const detector = new SquatDetector()

    detector.detectPose(
      mockFrame("left", 1, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }),
    )
    detector.detectPose(mockFrame("left", 1))

    expect(detector.counter).toBe(1)
    expect(detector.sideUsed).toBe("left")
  })
})
