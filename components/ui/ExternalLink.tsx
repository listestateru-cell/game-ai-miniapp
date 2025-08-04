import React from "react";
import { Linking, Pressable, Text } from "react-native";
export function ExternalLink({ href, children }) {
  return (
    <Pressable onPress={() => Linking.openURL(href)}>
      <Text style={{ color: "blue", textDecorationLine: "underline" }}>{children}</Text>
    </Pressable>
  );
}