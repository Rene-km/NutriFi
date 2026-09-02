import { Landmark } from "./utils";

export class Detecter {
    movementThreshold: number;
    previousLandmarks: Landmark[] | null = null;
    up: boolean | null;
    down: boolean | null;
    counter = 0;

    constructor() {
        this.movementThreshold = 0.2;
        this.up = false;
        this.down = true;
    }

    isUnstable(landmarks: Landmark[]): boolean {
        if (!this.previousLandmarks || this.previousLandmarks.length !== landmarks.length) {
            this.previousLandmarks = landmarks.map((l) => ({ ...l }));
            return false;
        }

        let unstable = false;
        landmarks.forEach((landmark, index) => {
            const prevLandmark = this.previousLandmarks![index];
            const dx = landmark.x - prevLandmark.x;
            const dy = landmark.y - prevLandmark.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.movementThreshold) {
                unstable = true;
            }
        });

        this.previousLandmarks = landmarks.map((l) => ({ ...l }));
        return unstable;
    }

    filterFrame(landmarks: Landmark[]) {}
    processFrame(landmarks: Landmark[]) {}
    validateSpecificExcercise(landmarks: Landmark[]) {}
    detectPose(landmarks: Landmark[]) {}

    reset() {
        this.counter = 0;
        this.up = false;
        this.down = true;
        this.previousLandmarks = null;
    }
}