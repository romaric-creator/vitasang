import React, { useState, useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  AppState,
  Alert as RNAlert,
  Platform,
  StatusBar,
} from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus, confirmDonation } from "@/services/user.service";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Extracted Components
import { PulseButton } from "@/components/tracking/PulseButton";
import { StatCard } from "@/components/tracking/StatCard";
import { AlertHeroCard } from "@/components/tracking/AlertHeroCard";
import { DonorItem } from "@/components/tracking/DonorItem";

export default function AlertTracking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const isMountedRef = useRef(true);

  const fetchStatus = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const res = await getAlertStatus(Number(id));
      if (isMountedRef.current) setData(res);
    } catch (error) {
      console.error("Tracking Error:", error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
      const interval = setInterval(() => {
        if (AppState.currentState === "active") fetchStatus();
      }, 15000);
      return () => {
        clearInterval(interval);
      };
    }, [id]),
  );

  const handleItinerary = () => {
    const alerte = data?.alerte;
    if (alerte?.latitude && alerte?.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${alerte.latitude},${alerte.longitude}`,
        android: `geo:0,0?q=${alerte.latitude},${alerte.longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const handleShareWhatsApp = () => {
    const alerte = data?.alerte;
    if (!alerte) return;
    const group = alerte.groupe_sanguin || alerte.groupe || alerte.groupe_requis || "?";
    const phone = alerte.telephone_contact || alerte.telephone_initiateur || alerte.initiateur?.telephone || "";
    const message = t("alert.shareMessage", {
      group,
      location: alerte.lieu || "Hôpital proche",
      phone,
      latitude: alerte.latitude || "",
      longitude: alerte.longitude || "",
      urgency: alerte.urgence || "URGENT",
      quantity: alerte.quantite_requise || "?",
      id: alerte.public_token || alerte.id || id || "",
    });
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then((supported) => {
      Linking.openURL(
        supported ? url : `https://wa.me/?text=${encodeURIComponent(message)}`,
      );
    });
  };

  const handleConfirmDonation = async () => {
    RNAlert.alert(
      t("alertTracking.confirmTitle"),
      t("alertTracking.confirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("alertTracking.confirmYes"),
          onPress: async () => {
            setConfirming(true);
            try {
              await confirmDonation(Number(id));
              fetchStatus();
              RNAlert.alert(t("alertTracking.congratsTitle"), t("alertTracking.congratsMessage"));
            } catch (e: any) {
              RNAlert.alert(t("common.error"), e.message);
            } finally {
              setConfirming(false);
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingOverlay visible={true} fullScreen />;

  const alerte = data?.alerte;
  const stats = data?.stats || { total: 0, lu: 0, accepte: 0 };
  const details = data?.details || [];

  const showConfirmButton = details.some(
    (d: any) => d.telephone === user?.telephone && d.statut === "accepte",
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={color.background} />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <TabBarIcon name="arrow-left" size={18} color={color.textMain} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t("alert.tracking.title") || "Suivi Alerte"}
        </Text>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchStatus}
          activeOpacity={0.7}
        >
          <TabBarIcon name="refresh" size={18} color={color.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Card */}
        <AlertHeroCard
          alerte={alerte}
          handleItinerary={handleItinerary}
          handleShare={handleShareWhatsApp}
        />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            label={t("alert.tracking.stats.notified") || "Notifiés"}
            value={stats.total}
            icon="users"
            iconColor={color.textSecondary}
          />
          <StatCard
            label={t("alert.tracking.stats.read") || "Lectures"}
            value={stats.lu}
            icon="eye"
            iconColor="#F59E0B"
          />
          <StatCard
            label={t("alert.tracking.stats.accepted") || "Réponses"}
            value={stats.accepte}
            icon="heartbeat"
            iconColor={color.primary}
          />
        </View>

        {/* Donneurs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("alertTracking.realEngagements")}</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>{details.length}</Text>
          </View>
        </View>

        {details.length > 0 ? (
          details.map((item: any, index: number) => (
            <DonorItem key={index} item={item} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <TabBarIcon name="clock-o" size={32} color={color.textLight} />
            <Text style={styles.emptyText}>{t("alertTracking.waitingDonors")}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {showConfirmButton && (
          <PulseButton
            onPress={handleConfirmDonation}
            loading={confirming}
            title={confirming ? t("alertTracking.inProgress") : t("alertTracking.donationDone")}
          />
        )}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>
            {t("alert.tracking.backHome") || "Retour au menu"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  // ─── Header ───────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: color.background,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.borderLight,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: color.textMain,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  // ─── Contenu ──────────────────────────────────────────────────
  scrollContent: {
    padding: 20,
    paddingBottom: 160,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: color.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badgeCount: {
    backgroundColor: color.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textMain,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: color.textLight,
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
  },
  // ─── Footer ───────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(248, 250, 252, 0.97)",
    borderTopWidth: 1,
    borderTopColor: color.borderLight,
    alignItems: "center",
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  secondaryBtnText: {
    color: color.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
});
