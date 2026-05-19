import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Modal
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

const { width } = Dimensions.get("window");

const PulseBadge = ({ label, color }: any) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.urgencyBadge, { backgroundColor: color + "15", borderColor: color + "30" }]}>
      <Animated.View style={[styles.pulseDot, { backgroundColor: color, opacity }]} />
      <Text style={[styles.urgencyLabel, { color }]}>{label}</Text>
    </View>
  );
};

export default function AlertResponse() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { id, distance } = params;
  const router = useRouter();
  const { success, error } = useToast();

  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isEligibilityVisible, setIsEligibilityVisible] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    q1: false, q2: false, q3: false, q4: false, q5: false, q6: false,
  });

  const isEligible = !answers.q4 && !answers.q5 && !answers.q6 && answers.q1 && answers.q2 && answers.q3;

  useEffect(() => {
    const fetchAlert = async () => {
      if (!id || isNaN(Number(id))) return;
      try {
        const data = await getAlertStatus(Number(id));
        setAlertData(data.alerte);
        // Check if user already accepted in the past
        const myResponse = data.details?.find((d: any) => d.isMe) ?? null;
        if (myResponse && (myResponse.statut === 'accepte' || myResponse.statut === 'don_effectue')) {
          setHasAccepted(true);
        }      } catch (error) {
        console.error("Fetch Error:", error);
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
        setHasAccepted(true);
        success("Merci pour votre engagement !");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      error(error.message || t("common.error"));
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

  if (loading) return <LoadingOverlay visible={true} fullScreen />;
  if (!alertData) return null;

  const urgencyKey = (alertData.urgence || alertData.degre_urgence || "NORMAL").toUpperCase();
  const urgencyColor = urgencyKey === "TRES_URGENT" ? "#DC2626" : urgencyKey === "URGENT" ? "#EA580C" : "#059669";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{hasAccepted ? "MISSION EN COURS" : "APPEL AU DON"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {!hasAccepted ? (
          <>
            {/* CARTE D'APPEL (Vue Avant Acceptation) */}
            <View style={styles.mainCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.bloodBadge, { backgroundColor: "#FFF1F2" }]}>
                  <Text style={styles.bloodText}>{alertData.groupe || alertData.groupe_requis}</Text>
                </View>
                <View style={{ flex: 1, paddingLeft: 16 }}>
                  <PulseBadge label={t(`alert.urgencyLevels.${urgencyKey}`)} color={urgencyColor} />
                  <Text style={styles.locationTitle} numberOfLines={2}>{alertData.lieu}</Text>
                  {distance && (
                    <View style={styles.distanceRow}>
                      <TabBarIcon name="map-marker" size={12} color="#64748B" />
                      <Text style={styles.distanceText}>À {distance} de vous</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <TabBarIcon name="user" size={16} color="#64748B" />
                  <Text style={styles.detailText}>
                    Pour: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{alertData.nom_patient || "Patient inconnu"}</Text>
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <TabBarIcon name="tint" size={16} color="#64748B" />
                  <Text style={styles.detailText}>
                    Besoin: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{alertData.quantite_requise || "1"} poche(s)</Text>
                  </Text>
                </View>
              </View>

              {alertData.description && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>"{alertData.description}"</Text>
                </View>
              )}
            </View>

            {/* BARRE D'ACTION */}
            <View style={styles.actionContainer}>
              <View style={styles.securityNote}>
                <TabBarIcon name="shield" size={14} color="#059669" />
                <Text style={styles.securityText}>Votre don peut sauver 3 vies aujourd'hui.</Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.ignoreBtn} onPress={() => handleResponse("ignore")}>
                  <Text style={styles.ignoreText}>Passer</Text>
                </TouchableOpacity>
                 <TouchableOpacity 
                  style={styles.acceptBtn} 
                  onPress={() => setIsEligibilityVisible(true)}
                >
                  {isResponding ? <ModernSpinner color="white" size="small" /> : (
                    <>
                      <Text style={styles.acceptText}>J'Y VAIS</Text>
                      <TabBarIcon name="arrow-right" size={18} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          /* VUE APRÈS ACCEPTATION (MODE MISSION) */
          <View style={styles.missionContainer}>
            <View style={styles.congratsHeader}>
              <View style={styles.checkCircle}>
                <TabBarIcon name="check" size={32} color="white" />
              </View>
              <Text style={styles.congratsTitle}>Merci, Héros !</Text>
              <Text style={styles.congratsSub}>Le demandeur a été notifié de votre arrivée.</Text>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.cardLabel}>COORDONNÉES DU DEMANDEUR</Text>
              
              <View style={styles.contactRow}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>
                    {(alertData.initiateur?.prenom || alertData.nom_contact || "C").charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>
                    {alertData.initiateur ? `${alertData.initiateur.prenom} ${alertData.initiateur.nom}` : (alertData.nom_contact || "Contact Urgence")}
                  </Text>
                  <Text style={styles.contactRole}>Demandeur</Text>
                </View>
              </View>

              <View style={styles.commButtons}>
                <TouchableOpacity style={styles.callBigBtn} onPress={handleCall}>
                  <TabBarIcon name="phone" size={24} color="white" />
                  <Text style={styles.callBigText}>APPELER</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.waBigBtn} onPress={handleWhatsApp}>
                  <TabBarIcon name="whatsapp" size={24} color="white" family="fontawesome" />
                  <Text style={styles.waBigText}>WHATSAPP</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.gpsBtn} onPress={handleItinerary}>
                <TabBarIcon name="location-arrow" size={18} color="#1E293B" />
                <Text style={styles.gpsText}>Ouvrir le GPS ({alertData.lieu})</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.doneText}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL D'ÉLIGIBILITÉ INTÉGRÉE (Simplification du flux) */}
      <Modal visible={isEligibilityVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("alert.response.eligibility.title") || "Vérification de sécurité"}</Text>
              <TouchableOpacity onPress={() => setIsEligibilityVisible(false)}>
                <TabBarIcon name="times" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              <Text style={styles.modalSubtitle}>{t("alert.response.eligibility.subtitle")}</Text>
              
              <View style={styles.questionsContainer}>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const key = `q${num}`;
                  const isNeg = num >= 4;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.qCard, (isNeg ? answers[key] : !answers[key]) && styles.qCardActive]}
                      onPress={() => setAnswers(prev => ({ ...prev, [key]: !prev[key] }))}
                    >
                      <Text style={[styles.qText, (isNeg ? answers[key] : !answers[key]) && styles.qTextActive]}>
                        {t(`alert.response.eligibility.questions.q${num}.text`)}
                      </Text>
                      <View style={[styles.checkbox, answers[key] && styles.checkboxActive]}>
                        {answers[key] && <TabBarIcon name="check" size={14} color="white" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!isEligible && (
                <View style={styles.warningBox}>
                  <TabBarIcon name="exclamation-triangle" size={18} color={color.error} />
                  <Text style={styles.warningText}>{t("alert.response.eligibility.warning")}</Text>
                </View>
              )}
            </ScrollView>

            <PrimaryButton
              title={t("alert.response.eligibility.confirmBtn") || "JE CONFIRME"}
              onPress={() => handleResponse("accepte")}
              disabled={!isEligible || isResponding}
              loading={isResponding}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12 },
  headerTitle: { fontSize: 14, fontWeight: "900", color: "#1E293B", letterSpacing: 1 },
  scrollContent: { padding: 20 },

  // MAIN CARD
  mainCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start" },
  bloodBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECDD3"
  },
  bloodText: { fontSize: 22, fontWeight: "900", color: "#E11D48" },
  
  urgencyBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  urgencyLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  locationTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 4, lineHeight: 24 },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  distanceText: { fontSize: 13, color: "#64748B", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },

  detailsRow: { gap: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { fontSize: 14, color: "#64748B" },

  noteBox: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginTop: 16, borderLeftWidth: 3, borderLeftColor: "#CBD5E1" },
  noteText: { fontSize: 13, color: "#475569", fontStyle: "italic" },

  // ACTION AREA
  actionContainer: { gap: 16 },
  securityNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#ECFDF5", padding: 10, borderRadius: 12 },
  securityText: { fontSize: 12, color: "#059669", fontWeight: "700" },

  btnRow: { flexDirection: "row", gap: 12, height: 56 },
  ignoreBtn: { flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  ignoreText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
  acceptBtn: { flex: 2, backgroundColor: "#E11D48", borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, shadowColor: "#E11D48", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  acceptText: { color: "white", fontWeight: "900", fontSize: 16, letterSpacing: 1 },

  // MISSION VIEW
  missionContainer: { alignItems: "center", paddingTop: 20 },
  congratsHeader: { alignItems: "center", marginBottom: 30 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#10B981", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#10B981", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  congratsTitle: { fontSize: 24, fontWeight: "900", color: "#1E293B", marginBottom: 8 },
  congratsSub: { fontSize: 14, color: "#64748B", textAlign: "center", paddingHorizontal: 20 },

  contactCard: { width: "100%", backgroundColor: "white", borderRadius: 24, padding: 20, elevation: 2 },
  cardLabel: { fontSize: 11, fontWeight: "800", color: "#94A3B8", letterSpacing: 1, marginBottom: 16 },
  
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 16, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  avatarLetter: { fontSize: 20, fontWeight: "800", color: "#64748B" },
  contactName: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  contactRole: { fontSize: 12, color: "#64748B" },

  commButtons: { flexDirection: "row", gap: 12, marginBottom: 16 },
  callBigBtn: { flex: 1, height: 56, backgroundColor: "#0F172A", borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  callBigText: { color: "white", fontWeight: "800", fontSize: 14 },
  waBigBtn: { flex: 1, height: 56, backgroundColor: "#25D366", borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  waBigText: { color: "white", fontWeight: "800", fontSize: 14 },

  gpsBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 14, backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  gpsText: { fontSize: 13, fontWeight: "700", color: "#475569" },

  doneBtn: { marginTop: 30, padding: 15 },
  doneText: { color: "#94A3B8", fontWeight: "700" },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1E293B" },
  modalSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 20, lineHeight: 18 },
  questionsContainer: { gap: 10 },
  qCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, backgroundColor: color.surface, borderRadius: 16, borderWidth: 1, borderColor: color.borderLight, gap: 12 },
  qCardActive: { borderColor: color.primary, backgroundColor: color.primaryGhost },
  qText: { fontSize: 13, color: color.textMain, flex: 1, fontWeight: "600" },
  qTextActive: { color: color.primary },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: color.border, backgroundColor: "white", justifyContent: "center", alignItems: "center" },
  checkboxActive: { borderColor: color.primary, backgroundColor: color.primary },
  warningBox: { flexDirection: "row", alignItems: "center", backgroundColor: color.errorLight, padding: 14, borderRadius: 12, gap: 10, marginTop: 16 },
  warningText: { flex: 1, fontSize: 12, color: color.error, fontWeight: "700" },
});
