import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { color } from "@/constant/color";
import { router } from "expo-router";
import { registerUser, updatePushToken } from "@/services/user.service";
import { TabBarIcon } from "@/components/TabBarIcon";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications"; // NEW IMPORT
import { storeData } from "@/utils/storage"; // NEW IMPORT

const BloodGroupBadge = ({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.bloodGroupCard,
      { 
        backgroundColor: isSelected ? color.primary : color.background,
        borderColor: isSelected ? color.primary : color.border,
        borderWidth: isSelected ? 0 : 1,
      },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.bloodGroupText,
        { color: isSelected ? "white" : color.textMain },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function Register() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [groupeSanguin, setGroupeSanguin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!nom || !prenom || !telephone || !motDePasse || !groupeSanguin) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(
        nom,
        prenom,
        telephone,
        motDePasse,
        groupeSanguin,
        "donneur",
      );
      console.log("Registration successful:", data);

      // Store the user object with id_utilisateur for later retrieval
      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.user.id_utilisateur, // Ensure id_utilisateur is explicitly set from data.user.user
      };
      await storeData("user", userToStore); // Store the user object

      // --- NEW: Register for push notifications and send token to backend ---
      // (This part is currently commented out, but the user object needs to be stored correctly for it to work later)
      // const user = data.user;
      // if (user && user.id_utilisateur) {
      //   const pushToken = await registerForPushNotificationsAsync();
      //   if (pushToken) {
      //     try {
      //       await updatePushToken(user.id_utilisateur, pushToken);
      //       console.log("Push token sent to backend successfully after registration.");
      //     } catch (tokenError) {
      //       console.error("Failed to send push token to backend after registration:", tokenError);
      //     }
      //   }
      // }
      // --- END NEW ---

      router.replace("/login");
    } catch (err: any) {
      console.error("Registration error:", err.message);
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
            <Text style={styles.subtitle}>Créez votre profil de donneur</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>NOM</Text>
            <TextInput
              placeholder="Ex: Kenfack"
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholderTextColor={color.textLight}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>PRÉNOM</Text>
            <TextInput
              placeholder="Ex: Paul"
              style={styles.input}
              value={prenom}
              onChangeText={setPrenom}
              placeholderTextColor={color.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>TÉLÉPHONE</Text>
            <TextInput
              placeholder="Ex: 67XXXXXXX"
              style={styles.input}
              keyboardType="phone-pad"
              value={telephone}
              onChangeText={setTelephone}
              placeholderTextColor={color.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>MOT DE PASSE</Text>
            <TextInput
              placeholder="Ex: ************"
              style={styles.input}
              secureTextEntry={true}
              value={motDePasse}
              onChangeText={setMotDePasse}
              placeholderTextColor={color.textLight}
            />
          </View>

          {/* Blood Group Selection */}
          <View style={styles.bloodGroupSection}>
            <Text style={styles.sectionTitle}>
              <TabBarIcon name="heart" size={14} color={color.primary} />{" "}
              Votre groupe sanguin
            </Text>
            <View style={styles.bloodGroupGrid}>
              {["A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-"].map(
                (group) => (
                  <BloodGroupBadge
                    key={group}
                    label={group}
                    isSelected={groupeSanguin === group}
                    onPress={() => setGroupeSanguin(group)}
                  />
                ),
              )}
            </View>
          </View>

          {/* Display Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Final Button */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={color.textWhite} />
            ) : (
              <Text style={styles.buttonText}>CRÉER MON COMPTE</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.loginLinkText}>
              Déjà inscrit ?{" "}
              <Text style={styles.loginLinkHighlight}>Connectez-vous ici</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: {
    marginBottom: 40,
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
  inputContainer: {
    marginTop: 24,
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
  bloodGroupSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 16,
    fontSize: 14,
    color: color.textMain,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  bloodGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  bloodGroupCard: {
    width: "23%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  mainButton: {
    backgroundColor: color.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 36,
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
  loginLink: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 14,
  },
  loginLinkText: {
    color: color.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: color.primary,
    fontWeight: "800",
  },
  errorText: {
    color: color.error,
    textAlign: "center",
    marginTop: 16,
    fontSize: 13,
    fontWeight: "600",
  },
});
