import { PushupDetector } from "../../../utils/pushupDetector";
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
  visibility = 1,
  presence = 1,
  shoulder = { x: 0, y: 1 },
  elbow = { x: 0, y: 0 },
  wrist = { x: 0, y: -1 },
): Landmark[] => {
  const arr = Array.from({ length: 33 }, () =>
    mockLandmark(0, 0, visibility, presence),
  )

  arr[landmarkNames.RIGHT_SHOULDER] = mockLandmark(
    shoulder.x,
    shoulder.y,
    visibility,
    presence,
  )
  arr[landmarkNames.RIGHT_ELBOW] = mockLandmark(
    elbow.x,
    elbow.y,
    visibility,
    presence,
  )
  arr[landmarkNames.RIGHT_WRIST] = mockLandmark(
    wrist.x,
    wrist.y,
    visibility,
    presence,
  )

  arr[landmarkNames.LEFT_SHOULDER] = mockLandmark(
    shoulder.x,
    shoulder.y,
    visibility,
    presence,
  )
  arr[landmarkNames.LEFT_ELBOW] = mockLandmark(
    elbow.x,
    elbow.y,
    visibility,
    presence,
  )
  arr[landmarkNames.LEFT_WRIST] = mockLandmark(
    wrist.x,
    wrist.y,
    visibility,
    presence,
  )

  return arr
}

describe("pushupDetector", () => {
  it("it returns false when visibility or presence is too low", () => {
    const detector = new PushupDetector()

    expect(detector.filterFrame(mockFrame(1, 1))).toBe(true)
    expect(detector.filterFrame(mockFrame(0.64, 1))).toBe(false)
    expect(detector.filterFrame(mockFrame(1, 0.64))).toBe(false)
  })

  it("it increments counter when the arms are straight", () => {
    const detector = new PushupDetector()

    detector.detectPose(mockFrame(1, 1))

    expect(detector.counter).toBe(1)
    expect(detector.up).toBe(true)
    expect(detector.down).toBe(false)
  })

  it("it counts another pushup after going down and back up", () => {
    const detector = new PushupDetector()
    detector.movementThreshold = 10

    detector.detectPose(mockFrame(1, 1))
    detector.detectPose(mockFrame(1, 1, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0.2, y: 0.1 }))
    detector.detectPose(mockFrame(1, 1))

    expect(detector.counter).toBe(2)
    expect(detector.up).toBe(true)
    expect(detector.down).toBe(false)
  })

  it("it does not increment counter when the frame is unstable", () => {
    const detector = new PushupDetector()

    detector.detectPose(mockFrame(1, 1))
    detector.detectPose(mockFrame(1, 1, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0.5, y: 0.5 }))

    expect(detector.counter).toBe(1)
  })
})
