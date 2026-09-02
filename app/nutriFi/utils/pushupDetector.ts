import { landmarkNames } from "./landmarks";
import { Detecter } from "./MotionDetection";
import { GetAngle, Landmark } from "./utils";

export class PushupDetector extends Detecter {

    armAngle: number | null;
    groundLevel = 0.5;

    constructor() {
        super()
        this.armAngle = null
    }

        filterFrame(landmarks: Landmark[]) {
            const minRequiredPresence = 0.65;
            const minRequiredVisibility = 0.65;
          
            const rightJoints = [
              landmarkNames.RIGHT_SHOULDER,
              landmarkNames.RIGHT_ELBOW,
              landmarkNames.RIGHT_WRIST,
            ];
            const leftJoints = [
              landmarkNames.LEFT_SHOULDER,
              landmarkNames.LEFT_ELBOW,
              landmarkNames.LEFT_WRIST,
            ];
          
            const joints = [...rightJoints, ...leftJoints];
          
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
        const rightAngle = GetAngle(
            landmarks[landmarkNames.RIGHT_SHOULDER],
            landmarks[landmarkNames.RIGHT_ELBOW],
            landmarks[landmarkNames.RIGHT_WRIST]
        )
        const leftAngle = GetAngle(
            landmarks[landmarkNames.LEFT_SHOULDER],
            landmarks[landmarkNames.LEFT_ELBOW],
            landmarks[landmarkNames.LEFT_WRIST]
        )

        const rightVisibility = landmarks[landmarkNames.RIGHT_ELBOW].visibility
        const leftVisibility = landmarks[landmarkNames.LEFT_ELBOW].visibility

        if (rightVisibility > leftVisibility) {
            this.armAngle = rightAngle
        } else if (leftVisibility > rightVisibility) {
            this.armAngle = leftAngle
        } else {
            this.armAngle = (rightAngle + leftAngle) / 2
        }

        if (this.armAngle > 155 && this.down == true && this.up == false) {
            this.up = true
            this.down = false
            this.counter++
            console.log(this.counter)
        }

        if (this.armAngle < 95 && this.up == true && this.down == false) {
            this.down = true
            this.up = false
            console.log("down", this.counter)
        }
    }

    validateSpecificExcercise(landmarks: Landmark[]){
        if (landmarks[landmarkNames.LEFT_WRIST].y < this.groundLevel || landmarks[landmarkNames.RIGHT_WRIST].y < this.groundLevel) {
            return false;
          }
    }

   

    detectPose(landmarks: Landmark[]) {
        
        if (this.isUnstable(landmarks)) {return}
        if(this.filterFrame(landmarks) === false) {return} 
        //if (this.validateSpecificExcercise(landmarks) === false) {return}
        this.processFrame(landmarks)
    }

} 