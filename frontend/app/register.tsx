import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import { color } from "@/constant/color";
import { router } from "expo-router";
import { registerUser, updatePushToken } from "@/services/user.service";
import { TabBarIcon } from "@/components/TabBarIcon";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import { storeData } from "@/utils/storage";
import { registerValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { formStyles } from "@/styles/formStyles";

import { useTranslation } from "react-i18next";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

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
        "donneur"
      );

      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };
      await storeData("user", userToStore);
      await storeData("token", data.token);

      // Enregistrement des notifications push après inscription
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken && userToStore.id_utilisateur) {
          await updatePushToken(userToStore.id_utilisateur, pushToken);
          console.log("Push token envoyé au backend après inscription.");
        }
      } catch (tokenError) {
        console.error("Échec de l'envoi du push token au backend:", tokenError);
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Registration error:", err.message);
      setGeneralError(err.message || t('register.error'));
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>{t('register.title')}</Text>
            <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
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
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <View style={styles.formContainer}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <FormField
                      label={t('register.fields.lastName')}
                      value={values.nom}
                      onChangeText={handleChange("nom")}
                      onBlur={handleBlur("nom")}
                      placeholder={t('register.placeholders.lastName')}
                      error={errors.nom}
                      touched={touched.nom}
                      required
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <FormField
                      label={t('register.fields.firstName')}
                      value={values.prenom}
                      onChangeText={handleChange("prenom")}
                      onBlur={handleBlur("prenom")}
                      placeholder={t('register.placeholders.firstName')}
                      error={errors.prenom}
                      touched={touched.prenom}
                      required
                    />
                  </View>
                </View>

                <FormField
                  label={t('register.fields.phone')}
                  value={values.telephone}
                  onChangeText={handleChange("telephone")}
                  onBlur={handleBlur("telephone")}
                  placeholder={t('register.placeholders.phone')}
                  error={errors.telephone}
                  touched={touched.telephone}
                  keyboardType="phone-pad"
                  required
                />
                <Text style={styles.hintText}>{t('register.hintPhone')}</Text>

                <FormField
                  label={t('register.fields.password')}
                  value={values.mot_de_passe}
                  onChangeText={handleChange("mot_de_passe")}
                  onBlur={handleBlur("mot_de_passe")}
                  placeholder={t('register.placeholders.password')}
                  error={errors.mot_de_passe}
                  touched={touched.mot_de_passe}
                  secureTextEntry
                  required
                />

                <BloodGroupSelector
                  value={values.groupe_sanguin}
                  onSelect={(group) => handleChange("groupe_sanguin")(group)}
                  error={errors.groupe_sanguin}
                  touched={touched.groupe_sanguin}
                />

                {generalError ? (
                  <Text style={styles.errorText}>{generalError}</Text>
                ) : null}

                <PrimaryButton
                  title={t('register.submit')}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  style={{ marginTop: 20 }}
                />

                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.loginLinkText}>
                    {t('register.alreadyRegistered')}{" "}
                    <Text style={styles.loginLinkHighlight}>
                      {t('register.loginLink')}
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
    flexDirection: 'row',
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
});
