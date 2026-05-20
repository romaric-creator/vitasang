import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Animated,
  Modal,
} from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ModernSpinner } from "@/components/ModernSpinner";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus, respondToAlert } from "@/services/user.service";
import { analyticsService } from "@/services/analyticsService";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import { useToast } from "@/context/ToastContext";

const getUrgencyConfig = (urgence: string) => {
  const key = (urgence || "NORMAL").toUpperCase();
  if (key === "TRES_URGENT" || key === "TRES URGENT") {
    return { color: color.error, bg: color.errorLight, label: "TRÈS URGENT" };
  }
  if (key === "URGENT") {
    return { color: color.warning, bg: color.warningLight, label: "URGENT" };
  }
  return { color: color.success, bg: color.successLight, label: "NORMAL" };
};

export default function AlertResponse() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { id, distance } = params;
  const router = useRouter();
  const { success, error } = useToast();

  const [alertData, setAlertData] = useState<any>(null);
  const [alertStats, setAlertStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isEligibilityVisible, setIsEligibilityVisible] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    q1: false, q2: false, q3: false, q4: false, q5: false, q6: false,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isEligible = answers.q1 && answers.q2 && answers.q3 && !answers.q4 && !answers.q5 && !answers.q6;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchAlert = async () => {
      if (!id || isNaN(Number(id))) return;
      try {
        const data = await getAlertStatus(Number(id));
        setAlertData(data.alerte);
        setAlertStats(data.stats);
        const myResponse = data.details?.find((d: any) => d.isMe) ?? null;
        if (myResponse && (myResponse.statut === "accepte" || myResponse.statut === "don_effectue")) {
          setHasAccepted(true);
        }
      } catch (err) {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  useEffect(() => {
    if (params.confirmedEligibility === "true" && alertData && !hasAccepted && !isResponding) {
      handleResponse("accepte");
    }
  }, [params.confirmedEligibility]);

  const handleResponse = async (response: "accepte" | "ignore") => {
    if (!id || isNaN(Number(id))) return;
    try {
      setIsResponding(true);
      await respondToAlert(Number(id), response);
      if (response === "accepte") {
        analyticsService.trackEvent(analyticsService.events.ALERT_ACCEPTED, { alertId: id });
        setIsEligibilityVisible(false);
        const refreshed = await getAlertStatus(Number(id));
        if (refreshed?.alerte) setAlertData(refreshed.alerte);
        if (refreshed?.stats) setAlertStats(refreshed.stats);
        setHasAccepted(true);
        success(t("alertPublic.thankYou"));
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      error(err.message || t("common.error"));
    } finally {
      setIsResponding(false);
    }
  };

  const handleCall = () => {
    const phone = alertData?.initiateur?.telephone || alertData?.telephone_contact;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const phone = alertData?.initiateur?.telephone || alertData?.telephone_contact;
    if (phone) Linking.openURL(`whatsapp://send?phone=${phone}&text=Bonjour, je viens pour le don de sang ${alertData.groupe}`);
  };

  const handleItinerary = () => {
    if (alertData?.latitude && alertData?.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${alertData.latitude},${alertData.longitude}`,
        android: `geo:0,0?q=${alertData.latitude},${alertData.longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  // --- LOADING ---
  if (loading) return <LoadingOverlay visible={true} fullScreen />;

  // --- ERROR STATE ---
  if (fetchError || !alertData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <TabBarIcon name="exclamation-circle" size={40} color={color.textLight} />
          </View>
          <Text style={styles.errorTitle}>{t("alertResponse.notFound")}</Text>
          <Text style={styles.errorDesc}>{t("alertResponse.notFoundDesc")}</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.errorBtnText}>{t("common.actions.backHome") || "Retour"}</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const urgency = getUrgencyConfig(alertData.urgence || alertData.degre_urgence);
  const initiatorName = alertData.initiateur
    ? `${alertData.initiateur.prenom} ${alertData.initiateur.nom}`
    : alertData.nom_contact || t("alertResponse.emergencyContact");

  // ==========================================
  // MODE MISSION (après acceptation)
  // ==========================================
  if (hasAccepted) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.missionScroll} showsVerticalScrollIndicator={false}>
          {/* Success header */}
          <View style={styles.missionHeader}>
            <View style={styles.successCircle}>
              <TabBarIcon name="check" size={28} color={color.textWhite} />
            </View>
            <Text style={styles.missionTitle}>{t("alertPublic.heroTitle")}</Text>
            <Text style={styles.missionSubtitle}>{t("alertPublic.heroDesc")}</Text>
          </View>

          {/* Recap card */}
          <View style={styles.missionCard}>
            <View style={styles.missionRecapRow}>
              <View style={[styles.missionBadge, { backgroundColor: urgency.bg }]}>
                <Text style={[styles.missionBadgeText, { color: urgency.color }]}>
                  {alertData.groupe}
                </Text>
              </View>
              <View style={styles.missionRecapInfo}>
                <Text style={styles.missionLocation} numberOfLines={1}>{alertData.lieu}</Text>
                <Text style={styles.missionQuantity}>
                  {alertData.quantite_requise || 1} {t("alertPublic.bags")}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact card */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionLabel}>{t("alertResponse.requesterContact")}</Text>

            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>{initiatorName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{initiatorName}</Text>
                  <Text style={styles.contactRole}>{t("alert.response.initiator")}</Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionCall} onPress={handleCall} accessibilityLabel={t("alertResponse.call")}>
                  <TabBarIcon name="phone" size={20} color={color.textWhite} />
                  <Text style={styles.actionCallText}>{t("alertResponse.call")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionWa} onPress={handleWhatsApp} accessibilityLabel="WhatsApp">
                  <TabBarIcon name="whatsapp" size={20} color={color.textWhite} />
                  <Text style={styles.actionWaText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionGps} onPress={handleItinerary} accessibilityLabel={t("alertResponse.openGPS")}>
                <TabBarIcon name="location-arrow" size={16} color={color.primary} />
                <Text style={styles.actionGpsText}>{t("alertResponse.openGPS")}</Text>
                <Text style={styles.actionGpsLocation} numberOfLines={1}>{alertData.lieu}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back button */}
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.backHomeText}>{t("alertPublic.backHome")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  // ==========================================
  // VUE AVANT ACCEPTATION
  // ==========================================
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()} accessibilityLabel="Retour">
          <TabBarIcon name="arrow-left" size={18} color={color.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("alertPublic.headerTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero: Blood group + Urgency */}
        <Animated.View style={[styles.heroCard, { transform: [{ scale: pulseAnim }], borderColor: urgency.color + "40" }]}>
          <View style={[styles.heroBadge, { backgroundColor: urgency.bg }]}>
            <Text style={[styles.heroBloodText, { color: urgency.color }]}>
              {alertData.groupe || alertData.groupe_requis}
            </Text>
          </View>
          <View style={[styles.heroUrgencyTag, { backgroundColor: urgency.color }]}>
            <Text style={styles.heroUrgencyText}>{urgency.label}</Text>
          </View>
        </Animated.View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {/* Location */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <TabBarIcon name="map-marker" size={16} color={color.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("alertResponse.location") || "Lieu"}</Text>
              <Text style={styles.infoValue}>{alertData.lieu}</Text>
            </View>
            {distance && (
              <View style={styles.distancePill}>
                <Text style={styles.distanceText}>{distance} km</Text>
              </View>
            )}
          </View>

          {/* Quantity */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <TabBarIcon name="tint" size={16} color={color.error} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("alertPublic.need")}</Text>
              <Text style={styles.infoValue}>
                {alertData.quantite_requise || 1} {t("alertPublic.bags")}
              </Text>
            </View>
          </View>

          {/* Patient */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <TabBarIcon name="user" size={16} color={color.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("alertPublic.forPatient")}</Text>
              <Text style={styles.infoValue}>
                {alertData.nom_patient || t("alertResponse.unknownPatient")}
              </Text>
            </View>
          </View>

          {/* Initiator */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <TabBarIcon name="phone" size={16} color={color.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("alertResponse.requesterContact")}</Text>
              <Text style={styles.infoValue}>{initiatorName}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {alertData.description ? (
          <View style={styles.descCard}>
            <TabBarIcon name="quote-left" size={12} color={color.textLight} />
            <Text style={styles.descText}>{alertData.description}</Text>
          </View>
        ) : null}

        {/* Stats */}
        {alertStats && alertStats.total > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{alertStats.total}</Text>
              <Text style={styles.statLbl}>{t("alertResponse.notified")}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: color.success }]}>{alertStats.accepte}</Text>
              <Text style={styles.statLbl}>{t("alertResponse.accepted")}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{alertStats.lu}</Text>
              <Text style={styles.statLbl}>{t("alertResponse.read")}</Text>
            </View>
          </View>
        )}

        {/* Security note */}
        <View style={styles.securityBanner}>
          <TabBarIcon name="shield" size={14} color={color.success} />
          <Text style={styles.securityText}>{t("alertPublic.securityNote")}</Text>
        </View>
      </ScrollView>

      {/* Fixed bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => handleResponse("ignore")}>
          <Text style={styles.skipText}>{t("common.actions.skip")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.goBtn, { backgroundColor: urgency.color }]}
          onPress={() => setIsEligibilityVisible(true)}
          activeOpacity={0.8}
        >
          {isResponding ? (
            <ModernSpinner color="white" size="small" />
          ) : (
            <>
              <TabBarIcon name="heartbeat" size={18} color={color.textWhite} />
              <Text style={styles.goText}>{t("alertResponse.goingText")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Eligibility modal */}
      <Modal visible={isEligibilityVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>{t("alert.response.eligibility.title")}</Text>
              <TouchableOpacity onPress={() => setIsEligibilityVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <TabBarIcon name="times" size={20} color={color.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>{t("alert.response.eligibility.subtitle")}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <View style={styles.questionsGrid}>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const key = `q${num}`;
                  const isNeg = num >= 4;
                  const isActive = isNeg ? answers[key] : !answers[key];
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.qRow, isActive && styles.qRowActive]}
                      onPress={() => setAnswers((prev) => ({ ...prev, [key]: !prev[key] }))}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.qCheck, answers[key] && styles.qCheckActive]}>
                        {answers[key] && <TabBarIcon name="check" size={12} color={color.textWhite} />}
                      </View>
                      <Text style={[styles.qLabel, isActive && styles.qLabelActive]}>
                        {t(`alert.response.eligibility.questions.q${num}.text`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!isEligible && (
                <View style={styles.warningBanner}>
                  <TabBarIcon name="exclamation-triangle" size={16} color={color.error} />
                  <Text style={styles.warningText}>{t("alert.response.eligibility.warning")}</Text>
                </View>
              )}
            </ScrollView>

            <PrimaryButton
              title={t("alert.response.eligibility.confirmBtn") || "CONFIRMER"}
              onPress={() => handleResponse("accepte")}
              disabled={!isEligible || isResponding}
              loading={isResponding}
              style={{ marginTop: color.spacing.m }}
            />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },

  // --- ERROR STATE ---
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: color.spacing.xl },
  errorIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: color.surfaceContainer, justifyContent: "center", alignItems: "center", marginBottom: color.spacing.l },
  errorTitle: { fontSize: 18, fontWeight: "800", color: color.textMain, textAlign: "center" },
  errorDesc: { fontSize: 14, color: color.textSecondary, textAlign: "center", marginTop: color.spacing.s, marginBottom: color.spacing.l },
  errorBtn: { paddingVertical: 14, paddingHorizontal: 32, backgroundColor: color.primary, borderRadius: color.radius.m },
  errorBtnText: { color: color.textWhite, fontWeight: "700", fontSize: 15 },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: color.spacing.l,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: color.spacing.m,
  },
  headerBack: { width: 40, height: 40, borderRadius: color.radius.m, backgroundColor: color.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: color.borderLight },
  headerTitle: { fontSize: 15, fontWeight: "800", color: color.textMain },
  scrollContent: { paddingHorizontal: color.spacing.l, paddingBottom: 120 },

  // --- HERO ---
  heroCard: {
    alignItems: "center",
    paddingVertical: color.spacing.xl,
    marginBottom: color.spacing.l,
    backgroundColor: color.surface,
    borderRadius: color.radius.xl,
    borderWidth: 2,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: color.spacing.m,
  },
  heroBloodText: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  heroUrgencyTag: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: color.radius.full },
  heroUrgencyText: { color: color.textWhite, fontSize: 11, fontWeight: "800", letterSpacing: 1 },

  // --- INFO CARD ---
  infoCard: {
    backgroundColor: color.surface,
    borderRadius: color.radius.l,
    paddingHorizontal: color.spacing.m,
    marginBottom: color.spacing.m,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
    gap: color.spacing.m,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: "600", color: color.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: "700", color: color.textMain, marginTop: 2 },
  distancePill: { backgroundColor: color.primaryGhost, paddingHorizontal: 10, paddingVertical: 4, borderRadius: color.radius.full },
  distanceText: { fontSize: 12, fontWeight: "700", color: color.primary },

  // --- DESCRIPTION ---
  descCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: color.spacing.s,
    backgroundColor: color.secondaryGhost,
    padding: color.spacing.m,
    borderRadius: color.radius.m,
    marginBottom: color.spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: color.borderDark,
  },
  descText: { flex: 1, fontSize: 13, color: color.textSecondary, fontStyle: "italic", lineHeight: 20 },

  // --- STATS ---
  statsCard: {
    flexDirection: "row",
    backgroundColor: color.surface,
    borderRadius: color.radius.l,
    paddingVertical: color.spacing.m,
    marginBottom: color.spacing.m,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "900", color: color.textMain },
  statLbl: { fontSize: 10, fontWeight: "600", color: color.textLight, marginTop: 4, textTransform: "uppercase" },
  statSep: { width: 1, height: 32, backgroundColor: color.borderLight, alignSelf: "center" },

  // --- SECURITY ---
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: color.spacing.s,
    backgroundColor: color.successLight,
    padding: color.spacing.m,
    borderRadius: color.radius.m,
  },
  securityText: { flex: 1, fontSize: 12, color: color.success, fontWeight: "600" },

  // --- BOTTOM BAR ---
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: color.spacing.m,
    paddingHorizontal: color.spacing.l,
    paddingTop: color.spacing.m,
    paddingBottom: Platform.OS === "ios" ? 36 : color.spacing.l,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderLight,
  },
  skipBtn: {
    flex: 1,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: color.radius.l,
    borderWidth: 1.5,
    borderColor: color.border,
  },
  skipText: { fontSize: 15, fontWeight: "700", color: color.textSecondary },
  goBtn: {
    flex: 2,
    height: 54,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: color.radius.l,
    gap: color.spacing.s,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  goText: { fontSize: 16, fontWeight: "900", color: color.textWhite, letterSpacing: 0.5 },

  // --- MISSION MODE ---
  missionScroll: { paddingHorizontal: color.spacing.l, paddingTop: Platform.OS === "ios" ? 80 : 60, paddingBottom: 40 },
  missionHeader: { alignItems: "center", marginBottom: color.spacing.xl },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: color.spacing.m,
    shadowColor: color.success,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  missionTitle: { fontSize: 22, fontWeight: "900", color: color.textMain, marginBottom: color.spacing.s },
  missionSubtitle: { fontSize: 14, color: color.textSecondary, textAlign: "center", lineHeight: 20 },

  missionCard: {
    backgroundColor: color.surface,
    borderRadius: color.radius.l,
    padding: color.spacing.m,
    marginBottom: color.spacing.l,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  missionRecapRow: { flexDirection: "row", alignItems: "center", gap: color.spacing.m },
  missionBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  missionBadgeText: { fontSize: 18, fontWeight: "900" },
  missionRecapInfo: { flex: 1 },
  missionLocation: { fontSize: 15, fontWeight: "700", color: color.textMain },
  missionQuantity: { fontSize: 12, color: color.textSecondary, marginTop: 2 },

  // --- CONTACT ---
  contactSection: { marginBottom: color.spacing.l },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: color.textLight, letterSpacing: 1, textTransform: "uppercase", marginBottom: color.spacing.s },
  contactCard: {
    backgroundColor: color.surface,
    borderRadius: color.radius.l,
    padding: color.spacing.l,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: color.spacing.m, marginBottom: color.spacing.l },
  contactAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: color.primaryGhost, justifyContent: "center", alignItems: "center" },
  contactInitial: { fontSize: 20, fontWeight: "800", color: color.primary },
  contactName: { fontSize: 16, fontWeight: "800", color: color.textMain },
  contactRole: { fontSize: 12, color: color.textSecondary, marginTop: 2 },

  actionGrid: { flexDirection: "row", gap: color.spacing.m, marginBottom: color.spacing.m },
  actionCall: { flex: 1, height: 52, backgroundColor: color.secondaryDark, borderRadius: color.radius.m, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  actionCallText: { color: color.textWhite, fontWeight: "700", fontSize: 14 },
  actionWa: { flex: 1, height: 52, backgroundColor: color.whatsapp, borderRadius: color.radius.m, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  actionWaText: { color: color.textWhite, fontWeight: "700", fontSize: 14 },
  actionGps: {
    flexDirection: "row",
    alignItems: "center",
    gap: color.spacing.s,
    paddingVertical: 14,
    paddingHorizontal: color.spacing.m,
    backgroundColor: color.primaryGhost,
    borderRadius: color.radius.m,
  },
  actionGpsText: { fontSize: 13, fontWeight: "700", color: color.primary },
  actionGpsLocation: { flex: 1, fontSize: 12, color: color.textSecondary, textAlign: "right" },

  backHomeBtn: { alignItems: "center", paddingVertical: color.spacing.m },
  backHomeText: { fontSize: 14, fontWeight: "600", color: color.textLight },

  // --- MODAL ---
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: color.spacing.l,
    paddingBottom: Platform.OS === "ios" ? 40 : color.spacing.l,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: color.borderLight, alignSelf: "center", marginBottom: color.spacing.m },
  modalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: color.spacing.s },
  modalTitle: { fontSize: 18, fontWeight: "900", color: color.textMain },
  modalDesc: { fontSize: 13, color: color.textSecondary, marginBottom: color.spacing.l, lineHeight: 18 },

  questionsGrid: { gap: color.spacing.s },
  qRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: color.surfaceContainer,
    borderRadius: color.radius.m,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: color.spacing.m,
  },
  qRowActive: { borderColor: color.primary, backgroundColor: color.primaryGhost },
  qCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: color.border, justifyContent: "center", alignItems: "center" },
  qCheckActive: { borderColor: color.primary, backgroundColor: color.primary },
  qLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: color.textMain },
  qLabelActive: { color: color.primary },
  warningBanner: { flexDirection: "row", alignItems: "center", gap: color.spacing.s, backgroundColor: color.errorLight, padding: color.spacing.m, borderRadius: color.radius.m, marginTop: color.spacing.m },
  warningText: { flex: 1, fontSize: 12, fontWeight: "700", color: color.error },
});
