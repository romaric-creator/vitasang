import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getData, getUserIdFromStorage } from "@/utils/storage";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getUserProfile } from "@/services/user.service";
import Constants from "expo-constants"; // Import Constants

// Données statiques de démonstration
const URGENCIES = [
  {
    id: 1,
    blood: "A-",
    hospital: "Hôpital Central",
    city: "Tunis",
    progress: 85,
    urgent: true,
  },
  {
    id: 2,
    blood: "B+",
    hospital: "Hôpital Laquintinie",
    city: "Douala",
    progress: 90,
    urgent: true,
  },
  {
    id: 3,
    blood: "AB-",
    hospital: "CHU",
    city: "Yaoundé",
    progress: 60,
    urgent: false,
  },
  {
    id: 4,
    blood: "O+",
    hospital: "Hôpital Général",
    city: "Dakar",
    progress: 75,
    urgent: true,
  },
];

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        const userId = await getUserIdFromStorage();
        if (userId) {
          const res = await getUserProfile(userId);
          if (res.success) setUserData(res.user);
        }
      };
      loadUser();
    }, []),
  );

  const tips = [
    {
      id: "1",
      title: t("home.tipsData.t1"),
      desc: t("home.tipsData.d1"),
      icon: "heartbeat",
      bg: "#FFE4E6",
      color: "#BE123C",
    },
    {
      id: "2",
      title: t("home.tipsData.t2"),
      desc: t("home.tipsData.d2"),
      icon: "coffee",
      bg: "#FEF3C7",
      color: "#B45309",
    },
    {
      id: "3",
      title: t("home.tipsData.t3"),
      desc: t("home.tipsData.d3"),
      icon: "check-square-o",
      bg: "#ECFDF5",
      color: "#047857",
    },
  ];

  const fullName = userData
    ? `${userData.prenom || ""} ${userData.nom || ""}`.trim()
    : t("profile.defaultUser");

  const urgentNeeds = URGENCIES.map((item) => ({
    id: item.id,
    group: item.blood,
    hospital: `${item.hospital}, ${item.city}`,
    collected: Math.floor((item.progress / 100) * 5),
    target: 5,
  }));

  const profileImage = userData?.photo_profil
    ? {
      uri: userData.photo_profil.startsWith('http')
        ? userData.photo_profil
        : (
          Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL ||
          "http://10.139.176.208:3000/api"
        ).replace("/api", "") + userData.photo_profil,
    }
    : null;

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={color.surface} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.profileSection}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image source={profileImage} style={styles.avatarImage} />
                ) : (
                  <TabBarIcon
                    name="user"
                    size={20}
                    color={color.textSecondary}
                  />
                )}
              </View>
              <View>
                <Text style={styles.profileLabel}>
                  {t("home.profileLabel")}
                </Text>
                <Text style={styles.profileName}>{fullName}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push("/(tabs)/alertes")}
            >
              <TabBarIcon name="bell-o" size={20} color={color.textMain} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => router.push("/historique")}
              activeOpacity={0.9}
            >
              <View style={styles.statusHeaderRow}>
                <View style={styles.statusUserInfo}>
                  <Text style={styles.statusDate}>
                    {t("home.nextDonation")}: 15 Sept 2024
                  </Text>
                </View>
                <Text style={styles.statusBlood}>
                  {userData?.groupe_sanguin || "O+"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.alertContainer}>
          <TouchableOpacity
            style={styles.mainAlertBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/create-alert")}
          >
            <TabBarIcon name="exclamation-triangle" size={20} color="white" />
            <Text style={styles.mainAlertText}>{t("home.launchAlert")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.urgentSection")}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/alertes")}>
              <Text style={{ color: color.primary, fontWeight: "700" }}>
                {t("common.seeAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.urgentScroll}
          >
            {urgentNeeds.map((need, idx) => (
              <View key={idx} style={styles.urgentCard}>
                <Text style={styles.urgentBlood}>{need.group}</Text>
                <View style={styles.urgentLocation}>
                  <TabBarIcon
                    name="map-marker"
                    size={14}
                    color={color.primary}
                  />
                  <Text style={styles.urgentHospital} numberOfLines={2}>
                    {need.hospital}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${(need.collected / need.target) * 100}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.progressText}>
                      {need.collected} / {need.target} L
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.btnDon}
                  onPress={() => router.push("/(tabs)/map")}
                >
                  <Text style={styles.btnDonText}>{t("home.donate")}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.tips")}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScroll}
          >
            {tips.map((tip) => (
              <TouchableOpacity
                key={tip.id}
                style={[styles.tipCard, { backgroundColor: tip.bg }]}
              >
                <View style={[styles.tipIconBox, { backgroundColor: "white" }]}>
                  <TabBarIcon
                    name={tip.icon as any}
                    size={20}
                    color={tip.color}
                  />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: color.background,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: color.surfaceDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  profileLabel: {
    fontSize: 11,
    color: color.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    letterSpacing: -0.3,
  },
  notificationBtn: {
    position: "relative",
    padding: 8,
    backgroundColor: color.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
    borderWidth: 2,
    borderColor: color.surface,
  },
  alertContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainAlertBtn: {
    backgroundColor: color.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  mainAlertText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  section: {
    paddingBottom: 15,

  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  urgentScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  urgentCard: {
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 4,
    width: 160,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: color.border,
  },
  urgentBlood: {
    fontSize: 32,
    fontWeight: "900",
    color: color.primary,
    marginBottom: 4,
    letterSpacing: -1,
  },
  urgentLocation: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 16,
    minHeight: 38,
  },
  urgentHospital: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: color.surfaceDark,
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: color.primary,
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 10,
    fontWeight: "800",
    color: color.textMain,
  },
  btnDon: {
    backgroundColor: color.surfaceDark,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnDonText: {
    fontSize: 12,
    fontWeight: "800",
    color: color.textMain,
  },
  statusCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 5,
  },
  statusHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: color.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: color.primary,
  },
  statusUserInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    letterSpacing: -0.5,
  },
  statusDate: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  statusBlood: {
    fontSize: 24,
    fontWeight: "900",
    color: color.primary,
  },
  statusDivider: {
    height: 1,
    backgroundColor: color.divider,
  },
  statusFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusScore: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "600",
  },
  badgesWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: color.surface,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "white",
  },
  statusProgressBarBg: {
    height: 6,
    backgroundColor: color.surfaceDark,
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
  },
  statusProgressBarFill: {
    height: "100%",
    backgroundColor: color.primary,
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  tipsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tipCard: {
    width: 190,
    padding: 18,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: color.border,
  },
  tipIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tipDesc: {
    fontSize: 13,
    color: color.textSecondary,
    lineHeight: 18,
    fontWeight: "600",
  },
});
