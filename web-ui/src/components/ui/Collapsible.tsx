import React from "react";
import { Text, View } from "react-native";
export function Collapsible({ title, children }) {
  return (
    <View
      style={{
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
      }}
    >
      <Text style={{ fontWeight: "bold", marginBottom: 5 }}>{title}</Text>
      {children}
    </View>
  );
}