import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import ThemedView from "@/components/ThemedView";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SkeletonLoader,
  SkeletonListLoader,
} from "@/components/SkeletonLoader";
import { color } from "@/constant/color";
import { getUserIdFromStorage } from "@/utils/storage";
import { getUserProfile, updateDonorProfile } from "@/services/user.service";
import { useUserProfile } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getProfileImageSource } from "@/utils/imageUtils";

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
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  useEffect(() => {
    getUserIdFromStorage().then((id) => {
      if (id) setUserId(Number(id));
    });
  }, []);

  const profileQuery = useUserProfile(userId as number, !!userId);
  const loading = !userId || (profileQuery.isLoading && !profileQuery.data);
  const userData = profileQuery.data?.user;

  // Sync availability state with profile data
  useEffect(() => {
    if (userData?.profilDonneur) {
      setIsAvailable(userData.profilDonneur.disponible !== false);
    }
  }, [userData]);

  const handleToggleAvailability = async (value: boolean) => {
    if (!userId || togglingAvailability) return;
    setTogglingAvailability(true);
    setIsAvailable(value);
    try {
      await updateDonorProfile(userId, { disponible: value });
    } catch (e) {
      setIsAvailable(!value); // revert on error
      console.error("Error toggling availability:", e);
    } finally {
      setTogglingAvailability(false);
    }
  };

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
  const pointsXP = userData?.profilDonneur?.points_xp || 0;
  const badges = userData?.profilDonneur?.badges || [];
  const profileImage = getProfileImageSource(userData?.photo_profil);

  // Simple level calculation: 1 level every 200 XP
  const level = Math.floor(pointsXP / 200) + 1;
  const progressToNextLevel = (pointsXP % 200) / 200;

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
          <View style={styles.row}>
            <View style={styles.bloodBadge}>
              <TabBarIcon name="heart" size={12} color={color.primary} />
              <Text style={styles.bloodText}>{bloodType}</Text>
            </View>
            <View style={[styles.bloodBadge, { backgroundColor: '#F0FDFA', marginLeft: 8 }]}>
              <TabBarIcon name="star" size={12} color="#0D9488" />
              <Text style={[styles.bloodText, { color: '#0D9488' }]}>Niveau {level}</Text>
            </View>
          </View>
        </View>

        {/* Gamification Section */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Progression Héros</Text>
            <Text style={styles.xpValue}>{pointsXP} XP</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressToNextLevel * 100}%` }]} />
          </View>
          <Text style={styles.xpNextLevel}>Plus que {200 - (pointsXP % 200)} XP pour le niveau {level + 1}</Text>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>Mes Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesList}>
                {badges.length > 0 ? badges.map((b: string, i: number) => (
                    <View key={i} style={styles.badgeItem}>
                        <View style={styles.badgeCircle}>
                            <TabBarIcon name="trophy" size={24} color="#EAB308" />
                        </View>
                        <Text style={styles.badgeLabel}>{b}</Text>
                    </View>
                )) : (
                    <View style={styles.noBadge}>
                        <Text style={styles.noBadgeText}>Répondez à votre première alerte pour gagner un badge !</Text>
                    </View>
                )}
            </ScrollView>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donsCount}</Text>
            <Text style={styles.statLabel}>
              {t("profile.donations")}
            </Text>
            <Text style={styles.statLabelSmall}>
              {t("profile.donationsSubtitle")}
            </Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{alertesCount}</Text>
            <Text style={styles.statLabel}>{t("profile.alerts")}</Text>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.availabilityTitle}>{t("profile.availability")}</Text>
            <Text style={styles.availabilitySubtitle}>
              {isAvailable ? t("profile.availableStatus") : t("profile.unavailableStatus")}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: "#ccc", true: color.success }}
            thumbColor="white"
            disabled={togglingAvailability}
          />
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
            icon="envelope"
            label={t("profile.messages")}
            onPress={() => router.push("/messages")}
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

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          testID="logout-button"
        >
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
  row: { flexDirection: 'row', alignItems: 'center' },
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
  xpCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: color.textMain,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '900',
    color: color.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: color.primary,
    borderRadius: 4,
  },
  xpNextLevel: {
    fontSize: 11,
    color: color.textSecondary,
    fontWeight: '600',
  },
  badgesSection: {
    marginBottom: 24,
  },
  badgesList: {
    paddingVertical: 10,
    gap: 16,
  },
  badgeItem: {
    alignItems: 'center',
    width: 80,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF9C3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#FDE047',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: color.textMain,
    textAlign: 'center',
  },
  noBadge: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    width: '100%',
  },
  noBadgeText: {
    fontSize: 12,
    color: color.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
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
    fontWeight: "700",
  },
  statLabelSmall: {
    fontSize: 9,
    color: color.textLight,
    fontWeight: "500",
  },
  dividerVertical: {
    width: 1,
    backgroundColor: color.border,
  },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  availabilitySubtitle: {
    fontSize: 12,
    color: color.textSecondary,
    marginTop: 2,
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
