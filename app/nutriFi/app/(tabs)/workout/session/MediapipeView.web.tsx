import React from "react";
import { PoseCameraWeb } from "@/utils/webCamera";

export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
};

export type LandmarkPayload = {
  landmarks?: Landmark[];
};

export type MediapipeViewProps = {
  width: number;
  height: number;
  onLandmark: (data: LandmarkPayload) => void;
};

export default function MediapipeView(props: MediapipeViewProps) {
  return <PoseCameraWeb {...props} />;
}