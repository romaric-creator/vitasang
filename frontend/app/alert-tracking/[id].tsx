import React, { useEffect, useState, useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  AppState,
} from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus } from "@/services/user.service";
import { useTranslation } from "react-i18next";

interface NotifiedDonor {
  id: number;
  username: string;
  distance: string;
}

export default function AlertTracking() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { id, notifiedDonors: notifiedDonorsParam } = params;
  const router = useRouter();
  const [alertInitialData, setAlertInitialData] = useState<any>(() => {
    if (params.id && params.groupe) {
      return {
        id_alerte: Number(params.id),
        groupe_requis: params.groupe,
        lieu: params.lieu,
        statut: "en_cours",
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!params.groupe);
  const [data, setData] = useState<any>(null);
  const [notifiedDonors, setNotifiedDonors] = useState<NotifiedDonor[]>([]);
  const isMountedRef = useRef(true);

  const fetchStatus = async () => {
    if (!id || isNaN(Number(id))) {
      console.warn("AlertTracking: Invalid ID, skipping fetchStatus", { id });
      return;
    }
    try {
      const res = await getAlertStatus(Number(id));
      if (isMountedRef.current) {
        setData(res);
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        console.error("AlertTracking: Error fetching status:", error);
        // Don't setLoading(false) here if we have initial data from params
        // This allows showing cached data while retrying
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
      // Polling optimisé pour l'économie de data (15s au lieu de 5s)
      const interval = setInterval(() => {
        if (AppState.currentState === "active") {
          fetchStatus();
        }
      }, 15000);

      return () => clearInterval(interval);
    }, [id]),
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (notifiedDonorsParam && typeof notifiedDonorsParam === "string") {
      try {
        const parsedDonors = JSON.parse(notifiedDonorsParam);
        if (isMountedRef.current) {
          setNotifiedDonors(parsedDonors);
        }
      } catch (e) {
        console.error("AlertTracking: Failed to parse notifiedDonorsParam", e);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [notifiedDonorsParam]);

  const handleItinerary = () => {
    const alerte = data?.alerte || alertInitialData;
    if (alerte?.latitude && alerte?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${alerte.latitude},${alerte.longitude}`;
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open maps", err),
      );
    } else {
      console.warn("Itinerary: Missing coordinates");
    }
  };

  const handleShareWhatsApp = useCallback(async () => {
    const alerte = data?.alerte || alertInitialData;
    if (!alerte) return;

    try {
      const urgencyLabel = t(
        `alert.urgencyLevels.${alerte.urgence || "NORMAL"}`,
      );
      const message = t("alert.shareMessage", {
        group: alerte.groupe || alerte.groupe_requis,
        location: alerte.lieu || t("centers.address"),
        urgency: urgencyLabel,
        phone: alerte.initiateur?.telephone || alerte.telephone_contact || "",
      });

      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback web si l'app n'est pas installée
        await Linking.openURL(
          `https://wa.me/?text=${encodeURIComponent(message)}`,
        );
      }
    } catch (error) {
      console.error("Error sharing to WhatsApp", error);
    }
  }, [data, alertInitialData, t, id]);

  if (isNaN(Number(id))) {
    return (
      <View style={styles.center}>
        <TabBarIcon name="alert-circle" size={48} color={color.error} />
        <Text
          style={{
            fontSize: 16,
            marginTop: 16,
            color: color.error,
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          {t("common.errors.unexpected")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text
            style={{ color: color.primary, marginTop: 10, fontWeight: "600" }}
          >
            {t("editProfile.back")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !alertInitialData) {
    return <LoadingOverlay visible={true} fullScreen />;
  }

  const alerte = data?.alerte || alertInitialData;

  if (!alerte) {
    return (
      <View style={styles.center}>
        <Text>{t("alert.unknownStatus")}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: color.primary, marginTop: 10 }}>
            {t("editProfile.back")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  const stats = data?.stats || { total: 0, lu: 0, accepte: 0 };
  const details = data?.details || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("alert.tracking.title")}</Text>
        <View style={{ flexDirection: "row", gap: 15 }}>
          {((data?.alerte && data.alerte.latitude) ||
            (alertInitialData && alertInitialData.latitude)) && (
            <TouchableOpacity
              onPress={handleItinerary}
              testID="itinerary-button"
            >
              <TabBarIcon name="map" size={20} color={color.info} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleShareWhatsApp}
            testID="whatsapp-share-button"
          >
            <TabBarIcon
              name="whatsapp"
              size={20}
              color="#25D366"
              family="fontawesome"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={fetchStatus}
            testID="refresh-status-button"
          >
            <TabBarIcon name="refresh" size={20} color={color.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <View style={styles.bloodCircleLarge}>
            <Text style={styles.bloodType}>
              {alerte.groupe || alerte.groupe_requis}
            </Text>
          </View>
          {alerte.statut && alerte.statut !== "status" && (
            <View
              style={[
                styles.statusBadgeContainer,
                { backgroundColor: getStatutColor(alerte.statut) + "20" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatutColor(alerte.statut) },
                ]}
              />
              <Text
                style={[
                  styles.statusBadge,
                  {
                    color: getStatutColor(alerte.statut),
                    backgroundColor: "transparent",
                  },
                ]}
              >
                {t(`alert.status.${alerte.statut}`).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.date}>
            {t("alert.tracking.launchedOn", {
              date: new Date(alerte.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox
            label={t("alert.tracking.stats.notified")}
            value={stats.total}
            color={color.info}
          />
          <StatBox
            label={t("alert.tracking.stats.read")}
            value={stats.lu}
            color={color.warning}
          />
          <StatBox
            label={t("alert.tracking.stats.accepted")}
            value={stats.accepte}
            color={color.success}
          />
        </View>

        {notifiedDonors.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              {t("alert.tracking.notifiedDonors")} ({notifiedDonors.length})
            </Text>
            {notifiedDonors.map((donor, index) => (
              <View key={donor.id} style={styles.donorRow}>
                <Text style={styles.donorName}>
                  {t("alert.tracking.donorIndex", { index: index + 1 })}
                </Text>
                <Text style={styles.donorPhone}>{donor.distance} km</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>
          {t("alert.tracking.notificationDetails")} ({details.length})
        </Text>
        {details.map((item: any, index: number) => (
          <View key={index} style={styles.donorRow}>
            <View>
              <Text style={styles.donorName}>{item.donneur}</Text>
              <Text style={styles.donorPhone}>{item.telephone}</Text>
            </View>
            <View
              style={[
                styles.statutPill,
                { backgroundColor: getStatutColor(item.statut) },
              ]}
            >
              <Text style={styles.statutText}>
                {t(`alert.status.${item.statut}`).toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.footerBtn}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.footerBtnText}>{t("alert.tracking.backHome")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const StatBox = ({ label, value, color }: any) => (
  <View style={[styles.statBox, { borderColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const getStatutColor = (statut: string) => {
  switch (statut) {
    case "accepte":
      return color.success;
    case "lu":
      return color.warning;
    case "envoye":
      return color.textLight;
    default:
      return color.error;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.screenBackground },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: color.screenBackground,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 24,
  },
  bloodCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.dangerLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: color.primary + "20",
  },
  bloodType: { fontSize: 42, fontWeight: "900", color: color.primary },
  statusBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 8,
    flexWrap: "wrap", // Allow wrapping
    maxWidth: "100%", // Don't overflow
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadge: {
    fontSize: 10, // Smaller font
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  date: { fontSize: 13, color: color.textSecondary, marginTop: 12 },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    backgroundColor: "white",
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: color.textSecondary, marginTop: 5 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: color.textMain,
  },
  donorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  donorName: { fontSize: 15, fontWeight: "600" },
  donorPhone: { fontSize: 12, color: color.textLight },
  statutPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statutText: { color: "white", fontSize: 9, fontWeight: "bold" },
  footerBtn: {
    backgroundColor: color.surface,
    margin: 20,
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
  },
  footerBtnText: { fontWeight: "bold", color: color.textMain },
});
