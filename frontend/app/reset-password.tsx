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
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { color } from "@/constant/color";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TabBarIcon } from "@/components/TabBarIcon";
import FormField from "@/components/FormField";
import { ErrorAlert } from "@/components/ErrorAlert";
import ThemedView from "@/components/ThemedView";
import { apiClient } from "@/config/axiosConfig";

const schema = Yup.object({
  telephone: Yup.string().min(8, "Numéro invalide").required("Numéro requis"),
  nom: Yup.string().min(2, "Trop court").required("Nom requis"),
  prenom: Yup.string().min(2, "Trop court").required("Prénom requis"),
  nouveau_mot_de_passe: Yup.string().min(8, "8 caractères minimum").required("Mot de passe requis"),
  confirm: Yup.string()
    .oneOf([Yup.ref("nouveau_mot_de_passe")], "Les mots de passe ne correspondent pas")
    .required("Confirmation requise"),
});

export default function ResetPasswordScreen() {
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleReset = async (values: any) => {
    setGeneralError("");
    try {
      await apiClient.post("users/reset-password", {
        telephone: values.telephone,
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        nouveau_mot_de_passe: values.nouveau_mot_de_passe,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.message || "Une erreur est survenue.";
      setGeneralError(msg.includes("404") || msg.includes("trouvé")
        ? "Aucun compte trouvé avec ces informations. Vérifiez votre numéro, nom et prénom."
        : msg
      );
    }
  };

  if (success) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.successContainer}>
          <View style={styles.checkCircle}>
            <TabBarIcon name="check" size={36} color="white" />
          </View>
          <Text style={styles.successTitle}>Mot de passe réinitialisé !</Text>
          <Text style={styles.successSub}>
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </Text>
          <PrimaryButton
            title="Se connecter"
            onPress={() => router.replace("/login")}
            style={{ marginTop: 32, width: "100%" }}
          />
        </View>
      </ThemedView>
    );
  }

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
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <TabBarIcon name="arrow-left" size={20} color={color.textMain} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <TabBarIcon name="lock" size={32} color="white" />
            </View>
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Renseignez votre numéro de téléphone, nom et prénom tels qu'enregistrés à l'inscription.
            </Text>
          </View>

          <Formik
            initialValues={{ telephone: "", nom: "", prenom: "", nouveau_mot_de_passe: "", confirm: "" }}
            validationSchema={schema}
            onSubmit={handleReset}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <View style={styles.form}>
                <FormField
                  label="Numéro de téléphone"
                  value={values.telephone}
                  onChangeText={handleChange("telephone")}
                  onBlur={handleBlur("telephone")}
                  placeholder="Ex: +2376XXXXXXXX"
                  keyboardType="phone-pad"
                  leftIcon="phone"
                  error={errors.telephone}
                  touched={touched.telephone as boolean}
                />
                <FormField
                  label="Nom"
                  value={values.nom}
                  onChangeText={handleChange("nom")}
                  onBlur={handleBlur("nom")}
                  placeholder="Votre nom de famille"
                  leftIcon="user"
                  error={errors.nom}
                  touched={touched.nom as boolean}
                />
                <FormField
                  label="Prénom"
                  value={values.prenom}
                  onChangeText={handleChange("prenom")}
                  onBlur={handleBlur("prenom")}
                  placeholder="Votre prénom"
                  leftIcon="user"
                  error={errors.prenom}
                  touched={touched.prenom as boolean}
                />
                <FormField
                  label="Nouveau mot de passe"
                  value={values.nouveau_mot_de_passe}
                  onChangeText={handleChange("nouveau_mot_de_passe")}
                  onBlur={handleBlur("nouveau_mot_de_passe")}
                  placeholder="8 caractères minimum"
                  secureTextEntry
                  leftIcon="lock"
                  error={errors.nouveau_mot_de_passe}
                  touched={touched.nouveau_mot_de_passe as boolean}
                />
                <FormField
                  label="Confirmer le mot de passe"
                  value={values.confirm}
                  onChangeText={handleChange("confirm")}
                  onBlur={handleBlur("confirm")}
                  placeholder="Répétez votre mot de passe"
                  secureTextEntry
                  leftIcon="lock"
                  error={errors.confirm}
                  touched={touched.confirm as boolean}
                />

                <ErrorAlert
                  visible={!!generalError}
                  message={generalError}
                  onDismiss={() => setGeneralError("")}
                  type="error"
                  title="Erreur"
                />

                <PrimaryButton
                  title="Réinitialiser le mot de passe"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                />

                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={() => router.replace("/login")}
                >
                  <Text style={styles.backToLoginText}>Retour à la connexion</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  header: { alignItems: "center", marginBottom: 40 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 26, fontWeight: "900", color: color.textMain, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  form: { gap: 16 },
  submitBtn: { marginTop: 8 },
  backToLogin: { alignItems: "center", paddingVertical: 16 },
  backToLoginText: { color: color.textSecondary, fontWeight: "700", fontSize: 14 },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: color.success,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: "900", color: color.textMain, textAlign: "center" },
  successSub: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});
