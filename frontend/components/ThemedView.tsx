import React from "react";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { color } from "@/constant/color";

export default function ThemedView({
  children,
  style,
  ...res
}: SafeAreaViewProps) {
  return (
    <SafeAreaView style={[{ backgroundColor: color.background }, style]} {...res}>
      {children}
    </SafeAreaView>
  );
}


