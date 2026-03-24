import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getStatusUI } from "@/utils/tracking";
import { color } from "@/constant/color";

interface DonorItemProps {
  item: any;
}

export const DonorItem = ({ item }: DonorItemProps) => {
  const itemUI = getStatusUI(item.statut);
  return (
    <View style={styles.donorItem}>
      <View style={styles.donorAvatar}>
        <Text style={styles.avatarText}>
          {item.donneur.charAt(0)}
        </Text>
      </View>
      <View style={styles.donorInfo}>
        <Text style={styles.donorName}>{item.donneur}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.donorSub}>{item.telephone}</Text>
          {item.distance !== null && (
            <>
              <Text style={styles.distanceDot}>•</Text>
              <View style={styles.distanceBadge}>
                <TabBarIcon name="map-marker" size={10} color="#64748B" />
                <Text style={styles.distanceText}>{item.distance} km</Text>
              </View>
            </>
          )}
        </View>
      </View>
      <View
        style={[
          styles.miniStatus,
          { backgroundColor: itemUI.color + "15" },
        ]}
      >
        <Text
          style={[styles.miniStatusText, { color: itemUI.color }]}
        >
          {itemUI.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  donorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 22,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 5,
  },
  donorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "800", color: color.primary, fontSize: 16 },
  donorInfo: { flex: 1, marginLeft: 15 },
  donorName: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  donorSub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  distanceDot: { color: "#CBD5E1", fontSize: 12 },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: { fontSize: 10, fontWeight: "700", color: "#64748B" },
  miniStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  miniStatusText: { fontSize: 10, fontWeight: "800" },
});
