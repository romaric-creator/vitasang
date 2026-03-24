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
  Dimensions,
  StatusBar
} from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import { color } from "@/constant/color";
import { loginValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { TabBarIcon } from "@/components/TabBarIcon";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

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
      await signIn(values.telephone, values.mot_de_passe);
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err.message || "";
      if (msg.includes("Network") || msg.includes("connexion")) {
        setGeneralError("Vérifiez votre connexion internet.");
      } else if (msg.includes("401") || msg.includes("identifiants")) {
        setGeneralError("Numéro ou mot de passe incorrect.");
      } else {
        setGeneralError(t("login.error") || "Erreur de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header / Brand */}
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.logo}
                />
              </View>
              <Text style={styles.brandName}>VitaSang</Text>
              <Text style={styles.tagline}>Le don de sang qui sauve des vies.</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t("login.title", "Connexion")}</Text>
              
              <Formik
                initialValues={{ telephone: "", mot_de_passe: "" }}
                validationSchema={loginValidationSchema}
                onSubmit={handleLogin}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                  <View style={styles.form}>
                    <FormField
                      label="Numéro de téléphone"
                      value={values.telephone}
                      onChangeText={handleChange("telephone")}
                      onBlur={handleBlur("telephone")}
                      placeholder="6XXXXXXXX"
                      error={errors.telephone}
                      touched={touched.telephone}
                      keyboardType="phone-pad"
                      required
                      inputStyle={styles.inputPremium}
                      icon="phone"
                    />

                    <View style={{ marginTop: 10 }}>
                      <FormField
                        label="Mot de passe"
                        value={values.mot_de_passe}
                        onChangeText={handleChange("mot_de_passe")}
                        onBlur={handleBlur("mot_de_passe")}
                        placeholder="••••••"
                        error={errors.mot_de_passe}
                        touched={touched.mot_de_passe}
                        secureTextEntry
                        required
                        inputStyle={styles.inputPremium}
                        icon="lock"
                      />
                      <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push("/aide-et-conseil")}>
                        <Text style={styles.forgotText}>Oublié ?</Text>
                      </TouchableOpacity>
                    </View>

                    {generalError ? (
                      <View style={styles.errorBox}>
                        <TabBarIcon name="exclamation-triangle" size={14} color="#DC2626" />
                        <Text style={styles.errorText}>{generalError}</Text>
                      </View>
                    ) : null}

                    <PrimaryButton
                      title="SE CONNECTER"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      style={styles.loginBtn}
                    />
                  </View>
                )}
              </Formik>
            </View>

            {/* Emergency / SOS */}
            <TouchableOpacity style={styles.sosAction} onPress={() => router.push("/guest-alert")}>
              <View style={styles.sosIconCircle}>
                <TabBarIcon name="bolt" size={20} color="white" />
              </View>
              <View>
                <Text style={styles.sosTitle}>URGENCE SOS</Text>
                <Text style={styles.sosSub}>Lancer une alerte sans compte</Text>
              </View>
              <TabBarIcon name="chevron-right" size={16} color="rgba(225, 29, 72, 0.5)" />
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.noAccountText}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => router.replace("/register")}>
                <Text style={styles.registerLink}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

import ThemedView from "@/components/ThemedView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#F8FAFC",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 16,
  },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  brandName: { fontSize: 28, fontWeight: "900", color: "#1E293B", letterSpacing: -1 },
  tagline: { fontSize: 14, color: "#64748B", marginTop: 4, fontWeight: "500" },

  card: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 24 },
  form: { gap: 16 },
  inputPremium: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  forgotBtn: { alignSelf: "flex-end", paddingVertical: 8 },
  forgotText: { color: color.primary, fontWeight: "700", fontSize: 13 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: "#991B1B", fontSize: 13, fontWeight: "600" },

  loginBtn: {
    height: 60,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  sosAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    padding: 16,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    marginBottom: 32,
  },
  sosIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E11D48",
    justifyContent: "center",
    alignItems: "center",
  },
  sosTitle: { fontSize: 14, fontWeight: "900", color: "#E11D48", letterSpacing: 1 },
  sosSub: { fontSize: 12, color: "#9F1239", fontWeight: "500" },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  noAccountText: { fontSize: 15, color: "#64748B", fontWeight: "500" },
  registerLink: { fontSize: 15, color: color.primary, fontWeight: "800", textDecorationLine: "underline" },
});
