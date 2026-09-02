import React from 'react'
import { Pressable, Text } from 'react-native';

type ChipProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
    testID?: string;
  };

const Chip = ({ label, selected, onPress, testID }: ChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 999,
        backgroundColor: selected ? "#3981f6" : "#f5f5f5 ",
        borderColor: selected ? "#3981f6" : "#e4e8ef",
      }}
    >
      <Text style={{ color: selected ? "#ffffff" : "##4b5666 " }}>{label}</Text>
    </Pressable>
  )
}

export default Chip