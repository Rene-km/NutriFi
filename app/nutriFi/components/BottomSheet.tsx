import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";


export const Chip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={{
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 999,
      backgroundColor: selected ? "#3981f6" : "#f5f5f5",
      borderColor: selected ? "#3981f6" : "#e4e8ef",
    }}
  >
    <Text style={{ color: selected ? "#ffffff" : "#4b5666" }}>{label}</Text>
  </Pressable>
);

type BottomSheetSelectorProps = {
  label: string;
  selectedValue: string;
  options: string[];
  onSelect: (value: string) => void;
  testID?: string;
};

export const BottomSheetSelector = ({
  label,
  selectedValue,
  options,
  onSelect,
  testID,
}: BottomSheetSelectorProps) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = useMemo(() => selectedValue || "Select", [selectedValue]);

  return (
    <View>
     
      <Pressable style={styles.selectorButton} 
      onPress={() => setVisible(true)}
      accessible={true}
      testID={testID}>
        <Text style={styles.selectorValue}>{selectedLabel}</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={styles.sheetCard} accessibilityViewIsModal={true}>
            {options.map((option) => (
              <Pressable
                key={option}
                testID={testID ? `${testID}-option-${option}` : undefined}
                accessible={true}
                accessibilityLabel={testID ? `${testID}-option-${option}` : option}
                style={styles.optionButton}
                onPress={() => {
                  onSelect(option);
                  setVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BottomSheetSelector;

const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e8ef",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  selectorValue: {
    color: "#1d1d1d",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000073",
  },
  sheetCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  optionText: {
    color: "#1d1d1d",
  },
});