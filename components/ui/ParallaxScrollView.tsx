import React from "react";
import { ScrollView } from "react-native";

// Экспорт
export default function ParallaxScrollView({ children }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }}>
      {children}
    </ScrollView>
  );
}