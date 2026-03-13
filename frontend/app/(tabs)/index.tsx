import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getUserIdFromStorage } from "@/utils/storage";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { getUserProfile, getActiveAlerts } from "@/services/user.service";
import { AlertFatigueInsights } from "@/components/AlertFatigueInsights";
import Constants from "expo-constants";
import { usePostHog } from "posthog-react-native";

const { width } = Dimensions.get("window");

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const posthog = usePostHog();

  const loadData = useCallback(async () => {
    try {
      const userId = await getUserIdFromStorage();
      if (userId) {
        const res = await getUserProfile(userId);
        if (res.success) setUserData(res.user);
      }
      const alertsRes = await getActiveAlerts();
      if (alertsRes.success) setActiveAlerts(alertsRes.alerts || []);
    } catch (error) {
      console.error("Home: Error loading data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      posthog?.capture("home_visited");
      loadData();
    }, [posthog, loadData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const fullName = userData
    ? `${userData.prenom || ""} ${userData.nom || ""}`.trim()
    : t("profile.defaultUser");

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
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          {profileImage && (
            <Image source={profileImage} style={styles.profileImage} />
          )}
          <View>
            <Text style={styles.greeting}>{t("home.profileLabel")}</Text>
            <Text style={styles.userName}>{fullName}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push("/(tabs)/alertes")}
        >
          <TabBarIcon name="bell-o" size={22} color={color.textMain} />
          {activeAlerts.length > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
      >
        <View style={styles.bentoRow}>
          <TouchableOpacity
            style={[styles.bentoItem, styles.heroBlock]}
            onPress={() => router.push("/historique")}
          >
            <View style={styles.heroIconCircle}>
              <TabBarIcon name="heart" size={24} color="white" />
            </View>
            <Text style={styles.heroValue}>{userData?.donsCount || 0}</Text>
            <Text style={styles.heroLabel}>{t("home.livesSaved")}</Text>
            <Text style={styles.heroSub}>
              {t("history.empty")?.split(".")[0]}
            </Text>
          </TouchableOpacity>

          <View style={styles.bentoColumn}>
            <View style={[styles.bentoItem, styles.bloodBlock]}>
              <Text style={styles.bloodLabel}>Groupe</Text>
              <Text style={styles.bloodValue}>
                {userData?.groupe_sanguin || "--"}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.bentoItem, styles.statusBlock]}
              onPress={() => router.push("/eligibility-test")}
            >
              <TabBarIcon
                name="calendar-check-o"
                size={18}
                color={color.primary}
              />
              <Text style={styles.statusLabel}>{t("home.nextDonation")}</Text>
              <Text style={styles.statusValue}>DISPONIBLE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.mainActionBtn}
          onPress={() => router.push("/create-alert")}
        >
          <View style={styles.mainActionGradient}>
            <TabBarIcon name="bolt" size={24} color="white" />
            <Text style={styles.mainActionText}>{t("home.launchAlert")}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.urgentSection")}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/alertes")}>
              <Text style={styles.seeAllText}>{t("common.seeAll")}</Text>
            </TouchableOpacity>
          </View>

          {activeAlerts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width * 0.75 + 16}
              decelerationRate="fast"
            >
              {activeAlerts.map((alert, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.urgentCard}
                  onPress={() =>
                    router.push({
                      pathname: "/alert-response/[id]",
                      params: { id: alert.id },
                    })
                  }
                >
                  <View style={styles.urgentHeader}>
                    <View style={styles.urgentBloodCircle}>
                      <Text style={styles.urgentBloodText}>{alert.groupe}</Text>
                    </View>
                    <View style={styles.urgentUrgencyBadge}>
                      <Text style={styles.urgentUrgencyText}>
                        {alert.urgence}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.urgentHospital} numberOfLines={1}>
                    {alert.lieu}
                  </Text>
                  <View style={styles.urgentFooter}>
                    <TabBarIcon
                      name="map-marker"
                      size={12}
                      color={color.textSecondary}
                    />
                    <Text style={styles.urgentDistance}>À proximité</Text>
                    <View style={styles.urgentAction}>
                      <Text style={styles.urgentActionText}>
                        {t("home.donate")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <TabBarIcon name="smile-o" size={32} color={color.success} />
              </View>
              <Text style={styles.emptyText}>{t("alert.empty.sent")}</Text>
              <Text style={styles.emptySubText}>Aucune urgence en cours.</Text>
            </View>
          )}
        </View>

        {/* Engagement Status Message */}
        <AlertFatigueInsights visible={true} />

        {/* Aide & Sensibilisation Section */}
        <TouchableOpacity
          style={styles.aideSection}
          onPress={() => router.push("/aide-et-conseil")}
          activeOpacity={0.7}
        >
          <View style={styles.aideSectionLeft}>
            <View style={styles.aideSectionIcon}>
              <TabBarIcon name="heart" size={28} color={color.primary} />
            </View>
            <View style={styles.aideSectionText}>
              <Text style={styles.aideSectionTitle}>
                Aide & Sensibilisation
              </Text>
              <Text style={styles.aideSectionDesc}>
                Découvrez tous nos conseils
              </Text>
            </View>
          </View>
          <TabBarIcon
            name="chevron-right"
            size={24}
            color={color.primary}
            family="fontawesome"
          />
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: color.surfaceDark,
    borderWidth: 2,
    borderColor: color.primary,
  },
  greeting: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -0.5,
  },
  headerAction: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: color.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
    borderWidth: 2,
    borderColor: color.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  bentoColumn: {
    flex: 1,
    gap: 12,
  },
  bentoItem: {
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  heroBlock: {
    flex: 1.2,
    backgroundColor: color.primary,
    borderColor: color.primary,
    justifyContent: "center",
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "white",
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
    marginTop: -4,
  },
  heroSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    fontWeight: "600",
  },
  bloodBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bloodLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
    textTransform: "uppercase",
  },
  bloodValue: {
    fontSize: 32,
    fontWeight: "900",
    color: color.primary,
    letterSpacing: -1,
  },
  statusBlock: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "900",
    color: color.success,
  },
  mainActionBtn: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 12,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  mainActionGradient: {
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  mainActionText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: color.textMain,
    letterSpacing: -0.5,
  },
  seeAllText: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  urgentCard: {
    width: width * 0.75,
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  urgentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  urgentBloodCircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  urgentBloodText: {
    fontSize: 20,
    fontWeight: "900",
    color: color.primary,
  },
  urgentUrgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: color.background,
  },
  urgentUrgencyText: {
    fontSize: 10,
    fontWeight: "800",
    color: color.primary,
  },
  urgentHospital: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 12,
  },
  urgentFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentDistance: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    flex: 1,
  },
  urgentAction: {
    backgroundColor: color.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  urgentActionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    backgroundColor: color.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    borderStyle: "dashed",
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FFF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: "600",
  },
  tipsGrid: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.border,
    gap: 16,
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tipTextContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    lineHeight: 16,
  },
  tipProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.surfaceDark,
    borderWidth: 1.5,
    borderColor: color.primary,
  },
  aideSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: color.primary,
  },
  aideSectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  aideSectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  aideSectionText: {
    flex: 1,
  },
  aideSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 2,
  },
  aideSectionDesc: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
  },
});
