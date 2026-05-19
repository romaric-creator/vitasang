import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { Formik } from "formik";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import * as Location from "expo-location";
import { searchDonors } from "@/services/user.service";
import { storeData } from "@/utils/storage";
import { createAlertValidationSchema } from "@/validation/ValidationSchemas";
import { apiClient } from "@/config/axiosConfig";
import FormField from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { formStyles } from "@/styles/formStyles";
import { useTranslation } from "react-i18next";
import {
  SkeletonLoader,
  SkeletonListLoader,
} from "@/components/SkeletonLoader";

export default function GuestAlertScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // Pas d'auth ici
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [showAccountPromptModal, setShowAccountPromptModal] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(t("alert.locationError"));
        setIsLocating(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // ✅ Balanced = plus rapide que High
          timeInterval: 10000, // ✅ Timeout 10s pour éviter un blocage infini
        });
        setLocation(location);
      } catch (e) {
        console.warn("Location error:", e);
        setErrorMsg(
          t("alert.locationError") ||
            "Impossible de récupérer votre position. Veuillez vérifier votre GPS.",
        );
      }
      setIsLocating(false);
    })();
  }, []);

  const handleSearch = async (
    groupeSanguin: string,
    latitude: number,
    longitude: number,
  ) => {
    if (!latitude || !longitude) return;

    setLoading(true);
    try {
      const data = await searchDonors(latitude, longitude, groupeSanguin, 10);
      setDonorCount(data.count);
    } catch (error) {
      console.error(error);
      setDonorCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreAndShowPrompt = async (values: any) => {
    setErrorMsg(null);

    if (!location) {
      const msg = t("alert.locationError");
      setErrorMsg(msg);
      Alert.alert(t("common.error"), msg);
      return;
    }

    const alertData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      groupe_sanguin: values.groupe_sanguin,
      radius: 10,
      urgence: values.urgence,
      quantite_requise: parseInt(values.quantite_requise),
      lieu: values.lieu,
      description: values.description,
      nom_patient: values.nom_patient,
      telephone_contact: values.telephone_contact,
    };

    setLoading(true);
    try {
      await storeData("pending_alert", alertData);
      // Afficher le modal informatif au lieu de rediriger directement
      setShowAccountPromptModal(true);
    } catch (error: any) {
      console.error("Failed to store pending alert:", error);
      const msg =
        t("alert.genericError") ||
        "Erreur inattendue lors de la sauvegarde de l'alerte.";
      setErrorMsg(msg);
      Alert.alert(t("common.error"), msg);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToRegister = () => {
    setShowAccountPromptModal(false);
    router.push("/register");
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.redHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <TabBarIcon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ALERTE SOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLocating ? (
        <View style={styles.loadingArea}>
          <SkeletonLoader width={80} height={80} borderRadius={40} style={{ marginBottom: 24 }} />
          <SkeletonLoader width="70%" height={24} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="50%" height={16} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formIntro}>
            <View style={styles.introIconBox}>
              <TabBarIcon name="bullhorn" size={24} color={color.primary} />
            </View>
            <Text style={styles.introText}>
              Remplissez les informations ci-dessous pour lancer une alerte urgente.
            </Text>
          </View>

          <Formik
            initialValues={{
              nom_patient: "",
              telephone_contact: "",
              groupe_sanguin: "O+",
              urgence: "URGENT",
              lieu: "",
              quantite_requise: "1",
              description: "",
              latitude: location?.coords.latitude || 0,
              longitude: location?.coords.longitude || 0,
            }}
            validationSchema={createAlertValidationSchema}
            onSubmit={handleStoreAndShowPrompt}
            enableReinitialize={true}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
            }) => (
              <View style={styles.formContainer}>
                <Text style={styles.groupLabel}>GROUPE SANGUIN REQUIS</Text>
                <BloodGroupSelector
                  value={values.groupe_sanguin}
                  onSelect={(group) => {
                    handleChange("groupe_sanguin")(group);
                    if (location) {
                      handleSearch(
                        group,
                        location.coords.latitude,
                        location.coords.longitude,
                      );
                    }
                  }}
                  error={errors.groupe_sanguin}
                  touched={touched.groupe_sanguin}
                />

                <View style={styles.fieldsGrid}>
                  <FormField
                    label={t("alert.fields.patientName") || "Nom du Patient"}
                    value={values.nom_patient}
                    onChangeText={handleChange("nom_patient")}
                    onBlur={handleBlur("nom_patient")}
                    placeholder="Ex: Jean Dupont"
                    error={errors.nom_patient}
                    touched={touched.nom_patient}
                    required
                  />

                  <FormField
                    label={t("alert.fields.contactPhone") || "Numéro de Contact"}
                    value={values.telephone_contact}
                    onChangeText={(text) =>
                      setFieldValue("telephone_contact", text.replace(/\s/g, ""))
                    }
                    onBlur={handleBlur("telephone_contact")}
                    placeholder="6XXXXXXXX"
                    error={errors.telephone_contact}
                    touched={touched.telephone_contact}
                    keyboardType="phone-pad"
                    required
                  />

                  <FormField
                    label={t("alert.fields.location") || "Hôpital / Lieu"}
                    value={values.lieu}
                    onChangeText={handleChange("lieu")}
                    onBlur={handleBlur("lieu")}
                    placeholder={t("alert.placeholders.location")}
                    error={errors.lieu}
                    touched={touched.lieu}
                    required
                  />

                  <FormField
                    label={t("alert.fields.quantity") || "Quantité (Poches)"}
                    value={values.quantite_requise}
                    onChangeText={handleChange("quantite_requise")}
                    onBlur={handleBlur("quantite_requise")}
                    placeholder={t("alert.placeholders.quantity")}
                    error={errors.quantite_requise}
                    touched={touched.quantite_requise}
                    keyboardType="numeric"
                    required
                  />
                </View>

                <View style={styles.urgencySection}>
                  <Text style={styles.fieldLabel}>NIVEAU D'URGENCE <Text style={{ color: color.primary }}>*</Text></Text>
                  <View style={styles.urgencyGrid}>
                    {["NORMAL", "URGENT", "TRES_URGENT"].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.urgencyOption,
                          values.urgence === level && styles.urgencySelected,
                        ]}
                        onPress={() => handleChange("urgence")(level)}
                      >
                        <Text
                          style={[
                            styles.urgencyText,
                            values.urgence === level && { color: "white" },
                          ]}
                        >
                          {t(`alert.urgencyLevels.${level}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <FormField
                  label={t("alert.fields.description") || "Description additionnelle"}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  placeholder={t("alert.placeholders.description")}
                  error={errors.description}
                  touched={touched.description}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.donorInfoBox}>
                  <TabBarIcon name="users" size={18} color={color.primary} />
                  <Text style={styles.donorInfoText}>
                    {donorCount !== null
                      ? t("alert.donorFound", { count: donorCount, group: values.groupe_sanguin })
                      : t("alert.searchingDonors")}
                  </Text>
                </View>

                {errorMsg && <Text style={styles.errorBanner}>{errorMsg}</Text>}

                <PrimaryButton
                  title={t("alert.submit") || "LANCER L'ALERTE"}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={!location || loading}
                  style={styles.submitBtn}
                />

                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => router.replace("/login")}
                >
                  <Text style={styles.loginLinkText}>
                    {t("alert.haveAccount") || "Vous avez un compte ?"}{" "}
                    <Text style={{ color: color.primary, fontWeight: "800" }}>Connexion</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      )}

      {/* Modal Redesign */}
      <Modal visible={showAccountPromptModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <TabBarIcon name="check" size={32} color="white" />
              </View>
            </View>
            <Text style={styles.modalTitle}>{t("alert.accountCreationTitle") || "Presque fini !"}</Text>
            <Text style={styles.modalDesc}>
              Votre alerte est prête. Pour la diffuser, créez votre compte en quelques secondes.
            </Text>
            
            <View style={styles.stepList}>
              <Step item="1" text="Créez votre compte" />
              <Step item="2" text="L'alerte est lancée automatiquement" />
              <Step item="3" text="Sauvez des vies immédiatement" />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAccountPromptModal(false)}>
                <Text style={styles.modalCancelText}>{t("common.cancel") || "Annuler"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalContinue} onPress={handleContinueToRegister}>
                <Text style={styles.modalContinueText}>CRÉER MON COMPTE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const Step = ({ item, text }: any) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{item}</Text></View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  redHeader: {
    height: 110,
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  scrollContent: { paddingBottom: 40 },
  loadingArea: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  formIntro: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "white",
    marginBottom: 16,
  },
  introIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  introText: { flex: 1, fontSize: 13, color: color.textSecondary, fontWeight: "600", lineHeight: 18 },
  formContainer: { paddingHorizontal: 20 },
  groupLabel: { fontSize: 11, fontWeight: "800", color: color.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  fieldsGrid: { gap: 4 },
  urgencySection: { marginTop: 8, marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: color.textMain, marginBottom: 12 },
  urgencyGrid: { flexDirection: "row", gap: 8 },
  urgencyOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borderLight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  urgencySelected: { backgroundColor: color.primary, borderColor: color.primary },
  urgencyText: { fontSize: 11, fontWeight: "800", color: color.textSecondary },
  donorInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: color.primaryGhost,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  donorInfoText: { fontSize: 13, color: color.primary, fontWeight: "700" },
  errorBanner: {
    color: "white",
    backgroundColor: color.error,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  submitBtn: { marginTop: 24, height: 56 },
  loginLink: { marginTop: 20, alignItems: "center" },
  loginLinkText: { fontSize: 14, color: color.textSecondary },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: "white", borderRadius: 24, padding: 24, alignItems: "center" },
  modalHeader: { marginBottom: 20 },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.primary, justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "900", color: color.textMain, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: color.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  stepList: { width: "100%", gap: 12, marginBottom: 30 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: color.primaryGhost, justifyContent: "center", alignItems: "center" },
  stepNumberText: { color: color.primary, fontWeight: "800", fontSize: 13 },
  stepText: { fontSize: 14, color: color.textMain, fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: { flex: 1, height: 48, justifyContent: "center", alignItems: "center" },
  modalCancelText: { color: color.textSecondary, fontWeight: "700" },
  modalContinue: { flex: 2, height: 48, backgroundColor: color.primary, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  modalContinueText: { color: "white", fontWeight: "800", fontSize: 13 },
});
