import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
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
        let location = await Location.getCurrentPositionAsync({});
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
      <PageHeader title={t("alert.emergencySOS") || "URGENCE SOS"} />
      {isLocating ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <SkeletonLoader
            width={120}
            height={120}
            borderRadius={60}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={16} />
          <SkeletonListLoader count={3} itemHeight={40} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
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
              <View>
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

                <FormField
                  label={t("alert.fields.patientName") || "Nom du Patient"}
                  value={values.nom_patient}
                  onChangeText={handleChange("nom_patient")}
                  onBlur={handleBlur("nom_patient")}
                  placeholder="Jean Dupont"
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
                  label={t("alert.fields.location")}
                  value={values.lieu}
                  onChangeText={handleChange("lieu")}
                  onBlur={handleBlur("lieu")}
                  placeholder={t("alert.placeholders.location")}
                  error={errors.lieu}
                  touched={touched.lieu}
                  required
                />

                <FormField
                  label={t("alert.fields.quantity")}
                  value={values.quantite_requise}
                  onChangeText={handleChange("quantite_requise")}
                  onBlur={handleBlur("quantite_requise")}
                  placeholder={t("alert.placeholders.quantity")}
                  error={errors.quantite_requise}
                  touched={touched.quantite_requise}
                  keyboardType="numeric"
                  required
                />

                <View style={formStyles.field}>
                  <Text style={formStyles.label}>
                    {t("alert.fields.urgency")}{" "}
                    <Text style={{ color: color.error }}>*</Text>
                  </Text>
                  <View style={styles.urgencyGrid}>
                    {["NORMAL", "URGENT", "TRES_URGENT"].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.urgencyOption,
                          values.urgence === level && styles.urgencySelected,
                        ]}
                        onPress={() => handleChange("urgence")(level)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.urgencyLabel,
                            values.urgence === level && styles.textWhite,
                          ]}
                        >
                          {t(`alert.urgencyLevels.${level}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.urgence && touched.urgence && (
                    <Text style={formStyles.errorText}>{errors.urgence}</Text>
                  )}
                </View>

                <FormField
                  label={t("alert.fields.description")}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  placeholder={t("alert.placeholders.description")}
                  error={errors.description}
                  touched={touched.description}
                />

                <View style={styles.warningBox}>
                  <TabBarIcon
                    name="info-circle"
                    size={16}
                    color={color.primary}
                  />
                  {loading ? (
                    <Text style={styles.warningText}>Envoi en cours...</Text>
                  ) : (
                    <Text style={styles.warningText}>
                      {donorCount !== null
                        ? t("alert.donorFound", {
                            count: donorCount,
                            group: values.groupe_sanguin,
                          })
                        : t("alert.searchingDonors")}
                    </Text>
                  )}
                </View>

                {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

                <PrimaryButton
                  title={t("alert.submit") || "LANCER L'ALERTE"}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={!location || loading}
                  style={{ marginTop: 20 }}
                />

                {/* Lien de retour au login spécifique pour guest */}
                <TouchableOpacity
                  style={{ marginTop: 20, alignItems: "center" }}
                  onPress={() => router.replace("/login")}
                >
                  <Text style={{ color: color.textSecondary, fontSize: 14 }}>
                    {t("alert.haveAccount") || "Vous avez un compte ?"}{" "}
                    <Text style={{ color: color.primary, fontWeight: "bold" }}>
                      Connexion
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      )}

      {/* Modal d'information sur la création du compte */}
      <Modal
        visible={showAccountPromptModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icône de succès */}
            <View style={styles.modalIcon}>
              <TabBarIcon name="check-circle" size={48} color={color.primary} />
            </View>

            {/* Titre */}
            <Text style={styles.modalTitle}>
              {t("alert.accountCreationTitle") || "Créez votre compte"}
            </Text>

            {/* Message informatif */}
            <Text style={styles.modalMessage}>
              {t("alert.accountCreationMessage") ||
                "Votre alerte a été enregistrée avec succès. Pour la lancer auprès des donneurs, vous devez créer un compte. Le compte sera créé immédiatement et votre alerte sera lancée automatiquement."}
            </Text>

            {/* Points clés */}
            <View style={styles.keyPointsContainer}>
              <View style={styles.keyPoint}>
                <Text style={styles.keyPointNumber}>1</Text>
                <Text style={styles.keyPointText}>
                  {t("alert.step1") ||
                    "Créez votre compte avec vos informations"}
                </Text>
              </View>

              <View style={styles.keyPoint}>
                <Text style={styles.keyPointNumber}>2</Text>
                <Text style={styles.keyPointText}>
                  {t("alert.step2") ||
                    "Votre alerte sera lancée automatiquement"}
                </Text>
              </View>

              <View style={styles.keyPoint}>
                <Text style={styles.keyPointNumber}>3</Text>
                <Text style={styles.keyPointText}>
                  {t("alert.step3") ||
                    "Les donneurs proches recevront votre alerte"}
                </Text>
              </View>
            </View>

            {/* Boutons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowAccountPromptModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel") || "Annuler"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleContinueToRegister}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>
                  {t("alert.continueToRegister") || "Créer mon compte"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.screenBackground },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  textWhite: { color: "white" },
  urgencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  urgencyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: "center",
    backgroundColor: color.surface,
  },
  urgencySelected: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  urgencyLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: color.textSecondary,
    textAlign: "center",
    textTransform: "uppercase",
  },
  warningBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: color.dangerLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.1)", // Subtle primary border
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: color.primary,
    lineHeight: 18,
    fontWeight: "700",
  },
  errorText: {
    color: color.error,
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "700",
    backgroundColor: color.dangerLight,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.error,
  },
  authSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: color.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 12,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 0,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: color.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  // Styles pour le Modal de notification du compte
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    maxHeight: "85%",
  },
  modalIcon: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: color.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    fontWeight: "500",
  },
  keyPointsContainer: {
    backgroundColor: color.screenBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    gap: 12,
  },
  keyPoint: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  keyPointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.primary,
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
    flexShrink: 0,
  },
  keyPointText: {
    flex: 1,
    fontSize: 12,
    color: color.textPrimary,
    lineHeight: 18,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.screenBackground,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textSecondary,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
});
