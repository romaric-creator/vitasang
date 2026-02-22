import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ThemedView";
import Header from "@/components/Header";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { urgentNeed, stat, collections } from "@/data/data";
import { getMyAlerts, getUserProfile } from "@/services/user.service";
import { getData, getUserIdFromStorage } from "@/utils/storage";

export default function Index() {
  const router = useRouter();
  const [myAlerts, setMyAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [userName, setUserName] = useState("Utilisateur");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdFromStorage();
        if (userId) {
          const profileRes = await getUserProfile(userId);
          if (profileRes.success) {
            const u = profileRes.user;
            setUserName(`${u.prenom || ""} ${u.nom || ""}`.trim() || "Utilisateur");
          }
          const alertsRes = await getMyAlerts(userId);
          setMyAlerts(alertsRes.alerts);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Header userName={userName} />

        {/* Section Mes Alertes Actives */}
        {myAlerts.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes Alertes</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              {myAlerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.myAlertCard}
                  onPress={() => router.push(`/alert-tracking/${alert.id}`)}
                >
                  <View style={styles.alertCircle}>
                    <Text style={styles.alertBlood}>{alert.groupe}</Text>
                  </View>
                  <View>
                    <Text style={styles.alertStatus}>{alert.statut.toUpperCase()}</Text>
                    <Text style={styles.alertStats}>{alert.acceptedCount} acceptés</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section Besoin Urgent */}
        <View style={styles.boxUrgent}>
          <View style={styles.urgentHeader}>
            <TabBarIcon name="exclamation-circle" size={18} color="white" />
            <Text style={styles.urgentLabel}>BESOIN URGENT</Text>
          </View>
          <View style={styles.urgentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bloodGroup}>{urgentNeed.bloodType}</Text>
              <View style={styles.locationRow}>
                <TabBarIcon name="map-pin" size={15} color="white" />
                <Text style={styles.locationText}>
                  {urgentNeed.hospital}
                </Text>
              </View>
              <Text style={styles.distanceText}>{urgentNeed.distance} km</Text>
            </View>
            <Link href="/tracking" asChild>
              <TouchableOpacity style={styles.btnAider}>
                <Text style={styles.btnText}>Je peux aider</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <TabBarIcon name="heart" size={28} color={color.primary} />
            </View>
            <Text style={styles.statNumber}>{stat.donations}</Text>
            <Text style={styles.statLabel}>Dons effectués</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBg}>
              <TabBarIcon name="check-circle" size={28} color={color.success} />
            </View>
            <Text style={styles.statStatus}>{stat.availability}</Text>
            <Text style={styles.statLabel}>Disponible</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collectes à proximité</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {collections.map((collection, index) => (
          <View style={styles.collecteCard} key={index}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{collection.date.day}</Text>
              <Text style={styles.dateMonth}>{collection.date.month}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.collecteTitle}>{collection.hospital}</Text>
              <View style={styles.collecteInfo}>
                <View style={styles.tagWrapper}>
                  <Text style={styles.tag}>{collection.type}</Text>
                </View>
                <View style={styles.timeWrapper}>
                  <TabBarIcon name="hourglass-o" size={12} color={color.textLight} />
                  <Text style={styles.timeText}>{collection.time}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* BOUTON FLOTTANT NHR */}
      <Link href="/create-alert" asChild>
        <TouchableOpacity style={styles.fabNHR}>
          <View style={styles.nhrIconBg}>
            <TabBarIcon name="bell" size={20} color="white" />
          </View>
          <Text style={styles.fabText}>LANCER UNE ALERTE</Text>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: color.background,
  },
  boxUrgent: {
    backgroundColor: color.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  urgentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  urgentLabel: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.95,
  },
  urgentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  bloodGroup: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  distanceText: {
    color: "white",
    fontSize: 12,
    opacity: 0.9,
    fontWeight: "500",
  },
  btnAider: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  btnText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: color.background,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: color.border,
  },
  statIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: color.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 4,
  },
  statLabel: {
    color: color.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  statStatus: {
    color: color.success,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: color.textMain,
    letterSpacing: 0.3,
  },
  seeMoreText: {
    color: color.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  collecteCard: {
    backgroundColor: color.background,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    shadowColor: color.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: color.border,
  },
  dateBox: {
    backgroundColor: color.dangerLight,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: 56,
    justifyContent: "center",
  },
  dateDay: {
    color: color.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  dateMonth: {
    color: color.primary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  collecteTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: color.textMain,
    marginBottom: 8,
  },
  collecteInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  tagWrapper: {
    flex: 1,
  },
  tag: {
    backgroundColor: color.surface,
    color: color.textSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "600",
    overflow: "hidden",
  },
  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: color.textLight,
    fontWeight: "500",
  },

  // STYLE DU BOUTON FLOTTANT AMÉLIORÉ
  fabNHR: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  nhrIconBg: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fabText: {
    color: color.textWhite,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  myAlertCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    minWidth: 160,
  },
  alertCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBlood: {
    color: color.primary,
    fontWeight: "900",
    fontSize: 16,
  },
  alertStatus: {
    fontSize: 10,
    fontWeight: "bold",
    color: color.primary,
  },
  alertStats: {
    fontSize: 12,
    color: color.textSecondary,
    marginTop: 2,
  },
});
