import { Pressable, StyleSheet, Text, View } from "react-native";

type TabButtonProps = {
  labels: [string, string];
  selectedIndex: 0 | 1;
  onChange: (index: 0 | 1) => void;
  testIDPrefix?: string;
};

export default function TabButton({ labels, selectedIndex, onChange, testIDPrefix }: TabButtonProps) {
  return (
    <View style={styles.container}>
      {[0, 1].map((i) => (
        <Pressable
          key={i}
          style={[styles.segment, selectedIndex === i && styles.segmentActive]}
          onPress={() => onChange(i as 0 | 1)}
          testID={testIDPrefix ? `${testIDPrefix}-tab-${i}` : undefined}
          accessibilityState={{ selected: selectedIndex === i }}
        >
          <Text style={[styles.label, selectedIndex === i && styles.labelActive]}>
            {labels[i]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: "row", 
    backgroundColor: "#e5e7eb", 
    borderRadius: 9, 
    padding: 2,
    marginBottom: 10
},
  segment: { 
    flex: 1, 
    paddingVertical: 8, 
    alignItems: "center", 
    borderRadius: 7 
},
  segmentActive: {
    backgroundColor: "#fff" 
},
  label: { 
    fontSize: 15, 
    color: "#6b7280", 
    fontWeight: "600" 
},
  labelActive: { 
    color: "#111" 
},
});