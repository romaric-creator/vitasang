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
} from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { color } from "@/constant/color";
import { getUserIdFromStorage, getData } from "@/utils/storage";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";
import { editProfileValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { PageHeader } from "@/components/PageHeader";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePicture } from "@/services/user.service";
import { TabBarIcon } from "@/components/TabBarIcon";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { success, error, info } = useToast();
  const { updateUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const id = await getUserIdFromStorage();
      if (!id) {
        error("Session expirée. Veuillez vous reconnecter.");
        router.replace("/login");
        return;
      }

      setUserId(Number(id));
      const res = await getUserProfile(Number(id));
      
      if (res && res.success) {
        setUserData(res.user);
        if (res.user.photo_profil) {
          const photoUrl = res.user.photo_profil.startsWith("http")
            ? res.user.photo_profil
            : (Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "").replace(
                "/api",
                "",
              ) + res.user.photo_profil;
          setCurrentImage(photoUrl);
        }
      } else {
        const cachedUser = await getData("user");
        if (cachedUser) {
          setUserData(cachedUser);
          info("Affichage des données hors-ligne.");
        } else {
          error(t("editProfile.loadError"));
        }
      }
    } catch (err) {
      error(t("editProfile.loadError"));
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

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
          console.error("Image upload failed:", uploadErr);
          error(t("editProfile.image.error"));
        }
      }

      const response = await updateUserProfile(userId, values);
      if (response.success) {
        const updatedRes = await getUserProfile(userId);
        if (updatedRes.success) {
          await updateUser(updatedRes.user);
        }

        success(t("editProfile.success"));
        router.replace("/(tabs)/profile");
      } else {
        error(response.message || t("editProfile.error"));
      }
    } catch (err: any) {
      error(err?.message || t("editProfile.error"));
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <PageHeader title={t("editProfile.title")} />
        <View style={{ padding: 24, gap: 16 }}>
          <SkeletonLoader width={100} height={100} borderRadius={50} />
          <SkeletonLoader width="100%" height={60} style={{ marginTop: 24, borderRadius: 20 }} />
          <SkeletonLoader width="100%" height={60} style={{ borderRadius: 20 }} />
          <SkeletonLoader width="100%" height={60} style={{ borderRadius: 20 }} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: color.background }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <PageHeader title={t("editProfile.title")} />

          <View style={styles.headerSection}>
            <Text style={styles.title}>{t("editProfile.header")}</Text>
            <Text style={styles.subtitle}>{t("editProfile.subtitle")}</Text>
          </View>

          <View style={styles.avatarSection}>
            <RNTouchableOpacity
              onPress={pickImage}
              style={styles.avatarWrapper}
              activeOpacity={0.8}
            >
              <View style={styles.avatarBorder}>
                {selectedImage || currentImage ? (
                  <Image
                    source={{ uri: selectedImage || currentImage || "" }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <TabBarIcon
                      name="user"
                      size={48}
                      color={color.secondaryLight}
                    />
                  </View>
                )}
              </View>
              <View style={styles.cameraBtn}>
                <TabBarIcon name="camera" size={16} color="white" />
              </View>
            </RNTouchableOpacity>
          </View>

          <Formik
            initialValues={{
              nom: userData.nom || "",
              prenom: userData.prenom || "",
              telephone: userData.telephone || "",
              groupe_sanguin: userData.groupe_sanguin || "",
              ville: userData.ville || "",
            }}
            validationSchema={editProfileValidationSchema}
            onSubmit={handleUpdate}
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
              <View style={styles.form}>
                <FormField
                  label={t("editProfile.fields.lastName")}
                  value={values.nom}
                  onChangeText={handleChange("nom")}
                  onBlur={handleBlur("nom")}
                  placeholder={t("editProfile.placeholders.lastName")}
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
                  error={errors.ville as any}
                  touched={touched.ville as any}
                  editable={!saving}
                />

                <View style={styles.bloodSection}>
                  <Text style={styles.fieldLabel}>Groupe Sanguin</Text>
                  <BloodGroupSelector
                    value={values.groupe_sanguin}
                    onSelect={(group) => handleChange("groupe_sanguin")(group)}
                    error={errors.groupe_sanguin as any}
                    touched={touched.groupe_sanguin as any}
                  />
                </View>

                <RNTouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>
                    {saving ? "ENREGISTREMENT..." : t("editProfile.save").toUpperCase()}
                  </Text>
                </RNTouchableOpacity>
                
                <RNTouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => router.back()}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </RNTouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    color: color.secondary,
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontWeight: "600",
    color: color.textSecondary,
    fontSize: 15,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: "white",
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: color.secondaryGhost,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: color.primary,
    width: 36,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  form: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: color.secondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bloodSection: {
    marginTop: 8,
  },
  saveBtn: {
    height: 60,
    borderRadius: 24,
    backgroundColor: color.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: color.disabled,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cancelBtn: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  cancelBtnText: {
    color: color.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});
