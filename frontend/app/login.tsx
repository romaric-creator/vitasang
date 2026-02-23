import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { color } from "@/constant/color";
import { router } from "expo-router";
import { loginUser, updatePushToken } from "@/services/user.service";
import { storeData } from "@/utils/storage";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications"; // NEW IMPORT

export default function Index() {
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(telephone, motDePasse);
      // Sauvegarder le token
      await storeData("token", data.token);
      // Sauvegarder l'objet user en normalisant l'id (backend renvoie "id" pas "id_utilisateur")
      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };
      await storeData("user", userToStore);

      // --- NEW: Register for push notifications and send token to backend ---
      // const pushToken = await registerForPushNotificationsAsync();
      // if (pushToken && userToStore.id_utilisateur) {
      //   try {
      //     await updatePushToken(userToStore.id_utilisateur, pushToken);
      //     console.log("Push token sent to backend successfully.");
      //   } catch (tokenError) {
      //     console.error("Failed to send push token to backend:", tokenError);
      //   }
      // }
      // --- END NEW ---

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err.message);
      setError(err.message || "Une erreur inattendue est survenue.");
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
        style={{ backgroundColor: color.background }}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>VitaSang</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>TÉLÉPHONE</Text>
              <TextInput
                placeholder="Ex: 67XXXXXXX"
                style={styles.input}
                keyboardType="phone-pad"
                placeholderTextColor={color.textLight}
                value={telephone}
                onChangeText={setTelephone}
              />
            </View>

            <View style={[styles.inputContainer, { marginTop: 28 }]}>
              <Text style={styles.label}>MOT DE PASSE</Text>
              <TextInput
                placeholder="Ex: ************"
                style={styles.input}
                secureTextEntry={true}
                placeholderTextColor={color.textLight}
                value={motDePasse}
                onChangeText={setMotDePasse}
              />
            </View>

            {/* Display Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Mot de passe oublié */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.mainButton}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={color.textWhite} />
              ) : (
                <Text style={styles.buttonText}>CONNEXION</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer - Switch to Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas de compte ? </Text>
            <TouchableOpacity onPress={() => router.replace("/register")}>
              <Text style={styles.registerLink}>Inscrivez-vous ici</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  headerSection: {
    marginBottom: 48,
  },
  title: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 40,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: "600",
    color: color.textSecondary,
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  inputContainer: {
    width: "100%",
  },
  label: {
    fontWeight: "700",
    fontSize: 12,
    color: color.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 2,
    borderColor: color.primary,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: color.textMain,
    fontWeight: "500",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 14,
  },
  forgotText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  mainButton: {
    backgroundColor: color.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 40,
    alignItems: "center",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: color.textWhite,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 1,
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
    fontSize: 14,
  },
});
