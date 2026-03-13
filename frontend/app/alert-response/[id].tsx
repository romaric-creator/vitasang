import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus, respondToAlert } from "@/services/user.service";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import { useAlert } from "@/hooks/useAlert";

export default function AlertResponse() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { id, distance } = params;
  const router = useRouter();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<any>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const data = await getAlertStatus(Number(id));
        setAlertData(data.alerte);
        // Check if user already responded in the notifications log if possible
        // For now just load data
      } catch (error) {
        console.error("AlertResponse: Error fetching alert:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAlert();
  }, [id]);

  const handleResponse = async (response: "accepte" | "ignore") => {
    try {
      setIsResponding(true);
      await respondToAlert(Number(id), response);
      if (response === "accepte") {
        setHasAccepted(true);
        showAlert(t("alert.response.success"), "success");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      showAlert(error.message || t("common.error"), "error");
    } finally {
      setIsResponding(false);
    }
  };

  const handleCall = () => {
    const phone = alertData?.initiateur?.telephone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return <LoadingOverlay visible={true} fullScreen />;
  }

  if (!alertData) {
    return (
      <View style={styles.center}>
        <Text>{t("common.error")}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: color.primary, marginTop: 10 }}>
            {t("editProfile.back")}
          </Text>
        </TouchableOpacity>
      </View>
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
            <Text style={styles.bloodText}>{alertData.groupe}</Text>
          </View>
          <Text style={styles.urgencyText}>
            {t(`alert.urgencyLevels.${alertData.statut?.toUpperCase()}`) ||
              alertData.statut?.toUpperCase()}
          </Text>
          {distance && (
            <Text style={styles.distanceText}>
              {t("alert.response.distance", { distance })}
            </Text>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>{t("alert.response.details")}</Text>
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
                onPress={() => handleResponse("accepte")}
                disabled={isResponding}
              >
                {isResponding ? (
                  <ActivityIndicator color="white" />
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
            <Text style={styles.sectionTitle}>
              {t("alert.response.contactInfo")}
            </Text>
            <Text style={styles.initiateurName}>
              {alertData.initiateur?.prenom} {alertData.initiateur?.nom}
            </Text>
            <TouchableOpacity style={styles.callFullBtn} onPress={handleCall}>
              <TabBarIcon name="phone" size={18} color="white" />
              <Text style={styles.callFullBtnText}>
                {alertData.initiateur?.telephone}
              </Text>
            </TouchableOpacity>

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 16,
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
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  initiateurName: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 16,
  },
  callFullBtn: {
    flexDirection: "row",
    backgroundColor: "#2ECC71",
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  callFullBtnText: { color: "white", fontSize: 18, fontWeight: "800" },
  closeBtn: {
    padding: 10,
  },
  closeBtnText: { color: color.textSecondary, fontWeight: "700" },
});
