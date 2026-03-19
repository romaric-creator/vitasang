import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animated?: boolean;
}

/**
 * Skeleton Loader Component - Meilleur que les spinners fullscreen
 * Utilise Moti pour les animations smooth
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
  animated = true,
}) => {
  if (!animated) {
    return (
      <View style={[styles.skeleton, { width, height, borderRadius }, style]} />
    );
  }

  return (
    <MotiView
      from={{ opacity: 0.6 }}
      animate={{ opacity: 0.3 }}
      transition={{ type: "timing", duration: 800, loop: true }}
      style={[styles.skeleton, { width, height, borderRadius }, style]}
    />
  );
};

/**
 * Skeleton List - Pour les listes de chargement
 */
export const SkeletonListLoader: React.FC<{
  count?: number;
  itemHeight?: number;
}> = ({ count = 5, itemHeight = 80 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItem, { height: itemHeight }]}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.textColumn}>
            <SkeletonLoader width="70%" height={16} />
            <SkeletonLoader width="50%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton Form - Pour les formulaires de chargement
 */
export const SkeletonFormLoader: React.FC<{ fieldCount?: number }> = ({
  fieldCount = 4,
}) => {
  return (
    <View style={styles.formContainer}>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <View key={index} style={styles.formField}>
          <SkeletonLoader width="40%" height={14} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="100%" height={45} borderRadius={8} />
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton Map Markers - Pour les marqueurs de carte
 */
export const SkeletonMapMarkers: React.FC<{ count?: number }> = ({
  count = 8,
}) => {
  return (
    <View style={styles.mapMarkersContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonMarker,
            {
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
            },
          ]}
        >
          <SkeletonLoader width={40} height={40} borderRadius={20} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#e0e0e0",
  },
  listContainer: {
    gap: 12,
    padding: 16,
  },
  listItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  textColumn: {
    flex: 1,
    gap: 8,
  },
  formContainer: {
    gap: 16,
    padding: 16,
  },
  formField: {
    gap: 8,
  },
  mapMarkersContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  skeletonMarker: {
    position: "absolute",
    zIndex: 1,
  },
});
