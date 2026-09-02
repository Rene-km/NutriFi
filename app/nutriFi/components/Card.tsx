import React from 'react';
import { View, Text, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

type CardProps = {
  children?: ReactNode;
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function Card({ children, header, style, contentStyle }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {header && <View style={styles.header}>{header}</View>}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 16,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 14,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    }
  
  })