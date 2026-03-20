import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus } from "@/services/user.service";

interface NotifiedDonor {
  id: number;
  username: string;
  distance: string;
}

export default function AlertTracking() {
  const params = useLocalSearchParams();
  const { id, notifiedDonors: notifiedDonorsParam } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [notifiedDonors, setNotifiedDonors] = useState<NotifiedDonor[]>([]);
  const isMountedRef = useRef(true);

  const fetchStatus = async () => {
    try {
      const res = await getAlertStatus(Number(id));
      if (isMountedRef.current) {
        setData(res);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (notifiedDonorsParam && typeof notifiedDonorsParam === "string") {
      try {
        const parsedDonors = JSON.parse(notifiedDonorsParam);
        if (isMountedRef.current) {
          setNotifiedDonors(parsedDonors);
        }
      } catch (e) {
        console.error("AlertTracking: Failed to parse notifiedDonorsParam", e);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Polling toutes les 5s

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [id, notifiedDonorsParam]);

  if (loading || !data) {
    return <LoadingOverlay visible={true} fullScreen />;
  }

  const { stats, alerte, details } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de l'Alerte</Text>
        <TouchableOpacity onPress={fetchStatus}>
          <TabBarIcon name="refresh" size={20} color={color.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <Text style={styles.bloodType}>{alerte.groupe}</Text>
          {alerte.statut !== "en_attente" && alerte.statut !== "en_attente_validation" && alerte.statut !== "status" && (
            <Text style={styles.statusBadge}>
              {alerte.statut.toUpperCase()}
            </Text>
          )}
          {alerte.statut === "status" && (
            <Text style={styles.statusBadge}>Statut inconnu</Text>
          )}
          <Text style={styles.date}>
            Lancée le {new Date(alerte.createdAt).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox
            label="Notifi&eacute;s"
            value={stats.total}
            color={color.info}
          />
          <StatBox label="Lus" value={stats.lu} color={color.warning} />
          <StatBox
            label="Accept&eacute;s"
            value={stats.accepte}
            color={color.success}
          />
        </View>

        {notifiedDonors.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Donneurs Notifiés ({notifiedDonors.length})
            </Text>
            {notifiedDonors.map((donor, index) => (
              <View key={donor.id} style={styles.donorRow}>
                <Text style={styles.donorName}>Donneur {index + 1}</Text>
                <Text style={styles.donorPhone}>{donor.distance} km</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>
          Détails des Notifications ({details.length})
        </Text>
        {details.map((item: any, index: number) => (
          <View key={index} style={styles.donorRow}>
            <View>
              <Text style={styles.donorName}>{item.donneur}</Text>
              <Text style={styles.donorPhone}>{item.telephone}</Text>
            </View>
            <View
              style={[
                styles.statutPill,
                { backgroundColor: getStatutColor(item.statut) },
              ]}
            >
              <Text style={styles.statutText}>{item.statut.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.footerBtn}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.footerBtnText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const StatBox = ({ label, value, color }: any) => (
  <View style={[styles.statBox, { borderColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const getStatutColor = (statut: string) => {
  switch (statut) {
    case "accepte":
      return color.success;
    case "lu":
      return color.warning;
    case "envoye":
      return color.textLight;
    default:
      return color.error;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.screenBackground },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: color.screenBackground,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 4,
    marginBottom: 20,
  },
  bloodType: { fontSize: 48, fontWeight: "900", color: color.primary },
  statusBadge: {
    backgroundColor: color.infoLight,
    color: color.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
  },
  date: { fontSize: 12, color: color.textLight, marginTop: 10 },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: "white",
    width: "30%",
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: color.textSecondary, marginTop: 5 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: color.textMain,
  },
  donorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  donorName: { fontSize: 15, fontWeight: "600" },
  donorPhone: { fontSize: 12, color: color.textLight },
  statutPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statutText: { color: "white", fontSize: 9, fontWeight: "bold" },
  footerBtn: {
    backgroundColor: color.surface,
    margin: 20,
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
  },
  footerBtnText: { fontWeight: "bold", color: color.textMain },
});
