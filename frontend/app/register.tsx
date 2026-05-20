import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { analyticsService } from "@/services/analyticsService";
import { PrimaryButton } from "@/components/PrimaryButton";

import { Formik } from "formik";
import { color } from "@/constant/color";
import { router } from "expo-router";
import {
  registerUser,
  updatePushToken,
  sendAlert,
} from "@/services/user.service";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";

import { getData, removeData } from "@/utils/storage";
import { registerValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { useTranslation } from "react-i18next";
import { ErrorAlert } from "@/components/ErrorAlert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TabBarIcon } from "@/components/TabBarIcon";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { completeAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [step, setStep] = useState(1);

  const handleRegister = async (values: any, { setErrors }: any) => {
    setGeneralError("");
    setLoading(true);
    analyticsService.trackEvent("register_attempt");

    try {
      const cleanPhone = values.telephone.replace(/\s/g, "");
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

      await completeAuth(data.user, data.token);

      const userId = data.user.id || data.user.id_utilisateur;

      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken && userId) {
          await updatePushToken(userId, pushToken);
        }
      } catch (e) {}

      try {
        const pendingAlert = await getData("pending_alert");
        if (pendingAlert) {
          try {
            const result = await sendAlert(pendingAlert);
            if (result.alertId && !isNaN(Number(result.alertId))) {
              await removeData("pending_alert");
              router.replace({
                pathname: "/alert-confirmation",
                params: { alertId: result.alertId.toString() },
              });
              return;
            }
          } catch (alertError) {}
        }
      } catch (e) {}

      analyticsService.trackEvent("register_success");
    } catch (err: any) {
      console.error("Registration error details:", err);
      if (err.errors) {
        setErrors(err.errors);
        setGeneralError("Veuillez corriger les erreurs ci-dessous.");
        const step1Fields = ["nom", "prenom", "telephone", "mot_de_passe"];
        const hasStep1Errors = step1Fields.some((field) => err.errors[field]);
        if (hasStep1Errors && step === 2) {
          setStep(1);
        }
      } else {
        let userMsg = err.message || t("register.error");
        if (err.message.includes("Validation error") || err.message.includes("409"))
          userMsg = "Ce numéro est déjà utilisé.";
        setGeneralError(userMsg);
      }
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <LoadingSpinner visible={loading} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
            </View>
            <Text style={styles.title}>
              {step === 1 ? t("register.joinUs") : t("register.bloodGroup")}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? t("register.createProfile")
                : t("register.vitalInfo")}
            </Text>
          </View>

          <Formik
            initialValues={{
              nom: "",
              prenom: "",
              telephone: "",
              mot_de_passe: "",
              groupe_sanguin: "",
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
            }) => (
              <View style={styles.form}>
                {step === 1 && (
                  <>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <FormField
                          label={t("register.fields.firstName")}
                          value={values.prenom}
                          onChangeText={handleChange("prenom")}
                          onBlur={handleBlur("prenom")}
                          placeholder="Jean"
                          leftIcon="user"
                          error={errors.prenom as any}
                          touched={touched.prenom as any}
                        />
                      </View>
                      <View style={{ width: 16 }} />
                      <View style={{ flex: 1 }}>
                        <FormField
                          label="Nom"
                          value={values.nom}
                          onChangeText={handleChange("nom")}
                          onBlur={handleBlur("nom")}
                          placeholder="Dupont"
                          leftIcon="user"
                          error={errors.nom as any}
                          touched={touched.nom as any}
                        />
                      </View>
                    </View>

                    <FormField
                      label="Téléphone"
                      value={values.telephone}
                      onChangeText={handleChange("telephone")}
                      onBlur={handleBlur("telephone")}
                      placeholder="6 99 99 99 99"
                      keyboardType="phone-pad"
                      leftIcon="phone"
                      error={errors.telephone as any}
                      touched={touched.telephone as any}
                    />

                    <FormField
                      label="Mot de passe"
                      value={values.mot_de_passe}
                      onChangeText={handleChange("mot_de_passe")}
                      onBlur={handleBlur("mot_de_passe")}
                      placeholder="8 caractères min."
                      secureTextEntry
                      leftIcon="lock"
                      error={errors.mot_de_passe as any}
                      touched={touched.mot_de_passe as any}
                    />

                    <PrimaryButton
                      title={t("register.continue")}
                      onPress={() => handleNextStep(validateForm, values, setTouched)}
                      style={styles.primaryBtn}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <View style={styles.bloodSection}>
                      <Text style={styles.sectionLabel}>
                        {t("register.bloodGroupQuestion")}
                      </Text>
                      <BloodGroupSelector
                        value={values.groupe_sanguin}
                        onSelect={(group) => setFieldValue("groupe_sanguin", group)}
                        error={errors.groupe_sanguin}
                        touched={touched.groupe_sanguin}
                      />

                      <TouchableOpacity
                        style={[
                          styles.unknownCard,
                          (values.groupe_sanguin === "INCONNU" || values.groupe_sanguin === "") &&
                            styles.unknownCardActive,
                        ]}
                        onPress={() => setFieldValue("groupe_sanguin", "INCONNU")}
                        activeOpacity={0.7}
                        accessibilityRole="radio"
                        accessibilityLabel={t("register.unknownBloodGroup")}
                        accessibilityState={{ selected: values.groupe_sanguin === "INCONNU" || values.groupe_sanguin === "" }}
                      >
                        <TabBarIcon 
                          name="question-circle" 
                          size={20} 
                          color={(values.groupe_sanguin === "INCONNU" || values.groupe_sanguin === "") ? color.primary : color.textSecondary} 
                        />
                        <Text
                          style={[
                            styles.unknownText,
                            (values.groupe_sanguin === "INCONNU" || values.groupe_sanguin === "") &&
                              styles.unknownTextActive,
                          ]}
                        >
                          {t("register.unknownBloodGroup")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <ErrorAlert
                      visible={!!generalError}
                      message={generalError}
                      onDismiss={() => setGeneralError("")}
                    />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => setStep(1)}
                        accessibilityRole="button"
                        accessibilityLabel={t("common.back") || "Retour"}
                      >
                        <Text style={styles.backBtnText}>{t("common.back") || "Retour"}</Text>
                      </TouchableOpacity>

                      <PrimaryButton
                        title={t("register.submit")}
                        onPress={() => handleSubmit()}
                        loading={loading}
                        style={{ flex: 1, marginTop: 0 }}
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  onPress={() => router.replace("/login")}
                  style={styles.loginFooter}
                  accessibilityRole="link"
                  accessibilityLabel={t("register.alreadyRegistered")}
                >
                  <Text style={styles.loginText}>
                    {t("register.alreadyHaveAccount")}{" "}
                    <Text style={styles.loginHighlight}>{t("register.signIn")}</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.border,
  },
  stepDotActive: {
    backgroundColor: color.primary,
    width: 24,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: color.border,
    borderRadius: 1,
  },
  stepLineActive: {
    backgroundColor: color.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: color.textSecondary,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.7,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bloodSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 24,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  unknownCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.borderLight,
    marginTop: 20,
    backgroundColor: color.secondaryGhost,
  },
  unknownCardActive: {
    backgroundColor: color.primaryGhost,
    borderColor: color.primary,
  },
  unknownText: {
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: "700",
  },
  unknownTextActive: {
    color: color.primary,
  },
  primaryBtn: {
    marginTop: 24,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtnText: {
    color: color.textSecondary,
    fontWeight: "700",
    fontSize: 15,
  },
  loginFooter: {
    marginTop: 40,
    alignItems: "center",
    padding: 10,
  },
  loginText: {
    color: color.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  loginHighlight: {
    color: color.primary,
    fontWeight: "800",
  },
});


