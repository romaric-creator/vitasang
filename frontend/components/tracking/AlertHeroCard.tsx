import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getStatusUI } from "@/utils/tracking";

interface AlertHeroCardProps {
  alerte: any;
  handleItinerary: () => void;
  handleShare?: () => void;
}

export const AlertHeroCard = ({ alerte, handleItinerary, handleShare }: AlertHeroCardProps) => {
  const statusConfig = getStatusUI(alerte?.statut);

  return (
    <View style={styles.heroCard}>
      {/* Badge groupe sanguin */}
      <View style={styles.bloodDiamond}>
        <Text style={styles.bloodText}>
          {alerte?.groupe_sanguin || alerte?.groupe || alerte?.groupe_requis || "?"}
        </Text>
      </View>

      {/* Lieu */}
      <Text style={styles.locationTitle}>
        {alerte?.lieu || "Hôpital proche"}
      </Text>

      {/* Statut */}
      <View style={[styles.mainStatusBadge, { backgroundColor: statusConfig.color + "15" }]}>
        <View style={[styles.pulseDot, { backgroundColor: statusConfig.color }]} />
        <Text style={[styles.mainStatusText, { color: statusConfig.color }]}>
          {statusConfig.label.toUpperCase()}
        </Text>
      </View>

      {/* Méta-infos */}
      <View style={styles.metaRow}>
        {alerte?.urgence && (
          <View style={[styles.metaBadge, { backgroundColor: color.primaryGhost }]}>
            <TabBarIcon name="exclamation-triangle" size={10} color={color.primary} />
            <Text style={[styles.metaText, { color: color.primary }]}>
              {alerte.urgence}
            </Text>
          </View>
        )}
        {alerte?.quantite_requise && (
          <View style={[styles.metaBadge, { backgroundColor: color.surfaceDark }]}>
            <TabBarIcon name="tint" size={10} color={color.textSecondary} />
            <Text style={[styles.metaText, { color: color.textSecondary }]}>
              {alerte.quantite_requise} poche(s)
            </Text>
          </View>
        )}
      </View>

      <View style={styles.heroDivider} />

      {/* Actions */}
      <View style={styles.heroActions}>
        <TouchableOpacity style={styles.heroActionBtn} onPress={handleItinerary} activeOpacity={0.7}>
          <View style={[styles.actionIconBg, { backgroundColor: "#EFF6FF" }]}>
            <TabBarIcon name="map-marker" size={16} color="#3B82F6" />
          </View>
          <Text style={styles.heroActionLabel}>Itinéraire</Text>
        </TouchableOpacity>

        <View style={styles.heroActionSeparator} />

        <TouchableOpacity
          style={styles.heroActionBtn}
          onPress={handleShare}
          activeOpacity={0.7}
          disabled={!handleShare}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#F0FDF4" }]}>
            <TabBarIcon name="whatsapp" size={16} color="#25D366" />
          </View>
          <Text style={styles.heroActionLabel}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  bloodDiamond: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    transform: [{ rotate: "45deg" }],
    shadowColor: color.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bloodText: {
    color: "white",
    fontWeight: "900",
    fontSize: 22,
    transform: [{ rotate: "-45deg" }],
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    textAlign: "center",
    marginBottom: 12,
  },
  mainStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 8,
    marginBottom: 12,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  mainStatusText: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 4,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "700",
  },
  heroDivider: {
    width: "100%",
    height: 1,
    backgroundColor: color.borderLight,
    marginVertical: 18,
  },
  heroActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  heroActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  actionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  heroActionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: color.textSecondary,
  },
  heroActionSeparator: {
    width: 1,
    height: 28,
    backgroundColor: color.borderLight,
  },
});
