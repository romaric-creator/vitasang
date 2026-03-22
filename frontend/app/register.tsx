import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { analyticsService } from "@/services/analyticsService";

import { Formik } from "formik";
import { color } from "@/constant/color";
import { router } from "expo-router";
import {
  registerUser,
  updatePushToken,
  sendAlert,
} from "@/services/user.service";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";

import { storeData, getData, removeData } from "@/utils/storage";
import { registerValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { useTranslation } from "react-i18next";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  // Step 1: Info perso, Step 2: Info médicale (optionnelle)
  const [step, setStep] = useState(1);

  const handleRegister = async (values: any) => {
    setGeneralError("");
    setLoading(true);
    analyticsService.trackEvent("register_attempt");

    try {
      // Nettoyage du numéro de téléphone (espaces)
      const cleanPhone = values.telephone.replace(/\s/g, "");
      // Gestion groupe sanguin null si vide ou "INCONNU"
      const cleanBloodGroup =
        values.groupe_sanguin === "" || values.groupe_sanguin === "INCONNU"
          ? null
          : values.groupe_sanguin;

      const data = await registerUser(
        values.nom,
        values.prenom,
        cleanPhone,
        values.mot_de_passe,
        cleanBloodGroup,
        "donneur",
      );

      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };

      // Stockage sécurisé
      await storeData("user", userToStore);
      await storeData("token", data.token);

      // Gestion Push Token (Silencieuse)
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken && userToStore.id_utilisateur) {
          await updatePushToken(userToStore.id_utilisateur, pushToken);
        }
      } catch (e) {
        /* Ignorer erreur push silencieuse */
      }

      // Gestion Alerte en attente (Workflow spécifique)
      try {
        const pendingAlert = await getData("pending_alert");
        if (pendingAlert) {
          try {
            const result = await sendAlert(pendingAlert);
            if (result.alertId && !isNaN(Number(result.alertId))) {
              await removeData("pending_alert");
              analyticsService.trackEvent("pending_alert_sent", {
                alertId: result.alertId,
              });
              router.replace({
                pathname: "/alert-confirmation",
                params: { alertId: result.alertId.toString() },
              });
              return;
            }
          } catch (alertError) {
            console.warn(
              "Failed to send pending alert after registration",
              alertError,
            );
          }
        }
      } catch (e) {
        console.warn("Error checking pending alert", e);
      }

      analyticsService.trackEvent("register_success");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Registration error:", err.message);
      // Messages d'erreur conviviaux
      let userMsg = t("register.error");
      if (err.message.includes("Validation error"))
        userMsg = "Ce numéro est déjà utilisé.";
      if (err.message.includes("Network"))
        userMsg = "Problème de connexion. Vérifiez votre réseau.";

      setGeneralError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (validateForm: any, values: any, setTouched: any) => {
    const step1Fields = {
      nom: true,
      prenom: true,
      telephone: true,
      mot_de_passe: true,
    };
    setTouched(step1Fields);

    validateForm(values).then((errors: any) => {
      const step1Errors = ["nom", "prenom", "telephone", "mot_de_passe"];
      const hasErrors = step1Errors.some((field) => errors[field]);

      if (!hasErrors) {
        setStep(2);
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: color.surface }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              {step === 1 ? "Créer un compte" : "Dernière étape"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Rejoignez la communauté des héros."
                : "Connaissez-vous votre groupe sanguin ?"}
            </Text>
          </View>

          <Formik
            initialValues={{
              nom: "",
              prenom: "",
              telephone: "",
              mot_de_passe: "",
              groupe_sanguin: "", // Vide par défaut
            }}
            validationSchema={registerValidationSchema}
            onSubmit={handleRegister}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              validateForm,
              setTouched,
              setFieldValue,
              isValid,
            }) => (
              <View style={styles.formContainer}>
                {step === 1 && (
                  <>
                    <View style={styles.row}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <FormField
                          label="Nom"
                          value={values.nom}
                          onChangeText={handleChange("nom")}
                          onBlur={handleBlur("nom")}
                          placeholder="Votre nom"
                          error={errors.nom}
                          touched={touched.nom}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <FormField
                          label="Prénom"
                          value={values.prenom}
                          onChangeText={handleChange("prenom")}
                          onBlur={handleBlur("prenom")}
                          placeholder="Votre prénom"
                          error={errors.prenom}
                          touched={touched.prenom}
                        />
                      </View>
                    </View>

                    <FormField
                      label="Téléphone"
                      value={values.telephone}
                      onChangeText={handleChange("telephone")}
                      onBlur={handleBlur("telephone")}
                      placeholder="Ex: 6 99 99 99 99"
                      keyboardType="phone-pad"
                      error={errors.telephone}
                      touched={touched.telephone}
                    />

                    <FormField
                      label="Mot de passe"
                      value={values.mot_de_passe}
                      onChangeText={handleChange("mot_de_passe")}
                      onBlur={handleBlur("mot_de_passe")}
                      placeholder="6 caractères min."
                      secureTextEntry
                      error={errors.mot_de_passe}
                      touched={touched.mot_de_passe}
                    />

                    <PrimaryButton
                      title="Suivant"
                      onPress={() =>
                        handleNextStep(validateForm, values, setTouched)
                      }
                      style={{ marginTop: 24 }}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Text style={styles.label}>
                      Votre groupe sanguin (Optionnel)
                    </Text>
                    <BloodGroupSelector
                      value={values.groupe_sanguin}
                      onSelect={(group) =>
                        handleChange("groupe_sanguin")(group)
                      }
                      error={errors.groupe_sanguin}
                      touched={touched.groupe_sanguin}
                    />

                    {/* Option Explicite "Je ne sais pas" */}
                    <TouchableOpacity
                      style={[
                        styles.unknownButton,
                        (values.groupe_sanguin === "INCONNU" ||
                          values.groupe_sanguin === "") &&
                          styles.unknownButtonActive,
                      ]}
                      onPress={() => setFieldValue("groupe_sanguin", "INCONNU")}
                    >
                      <Text
                        style={[
                          styles.unknownButtonText,
                          (values.groupe_sanguin === "INCONNU" ||
                            values.groupe_sanguin === "") &&
                            styles.unknownButtonTextActive,
                        ]}
                      >
                        Je ne connais pas mon groupe sanguin
                      </Text>
                    </TouchableOpacity>

                    {generalError ? (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{generalError}</Text>
                      </View>
                    ) : null}

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setStep(1)}
                      >
                        <Text style={styles.backButtonText}>Retour</Text>
                      </TouchableOpacity>

                      <PrimaryButton
                        title={loading ? "Création..." : "Terminer"}
                        onPress={() => handleSubmit()}
                        loading={loading}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  onPress={() => router.replace("/login")}
                  style={{ marginTop: 24, padding: 10 }}
                >
                  <Text style={styles.loginLinkText}>
                    Déjà un compte ?{" "}
                    <Text style={styles.loginLinkHighlight}>Se connecter</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    color: color.primary,
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -1,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    color: color.textSecondary,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: color.text,
    marginBottom: 12,
  },
  unknownButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    marginTop: 16,
    backgroundColor: color.background,
  },
  unknownButtonActive: {
    backgroundColor: color.primary + "10", // 10% opacity
    borderColor: color.primary,
  },
  unknownButtonText: {
    color: color.textSecondary,
    fontWeight: "600",
  },
  unknownButtonTextActive: {
    color: color.primary,
  },
  loginLinkText: {
    color: color.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: color.primary,
    fontWeight: "700",
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    gap: 16,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: color.textSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
});
