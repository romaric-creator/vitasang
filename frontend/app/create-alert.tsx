import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { ModernSpinner } from "@/components/ModernSpinner";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import * as Location from "expo-location";
import { searchDonors, sendAlert } from "@/services/user.service";
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

export default function CreateAlertScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuth } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [pendingAlertData, setPendingAlertData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setIsLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(t("alert.locationError"));
        console.error("Location permission denied");
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("Location fetched:", location);
      setLocation(location);
      setIsLocating(false);
    })();
  }, []);

  const handleSearch = async (
    groupeSanguin: string,
    latitude: number,
    longitude: number,
  ) => {
    if (!latitude || !longitude) return;

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

  const handleRedirectToRegister = async () => {
    if (pendingAlertData) {
      try {
        await storeData("pending_alert", pendingAlertData);
        router.push("/register");
      } catch (e) {
        console.error("Failed to save pending alert:", e);
        setErrorMsg("Impossible de sauvegarder l'alerte. Veuillez réessayer.");
      }
    }
  };

  const handleRedirectToLogin = async () => {
    if (pendingAlertData) {
      try {
        await storeData("pending_alert", pendingAlertData);
        router.push("/login");
      } catch (e) {
        console.error("Failed to save pending alert:", e);
        setErrorMsg("Impossible de sauvegarder l'alerte. Veuillez réessayer.");
      }
    }
  };

  const handleSubmit = async (values: any) => {
    console.log("handleSubmit called with values:", values);

    if (!location) {
      setErrorMsg(t("alert.locationError"));
      console.error("No location");
      return;
    }

    const alertData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      groupe_sanguin: values.groupe_sanguin,
      radius: 10,
      urgence: values.urgence,
      quantite_requise: parseInt(values.quantite_requise),
      lieu: values.lieu,
      description: values.description,
    };

    // SI L'UTILISATEUR N'EST PAS CONNECTÉ
    if (!isAuth) {
      setPendingAlertData(alertData);
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const result = await sendAlert(alertData);
      if (result.alertId) {
        router.replace({
          pathname: "/alert-tracking/[id]",
          params: { id: result.alertId },
        });
      } else {
        setErrorMsg(t("alert.idError"));
      }
    } catch (error: any) {
      setErrorMsg(error.message || t("alert.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("alert.title")} />
      {isLocating ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <SkeletonLoader
            width={120}
            height={120}
            borderRadius={60}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={16} />
          <SkeletonListLoader count={3} itemHeight={40} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Formik
            initialValues={{
              groupe_sanguin: "O+",
              urgence: "URGENT",
              lieu: "",
              quantite_requise: "",
              description: "",
              latitude: location?.coords.latitude || 0,
              longitude: location?.coords.longitude || 0,
            }}
            validationSchema={createAlertValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <View>
                <BloodGroupSelector
                  value={values.groupe_sanguin}
                  onSelect={(group) => {
                    handleChange("groupe_sanguin")(group);
                    if (location) {
                      handleSearch(
                        group,
                        location.coords.latitude,
                        location.coords.longitude,
                      );
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
                  placeholder={t("alert.placeholders.location")}
                  error={errors.lieu}
                  touched={touched.lieu}
                  required
                />

                <FormField
                  label={t("alert.fields.quantity")}
                  value={values.quantite_requise}
                  onChangeText={handleChange("quantite_requise")}
                  onBlur={handleBlur("quantite_requise")}
                  placeholder={t("alert.placeholders.quantity")}
                  error={errors.quantite_requise}
                  touched={touched.quantite_requise}
                  keyboardType="numeric"
                  required
                />

                <View style={formStyles.field}>
                  <Text style={formStyles.label}>
                    {t("alert.fields.urgency")}{" "}
                    <Text style={{ color: color.error }}>*</Text>
                  </Text>
                  <View style={styles.urgencyGrid}>
                    {["NORMAL", "URGENT", "TRES_URGENT"].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.urgencyOption,
                          values.urgence === level && styles.urgencySelected,
                        ]}
                        onPress={() => handleChange("urgence")(level)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.urgencyLabel,
                            values.urgence === level && styles.textWhite,
                          ]}
                        >
                          {t(`alert.urgencyLevels.${level}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.urgence && touched.urgence && (
                    <Text style={formStyles.errorText}>{errors.urgence}</Text>
                  )}
                </View>

                <FormField
                  label={t("alert.fields.description")}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  placeholder={t("alert.placeholders.description")}
                  error={errors.description}
                  touched={touched.description}
                />

                <View style={styles.warningBox}>
                  <TabBarIcon
                    name="info-circle"
                    size={16}
                    color={color.primary}
                  />
                  {loading ? (
                    <Text style={styles.warningText}>Envoi en cours...</Text>
                  ) : (
                    <Text style={styles.warningText}>
                      {donorCount !== null
                        ? t("alert.donorFound", {
                            count: donorCount,
                            group: values.groupe_sanguin,
                          })
                        : t("alert.searchingDonors")}
                    </Text>
                  )}
                </View>

                {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

                {/* SI L'UTILISATEUR N'EST PAS CONNECTÉ */}
                {!isAuth ? (
                  <View style={styles.authSection}>
                    <Text style={styles.authTitle}>
                      {t("alert.authRequired") || "Connexion requise"}
                    </Text>
                    <Text style={styles.authSubtitle}>
                      {t("alert.authMessage") ||
                        "Créez un compte pour suivre votre alerte et recevoir des notifications."}
                    </Text>

                    <View style={styles.buttonContainer}>
                      <PrimaryButton
                        title={t("alert.register") || "S'inscrire"}
                        onPress={() => {
                          setPendingAlertData(values);
                          handleRedirectToRegister();
                        }}
                        style={{ marginBottom: 12 }}
                      />
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => {
                          setPendingAlertData(values);
                          handleRedirectToLogin();
                        }}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {t("alert.login") || "Se connecter"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <PrimaryButton
                    title={t("alert.submit")}
                    onPress={() => handleSubmit()}
                    loading={loading}
                    disabled={!location || loading}
                    style={{ marginTop: 20 }}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  locatingText: {
    marginTop: 10,
    color: color.textSecondary,
    fontWeight: "600",
  },
  textWhite: { color: "white" },
  urgencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  urgencyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    backgroundColor: "white",
  },
  urgencySelected: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  urgencyLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: color.textMain,
    textAlign: "center",
  },
  warningBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE4E6",
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: color.primary,
    lineHeight: 16,
    fontWeight: "600",
  },
  errorText: {
    color: color.error,
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  authSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: color.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 12,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 0,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: color.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
