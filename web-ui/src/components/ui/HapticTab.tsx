import { Text, TouchableOpacity } from "react-native";
export function HapticTab({ children, ...props }) {
  return <TouchableOpacity {...props}><Text>{children}</Text></TouchableOpacity>;
}