import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StatusBar,
} from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  SkeletonLoader,
  SkeletonListLoader,
} from "@/components/SkeletonLoader";
import { color } from "@/constant/color";
import { useUserProfile } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
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
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuLeft}>
      <View style={styles.iconContainer}>
        <TabBarIcon name={icon as any} size={20} color={color.secondary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <TabBarIcon name="chevron-right" size={16} color={color.textMuted} />
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut, user: authUser } = useAuth();

  const userId = authUser?.id_utilisateur ?? authUser?.id ?? null;
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
          await signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.profileHeaderSkeleton}>
          <SkeletonLoader width={110} height={110} borderRadius={55} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="60%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={16} />
        </View>
        <View style={{ padding: 24 }}>
          <SkeletonListLoader count={5} itemHeight={64} />
        </View>
      </View>
    );
  }

  const fullName = userData ? `${userData.prenom || ""} ${userData.nom || ""}`.trim() : t("profile.defaultUser");
  const bloodType = userData?.groupe_sanguin || "—";
  const donsCount = userData?.donsCount ?? 0;
  const alertesCount = userData?.alertesCount ?? 0;
  const profileImage = userData?.photo_profil
    ? {
        uri: userData.photo_profil.startsWith("http")
          ? userData.photo_profil
          : (Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "").replace("/api", "") + userData.photo_profil,
      }
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t("profile.title")}</Text>
          <TouchableOpacity onPress={() => router.push("/notifications-settings")} style={styles.headerBtn}>
            <TabBarIcon name="bell-o" size={20} color={color.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {profileImage ? (
                <Image source={profileImage} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <TabBarIcon name="user" size={40} color={color.secondaryLight} />
                </View>
              )}
              <TouchableOpacity
                style={styles.editBadge}
                onPress={() => router.push("/edit-profile")}
              >
                <TabBarIcon name="pencil" size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.userName}>{fullName}</Text>
          <View style={styles.bloodBadge}>
            <View style={styles.bloodIconCircle}>
              <TabBarIcon name="tint" size={12} color="white" />
            </View>
            <Text style={styles.bloodText}>{bloodType}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{donsCount}</Text>
              <Text style={styles.statLabel}>{t("home.livesSaved")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{alertesCount}</Text>
              <Text style={styles.statLabel}>{t("profile.alerts")}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("profile.menu")}</Text>
        <View style={styles.menuList}>
          <ProfileItem icon="pencil" label={t("profile.edit")} onPress={() => router.push("/edit-profile")} />
          <ProfileItem icon="history" label={t("profile.history")} onPress={() => router.push("/historique")} />
          <ProfileItem icon="calendar" label={t("profile.appointments")} onPress={() => router.push("/rendezvous")} />
          <ProfileItem icon="hospital-o" label={t("profile.centers")} onPress={() => router.push("/(tabs)/map")} />
          <ProfileItem icon="globe" label={t("profile.language")} onPress={() => router.push("/language-settings")} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={styles.logoutIconCircle}>
            <TabBarIcon name="sign-out" size={18} color="white" />
          </View>
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  profileHeaderSkeleton: {
    alignItems: "center",
    paddingTop: 80,
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "950",
    color: color.text,
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: color.secondaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.secondaryGhost,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.secondaryGhost,
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: color.secondary,
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: color.text,
    marginBottom: 12,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: color.primaryGhost,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  bloodIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodText: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1.5,
    borderTopColor: color.borderLight,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "950",
    color: color.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  statDivider: {
    width: 1.5,
    height: 40,
    backgroundColor: color.borderLight,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: color.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4,
  },
  menuList: {
    gap: 12,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.background,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 20,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  menuLabel: {
    fontSize: 16,
    color: color.textMain,
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    backgroundColor: color.primaryGhost,
    borderRadius: 24,
  },
  logoutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: color.primary,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

