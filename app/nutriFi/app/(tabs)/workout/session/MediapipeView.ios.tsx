import React from "react";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require("@thinksys/react-native-mediapipe") as {
  RNMediapipe?: React.ComponentType<any>;
  default?: React.ComponentType<any>;
};

const RNMediapipe = mod.RNMediapipe ?? mod.default;

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
  if (!RNMediapipe) return null;
  return <RNMediapipe {...props} />;
}