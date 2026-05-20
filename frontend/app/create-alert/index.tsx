import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { Formik } from "formik";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import * as Location from "expo-location";
import { searchDonors, sendAlert } from "@/services/user.service";
import { createAlertValidationSchema } from "@/validation/ValidationSchemas";
import { useAuth } from "@/context/AuthContext";
import FormField from "@/components/FormField";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTranslation } from "react-i18next";
import {
  SkeletonLoader,
} from "@/components/SkeletonLoader";
import { ModernSpinner } from "@/components/ModernSpinner";

export default function CreateAlertScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
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
        let location = await Location.getCurrentPositionAsync({
           accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location);
      } catch (e) {
        console.warn("Location error:", e);
        setErrorMsg(t("alert.locationError") || "Impossible de récupérer votre position.");
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

  const handleSubmit = async (values: any) => {
    setErrorMsg(null);
    
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
      nom_patient: values.nom_patient,
      telephone_contact: values.telephone_contact,
    };

    setLoading(true);
    try {
      const result = await sendAlert(alertData);
      if (result && result.success !== false) {
        const alertId = result.alerte?.id_alerte || result.alertId || result.id;
        router.replace({
          pathname: "/alert-tracking/[id]",
          params: { id: alertId.toString() },
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.redHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <TabBarIcon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("createAlert.headerTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Plus de blocage par isLocating pour éviter l'écran blanc */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formIntro}>
          <View style={styles.introIconBox}>
            <TabBarIcon name="bullhorn" size={24} color={color.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introText}>
              {t("createAlert.introText")}
            </Text>
            {isLocating && (
              <View style={styles.locatingBadge}>
                <ModernSpinner size="small" color={color.primary} />
                <Text style={styles.locatingText}>{t("createAlert.locating")}</Text>
              </View>
            )}
          </View>
        </View>

          <Formik
            initialValues={{
              nom_patient: user ? `${user.prenom} ${user.nom}` : "",
              telephone_contact: user?.telephone || "",
              groupe_sanguin: "O+",
              urgence: "URGENT",
              lieu: "",
              quantite_requise: "1",
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
              setFieldValue,
            }) => (
              <View style={styles.formContainer}>
                <Text style={styles.groupLabel}>{t("createAlert.bloodGroupRequired")}</Text>
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
                  error={errors.groupe_sanguin as string}
                  touched={touched.groupe_sanguin as boolean}
                />

                <View style={styles.fieldsGrid}>
                  <FormField
                    label={t("alert.fields.patientName") || "Nom du Patient"}
                    value={values.nom_patient}
                    onChangeText={handleChange("nom_patient")}
                    onBlur={handleBlur("nom_patient")}
                    placeholder="Jean Dupont"
                    error={errors.nom_patient as string}
                    touched={touched.nom_patient as boolean}
                    required
                  />

                  <FormField
                    label={t("alert.fields.contactPhone") || "Numéro de Contact"}
                    value={values.telephone_contact}
                    onChangeText={(text) => setFieldValue("telephone_contact", text.replace(/\s/g, ""))}
                    onBlur={handleBlur("telephone_contact")}
                    placeholder="6XXXXXXXX"
                    error={errors.telephone_contact as string}
                    touched={touched.telephone_contact as boolean}
                    keyboardType="phone-pad"
                    required
                  />

                  <FormField
                    label={t("alert.fields.location") || "Hôpital / Lieu"}
                    value={values.lieu}
                    onChangeText={handleChange("lieu")}
                    onBlur={handleBlur("lieu")}
                    placeholder={t("alert.placeholders.location")}
                    error={errors.lieu as string}
                    touched={touched.lieu as boolean}
                    required
                  />

                  <FormField
                    label={t("alert.fields.quantity") || "Quantité requis"}
                    value={values.quantite_requise}
                    onChangeText={handleChange("quantite_requise")}
                    onBlur={handleBlur("quantite_requise")}
                    placeholder={t("alert.placeholders.quantity")}
                    error={errors.quantite_requise as string}
                    touched={touched.quantite_requise as boolean}
                    keyboardType="numeric"
                    required
                  />
                </View>

                <View style={styles.urgencySection}>
                   <Text style={styles.fieldLabel}>{t("createAlert.urgencyLevel")} <Text style={{ color: color.primary }}>*</Text></Text>
                   <View style={styles.urgencyGrid}>
                    {["NORMAL", "URGENT", "TRES_URGENT"].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.urgencyOption,
                          values.urgence === level && styles.urgencySelected,
                        ]}
                        onPress={() => handleChange("urgence")(level)}
                      >
                        <Text style={[styles.urgencyText, values.urgence === level && { color: "white" }]}>
                          {t(`alert.urgencyLevels.${level}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <FormField
                  label={t("alert.fields.description") || "Description"}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  placeholder={t("alert.placeholders.description")}
                  error={errors.description}
                  touched={touched.description}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.donorInfoBox}>
                  <TabBarIcon name="users" size={18} color={color.primary} />
                  <Text style={styles.donorInfoText}>
                    {donorCount !== null
                      ? t("alert.donorFound", { count: donorCount, group: values.groupe_sanguin })
                      : t("alert.searchingDonors")}
                  </Text>
                </View>

                {errorMsg && <Text style={styles.errorBanner}>{errorMsg}</Text>}

                <PrimaryButton
                  title={isLocating ? t("createAlert.pleaseWait") : t("alert.submit")}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading || (isLocating && !location)}
                  style={styles.submitBtn}
                />
              </View>
            )}
          </Formik>
        </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  redHeader: {
    height: 110,
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  scrollContent: { paddingBottom: 40 },
  loadingArea: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  formIntro: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "white",
    marginBottom: 16,
  },
  introIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  introText: { flex: 1, fontSize: 13, color: color.textSecondary, fontWeight: "600", lineHeight: 18 },
  formContainer: { paddingHorizontal: 20 },
  groupLabel: { fontSize: 11, fontWeight: "800", color: color.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  fieldsGrid: { gap: 4 },
  urgencySection: { marginTop: 8, marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: color.textMain, marginBottom: 12 },
  urgencyGrid: { flexDirection: "row", gap: 8 },
  urgencyOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.borderLight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  urgencySelected: { backgroundColor: color.primary, borderColor: color.primary },
  urgencyText: { fontSize: 11, fontWeight: "800", color: color.textSecondary },
  donorInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: color.primaryGhost,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  donorInfoText: { fontSize: 13, color: color.primary, fontWeight: "700" },
  errorBanner: {
    color: "white",
    backgroundColor: color.error,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  submitBtn: { marginTop: 24, height: 56 },
  locatingBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  locatingText: { fontSize: 11, color: color.primary, fontWeight: "700" },
});
