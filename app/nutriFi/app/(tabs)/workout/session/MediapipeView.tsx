import React from "react";
import { View, Text } from "react-native";

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

export default function MediapipeView(_props: MediapipeViewProps) {
  return (
    <View style={{ padding: 16 }}>
      <Text>Pose detection is not available on this platform.</Text>
    </View>
  );
}