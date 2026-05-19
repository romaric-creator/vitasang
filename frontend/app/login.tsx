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
import { PrimaryButton } from "@/components/PrimaryButton";
import { Formik } from "formik";
import { router } from "expo-router";
import { color } from "@/constant/color";
import { loginValidationSchema } from "@/validation/ValidationSchemas";
import { useAuth } from "@/context/AuthContext";
import { TabBarIcon } from "@/components/TabBarIcon";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import { ErrorAlert } from "@/components/ErrorAlert";
import FormField from "@/components/FormField";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (
    values: { telephone: string; mot_de_passe: string },
    { setErrors }: any,
  ) => {
    setGeneralError("");
    setLoading(true);

    try {
      await signIn(values.telephone, values.mot_de_passe);
    } catch (err: any) {
      console.error("Login error details:", err);
      if (err.errors) {
        setErrors(err.errors);
        setGeneralError("Identifiants incorrects ou format invalide.");
      } else {
        const msg = err.message || "";
        if (msg.includes("Network") || msg.includes("connexion")) {
          setGeneralError(t("error.network") || "Vérifiez votre connexion internet.");
        } else if (msg.includes("401") || msg.includes("identifiants")) {
          setGeneralError(t("error.invalidCredentials") || "Numéro ou mot de passe incorrect.");
        } else {
          setGeneralError(t("login.error") || "Erreur de connexion.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <TabBarIcon name="tint" size={42} color="white" />
            </View>
            <Text style={styles.brandName}>VitaSang</Text>
            <Text style={styles.subTitle}>{t("login.welcomeBack") || "Donnez, sauvez des vies"}</Text>
          </View>

          <Formik
            initialValues={{ telephone: "", mot_de_passe: "" }}
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
              <View style={styles.form}>
                {/* Telephone */}
                <FormField
                  label={t("login.phone") || "Téléphone"}
                  value={values.telephone}
                  onChangeText={handleChange("telephone")}
                  onBlur={handleBlur("telephone")}
                  placeholder="Ex: +2376XXXXXXXX"
                  keyboardType="phone-pad"
                  leftIcon="phone"
                  error={errors.telephone as string}
                  touched={touched.telephone as boolean}
                />
                
                {/* Mot de passe */}
                <FormField
                  label={t("login.password") || "Mot de passe"}
                  value={values.mot_de_passe}
                  onChangeText={handleChange("mot_de_passe")}
                  onBlur={handleBlur("mot_de_passe")}
                  placeholder="Votre mot de passe"
                  secureTextEntry
                  leftIcon="lock"
                  error={errors.mot_de_passe as string}
                  touched={touched.mot_de_passe as boolean}
                />

                {/* Lien Oublié */}
                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push("/aide-et-conseil")}
                  accessibilityLabel={t("login.forgotPassword") || "Mot de passe oublié ?"}
                  accessibilityRole="button"
                >
                  <Text style={styles.forgotText}>{t("login.forgotPassword") || "Mot de passe oublié ?"}</Text>
                </TouchableOpacity>

                {/* Erreur Générale */}
                <ErrorAlert
                  visible={!!generalError}
                  message={generalError}
                  onDismiss={() => setGeneralError("")}
                  type="error"
                  title={t("common.errors.error")}
                />

                {/* Bouton Connexion */}
                <PrimaryButton
                  title={t("login.submit") || "SE CONNECTER"}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginBtn}
                />

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.noAccountText}>{t("login.noAccount") || "Pas encore de compte ? "}</Text>
                  <TouchableOpacity
                    onPress={() => router.replace("/register")}
                    accessibilityRole="link"
                    accessibilityLabel={t("login.register") || "S'inscrire"}
                  >
                    <Text style={styles.registerLink}>{t("login.register") || "S'inscrire"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: color.primary, // Red for Vitality
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  brandName: {
    fontSize: 34,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -1,
  },
  subTitle: {
    fontSize: 15,
    color: color.textSecondary,
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: color.primary,
    fontSize: 13,
    marginTop: -8,
    paddingLeft: 4,
    fontWeight: "600",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotText: {
    color: color.textSecondary,
    fontWeight: "700",
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginBtn: {
    marginTop: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
  },
  noAccountText: {
    fontSize: 15,
    color: color.textSecondary,
    fontWeight: "600",
  },
  registerLink: {
    fontSize: 15,
    color: color.primary,
    fontWeight: "800",
  },
});


