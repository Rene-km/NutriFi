import { JumpingJacksDetector } from "../../../utils/jumpingJacksDetector";
import type { Landmark } from "../../../utils/utils";

const mockLandmark = (visibility = 0.7, presence = 0.7, y = 0.5): Landmark => ({
    x: 0,
    y,
    z: 0,
    visibility,
    presence,
  })

  const mockFrame = (visibility = 1, presence = 1): Landmark[] => {
    
    const arr = Array.from({ length: 33 }, () => mockLandmark());
  
    
    arr[11] = mockLandmark(visibility, presence); // LEFT_SHOULDER
    arr[12] = mockLandmark(visibility, presence); // RIGHT_SHOULDER
    arr[15] = mockLandmark(visibility, presence); // LEFT_WRIST
    arr[16] = mockLandmark(visibility, presence); // RIGHT_WRIST
  
    return arr
  }

  const mockFrameY = (visibility = 1, presence = 1, y1 = 0.5, y2 = 0.5,
     y3 = 0.5, y4 = 0.5): Landmark[] => {
  
    const arr = Array.from({ length: 33 }, () => mockLandmark());
  
    
    arr[11] = mockLandmark(visibility, presence, y1); // LEFT_SHOULDER
    arr[12] = mockLandmark(visibility, presence, y2); // RIGHT_SHOULDER
    arr[15] = mockLandmark(visibility, presence, y3); // LEFT_WRIST
    arr[16] = mockLandmark(visibility, presence, y4); // RIGHT_WRIST
  
    return arr
  }


describe("jumpingJacksDetector", () => {
    it('it retuns false when unstable', () => {
        const detector = new JumpingJacksDetector()
        expect(detector.filterFrame(mockFrame(0.7, 0.67))).toBe(true)
        expect(detector.filterFrame(mockFrame(0.64, 0.55))).toBe(false)
        expect(detector.filterFrame(mockFrame(0.50, 0.70))).toBe(false)
        expect(detector.filterFrame(mockFrame(0.80, 0.60))).toBe(false)
    })

    it('it increments counter after a successful jumping jack', () => {
        const detector = new JumpingJacksDetector()

        // rep 1
        detector.previousLandmarks = null
        detector.detectPose(mockFrameY(1, 1, 0.58, 0.61, 0.19, 0.21)) // up
        expect(detector.counter).toBe(0)
        detector.previousLandmarks = null
        detector.detectPose(mockFrameY(1, 1, 0.57, 0.60, 0.83, 0.85)) // down
        expect(detector.counter).toBe(1)

        // rep 2
        detector.previousLandmarks = null
        detector.detectPose(mockFrameY(1, 1, 0.55, 0.57, 0.25, 0.27)) // up
        expect(detector.counter).toBe(1)
        detector.previousLandmarks = null
        detector.detectPose(mockFrameY(1, 1, 0.56, 0.58, 0.78, 0.76)) // down
        expect(detector.counter).toBe(2)

        // rep 3
        detector.previousLandmarks = null
        detector.detectPose(mockFrameY(1, 1, 0.63, 0.65, 0.30, 0.28)) // up
        expect(detector.counter).toBe(2)
        detector.previousLandmarks = null
        detector.detectPose(mockFrameY(1, 1, 0.62, 0.64, 0.85, 0.87)) //down
        expect(detector.counter).toBe(3)
    })

})

