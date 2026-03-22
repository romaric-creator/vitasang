import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
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
import { apiClient } from "@/config/axiosConfig";
import * as Location from "expo-location";

export default function GuestAlertScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [locationData, setLocationData] = useState<{lat: number, lng: number} | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Tentative de localisation silencieuse dès l'ouverture pour gagner du temps
    useEffect(() => {
        const prefetchLocation = async () => {
            try {
                setIsLocating(true);
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setLocationData({ lat: loc.coords.latitude, lng: loc.coords.longitude });
                }
            } catch (e) {
                console.warn("Silent location failed", e);
            } finally {
                setIsLocating(false);
            }
        };
        prefetchLocation();
    }, []);

    const guestAlertSchema = yup.object().shape({
        nom_patient: yup.string().required(t("guestAlert.validation.required")),
        telephone_contact: yup.string().min(8).required(t("guestAlert.validation.required")),
        groupe_sanguin: yup.string().required(t("guestAlert.validation.required")),
        lieu: yup.string().required(t("guestAlert.validation.required")),
        description: yup.string(),
    });

    const handleGuestAlert = async (values: any) => {
        setLoading(true);
        setGeneralError("");
        
        try {
            let finalLat = locationData?.lat || 0;
            let finalLng = locationData?.lng || 0;

            // Si on n'a pas encore de loc, on tente une dernière fois avec timeout court
            if (!locationData) {
                try {
                    let loc = await Promise.race([
                        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
                    ]) as Location.LocationObject;
                    finalLat = loc.coords.latitude;
                    finalLng = loc.coords.longitude;
                } catch (e) {
                    console.log("Using manual location only");
                }
            }

            const response = await apiClient.post(`alerts/guest`, {
                ...values,
                latitude: finalLat,
                longitude: finalLng,
            });

            if (response.data.success) {
                router.replace({
                    pathname: "/alert-confirmation",
                    params: { alertId: response.data.alertId.toString(), isGuest: "true" },
                });
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || t("guestAlert.error");
            setGeneralError(msg);
            Alert.alert("Erreur SOS", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.sosBar}>
                <Text style={styles.sosBarText}>MODE URGENCE VITALE (SOS)</Text>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <TabBarIcon name="arrow-left" size={24} color={color.primary} />
                        </TouchableOpacity>
                        <View style={styles.emergencyIcon}>
                            <TabBarIcon name="heartbeat" size={24} color="white" />
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
                                <BloodGroupSelector
                                    isAlert
                                    value={values.groupe_sanguin}
                                    onSelect={(val) => setFieldValue("groupe_sanguin", val)}
                                    error={errors.groupe_sanguin}
                                    touched={touched.groupe_sanguin}
                                />

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <FormField
                                            label={t("guestAlert.patientName")}
                                            value={values.nom_patient}
                                            onChangeText={handleChange("nom_patient")}
                                            onBlur={handleBlur("nom_patient")}
                                            placeholder="Nom du patient"
                                            error={errors.nom_patient}
                                            touched={touched.nom_patient}
                                        />
                                    </View>
                                </View>

                                <FormField
                                    label={t("guestAlert.contactPhone")}
                                    value={values.telephone_contact}
                                    onChangeText={(text) => setFieldValue("telephone_contact", text.replace(/\s/g, ""))}
                                    onBlur={handleBlur("telephone_contact")}
                                    placeholder="Numéro de contact"
                                    keyboardType="phone-pad"
                                    error={errors.telephone_contact}
                                    touched={touched.telephone_contact}
                                />

                                <FormField
                                    label={t("guestAlert.hospital")}
                                    value={values.lieu}
                                    onChangeText={handleChange("lieu")}
                                    onBlur={handleBlur("lieu")}
                                    placeholder="Hôpital ou lieu précis"
                                    error={errors.lieu}
                                    touched={touched.lieu}
                                    rightIcon={isLocating ? <ModernSpinner size="small" color={color.primary} /> : <TabBarIcon name="map-marker" size={18} color={locationData ? color.success : color.disabled} />}
                                />

                                {generalError ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>{generalError}</Text>
                                    </View>
                                ) : null}

                                <PrimaryButton
                                    title="LANCER L'APPEL AU SECOURS"
                                    onPress={() => handleSubmit()}
                                    loading={loading}
                                    style={styles.submitBtn}
                                />

                                <TouchableOpacity
                                    style={styles.loginBtn}
                                    onPress={() => router.replace("/login")}
                                >
                                    <Text style={styles.loginBtnText}>
                                        Déjà donneur ? Connectez-vous
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const ModernSpinner = ({ size, color }: any) => (
    <View style={{ transform: [{ scale: size === 'small' ? 0.6 : 1 }] }}>
        <TabBarIcon name="circle-o-notch" size={24} color={color} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    sosBar: {
        backgroundColor: color.error,
        paddingTop: 40,
        paddingBottom: 8,
        alignItems: "center",
    },
    sosBarText: {
        color: "white",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2,
    },
    scrollContent: { padding: 24, paddingTop: 20 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    backBtn: { padding: 8, marginLeft: -12 },
    emergencyIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: color.error,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 24,
        fontWeight: "500",
    },
    form: { gap: 10 },
    row: { flexDirection: "row", gap: 12 },
    errorContainer: {
        backgroundColor: color.error + "10",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color.error + "20",
    },
    errorText: { color: color.error, fontSize: 13, fontWeight: "700", textAlign: "center" },
    submitBtn: { 
        marginTop: 15, 
        borderRadius: 16, 
        height: 64, 
        backgroundColor: color.error,
        elevation: 8,
    },
    loginBtn: { alignItems: "center", padding: 15, marginTop: 5 },
    loginBtnText: { color: "#666", fontWeight: "600", fontSize: 14 },
});
