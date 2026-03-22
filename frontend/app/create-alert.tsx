import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Formik } from "formik";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import * as Location from "expo-location";
import { searchDonors, sendAlert } from "@/services/user.service";
import { analyticsService } from "@/services/analyticsService";

import { createAlertValidationSchema } from "@/validation/ValidationSchemas";
import { useAuth } from "@/context/AuthContext";
import { storeData } from "@/utils/storage";
import FormField from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { formStyles } from "@/styles/formStyles";
import { useTranslation } from "react-i18next";
import {
  SkeletonLoader,
  SkeletonListLoader,
} from "@/components/SkeletonLoader";

// Coordonnées par défaut (Yaoundé, Cameroun) pour éviter les crashs si GPS HS
const DEFAULT_LOCATION = {
  latitude: 3.8480,
  longitude: 11.5021,
};

export default function CreateAlertScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuth, user } = useAuth();
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [isManualLocation, setIsManualLocation] = useState(false);
  
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [pendingAlertData, setPendingAlertData] = useState<any>(null);

  // Timeout ref pour éviter les boucles infinies de localisation
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startLocationProcess();
    return () => {
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
    };
  }, []);

  const startLocationProcess = async () => {
    setIsLocating(true);
    setLocationError(null);

    // Timeout de sécurité : si pas de GPS après 5s, on active le mode manuel
    locationTimeoutRef.current = setTimeout(() => {
      if (isLocating) {
        console.warn("Location timeout - falling back to manual");
        setIsLocating(false);
        setIsManualLocation(true);
        Alert.alert(
          "GPS lent ou inactif", 
          "Nous n'arrivons pas à vous localiser automatiquement. Veuillez préciser le lieu exact (Hôpital, Quartier...).",
          [{ text: "Compris" }]
        );
      }
    }, 5000);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission refusée");
      }

      // On tente une localisation rapide (précision "balanced" suffisante pour une alerte)
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log("Location fetched:", loc);
      setLocation(loc);
      setIsLocating(false);
      setIsManualLocation(false);
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);

    } catch (error) {
      console.warn("Location error:", error);
      setLocationError(t("alert.locationError"));
      setIsLocating(false);
      setIsManualLocation(true); // Fallback manuel
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
    }
  };

  const handleSearch = async (
    groupeSanguin: string,
    latitude: number,
    longitude: number,
  ) => {
    // Si on est en mode manuel sans coordonnées, on ne cherche pas les donneurs par distance
    if (!latitude || !longitude || isManualLocation) return;

    setLoading(true);
    try {
      const data = await searchDonors(latitude, longitude, groupeSanguin, 10);
      setDonorCount(data.count);
    } catch (error) {
      console.error(error);
      setDonorCount(0);
    } finally {
      setLoading(false);
    }
  };

  const savePendingAndRedirect = async (path: "/login" | "/register", data: any) => {
    try {
      await storeData("pending_alert", data);
      router.push(path);
    } catch (e) {
      console.error("Failed to save pending alert:", e);
      Alert.alert("Erreur", t("alert.error"));
    }
  };

  const handleSubmit = async (values: any) => {
    // Si on n'a pas de localisation GPS, on utilise les coordonnées par défaut ou 0,0
    // L'essentiel est que le champ "Lieu" (texte) soit rempli.
    const finalLat = location?.coords.latitude || DEFAULT_LOCATION.latitude;
    const finalLng = location?.coords.longitude || DEFAULT_LOCATION.longitude;

    if (!location && !isManualLocation) {
      Alert.alert("Localisation requise", "Veuillez activer votre GPS ou décrire le lieu.");
      return;
    }

    analyticsService.trackEvent(analyticsService.events.ALERT_CREATION_STARTED, {
      groupe: values.groupe_sanguin,
      urgence: values.urgence,
      mode: isManualLocation ? "manual" : "gps"
    });

    const alertData = {
      latitude: finalLat,
      longitude: finalLng,
      groupe_sanguin: values.groupe_sanguin,
      radius: 10,
      urgence: values.urgence,
      quantite_requise: parseInt(values.quantite_requise),
      lieu: values.lieu, // C'est le plus important si GPS HS
      description: values.description,
      telephone_contact: values.telephone_contact,
      is_manual_location: isManualLocation // Flag utile pour le backend/backoffice
    };

    // SI L'UTILISATEUR N'EST PAS CONNECTÉ
    if (!isAuth) {
      setPendingAlertData(alertData);
      return;
    }

    setLoading(true);
    try {
      const result = await sendAlert(alertData);
      if (result.alertId) {
        analyticsService.trackEvent(analyticsService.events.ALERT_CREATED, {
          alertId: result.alertId,
        });
        router.replace({
          pathname: "/alert-tracking/[id]",
          params: { id: result.alertId },
        });
      } else {
        throw new Error("No alertId returned");
      }
    } catch (error: any) {
      analyticsService.trackEvent(analyticsService.events.ALERT_FAILED, {
        error: error.message,
      });
      Alert.alert("Erreur", error.message || t("alert.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("alert.title")} />
      
      {isLocating ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader width={120} height={120} borderRadius={60} style={{ marginBottom: 16 }} />
          <Text style={styles.loadingText}>Localisation en cours...</Text>
          <TouchableOpacity onPress={() => {
            setIsLocating(false);
            setIsManualLocation(true);
          }}>
            <Text style={styles.skipText}>Passer (Saisie manuelle)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          {isManualLocation && (
            <View style={styles.manualWarning}>
              <TabBarIcon name="exclamation-circle" size={16} color="#B45309" />
              <Text style={styles.manualWarningText}>
                GPS indisponible. Décrivez le lieu avec précision.
              </Text>
            </View>
          )}

          <Formik
            initialValues={{
              groupe_sanguin: "O+",
              urgence: "URGENT",
              lieu: "",
              quantite_requise: "",
              description: "",
              telephone_contact: user?.telephone || "",
            }}
            validationSchema={createAlertValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <View>
                <BloodGroupSelector
                  isAlert
                  value={values.groupe_sanguin}
                  onSelect={(group) => {
                    handleChange("groupe_sanguin")(group);
                    if (location) {
                      handleSearch(group, location.coords.latitude, location.coords.longitude);
                    }
                  }}
                  error={errors.groupe_sanguin}
                  touched={touched.groupe_sanguin}
                />

                <FormField
                  label={t("alert.fields.location")}
                  value={values.lieu}
                  onChangeText={handleChange("lieu")}
                  onBlur={handleBlur("lieu")}
                  placeholder={isManualLocation ? "Ex: Hôpital Laquintinie, Urgences" : t("alert.placeholders.location")}
                  error={errors.lieu}
                  touched={touched.lieu}
                  required
                />

                <FormField
                  label={t("alert.fields.quantity")}
                  value={values.quantite_requise}
                  onChangeText={handleChange("quantite_requise")}
                  onBlur={handleBlur("quantite_requise")}
                  placeholder="Nombre de poches"
                  error={errors.quantite_requise}
                  touched={touched.quantite_requise}
                  keyboardType="numeric"
                  required
                />

                <View style={formStyles.field}>
                  <Text style={formStyles.label}>
                    {t("alert.fields.urgency")} <Text style={{ color: color.error }}>*</Text>
                  </Text>
                  <View style={styles.urgencyGrid}>
                    {[
                      { id: "NORMAL", color: color.success, label: "Normal (24h)" },
                      { id: "URGENT", color: color.warning, label: "Urgent (<4h)" },
                      { id: "TRES_URGENT", color: color.error, label: "Vital (<1h)" },
                    ].map((level) => (
                      <TouchableOpacity
                        key={level.id}
                        style={[
                          styles.urgencyOption,
                          values.urgence === level.id && { backgroundColor: level.color, borderColor: level.color },
                        ]}
                        onPress={() => handleChange("urgence")(level.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.urgencyLabel, values.urgence === level.id && styles.textWhite]}>
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <FormField
                  label={t("guestAlert.contactPhone")}
                  value={values.telephone_contact}
                  onChangeText={(text) => handleChange("telephone_contact")(text.replace(/\s/g, ''))} // Auto-clean space
                  onBlur={handleBlur("telephone_contact")}
                  placeholder="Ex: 699000000"
                  error={errors.telephone_contact}
                  touched={touched.telephone_contact}
                  keyboardType="phone-pad"
                  required
                />

                {/* Info Recherche Donneur (Seulement si GPS OK) */}
                {!isManualLocation && (
                  <View style={styles.infoBox}>
                    <TabBarIcon name="search" size={14} color={color.primary} />
                    <Text style={styles.infoText}>
                      {loading 
                        ? "Estimation des donneurs..." 
                        : donorCount !== null 
                          ? `${donorCount} donneurs potentiels dans la zone.` 
                          : "Nous chercherons des donneurs proches."}
                    </Text>
                  </View>
                )}

                {/* Auth Section ou Submit */}
                {!isAuth ? (
                  <View style={styles.authSection}>
                    <Text style={styles.authTitle}>Connexion requise</Text>
                    <Text style={styles.authSubtitle}>
                      Pour éviter les fausses alertes, vous devez être identifié.
                    </Text>

                    <PrimaryButton
                      title="Créer un compte et publier"
                      onPress={() => {
                        setPendingAlertData({ ...values, 
                          latitude: location?.coords.latitude || DEFAULT_LOCATION.latitude, 
                          longitude: location?.coords.longitude || DEFAULT_LOCATION.longitude 
                        });
                        savePendingAndRedirect("/register", null);
                      }}
                      style={{ marginBottom: 12 }}
                    />
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => {
                        setPendingAlertData({ ...values, 
                          latitude: location?.coords.latitude || DEFAULT_LOCATION.latitude, 
                          longitude: location?.coords.longitude || DEFAULT_LOCATION.longitude 
                        });
                        savePendingAndRedirect("/login", null);
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <PrimaryButton
                    title="LANCER L'ALERTE"
                    onPress={() => handleSubmit()}
                    loading={loading}
                    style={{ marginTop: 24, backgroundColor: color.error }}
                  />
                )}
              </View>
            )}
          </Formik>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.screenBackground },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, color: color.textSecondary, fontWeight: "600" },
  skipText: { marginTop: 20, color: color.primary, fontWeight: "700", textDecorationLine: "underline" },
  
  manualWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCD34D",
    marginBottom: 20,
    gap: 10,
  },
  manualWarningText: { color: "#92400E", fontSize: 12, fontWeight: "600", flex: 1 },

  urgencyGrid: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  urgencyOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    backgroundColor: "white",
  },
  urgencyLabel: { fontSize: 11, fontWeight: "700", color: color.textMain, textAlign: "center" },
  textWhite: { color: "white" },

  infoBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  infoText: { fontSize: 12, color: "#1E3A8A", flex: 1 },

  authSection: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: color.border },
  authTitle: { fontSize: 16, fontWeight: "700", color: color.textMain, marginBottom: 4, textAlign: "center" },
  authSubtitle: { fontSize: 13, color: color.textSecondary, textAlign: "center", marginBottom: 20 },
  
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    backgroundColor: "white",
  },
  secondaryButtonText: { color: color.textMain, fontWeight: "600" },
});
