import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import { color } from "@/constant/color";
import { loginValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { formStyles } from "@/styles/formStyles";
import { useAuth } from "@/context/AuthContext";
import { TabBarIcon } from "@/components/TabBarIcon";

import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleLogin = async (values: {
    telephone: string;
    mot_de_passe: string;
  }) => {
    setGeneralError("");
    setLoading(true);

    try {
      // signIn gère tout : appel API, stockage token/user, et mise à jour de isAuth
      await signIn(values.telephone, values.mot_de_passe);
    } catch (err: any) {
      console.error("Login error:", err);
      // Messages d'erreur améliorés pour le contexte local
      const msg = err.message || "";
      if (msg.includes("Network") || msg.includes("connexion")) {
        setGeneralError("Problème de connexion internet.");
      } else if (msg.includes("timeout") || msg.includes("délai")) {
        setGeneralError("Le serveur est lent. Réessayez.");
      } else if (msg.includes("401") || msg.includes("identifiants")) {
        setGeneralError("Numéro ou mot de passe incorrect.");
      } else {
        setGeneralError(t("login.error") || "Erreur inconnue.");
      }
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
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>{t("login.title")}</Text>
            <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
          </View>

          {/* SOS Floating/Highlight Button - Redesigned to be less redundant but useful */}
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => router.push("/guest-alert")}
          >
            <TabBarIcon name="bolt" size={16} color="white" />
            <Text style={styles.sosText}>BESOIN DE SANG EN URGENCE ?</Text>
          </TouchableOpacity>

          {/* Form Section with Formik */}
          <Formik
            initialValues={{
              telephone: "",
              mot_de_passe: "",
            }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <View style={styles.formContainer}>
                <FormField
                  label={t("login.fields.phone")}
                  value={values.telephone}
                  onChangeText={handleChange("telephone")}
                  onBlur={handleBlur("telephone")}
                  placeholder={t("login.placeholders.phone")}
                  error={errors.telephone}
                  touched={touched.telephone}
                  keyboardType="phone-pad"
                  required
                />

                <FormField
                  label={t("login.fields.password")}
                  value={values.mot_de_passe}
                  onChangeText={handleChange("mot_de_passe")}
                  onBlur={handleBlur("mot_de_passe")}
                  placeholder={t("login.placeholders.password")}
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
                <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push("/aide-et-conseil")}>
                  <Text style={styles.forgotText}>
                    {t("login.forgotPassword")}
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <PrimaryButton
                  title={t("login.submit")}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  style={{ marginTop: 24 }}
                />
              </View>
            )}
          </Formik>

          {/* Footer - Switch to Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("login.noAccount")} </Text>
            <TouchableOpacity onPress={() => router.replace("/register")}>
              <Text style={styles.registerLink}>{t("login.registerLink")}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 12,
  },
  title: {
    color: color.primary,
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    color: color.textSecondary,
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
  },
  sosBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 30,
    gap: 8,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sosText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  formContainer: {
    flex: 1,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    padding: 5,
  },
  forgotText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    color: color.error,
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: color.error + "10",
    padding: 10,
    borderRadius: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    color: color.textSecondary,
    fontWeight: "500",
    fontSize: 15,
  },
  registerLink: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 5,
  },
});
