import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ModernSpinner } from "@/components/ModernSpinner";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus, respondToAlert } from "@/services/user.service";
import { analyticsService } from "@/services/analyticsService";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";

export default function AlertResponse() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { id, distance } = params;
  const router = useRouter();
  const { show } = useNotification();
  const [alertData, setAlertData] = useState<any>(() => {
    if (params.id && params.groupe) {
      return {
        id_alerte: Number(params.id),
        groupe_requis: params.groupe,
        lieu: params.lieu,
        degre_urgence: params.urgence,
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!params.groupe);
  const [isResponding, setIsResponding] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const data = await getAlertStatus(Number(id));
        setAlertData(data.alerte);
      } catch (error) {
        console.error("AlertResponse: Error fetching alert:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAlert();
  }, [id]);

  // Auto-respond when returning from eligibility screen
  useEffect(() => {
    if (params.confirmedEligibility === "true" && alertData && !hasAccepted && !isResponding) {
      handleResponse("accepte");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.confirmedEligibility, alertData]);

  const handleResponse = async (response: "accepte" | "ignore") => {
    try {
      setIsResponding(true);
      await respondToAlert(Number(id), response);
      if (response === "accepte") {
        analyticsService.trackEvent(analyticsService.events.ALERT_ACCEPTED, {
          alertId: id,
        });
        // Re-fetch alert data to get full initiator details (phone number)
        try {
          const refreshed = await getAlertStatus(Number(id));
          if (refreshed?.alerte) {
            setAlertData(refreshed.alerte);
          }
        } catch (e) {
          console.warn("Could not refresh alert data:", e);
        }
        setHasAccepted(true);
        show("success", t("alert.response.success"));
      } else {
        analyticsService.trackEvent(analyticsService.events.ALERT_IGNORED, {
          alertId: id,
        });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      show("error", error.message || t("common.error"));
    } finally {
      setIsResponding(false);
    }
  };

  const handleCall = () => {
    const phone = alertData?.initiateur?.telephone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleItinerary = () => {
    if (alertData?.latitude && alertData?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${alertData.latitude},${alertData.longitude}`;
      Linking.openURL(url);
    } else {
      show("info", t("alert.itineraryUnavailable"));
    }
  };

  const handleShareWhatsApp = useCallback(() => {
    if (!alertData) return;
    const urgencyLabel = t(`alert.urgencyLevels.${alertData.urgence || "NORMAL"}`);
    const message = t("alert.shareMessage", {
      group: alertData.groupe,
      location: alertData.lieu || t("centers.address"),
      latitude: alertData.latitude || "0",
      longitude: alertData.longitude || "0",
      urgency: urgencyLabel,
      quantity: alertData.quantite || "1",
      phone: alertData.initiateur?.telephone || "",
      id: alertData.id || id || "0000",
    });
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      }
    });
  }, [alertData, t, id]);

  if (isNaN(Number(id))) {
    return (
      <ThemedView style={styles.center}>
        <Text style={{ color: color.textSecondary }}>{t("common.errors.unexpected")}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10 }}>
          <Text style={{ color: color.primary, fontWeight: "700" }}>{t("editProfile.back")}</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (loading) {
    return <LoadingOverlay visible={true} fullScreen />;
  }

  if (!alertData) {
    return (
      <ThemedView style={styles.center}>
        <TabBarIcon name="exclamation-circle" size={64} color={color.disabled} />
        <Text style={[styles.sectionTitle, { marginTop: 20, textAlign: 'center' }]}>
          {t("common.errors.unexpected")}
        </Text>
        <TouchableOpacity
          style={[styles.btn, styles.acceptBtn, { marginTop: 30, paddingHorizontal: 40 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.acceptBtnText}>
            {t("editProfile.back")}
          </Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("alert.response.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <View style={styles.bloodCircle}>
            <Text style={styles.bloodText}>{alertData.groupe || alertData.groupe_requis}</Text>
          </View>
          <Text style={styles.urgencyText}>
            {t(`alert.urgencyLevels.${(alertData.urgence || alertData.degre_urgence || "NORMAL").toUpperCase()}`)}
          </Text>
          {distance && (
            <Text style={styles.distanceText}>
              {t("alert.response.distance", { distance })}
            </Text>
          )}
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("alert.response.details")}</Text>
            {alertData.latitude && alertData.longitude && (
              <TouchableOpacity onPress={handleItinerary} style={styles.itineraryBtn}>
                <TabBarIcon name="map" size={14} color={color.info} />
                <Text style={styles.itineraryBtnText}>{t("alert.actions.itinerary")}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.detailRow}>
            <TabBarIcon name="map-marker" size={16} color={color.primary} />
            <Text style={styles.detailText}>{alertData.lieu}</Text>
          </View>
          {alertData.description && (
            <View style={styles.detailRow}>
              <TabBarIcon
                name="info-circle"
                size={16}
                color={color.textSecondary}
              />
              <Text style={styles.detailText}>{alertData.description}</Text>
            </View>
          )}
        </View>

        {!hasAccepted ? (
          <View style={styles.actionContainer}>
            <Text style={styles.confirmTitle}>
              {t("alert.response.confirmTitle")}
            </Text>
            <Text style={styles.confirmDesc}>
              {t("alert.response.confirmDesc")}
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.ignoreBtn]}
                onPress={() => handleResponse("ignore")}
                disabled={isResponding}
              >
                <Text style={styles.ignoreBtnText}>
                  {t("alert.response.no")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.acceptBtn]}
                onPress={() => {
                  if (params.confirmedEligibility === "true") {
                    handleResponse("accepte");
                  } else {
                    router.push({
                      pathname: "/alert-response/[id]/eligibility",
                      params: { id },
                    });
                  }
                }}
                disabled={isResponding}
              >
                {isResponding ? (
                  <ModernSpinner size="small" color="white" />
                ) : (
                  <Text style={styles.acceptBtnText}>
                    {t("alert.response.yes")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contactCard}>
            <View style={styles.successBadge}>
              <TabBarIcon name="check-circle" size={48} color={color.success} />
              <Text style={styles.successTitle}>{t("alert.response.contactInfo")}</Text>
            </View>

            <View style={styles.initiateurInfo}>
              <Text style={styles.initiateurLabel}>{t("alert.response.initiator")}</Text>
              <Text style={styles.initiateurName}>
                {alertData.initiateur?.prenom} {alertData.initiateur?.nom}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.callFullBtn, { backgroundColor: color.info }]}
              onPress={handleCall}
            >
              <TabBarIcon name="phone" size={20} color="white" />
              <Text style={styles.callFullBtnText}>
                {alertData.initiateur?.telephone || t("common.loading")}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#25D366" }]}
                onPress={handleShareWhatsApp}
              >
                <TabBarIcon name="whatsapp" size={18} color="white" />
                <Text style={styles.actionBtnText}>{t("alert.actions.share")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: color.primary }]}
                onPress={() => {
                  if (alertData.initiateur?.id_utilisateur) {
                    router.push({
                      pathname: "/messages/[id]",
                      params: {
                        id: alertData.initiateur.id_utilisateur,
                        name: `${alertData.initiateur.prenom} ${alertData.initiateur.nom}`,
                      },
                    });
                  } else {
                    show("info", t("messages.chatUnavailable"));
                  }
                }}
              >
                <TabBarIcon name="envelope" size={18} color="white" />
                <Text style={styles.actionBtnText}>
                  {t("alert.response.chatInitiator")}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => router.replace("/(tabs)/alertes")}
            >
              <Text style={styles.closeBtnText}>
                {t("alert.actions.close")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: color.textMain },
  content: { padding: 20 },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24,
  },
  bloodCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.dangerLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  bloodText: { color: color.primary, fontSize: 32, fontWeight: "900" },
  urgencyText: {
    fontSize: 18,
    fontWeight: "800",
    color: color.primary,
    marginBottom: 8,
  },
  distanceText: { fontSize: 14, color: color.textSecondary },
  detailsSection: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
  },
  itineraryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
    borderRadius: 8,
    backgroundColor: color.info + '10',
  },
  itineraryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: color.info,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  detailText: { fontSize: 14, color: color.textMain, flex: 1 },
  actionContainer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 10,
  },
  confirmDesc: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  btnRow: { flexDirection: "row", gap: 12, width: "100%" },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  ignoreBtn: { backgroundColor: "#F1F5F9" },
  ignoreBtnText: {
    color: color.textSecondary,
    fontWeight: "700",
    fontSize: 16,
  },
  acceptBtn: { backgroundColor: color.primary },
  acceptBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  contactCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "stretch",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  successBadge: {
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: color.success,
    marginTop: 12,
    textAlign: "center",
  },
  initiateurInfo: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  initiateurLabel: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  initiateurName: {
    fontSize: 20,
    fontWeight: "800",
    color: color.textMain,
  },
  callFullBtn: {
    flexDirection: "row",
    backgroundColor: color.info,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    elevation: 2,
  },
  callFullBtnText: { color: "white", fontSize: 18, fontWeight: "800" },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 12,
    alignItems: "center",
  },
  closeBtnText: { color: color.textSecondary, fontWeight: "700", fontSize: 15 },
});
