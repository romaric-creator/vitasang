import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { TabBarIcon } from "@/components/TabBarIcon";
import axios from "axios";
import Constants from "expo-constants";
import * as Location from "expo-location";

export default function GuestAlertScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");

    const guestAlertSchema = yup.object().shape({
        nom_patient: yup.string().required(`${t("guestAlert.patientName")} ${t("guestAlert.validation.required")}`),
        telephone_contact: yup
            .string()
            .required(`${t("guestAlert.contactPhone")} ${t("guestAlert.validation.required")}`)
            .matches(/^6[5-9]\d{7}$/, t("guestAlert.validation.phoneFormat")),
        groupe_sanguin: yup.string().required(`${t("guestAlert.groupNeeded")} ${t("guestAlert.validation.required")}`),
        lieu: yup.string().required(`${t("guestAlert.hospital")} ${t("guestAlert.validation.required")}`),
        description: yup.string(),
    });

    const handleGuestAlert = async (values: any) => {
        setLoading(true);
        setGeneralError("");
        try {
            // Get location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setGeneralError(t("alert.locationError"));
                setLoading(false);
                return;
            }
            let location = await Location.getCurrentPositionAsync({});

            const apiUrl = Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "https://vitasang-api.onrender.com/api/v1";

            const response = await axios.post(`${apiUrl}/alerts/guest`, {
                ...values,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (response.data.success) {
                // Show success and redirect
                router.replace({
                    pathname: "/alert-confirmation",
                    params: { alertId: response.data.alertId.toString(), isGuest: "true" },
                });
            }
        } catch (err: any) {
            console.error("Guest Alert Error:", err);
            setGeneralError(err.response?.data?.message || t("guestAlert.error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <TabBarIcon name="arrow-left" size={24} color={color.textMain} />
                        </TouchableOpacity>
                        <View style={styles.emergencyBadge}>
                            <TabBarIcon name="bolt" size={14} color="white" />
                            <Text style={styles.emergencyText}>SOS</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{t("guestAlert.title")}</Text>
                    <Text style={styles.subtitle}>{t("guestAlert.subtitle")}</Text>

                    <Formik
                        initialValues={{
                            nom_patient: "",
                            telephone_contact: "",
                            groupe_sanguin: "",
                            lieu: "",
                            description: "",
                        }}
                        validationSchema={guestAlertSchema}
                        onSubmit={handleGuestAlert}
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
                            <View style={styles.form}>
                                <FormField
                                    label={t("guestAlert.patientName")}
                                    value={values.nom_patient}
                                    onChangeText={handleChange("nom_patient")}
                                    onBlur={handleBlur("nom_patient")}
                                    placeholder={t("guestAlert.placeholders.patientName")}
                                    error={errors.nom_patient}
                                    touched={touched.nom_patient}
                                />

                                <FormField
                                    label={t("guestAlert.contactPhone")}
                                    value={values.telephone_contact}
                                    onChangeText={handleChange("telephone_contact")}
                                    onBlur={handleBlur("telephone_contact")}
                                    placeholder={t("guestAlert.placeholders.contactPhone")}
                                    keyboardType="phone-pad"
                                    error={errors.telephone_contact}
                                    touched={touched.telephone_contact}
                                />

                                <BloodGroupSelector
                                    isAlert
                                    value={values.groupe_sanguin}
                                    onSelect={(val) => setFieldValue("groupe_sanguin", val)}
                                    error={errors.groupe_sanguin}
                                    touched={touched.groupe_sanguin}
                                />

                                <FormField
                                    label={t("guestAlert.hospital")}
                                    value={values.lieu}
                                    onChangeText={handleChange("lieu")}
                                    onBlur={handleBlur("lieu")}
                                    placeholder={t("guestAlert.placeholders.hospital")}
                                    error={errors.lieu}
                                    touched={touched.lieu}
                                />

                                <FormField
                                    label={t("guestAlert.description")}
                                    value={values.description}
                                    onChangeText={handleChange("description")}
                                    onBlur={handleBlur("description")}
                                    placeholder={t("guestAlert.placeholders.description")}
                                    multiline
                                    numberOfLines={3}
                                />

                                {generalError ? (
                                    <Text style={styles.errorText}>{generalError}</Text>
                                ) : null}

                                <PrimaryButton
                                    title={t("guestAlert.submit")}
                                    onPress={() => handleSubmit()}
                                    loading={loading}
                                    style={styles.submitBtn}
                                />

                                <TouchableOpacity
                                    style={styles.loginBtn}
                                    onPress={() => router.replace("/login")}
                                >
                                    <Text style={styles.loginBtnText}>{t("guestAlert.loginLink")}</Text>
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
    container: { flex: 1, backgroundColor: color.background },
    scrollContent: { padding: 24, paddingTop: 60 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    emergencyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: color.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    emergencyText: { color: "white", fontWeight: "900", fontSize: 12 },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: color.textMain,
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: color.textSecondary,
        marginBottom: 32,
        fontWeight: "500",
    },
    form: { gap: 16 },
    errorText: {
        color: color.error,
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    submitBtn: { marginTop: 12 },
    loginBtn: {
        alignItems: "center",
        padding: 12,
        marginTop: 8,
    },
    loginBtnText: {
        color: color.textSecondary,
        fontWeight: "700",
        fontSize: 14,
    }
});
