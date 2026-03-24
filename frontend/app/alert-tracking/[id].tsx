import React, { useState, useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  AppState,
  Alert as RNAlert,
  Platform,
} from "react-native";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getAlertStatus, confirmDonation } from "@/services/user.service";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

// Extracted Components
import { PulseButton } from "@/components/tracking/PulseButton";
import { StatCard } from "@/components/tracking/StatCard";
import { AlertHeroCard } from "@/components/tracking/AlertHeroCard";
import { DonorItem } from "@/components/tracking/DonorItem";

export default function AlertTracking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const isMountedRef = useRef(true);

  const fetchStatus = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const res = await getAlertStatus(Number(id));
      if (isMountedRef.current) setData(res);
    } catch (error) {
      console.error("Tracking Error:", error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
      const interval = setInterval(() => {
        if (AppState.currentState === "active") fetchStatus();
      }, 15000);
      return () => {
        clearInterval(interval);
      };
    }, [id]),
  );

  const handleItinerary = () => {
    const alerte = data?.alerte;
    if (alerte?.latitude && alerte?.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${alerte.latitude},${alerte.longitude}`,
        android: `geo:0,0?q=${alerte.latitude},${alerte.longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const handleConfirmDonation = async () => {
    RNAlert.alert(
      "Confirmation de don",
      "Confirmez-vous avoir effectué ce don ? Votre geste héroïque sera enregistré.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, je confirme",
          onPress: async () => {
            setConfirming(true);
            try {
              await confirmDonation(Number(id));
              fetchStatus();
              RNAlert.alert("Félicitations", "Merci pour votre don !");
            } catch (e: any) {
              RNAlert.alert("Erreur", e.message);
            } finally {
              setConfirming(false);
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingOverlay visible={true} fullScreen />;

  const alerte = data?.alerte;
  const stats = data?.stats || { total: 0, lu: 0, accepte: 0 };
  const details = data?.details || [];

  const showConfirmButton = details.some(
    (d: any) => d.telephone === user?.telephone && d.statut === "accepte",
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de l'Alerte</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchStatus}>
          <TabBarIcon name="refresh" size={18} color={color.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AlertHeroCard alerte={alerte} handleItinerary={handleItinerary} />

        <View style={styles.statsContainer}>
          <StatCard
            label="Notifiés"
            value={stats.total}
            icon="users"
            iconColor="#64748B"
          />
          <StatCard
            label="Lectures"
            value={stats.lu}
            icon="eye"
            iconColor="#F59E0B"
          />
          <StatCard
            label="Réponses"
            value={stats.accepte}
            icon="heartbeat"
            iconColor="#10B981"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Engagements réels</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>{details.length}</Text>
          </View>
        </View>

        {details.length > 0 ? (
          details.map((item: any, index: number) => (
            <DonorItem key={index} item={item} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>En attente de donneurs...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {showConfirmButton && (
          <PulseButton
            onPress={handleConfirmDonation}
            loading={confirming}
            title={confirming ? "EN COURS..." : "J'AI EFFECTUÉ LE DON"}
          />
        )}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.secondaryBtnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20, paddingBottom: 160 },
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badgeCount: {
    backgroundColor: "#CBD5E1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCountText: { fontSize: 10, fontWeight: "700", color: "white" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
    backgroundColor: "rgba(248, 250, 252, 0.95)",
    alignItems: "center",
  },
  secondaryBtn: { marginTop: 15, padding: 10 },
  secondaryBtnText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  emptyState: { alignItems: "center", padding: 30 },
  emptyText: { color: "#94A3B8", fontSize: 14, fontStyle: "italic" },
});
