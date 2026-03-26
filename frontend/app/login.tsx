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
  TextInput
} from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import { color } from "@/constant/color";
import { loginValidationSchema } from "@/validation/ValidationSchemas";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { TabBarIcon } from "@/components/TabBarIcon";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        setGeneralError(t("error.network") || "Vérifiez votre connexion internet.");
      } else if (msg.includes("401") || msg.includes("identifiants")) {
        setGeneralError(t("error.invalidCredentials") || "Numéro ou mot de passe incorrect.");
      } else {
        setGeneralError(t("login.error") || "Erreur de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandName}>VitaSang</Text>
            <Text style={styles.subTitle}>Connectez-vous à votre compte</Text>
          </View>

          <Formik
            initialValues={{ telephone: "", mot_de_passe: "" }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <View style={styles.form}>
                
                {/* Telephone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone<Text style={{color: color.primary}}>*</Text></Text>
                  <TextInput
                    style={[styles.input, (touched.telephone && errors.telephone) && styles.inputError]}
                    value={values.telephone}
                    onChangeText={handleChange("telephone")}
                    onBlur={handleBlur("telephone")}
                    placeholder="Ex: +2376XXXXXXXX"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                  />
                  {touched.telephone && errors.telephone && (
                    <Text style={styles.errorText}>{errors.telephone}</Text>
                  )}
                </View>

                {/* Mot de passe */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mot de passe<Text style={{color: color.primary}}>*</Text></Text>
                  <View style={[styles.passwordContainer, (touched.mot_de_passe && errors.mot_de_passe) && styles.inputError]}>
                    <TextInput
                      style={styles.passwordInput}
                      value={values.mot_de_passe}
                      onChangeText={handleChange("mot_de_passe")}
                      onBlur={handleBlur("mot_de_passe")}
                      placeholder="Votre mot de passe"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      textContentType="password"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)} 
                      style={styles.eyeIcon}
                      accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      activeOpacity={0.6}
                    >
                      <TabBarIcon 
                        name={showPassword ? "eye" : "eye-slash"} 
                        size={20} 
                        color={showPassword ? color.primary : "#9CA3AF"} 
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
                {generalError ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.generalErrorText}>{generalError}</Text>
                  </View>
                ) : null}

                {/* Bouton Connexion */}
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => handleSubmit()}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={styles.loginBtnText}>CHARGEMENT...</Text>
                  ) : (
                    <Text style={styles.loginBtnText}>CONNEXION</Text>
                  )}
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.noAccountText}>Pas de compte ? </Text>
                  <TouchableOpacity onPress={() => router.replace("/register")}>
                    <Text style={styles.registerLink}>Inscrivez-vous ici</Text>
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
  header: {
    marginBottom: 40,
  },
  brandName: { 
    fontSize: 32, 
    fontWeight: "900", 
    color: color.primary, 
    marginBottom: 8,
  },
  subTitle: { 
    fontSize: 16, 
    color: "#4B5563", 
    fontWeight: "600",
  },
  form: { 
    gap: 20 
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "white",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  inputError: {
    borderColor: color.error,
  },
  errorText: {
    color: color.error,
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 12,
  },
  forgotBtn: { 
    alignSelf: "flex-end", 
    paddingRight: 10,
  },
  forgotText: { 
    color: color.primary, 
    fontWeight: "700", 
    fontSize: 14,
  },
  loginBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  noAccountText: { 
    fontSize: 14, 
    color: "#6B7280", 
    fontWeight: "500",
  },
  registerLink: { 
    fontSize: 14, 
    color: color.primary, 
    fontWeight: "800", 
  },
  errorBox: {
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  generalErrorText: {
    color: "#991B1B",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});
