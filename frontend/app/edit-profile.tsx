import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  TouchableOpacity as RNTouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { color } from "@/constant/color";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, uploadProfilePicture } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";
import { editProfileValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import * as ImagePicker from "expo-image-picker";
import { TabBarIcon } from "@/components/TabBarIcon";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { success, error } = useToast();
  const { updateUser, user: authUser } = useAuth();
  const insets = useSafeAreaInsets();

  // ✅ Pré-remplissage IMMÉDIAT depuis le cache AuthContext
  const [userData, setUserData] = useState<any>(authUser || null);
  const [refreshing, setRefreshing] = useState(false); // Chargement silencieux en arrière-plan
  const [saving, setSaving] = useState(false);
  const [userId] = useState<number | null>(
    authUser?.id_utilisateur ?? authUser?.id ?? null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(
    authUser?.photo_profil
      ? authUser.photo_profil.startsWith("http")
        ? authUser.photo_profil
        : (Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "").replace("/api", "") + authUser.photo_profil
      : null
  );

  // ✅ Rafraîchissement en arrière-plan (silencieux)
  useEffect(() => {
    if (!userId) return;
    const refreshInBackground = async () => {
      setRefreshing(true);
      try {
        const res = await getUserProfile(userId);
        if (res?.success) {
          setUserData(res.user);
          if (res.user.photo_profil) {
            const photoUrl = res.user.photo_profil.startsWith("http")
              ? res.user.photo_profil
              : (Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "").replace("/api", "") + res.user.photo_profil;
            setCurrentImage(photoUrl);
          }
        }
      } catch (err) {
        // Silencieux — les données du cache sont déjà affichées
      } finally {
        setRefreshing(false);
      }
    };
    refreshInBackground();
  }, [userId]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      error("Impossible d'accéder à la galerie.");
    }
  };

  const handleUpdate = async (values: any) => {
    if (!userId) return;
    setSaving(true);
    try {
      if (selectedImage) {
        try {
          await uploadProfilePicture(userId, selectedImage);
        } catch (uploadErr) {
          error(t("editProfile.image.error"));
        }
      }
      const response = await updateUserProfile(userId, values);
      if (response.success) {
        const updatedRes = await getUserProfile(userId);
        if (updatedRes?.success) {
          await updateUser(updatedRes.user);
        }
        success(t("editProfile.success"));
        router.replace("/(tabs)/profile");
      } else {
        error(response.message || t("editProfile.error"));
      }
    } catch (err: any) {
      error(err?.message || t("editProfile.error"));
    } finally {
      setSaving(false);
    }
  };

  // ✅ Si aucune donnée en cache non plus → état de chargement minimal
  if (!userData) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <RNTouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={18} color={color.textMain} />
        </RNTouchableOpacity>
        <ActivityIndicator size="large" color={color.primary} style={{ marginTop: 60 }} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: color.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={color.background} translucent={false} />

      {/* ✅ Header fixe avec gestion StatusBar correcte */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 8 }]}>
        <RNTouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
          <TabBarIcon name="chevron-left" size={20} color={color.primary} />
        </RNTouchableOpacity>
        <Text style={styles.headerTitle}>{t("editProfile.title") || "Paramètres"}</Text>
        {/* Indicateur de rafraîchissement silencieux */}
        {refreshing ? (
          <ActivityIndicator size="small" color={color.primary} style={{ width: 40 }} />
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ backgroundColor: color.background }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <RNTouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
            <View style={styles.avatarBorder}>
              {selectedImage || currentImage ? (
                <Image
                  source={{ uri: selectedImage || currentImage || "" }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <TabBarIcon name="user" size={44} color="#CBD5E1" />
                </View>
              )}
            </View>
            <View style={styles.cameraBtn}>
              <TabBarIcon name="camera" size={14} color="white" />
            </View>
          </RNTouchableOpacity>
        </View>

        {/* Formulaire */}
        <Formik
          initialValues={{
            nom: userData?.nom || "",
            prenom: userData?.prenom || "",
            telephone: userData?.telephone || "",
            groupe_sanguin: userData?.groupe_sanguin || "",
            ville: userData?.ville || userData?.region || "",
          }}
          validationSchema={editProfileValidationSchema}
          onSubmit={handleUpdate}
          enableReinitialize={true}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <View style={styles.form}>
              <FormField
                label={t("editProfile.fields.lastName")}
                value={values.nom}
                onChangeText={handleChange("nom")}
                onBlur={handleBlur("nom")}
                placeholder={t("editProfile.placeholders.lastName")}
                leftIcon="user"
                error={errors.nom as any}
                touched={touched.nom as any}
                editable={!saving}
              />

              <FormField
                label={t("editProfile.fields.firstName")}
                value={values.prenom}
                onChangeText={handleChange("prenom")}
                onBlur={handleBlur("prenom")}
                placeholder={t("editProfile.placeholders.firstName")}
                leftIcon="user"
                error={errors.prenom as any}
                touched={touched.prenom as any}
                editable={!saving}
              />

              <FormField
                label={t("editProfile.fields.phone")}
                value={values.telephone}
                onChangeText={handleChange("telephone")}
                onBlur={handleBlur("telephone")}
                placeholder={t("editProfile.placeholders.phone")}
                leftIcon="phone"
                error={errors.telephone as any}
                touched={touched.telephone as any}
                keyboardType="phone-pad"
                editable={!saving}
              />

              <FormField
                label={t("editProfile.fields.city")}
                value={values.ville}
                onChangeText={handleChange("ville")}
                onBlur={handleBlur("ville")}
                placeholder={t("editProfile.placeholders.city")}
                leftIcon="map-marker"
                error={errors.ville as any}
                touched={touched.ville as any}
                editable={!saving}
              />

              <View style={styles.bloodSection}>
                <Text style={styles.fieldLabel}>{t("common.bloodGroup") || "Groupe Sanguin"}</Text>
                <BloodGroupSelector
                  value={values.groupe_sanguin}
                  onSelect={(group) => setFieldValue("groupe_sanguin", group)}
                  error={errors.groupe_sanguin as any}
                  touched={touched.groupe_sanguin as any}
                />
              </View>

              {/* Bouton Sauvegarder */}
              <RNTouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={() => handleSubmit()}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {t("editProfile.save")?.toUpperCase() || "ENREGISTRER"}
                  </Text>
                )}
              </RNTouchableOpacity>

              <RNTouchableOpacity
                style={styles.cancelBtn}
                onPress={() => router.back()}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>{t("common.cancel") || "Annuler"}</Text>
              </RNTouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Loading state
  emptyContainer: {
    flex: 1,
    backgroundColor: color.background,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: color.textSecondary,
    fontWeight: "600",
  },
  // ✅ Header fixe avec padding StatusBar correct
  fixedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: color.background,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  headerBackBtn: {
    padding: 4,
    width: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: color.textMain,
    flex: 1,
    textAlign: "center",
  },
  // Contenu scrollable
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 60,
    backgroundColor: "white",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: color.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    elevation: 5,
  },
  // Formulaire
  form: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bloodSection: {
    marginTop: 4,
  },
  // Boutons
  saveBtn: {
    height: 60,
    borderRadius: 30,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: color.disabled,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cancelBtn: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  cancelBtnText: {
    color: color.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});
