import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import FormField from "@/components/FormField";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { TabBarIcon } from "@/components/TabBarIcon";
import { searchDonors } from "@/services/user.service";
import { apiClient } from "@/config/axiosConfig";
import * as Location from "expo-location";

export default function GuestAlertScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [locationData, setLocationData] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [donorCount, setDonorCount] = useState<number | null>(null);
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const getLoc = async () => {
      try {
        setIsLocating(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (isMountedRef.current) {
            setLocationData({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            fetchDonors("O+", loc.coords.latitude, loc.coords.longitude);
          }
        }
      } catch (e) {
        console.warn("Location failed", e);
      } finally {
        if (isMountedRef.current) setIsLocating(false);
      }
    };
    getLoc();
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchDonors = async (groupe: string, lat: number, lng: number) => {
    try {
      const data = await searchDonors(lat, lng, groupe, 15);
      setDonorCount(data.count);
    } catch (e) {
      setDonorCount(0);
    }
  };

  const guestAlertSchema = yup.object().shape({
    nom_patient: yup.string().required("Le nom du patient est requis"),
    telephone_contact: yup.string().min(8, "Numéro invalide").required("Le contact est requis"),
    groupe_sanguin: yup.string().required("Sélectionnez un groupe"),
    lieu: yup.string().required("Précisez l'hôpital"),
    quantite_requise: yup.number().min(1).required(),
    urgence: yup.string().required(),
  });

  const handleGuestAlert = async (values: any) => {
    setLoading(true);
    setGeneralError("");

    try {
      const response = await apiClient.post(`alerts/guest`, {
        ...values,
        latitude: locationData?.lat || 0,
        longitude: locationData?.lng || 0,
        radius: 15,
      });

      if (response.data.success) {
        router.replace({
          pathname: "/alert-confirmation",
          params: { alertId: response.data.alertId.toString(), isGuest: "true" },
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'envoi";
      setGeneralError(msg);
      Alert.alert("Erreur SOS", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />
      
      {/* HEADER D'URGENCE */}
      <View style={styles.sosHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <TabBarIcon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.sosHeaderText}>URGENCE VITALE (SOS)</Text>
        <View style={{ width: 44 }} />
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.alertBox}>
            <View style={styles.alertIconBg}>
               <TabBarIcon name="ambulance" size={24} color="#DC2626" family="fontawesome" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.alertTitle}>Appel à l'aide immédiat</Text>
              <Text style={styles.alertDesc}>Pas besoin de compte. Les donneurs proches seront alertés instantanément.</Text>
            </View>
          </View>

          <Formik
            initialValues={{
              nom_patient: "",
              telephone_contact: "",
              groupe_sanguin: "O+",
              lieu: "",
              description: "",
              quantite_requise: "1",
              urgence: "URGENT",
            }}
            validationSchema={guestAlertSchema}
            onSubmit={handleGuestAlert}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
              <View style={styles.form}>
                
                {/* BLOC 1: GROUPE SANGUIN (CRUCIAL) */}
                <View style={styles.sectionCard}>
                  <Text style={styles.label}>Groupe Sanguin Requis</Text>
                  <BloodGroupSelector
                    isAlert
                    value={values.groupe_sanguin}
                    onSelect={(val) => {
                      setFieldValue("groupe_sanguin", val);
                      if (locationData) fetchDonors(val, locationData.lat, locationData.lng);
                    }}
                    error={errors.groupe_sanguin}
                    touched={touched.groupe_sanguin}
                  />
                  
                  {/* FEEDBACK DONNEURS */}
                  <View style={styles.donorFeedback}>
                    {isLocating ? (
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <ActivityIndicator size="small" color={color.primary} />
                        <Text style={styles.locatingText}>Localisation des donneurs...</Text>
                      </View>
                    ) : (
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                         <TabBarIcon name="users" size={14} color={donorCount && donorCount > 0 ? "#16A34A" : "#94A3B8"} />
                         <Text style={[styles.miniDonorText, { color: donorCount && donorCount > 0 ? "#16A34A" : "#64748B" }]}>
                          {donorCount && donorCount > 0 
                            ? `${donorCount} donneurs ${values.groupe_sanguin} détectés dans votre zone`
                            : `Recherche de donneurs ${values.groupe_sanguin} en cours...`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* BLOC 2: INFOS PATIENT */}
                <View style={styles.inputGroup}>
                  <FormField
                    label="Nom du Patient"
                    value={values.nom_patient}
                    onChangeText={handleChange("nom_patient")}
                    onBlur={handleBlur("nom_patient")}
                    placeholder="Ex: Jean Dupont"
                    error={errors.nom_patient}
                    touched={touched.nom_patient}
                    required
                    inputStyle={styles.inputPremium}
                    icon="user"
                  />
                  
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                       <FormField
                        label="Poches"
                        value={values.quantite_requise}
                        onChangeText={handleChange("quantite_requise")}
                        onBlur={handleBlur("quantite_requise")}
                        placeholder="1"
                        keyboardType="numeric"
                        error={errors.quantite_requise}
                        touched={touched.quantite_requise}
                        required
                        inputStyle={styles.inputPremium}
                        icon="tint"
                      />
                    </View>
                    <View style={{ flex: 1.5 }}>
                       <FormField
                        label="Numéro à appeler"
                        value={values.telephone_contact}
                        onChangeText={(text) => setFieldValue("telephone_contact", text.replace(/\s/g, ""))}
                        onBlur={handleBlur("telephone_contact")}
                        placeholder="6XXXXXXXX"
                        keyboardType="phone-pad"
                        error={errors.telephone_contact}
                        touched={touched.telephone_contact}
                        required
                        inputStyle={styles.inputPremium}
                        icon="phone"
                      />
                    </View>
                  </View>

                   <FormField
                    label="Hôpital / Lieu exact"
                    value={values.lieu}
                    onChangeText={handleChange("lieu")}
                    onBlur={handleBlur("lieu")}
                    placeholder="Ex: Hôpital Laquintinie, Urgences"
                    error={errors.lieu}
                    touched={touched.lieu}
                    required
                    inputStyle={styles.inputPremium}
                    rightIcon={
                      <TabBarIcon name="map-marker" size={18} color={locationData ? "#16A34A" : "#94A3B8"} />
                    }
                  />
                </View>

                {/* BOUTON D'URGENCE MASSIF */}
                <TouchableOpacity 
                  style={styles.sosButton} 
                  onPress={() => handleSubmit()}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                   {loading ? (
                     <ActivityIndicator color="white" size="large" />
                   ) : (
                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                        <View style={styles.sosIconCircle}>
                           <TabBarIcon name="rss" size={24} color="#DC2626" />
                        </View>
                        <View>
                           <Text style={styles.sosButtonTitle}>LANCER L'ALERTE</Text>
                           <Text style={styles.sosButtonSub}>Prévenir les donneurs</Text>
                        </View>
                     </View>
                   )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace("/login")}>
                  <Text style={styles.loginBtnText}>Vous avez un compte ? <Text style={{ color: "#DC2626", fontWeight: '800' }}>Connexion</Text></Text>
                </TouchableOpacity>
                
                <View style={{ height: 40 }} />
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  sosHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    backgroundColor: "#DC2626", 
    paddingTop: Platform.OS === 'android' ? 20 : 50, 
    paddingBottom: 16, 
    paddingHorizontal: 20,
    elevation: 4
  },
  sosHeaderText: { color: "white", fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  
  alertBox: {
    flexDirection: 'row',
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    marginBottom: 24
  },
  alertIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2
  },
  alertTitle: { fontSize: 16, fontWeight: "800", color: "#991B1B" },
  alertDesc: { fontSize: 12, color: "#7F1D1D", marginTop: 2 },

  form: { gap: 20 },
  
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: "800", color: "#475569", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  donorFeedback: { 
    marginTop: 16, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: "#F1F5F9" 
  },
  locatingText: { fontSize: 13, color: color.textSecondary, fontStyle: 'italic' },
  miniDonorText: { fontSize: 13, fontWeight: "600" },

  inputGroup: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  inputPremium: { 
    height: 54, 
    borderRadius: 12, 
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  row: { flexDirection: "row", gap: 12 },

  sosButton: {
    backgroundColor: "#DC2626",
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    marginTop: 10
  },
  sosIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  sosButtonTitle: { color: "white", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  sosButtonSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },

  loginBtn: { alignItems: "center", padding: 15 },
  loginBtnText: { color: "#64748B", fontWeight: "600", fontSize: 14 },
});
