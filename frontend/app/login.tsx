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
  TextInput,
} from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import { color } from "@/constant/color";
import { loginValidationSchema } from "@/validation/ValidationSchemas";
import { useAuth } from "@/context/AuthContext";
import { TabBarIcon } from "@/components/TabBarIcon";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import { ErrorAlert } from "@/components/ErrorAlert";

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
              <TabBarIcon name="tint" size={40} color="white" />
            </View>
            <Text style={styles.brandName}>VitaSang</Text>
            <Text style={styles.subTitle}>{t("login.welcomeBack") || "Bon retour parmi nous"}</Text>
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
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone</Text>
                  <View style={[styles.inputWrapper, touched.telephone && errors.telephone && styles.inputError]}>
                    <TabBarIcon name="phone" size={20} color={color.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={values.telephone}
                      onChangeText={handleChange("telephone")}
                      onBlur={handleBlur("telephone")}
                      placeholder="Ex: +2376XXXXXXXX"
                      placeholderTextColor={color.textMuted}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  </View>
                  {touched.telephone && errors.telephone && (
                    <Text style={styles.errorText}>{errors.telephone}</Text>
                  )}
                </View>

                {/* Mot de passe */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={[styles.inputWrapper, touched.mot_de_passe && errors.mot_de_passe && styles.inputError]}>
                    <TabBarIcon name="lock" size={20} color={color.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={values.mot_de_passe}
                      onChangeText={handleChange("mot_de_passe")}
                      onBlur={handleBlur("mot_de_passe")}
                      placeholder="Votre mot de passe"
                      placeholderTextColor={color.textMuted}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <TabBarIcon
                        name={showPassword ? "eye" : "eye-slash"}
                        size={20}
                        color={showPassword ? color.primary : color.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.mot_de_passe && errors.mot_de_passe && (
                    <Text style={styles.errorText}>{errors.mot_de_passe}</Text>
                  )}
                </View>

                {/* Lien Oublié */}
                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push("/aide-et-conseil")}
                >
                  <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
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
                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.disabledBtn]}
                  onPress={() => handleSubmit()}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginBtnText}>
                    {loading ? "CHARGEMENT..." : "SE CONNECTER"}
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.noAccountText}>Pas encore de compte ? </Text>
                  <TouchableOpacity onPress={() => router.replace("/register")}>
                    <Text style={styles.registerLink}>S'inscrire</Text>
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
    marginBottom: 56,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 36,
    backgroundColor: color.secondary, // Teal for Trust
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  brandName: {
    fontSize: 38,
    fontWeight: "950",
    color: color.text,
    letterSpacing: -1.5,
  },
  subTitle: {
    fontSize: 16,
    color: color.textSecondary,
    fontWeight: "700",
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    color: color.secondaryDark,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    backgroundColor: color.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: color.text,
    height: "100%",
    fontWeight: "700",
  },
  eyeIcon: {
    padding: 8,
  },
  inputError: {
    borderColor: color.error,
    backgroundColor: color.errorLight,
  },
  errorText: {
    color: color.error,
    fontSize: 13,
    marginTop: 8,
    paddingLeft: 4,
    fontWeight: "600",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
  },
  forgotText: {
    color: color.secondary,
    fontWeight: "800",
    fontSize: 15,
  },
  loginBtn: {
    height: 64,
    borderRadius: 24,
    backgroundColor: color.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  disabledBtn: {
    backgroundColor: color.disabled,
  },
  loginBtnText: {
    color: "white",
    fontSize: 17,
    fontWeight: "950",
    letterSpacing: 1.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  noAccountText: {
    fontSize: 16,
    color: color.textSecondary,
    fontWeight: "600",
  },
  registerLink: {
    fontSize: 16,
    color: color.secondary,
    fontWeight: "900",
  },
});


