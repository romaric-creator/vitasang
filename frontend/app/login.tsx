import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import { color } from "@/constant/color";
import { router } from "expo-router";
import { loginUser, updatePushToken } from "@/services/user.service";
import { storeData } from "@/utils/storage";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import { loginValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { formStyles } from "@/styles/formStyles";

import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async (values: { telephone: string; mot_de_passe: string }) => {
    setGeneralError("");
    setLoading(true);

    try {
      const data = await loginUser(values.telephone, values.mot_de_passe);
      // Sauvegarder le token
      await storeData("token", data.token);
      // Sauvegarder l'objet user en normalisant l'id
      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };
      await storeData("user", userToStore);

      // Register for push notifications
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken && userToStore.id_utilisateur) {
          await updatePushToken(userToStore.id_utilisateur, pushToken);
          console.log("Push token envoyé au backend après connexion.");
        }
      } catch (tokenError) {
        console.error("Échec de l'envoi du push token au backend:", tokenError);
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err.message);
      setGeneralError(err.message || t('login.error'));
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
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          </View>

          {/* Form Section with Formik */}
          <Formik
            initialValues={{
              telephone: "",
              mot_de_passe: "",
            }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <View style={styles.formContainer}>
                <FormField
                  label={t('login.fields.phone')}
                  value={values.telephone}
                  onChangeText={handleChange("telephone")}
                  onBlur={handleBlur("telephone")}
                  placeholder={t('login.placeholders.phone')}
                  error={errors.telephone}
                  touched={touched.telephone}
                  keyboardType="phone-pad"
                  required
                />

                <FormField
                  label={t('login.fields.password')}
                  value={values.mot_de_passe}
                  onChangeText={handleChange("mot_de_passe")}
                  onBlur={handleBlur("mot_de_passe")}
                  placeholder={t('login.placeholders.password')}
                  error={errors.mot_de_passe}
                  touched={touched.mot_de_passe}
                  secureTextEntry
                  required
                />

                {/* Display general error message */}
                {generalError ? (
                  <Text style={styles.errorText}>{generalError}</Text>
                ) : null}

                {/* Forgot Password Link */}
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <PrimaryButton
                  title={t('login.submit')}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  style={{ marginTop: 24 }}
                />
              </View>
            )}
          </Formik>

          {/* Footer - Switch to Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('login.noAccount')} </Text>
            <TouchableOpacity onPress={() => router.replace("/register")}>
              <Text style={styles.registerLink}>{t('login.registerLink')}</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 32,
  },
  title: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 32,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: "600",
    color: color.textSecondary,
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
  },
  forgotText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  errorText: {
    color: color.error,
    textAlign: "center",
    marginTop: 16,
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 30,
    paddingBottom: 20,
  },
  footerText: {
    color: color.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },
  registerLink: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 13,
  },
});
