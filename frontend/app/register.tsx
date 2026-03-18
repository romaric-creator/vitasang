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
  const [step, setStep] = useState(1);

  const handleRegister = async (values: any) => {
    setGeneralError("");
    setLoading(true);

    try {
      const data = await registerUser(
        values.nom,
        values.prenom,
        values.telephone,
        values.mot_de_passe,
        values.groupe_sanguin,
        "donneur",
      );

      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };
      await storeData("user", userToStore);
      await storeData("token", data.token);

      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken && userToStore.id_utilisateur) {
          await updatePushToken(userToStore.id_utilisateur, pushToken);
          console.log("Push token envoyé au backend après inscription.");
        }
      } catch (tokenError) {
        console.error("Échec de l'envoi du push token au backend:", tokenError);
      }

      // TRAITER L'ALERTE EN ATTENTE (Guest flow)
      try {
        const pendingAlert = await getData("pending_alert");
        if (pendingAlert) {
          console.log("Envoi de l'alerte en attente après inscription...");
          const result = await sendAlert(pendingAlert);
          if (result.alertId) {
            await removeData("pending_alert");
            console.log("Alerte en attente envoyée avec succès.");
            router.replace({
              pathname: "/alert-confirmation",
              params: { alertId: result.alertId.toString() },
            });
            return;
          }
        }
      } catch (e) {
        console.error("Erreur lors de l'envoi de l'alerte en attente:", e);
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Registration error:", err.message);
      setGeneralError(err.message || t("register.error"));
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
      confirmPassword: true,
    };
    setTouched(step1Fields);

    validateForm(values).then((errors: any) => {
      const step1Errors = [
        "nom",
        "prenom",
        "telephone",
        "mot_de_passe",
        "confirmPassword",
      ];
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
              {step === 1
                ? t("register.step1.title")
                : t("register.step2.title")}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? t("register.subtitle")
                : t("register.step2.subtitle")}
            </Text>
          </View>

          <Formik
            initialValues={{
              nom: "",
              prenom: "",
              telephone: "",
              mot_de_passe: "",
              confirmPassword: "",
              groupe_sanguin: "",
            }}
            validationSchema={registerValidationSchema}
            onSubmit={handleRegister}
            validateOnMount
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
              isValid,
            }) => (
              <View style={styles.formContainer}>
                {step === 1 && (
                  <>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <FormField
                          label={t("register.fields.lastName")}
                          value={values.nom}
                          onChangeText={handleChange("nom")}
                          onBlur={handleBlur("nom")}
                          placeholder={t("register.placeholders.lastName")}
                          error={errors.nom}
                          touched={touched.nom}
                          required
                        />
                      </View>
                      <View style={{ width: 12 }} />
                      <View style={{ flex: 1 }}>
                        <FormField
                          label={t("register.fields.firstName")}
                          value={values.prenom}
                          onChangeText={handleChange("prenom")}
                          onBlur={handleBlur("prenom")}
                          placeholder={t("register.placeholders.firstName")}
                          error={errors.prenom}
                          touched={touched.prenom}
                          required
                        />
                      </View>
                    </View>

                    <FormField
                      label={t("register.fields.phone")}
                      value={values.telephone}
                      onChangeText={handleChange("telephone")}
                      onBlur={handleBlur("telephone")}
                      placeholder={t("register.placeholders.phone")}
                      error={errors.telephone}
                      touched={touched.telephone}
                      keyboardType="phone-pad"
                      required
                    />
                    <Text style={styles.hintText}>
                      {t("register.hintPhone")}
                    </Text>

                    <FormField
                      label={t("register.fields.password")}
                      value={values.mot_de_passe}
                      onChangeText={handleChange("mot_de_passe")}
                      onBlur={handleBlur("mot_de_passe")}
                      placeholder={t("register.placeholders.password")}
                      error={errors.mot_de_passe}
                      touched={touched.mot_de_passe}
                      secureTextEntry
                      required
                    />

                    <FormField
                      label={t("register.fields.confirmPassword")}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      placeholder={t("register.placeholders.confirmPassword")}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                      secureTextEntry
                      required
                    />
                    <PrimaryButton
                      title={t("register.next")}
                      onPress={() =>
                        handleNextStep(validateForm, values, setTouched)
                      }
                      style={{ marginTop: 20 }}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <BloodGroupSelector
                      value={values.groupe_sanguin}
                      onSelect={(group) =>
                        handleChange("groupe_sanguin")(group)
                      }
                      error={errors.groupe_sanguin}
                      touched={touched.groupe_sanguin}
                    />

                    {generalError ? (
                      <Text style={styles.errorText}>{generalError}</Text>
                    ) : null}

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setStep(1)}
                      >
                        <Text style={styles.backButtonText}>
                          {t("register.back")}
                        </Text>
                      </TouchableOpacity>
                      <PrimaryButton
                        title={t("register.submit")}
                        onPress={() => handleSubmit()}
                        loading={loading}
                        style={{ marginTop: 20, flex: 1 }}
                        disabled={!isValid}
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.loginLinkText}>
                    {t("register.alreadyRegistered")}{" "}
                    <Text style={styles.loginLinkHighlight}>
                      {t("register.loginLink")}
                    </Text>
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 32,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: "600",
    color: color.textSecondary,
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  loginLinkText: {
    color: color.textSecondary,
    fontWeight: "500",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
  loginLinkHighlight: {
    color: color.primary,
    fontWeight: "800",
  },
  errorText: {
    color: color.error,
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
  },
  hintText: {
    color: color.textSecondary,
    fontSize: 10,
    marginTop: -10,
    marginBottom: 12,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 10,
  },
  backButtonText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
