import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { apiClient } from "@/config/axiosConfig";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

type AlertData = {
  id_alerte: number;
  groupe: string;
  lieu: string;
  urgence?: string;
  degre_urgence?: string;
  statut: string;
  description?: string;
  nom_patient?: string;
  quantite_requise?: number;
};

const URGENCY_COLORS: Record<string, string> = {
  TRES_URGENT: "#DC2626",
  URGENT: "#EA580C",
  NORMAL: "#059669",
};

const URGENCY_LABELS: Record<string, string> = {
  TRES_URGENT: "Tres urgent",
  URGENT: "Urgent",
  NORMAL: "Normal",
};

export default function AlertPublicScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { isAuth } = useAuth();

  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState<"accepte" | "refuse" | null>(null);

  useEffect(() => {
    if (!token) {
      setFetchError(t("alertPublic.invalidLink"));
      setLoading(false);
      return;
    }

    const fetchAlert = async () => {
      try {
        const res = await apiClient.get(`alerts/public/${token}`);
        const data = res.data;
        // Backend returns { success, alerte } or { success, ...alerte }
        setAlertData(data.alerte ?? data);
      } catch (e: any) {
        const msg =
          e?.message ||
          e?.response?.data?.message ||
          t("alertPublic.loadError");
        setFetchError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [token]);

  const handleAccept = async () => {
    if (!alertData) return;
    if (!isAuth) {
      // Redirect to login, then come back
      router.push(`/login?redirect=/alert-public/${token}`);
      return;
    }
    try {
      setResponding(true);
      await apiClient.post(`alerts/${alertData.id_alerte}/respond`, {
        response: "accepte",
      });
      setResponded("accepte");
      success(t("alertPublic.thankYou"));
    } catch (e: any) {
      showError(e?.message || t("alertPublic.responseError"));
    } finally {
      setResponding(false);
    }
  };

  const handleRefuse = async () => {
    if (!alertData) return;
    if (!isAuth) {
      router.replace("/(tabs)");
      return;
    }
    try {
      setResponding(true);
      await apiClient.post(`alerts/${alertData.id_alerte}/respond`, {
        response: "ignore",
      });
      setResponded("refuse");
    } catch {
      // Ignore errors on refuse
    } finally {
      setResponding(false);
      router.replace("/(tabs)");
    }
  };

  const handleDiscuter = () => {
    if (!isAuth) {
      router.push(`/login?redirect=/alert-public/${token}`);
      return;
    }
    if (alertData?.id_alerte) {
      router.push(`/(tabs)/messages` as any);
    }
  };

  // ---- LOADING STATE ----
  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>{t("alertPublic.loading")}</Text>
      </ThemedView>
    );
  }

  // ---- ERROR / NOT FOUND STATE ----
  if (fetchError || !alertData) {
    return (
      <ThemedView style={styles.centered}>
        <TabBarIcon name="exclamation-circle" size={48} color={color.error} />
        <Text style={styles.errorTitle}>{t("alertPublic.notFound")}</Text>
        <Text style={styles.errorSub}>
          {fetchError ?? t("alertPublic.notFoundDesc")}
        </Text>
        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.homeLinkText}>{t("alertPublic.backHome")}</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const statut = alertData.statut;
  const isActive = statut === "en_cours";
  const urgencyKey = (
    alertData.urgence ||
    alertData.degre_urgence ||
    "NORMAL"
  ).toUpperCase();
  const urgencyColor = URGENCY_COLORS[urgencyKey] ?? "#059669";
  const urgencyLabel = URGENCY_LABELS[urgencyKey] ?? urgencyKey;

  // ---- RESOLVED / CANCELLED STATE ----
  if (!isActive) {
    const isResolved = statut === "resolu";
    return (
      <ThemedView style={styles.centered}>
        <TabBarIcon
          name={isResolved ? "check-circle" : "times-circle"}
          size={56}
          color={isResolved ? color.success : color.textMuted}
        />
        <Text style={styles.resolvedTitle}>
          {isResolved ? t("alertPublic.resolved") : t("alertPublic.cancelled")}
        </Text>
        <Text style={styles.resolvedSub}>
          {isResolved
            ? t("alertPublic.resolvedDesc")
            : t("alertPublic.cancelledDesc")}
        </Text>
        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.homeLinkText}>{t("alertPublic.seeActive")}</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // ---- ACCEPTED CONFIRMATION ----
  if (responded === "accepte") {
    return (
      <ThemedView style={styles.centered}>
        <View style={styles.checkCircle}>
          <TabBarIcon name="check" size={32} color="white" />
        </View>
        <Text style={styles.resolvedTitle}>{t("alertPublic.heroTitle")}</Text>
        <Text style={styles.resolvedSub}>
          {t("alertPublic.heroDesc")}
        </Text>
        <PrimaryButton
          title={t("alertPublic.seeMissions")}
          onPress={() => router.replace("/(tabs)")}
          style={styles.ctaBtn}
        />
      </ThemedView>
    );
  }

  // ---- ACTIVE ALERT ----
  return (
    <ThemedView>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          accessibilityLabel="Retour"
        >
          <TabBarIcon name="arrow-left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("alertPublic.headerTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* MAIN CARD */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            {/* Blood group badge */}
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodText}>{alertData.groupe}</Text>
            </View>

            <View style={{ flex: 1, paddingLeft: 16 }}>
              {/* Urgency badge */}
              <View
                style={[
                  styles.urgencyBadge,
                  {
                    backgroundColor: urgencyColor + "15",
                    borderColor: urgencyColor + "30",
                  },
                ]}
              >
                <View
                  style={[styles.pulseDot, { backgroundColor: urgencyColor }]}
                />
                <Text style={[styles.urgencyLabel, { color: urgencyColor }]}>
                  {urgencyLabel}
                </Text>
              </View>

              <Text style={styles.locationTitle} numberOfLines={2}>
                {alertData.lieu}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.detailsRow}>
            {alertData.nom_patient ? (
              <View style={styles.detailItem}>
                <TabBarIcon name="user" size={16} color="#64748B" />
                <Text style={styles.detailText}>
                  {t("alertPublic.forPatient")}{" "}
                  <Text style={styles.detailStrong}>
                    {alertData.nom_patient}
                  </Text>
                </Text>
              </View>
            ) : null}
            <View style={styles.detailItem}>
              <TabBarIcon name="tint" size={16} color="#64748B" />
              <Text style={styles.detailText}>
                {t("alertPublic.need")}{" "}
                <Text style={styles.detailStrong}>
                  {alertData.quantite_requise ?? 1} {t("alertPublic.bags")}
                </Text>
              </Text>
            </View>
          </View>

          {alertData.description ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>"{alertData.description}"</Text>
            </View>
          ) : null}
        </View>

        {/* NOTE SECURITE */}
        <View style={styles.securityNote}>
          <TabBarIcon name="shield" size={14} color="#059669" />
          <Text style={styles.securityText}>
            {t("alertPublic.securityNote")}
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title={t("alert.actions.accept")}
            onPress={handleAccept}
            loading={responding}
            style={styles.acceptBtn}
            accessibilityLabel={t("alert.actions.accept")}
          />

          <TouchableOpacity
            style={styles.discuterBtn}
            onPress={handleDiscuter}
            accessibilityLabel="Discuter avec le demandeur"
          >
            <TabBarIcon name="comment" size={18} color={color.primary} />
            <Text style={styles.discuterText}>{t("alertPublic.chat")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refuseBtn}
            onPress={handleRefuse}
            disabled={responding}
            accessibilityLabel="Refuser l'alerte"
          >
            <Text style={styles.refuseText}>{t("alertPublic.refuse")}</Text>
          </TouchableOpacity>
        </View>

        {!isAuth && (
          <Text style={styles.loginHint}>
            {t("alertPublic.loginHint")}
          </Text>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: color.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: color.textSecondary,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: color.textMain,
    marginTop: 16,
    textAlign: "center",
  },
  errorSub: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  homeLink: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: color.primary,
    borderRadius: color.radius.full,
  },
  homeLinkText: {
    color: color.textWhite,
    fontWeight: "700",
    fontSize: 15,
  },
  resolvedTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: color.textMain,
    marginTop: 16,
    textAlign: "center",
  },
  resolvedSub: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: color.success,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaBtn: {
    marginTop: 28,
    width: "100%",
  },

  // LAYOUT
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.surfaceDark,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },

  // CARD
  mainCard: {
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bloodBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  bloodText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#E11D48",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  urgencyLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 4,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: color.borderLight,
    marginVertical: 16,
  },
  detailsRow: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: color.textSecondary,
  },
  detailStrong: {
    fontWeight: "700",
    color: color.textMain,
  },
  noteBox: {
    backgroundColor: color.secondaryGhost,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: color.border,
  },
  noteText: {
    fontSize: 13,
    color: color.textSecondary,
    fontStyle: "italic",
  },

  // SECURITY NOTE
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
  },

  // ACTIONS
  actionsContainer: {
    gap: 12,
  },
  acceptBtn: {
    width: "100%",
  },
  discuterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: color.primary,
    backgroundColor: color.primaryGhost,
  },
  discuterText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  refuseBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  refuseText: {
    color: color.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  loginHint: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: color.textMuted,
    fontStyle: "italic",
  },
});
