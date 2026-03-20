import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SkeletonLoader,
  SkeletonListLoader,
} from "@/components/SkeletonLoader";
import { color } from "@/constant/color";
import { getUserIdFromStorage } from "@/utils/storage";
import { getUserProfile } from "@/services/user.service";
import { useUserProfile } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { useAuth } from "@/context/AuthContext";
import Constants from "expo-constants";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";

const ProfileItem = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.iconContainer}>
        <TabBarIcon name={icon as any} size={20} color={color.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <TabBarIcon name="chevron-right" size={18} color={color.textLight} />
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    getUserIdFromStorage().then((id) => {
      if (id) setUserId(Number(id));
    });
  }, []);

  const profileQuery = useUserProfile(userId as number, !!userId);
  const loading = !userId || (profileQuery.isLoading && !profileQuery.data);
  const userData = profileQuery.data?.user;

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          // signOut supprime token/user ET met isAuth=false
          // La redirection vers Splash est automatique via _layout.tsx
          await signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.profileHeader}>
          <SkeletonLoader
            width={120}
            height={120}
            borderRadius={60}
            style={{ marginBottom: 16 }}
          />
          <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={16} />
        </View>
        <SkeletonListLoader count={5} itemHeight={60} />
      </ThemedView>
    );
  }

  const fullName = userData
    ? `${userData.prenom || ""} ${userData.nom || ""}`.trim()
    : t("profile.defaultUser");
  const bloodType = userData?.groupe_sanguin || "—";
  const donsCount = userData?.donsCount ?? 0;
  const alertesCount = userData?.alertesCount ?? 0;
  const profileImage = userData?.photo_profil
    ? {
        uri: userData.photo_profil.startsWith("http")
          ? userData.photo_profil
          : (
              Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL ||
              "https://vitasang.vercel.app/api"
            ).replace("/api", "") + userData.photo_profil,
      }
    : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("profile.title")}</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              {profileImage ? (
                <Image source={profileImage} style={styles.avatarImage} />
              ) : (
                <TabBarIcon name="user" size={48} color={color.textWhite} />
              )}
            </View>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => router.push("/edit-profile")}
            >
              <TabBarIcon name="edit" size={12} color={color.textWhite} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{fullName}</Text>
          <View style={styles.bloodBadge}>
            <TabBarIcon name="heart" size={12} color={color.primary} />
            <Text style={styles.bloodText}>{bloodType}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donsCount}</Text>
            <Text style={styles.statLabel}>
              {"Vies sauvées"}
            </Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{alertesCount}</Text>
            <Text style={styles.statLabel}>{t("profile.alerts")}</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>{t("profile.rating")}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("profile.menu")}</Text>
        <View style={styles.menuContainer}>
          <ProfileItem
            icon="pencil"
            label={t("profile.edit")}
            onPress={() => router.push("/edit-profile")}
          />
          <ProfileItem
            icon="history"
            label={t("profile.history")}
            onPress={() => router.push("/historique")}
          />
          <ProfileItem
            icon="calendar"
            label={t("profile.appointments")}
            onPress={() => router.push("/rendezvous")}
          />
          <ProfileItem
            icon="hospital-o"
            label={t("profile.centers")}
            onPress={() => router.push("/(tabs)/map")}
          />
          <ProfileItem
            icon="bell"
            label={t("profile.notifications")}
            onPress={() => router.push("/notifications-settings")}
          />
          <ProfileItem
            icon="globe"
            label={t("profile.language")}
            onPress={() => router.push("/language-settings")}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <TabBarIcon name="sign-out" size={18} color={color.primary} />
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: color.background,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: color.dangerLight,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: color.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: color.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 8,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: color.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bloodText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: color.surface,
    borderRadius: 14,
    marginBottom: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: color.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: color.textSecondary,
    fontWeight: "600",
  },
  dividerVertical: {
    width: 1,
    backgroundColor: color.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: color.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  menuContainer: {
    gap: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    backgroundColor: color.surface,
    padding: 8,
    borderRadius: 8,
  },
  menuLabel: {
    fontSize: 13,
    color: color.textMain,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  logoutText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});
