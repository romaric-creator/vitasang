import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    (async () => {
      setIsLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(t("alert.locationError"));
        setIsLocating(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (e) {
        console.warn("Location error:", e);
      }
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

  const handleRedirectToRegister = async (values: any) => {
    try {
      await storeData("pending_alert", values);
      router.push("/register");
    } catch (e) {
      console.error(e);
    }
  };


  const handleSubmit = async (values: any) => {
    setErrorMsg(null); // Réinitialiser l'erreur
    
    if (!location) {
      const msg = t("alert.locationError");
      setErrorMsg(msg);
      Alert.alert(t("common.error"), msg);
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

    setLoading(true);
    try {
      const result = await sendAlert(alertData);
      if (result && result.success !== false) {
        router.replace({
          pathname: "/alert-tracking/[id]",
          params: { id: result.alertId || result.id },
        });
      } else {
        const msg = result.message || t("alert.idError");
        setErrorMsg(msg);
        Alert.alert(t("common.error"), msg);
      }
    } catch (error: any) {
      console.error("Submit Alert Error:", error);
      const msg = error.response?.data?.message || error.message || t("alert.genericError");
      setErrorMsg(msg);
      Alert.alert(t("common.error"), msg);
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

                  <PrimaryButton
                    title={t("alert.submit")}
                    onPress={() => handleSubmit()}
                    loading={loading}
                    disabled={!location || loading}
                    style={{ marginTop: 20 }}
                  />
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
