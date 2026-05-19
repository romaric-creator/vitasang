import { View, ViewProps } from "react-native";
import { color } from "@/constant/color";

export default function ThemedView({
  children,
  style,
  ...res
}: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: color.background }, style]} {...res}>
      {children}
    </View>
  );
}


