import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getStatusUI } from "@/utils/tracking";
import { color } from "@/constant/color";

interface DonorItemProps {
  item: any;
}

export const DonorItem = ({ item }: DonorItemProps) => {
  const itemUI = getStatusUI(item.statut);
  const canContact = (item.statut === "accepte" || item.statut === "don_effectue") && item.telephone;

  const openWhatsApp = () => {
    if (!item.telephone) return;
    const num = item.telephone.replace(/[^0-9]/g, "");
    const msg = `Bonjour ${item.donneur}, merci d'avoir accepté de donner votre sang. Pouvez-vous me confirmer votre disponibilité ?`;
    const url = `whatsapp://send?phone=${num}&text=${encodeURIComponent(msg)}`;
    Linking.canOpenURL(url).then(supported =>
      Linking.openURL(supported ? url : `https://wa.me/${num}?text=${encodeURIComponent(msg)}`)
    );
  };

  return (
    <View style={styles.donorItem}>
      <View style={styles.donorAvatar}>
        <Text style={styles.avatarText}>
          {item.donneur?.charAt(0)?.toUpperCase() || "?"}
        </Text>
      </View>
      <View style={styles.donorInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.donorName}>{item.donneur}</Text>
          {item.isGuest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestText}>lien</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.donorSub}>{item.telephone || "—"}</Text>
          {item.distance !== null && (
            <>
              <Text style={styles.distanceDot}>•</Text>
              <View style={styles.distanceBadge}>
                <TabBarIcon name="map-marker" size={10} color={color.textSecondary} />
                <Text style={styles.distanceText}>{item.distance} km</Text>
              </View>
            </>
          )}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <View style={[styles.miniStatus, { backgroundColor: itemUI.color + "15" }]}>
          <Text style={[styles.miniStatusText, { color: itemUI.color }]}>
            {itemUI.label}
          </Text>
        </View>
        {canContact && (
          <TouchableOpacity onPress={openWhatsApp} style={styles.waButton}>
            <TabBarIcon name="whatsapp" size={14} color="#25D366" />
          </TouchableOpacity>
        )}
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
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 5,
  },
  donorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "800", color: color.primary, fontSize: 18 },
  donorInfo: { flex: 1, marginLeft: 12 },
  donorName: { fontSize: 15, fontWeight: "700", color: color.textMain },
  donorSub: { fontSize: 11, color: color.textSecondary, marginTop: 2 },
  distanceDot: { color: color.borderLight, fontSize: 12 },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surfaceDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: { fontSize: 10, fontWeight: "700", color: color.textSecondary },
  miniStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  miniStatusText: { fontSize: 10, fontWeight: "800" },
  waButton: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#25D36615",
    justifyContent: "center", alignItems: "center",
  },
  guestBadge: {
    backgroundColor: color.primaryGhost,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  guestText: { fontSize: 9, fontWeight: "800", color: color.primary },
});
