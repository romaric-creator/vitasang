import React from "react";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";

export type IconFamily = "fontawesome" | "material" | "feather";

interface IconProps {
  name: string;
  color: string;
  size: number;
  family?: IconFamily;
  style?: StyleProp<ViewStyle>;
}

/**
 * Enhanced Icon Component with support for multiple icon families
 * Default: FontAwesome for backward compatibility
 */
export const TabBarIcon: React.FC<IconProps> = ({
  name,
  color,
  size,
  family = "fontawesome",
  style,
}) => {
  switch (family) {
    case "material":
      return (
        <MaterialCommunityIcons
          size={size}
          name={name as any}
          color={color}
          style={style}
        />
      );
    case "feather":
      return (
        <Feather size={size} name={name as any} color={color} style={style} />
      );
    case "fontawesome":
    default:
      return (
        <FontAwesome
          size={size}
          name={name as any}
          color={color}
          style={style}
        />
      );
  }
};

/**
 * Icon families and their available icons (for reference)
 * FontAwesome: heart, bolt, map-marker, info-circle, calendar-check-o, smile-o, heartbeat, coffee, shield, etc.
 * MaterialCommunityIcons: More modern icons - alert-circle, check-circle, calendar-check, map-marker, heart-outline, etc.
 * Feather: Clean, minimal icons - heart, zap, map-pin, info, calendar, smile, alert-circle, etc.
 */

export const IconFamilies = {
  fontawesome: "fontawesome",
  material: "material",
  feather: "feather",
} as const;
