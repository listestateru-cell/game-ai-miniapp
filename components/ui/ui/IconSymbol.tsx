import React from "react";
import { Text } from "react-native";
export function IconSymbol({ size = 24, color = "#000", name, style }) {
  // Просто иконка-заглушка
  return (
    <Text style={[{ fontSize: size, color }, style]}>
      {name || "★"}
    </Text>
  );
}