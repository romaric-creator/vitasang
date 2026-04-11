import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ModernSpinner } from "@/components/ModernSpinner";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { color } from "@/constant/color";
import { getUserIdFromStorage, storeData, getData } from "@/utils/storage";
import { useAuth } from "@/context/AuthContext";
import ThemedView from "@/components/ThemedView";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";
import { editProfileValidationSchema } from "@/validation/ValidationSchemas";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BloodGroupSelector } from "@/components/BloodGroupSelector";
import { PageHeader } from "@/components/PageHeader";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePicture } from "@/services/user.service";
import { TabBarIcon } from "@/components/TabBarIcon";
import { Image, TouchableOpacity as RNTouchableOpacity } from "react-native";
import Constants from "expo-constants"; // Import Constants

import { useTranslation } from "react-i18next";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { error } = useToast();
  const { completeAuth, updateUser } = useAuth();
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
            : Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL?.replace(
                "/api",
                "",
              ) + res.user.photo_profil;
          setCurrentImage(photoUrl);
        }
      } else {
        // Fallback sur les données du cache local si l'API échoue
        const cachedUser = await getData("user");
        if (cachedUser) {
          setUserData(cachedUser);
          info("Affichage des données hors-ligne.");
        } else {
error(t("editProfile.loadError"));
        }
      }
    } catch (error) {
      show("error", t("editProfile.loadError"));
      console.error("Error loading profile:", error);
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
        quality: 0.5, // Réduit pour économiser la data au Cameroun
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
      // 1. Upload image if selected
      if (selectedImage) {
        try {
          await uploadProfilePicture(userId, selectedImage);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          error(t("editProfile.image.error"));
          // On continue quand même la mise à jour des autres champs
        }
      }

      // 2. Update profile data
      const response = await updateUserProfile(userId, values);
      if (response.success) {
        // 3. Refresh local storage AND context with latest data
        const updatedRes = await getUserProfile(userId);
        if (updatedRes.success) {
          await updateUser(updatedRes.user);
        }

        success(t("editProfile.success"));
        setTimeout(() => router.replace("/(tabs)/profile"), 1500);
      } else {
        error(response.message || t("editProfile.error"));
      }
    } catch (error: any) {
      error(error?.message || t("editProfile.error"));
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title={t("editProfile.title")} />
        <View style={{ padding: 16, gap: 12 }}>
          <SkeletonLoader width={100} height={100} borderRadius={50} />
          <SkeletonLoader width="100%" height={50} style={{ marginTop: 16 }} />
          <SkeletonLoader width="100%" height={50} />
          <SkeletonLoader width="100%" height={50} />
        </View>
      </ThemedView>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{t("editProfile.notFound")}</Text>
        <PrimaryButton
          title={t("editProfile.back")}
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: color.screenBackground }}
      >
        <View style={styles.container}>
          <PageHeader title={t("editProfile.title")} />

          <View style={styles.headerSection}>
            <Text style={styles.title}>{t("editProfile.header")}</Text>
            <Text style={styles.subtitle}>{t("editProfile.subtitle")}</Text>
          </View>

          <View style={styles.avatarContainer}>
            <RNTouchableOpacity
              onPress={pickImage}
              style={styles.avatarWrapper}
            >
              {selectedImage || currentImage ? (
                <Image
                  source={{ uri: selectedImage || currentImage || "" }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <TabBarIcon
                    name="user"
                    size={40}
                    color={color.textSecondary}
                  />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <TabBarIcon name="camera" size={14} color="white" />
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
              <View style={styles.formContainer}>
                <FormField
                  label={t("editProfile.fields.lastName")}
                  value={values.nom}
                  onChangeText={handleChange("nom")}
                  onBlur={handleBlur("nom")}
                  placeholder={t("editProfile.placeholders.lastName")}
                  error={errors.nom as any}
                  touched={touched.nom as any}
                  editable={!saving}
                  required
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
                  required
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
                  required
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
                  required
                />

                <BloodGroupSelector
                  value={values.groupe_sanguin}
                  onSelect={(group) => handleChange("groupe_sanguin")(group)}
                  error={errors.groupe_sanguin as any}
                  touched={touched.groupe_sanguin as any}
                />

                <PrimaryButton
                  title={t("editProfile.save")}
                  onPress={() => handleSubmit()}
                  loading={saving}
                  style={{ marginTop: 24 }}
                />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 24,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: "600",
    color: color.textSecondary,
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: color.primary,
  },
  avatarPlaceholder: {
    backgroundColor: color.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: color.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  errorText: {
    color: color.error,
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
  },
});
