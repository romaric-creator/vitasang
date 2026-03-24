import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getStatusUI } from "@/utils/tracking";

interface AlertHeroCardProps {
  alerte: any;
  handleItinerary: () => void;
}

export const AlertHeroCard = ({ alerte, handleItinerary }: AlertHeroCardProps) => {
  const statusConfig = getStatusUI(alerte?.statut);

  return (
    <View style={styles.heroCard}>
      <View style={[styles.bloodDiamond, { backgroundColor: "#E11D48" }]}>
        <Text style={styles.bloodText}>
          {alerte?.groupe || alerte?.groupe_requis}
        </Text>
      </View>

      <Text style={styles.locationTitle}>
        {alerte?.lieu || "Hôpital proche"}
      </Text>

      <View
        style={[
          styles.mainStatusBadge,
          { backgroundColor: statusConfig.color + "15" },
        ]}
      >
        <View
          style={[styles.pulseDot, { backgroundColor: statusConfig.color }]}
        />
        <Text
          style={[styles.mainStatusText, { color: statusConfig.color }]}
        >
          {statusConfig.label.toUpperCase()}
        </Text>
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.heroActions}>
        <TouchableOpacity
          style={styles.heroActionBtn}
          onPress={handleItinerary}
        >
          <TabBarIcon
            name="map-marker"
            family="fontawesome"
            size={16}
            color="#3B82F6"
          />
          <Text style={styles.heroActionLabel}>Itinéraire</Text>
        </TouchableOpacity>
        <View style={styles.heroActionSeparator} />
        <TouchableOpacity style={styles.heroActionBtn}>
          <TabBarIcon
            name="share-alt"
            family="fontawesome"
            size={16}
            color="#64748B"
          />
          <Text style={styles.heroActionLabel}>Partager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  bloodDiamond: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    transform: [{ rotate: "45deg" }],
    shadowColor: "#E11D48",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bloodText: {
    color: "white",
    fontWeight: "900",
    fontSize: 24,
    transform: [{ rotate: "-45deg" }],
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 12,
  },
  mainStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  mainStatusText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  heroDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 20,
  },
  heroActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  heroActionBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroActionLabel: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  heroActionSeparator: { width: 1, height: 20, backgroundColor: "#F1F5F9" },
});
