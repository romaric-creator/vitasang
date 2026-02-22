import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { getMyAlerts } from "@/services/user.service";
import { getUserIdFromStorage } from "@/utils/storage";

const getStatutColor = (statut: string) => {
    switch (statut) {
        case "en_cours": return "#F39C12";
        case "resolu": return "#2ECC71";
        case "annule": return "#E74C3C";
        default: return "#BDC3C7";
    }
};

const getStatutLabel = (statut: string) => {
    switch (statut) {
        case "en_cours": return "En cours";
        case "resolu": return "Résolu";
        case "annule": return "Annulé";
        default: return statut;
    }
};

export default function AlertesScreen() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAlerts = useCallback(async () => {
        try {
            const userId = await getUserIdFromStorage();
            if (userId) {
                const res = await getMyAlerts(userId);
                setAlerts(res.alerts || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlerts();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={color.primary} />
            </View>
        );
    }

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push(`/alert-tracking/${item.id}`)}
        >
            <View style={[styles.bloodCircle]}>
                <Text style={styles.bloodText}>{item.groupe}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.alertDate}>
                    {new Date(item.date).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                    })}
                </Text>
                <View style={styles.statsRow}>
                    <TabBarIcon name="bell" size={12} color={color.textSecondary} />
                    <Text style={styles.alertStat}>{item.notifiedCount} notifiés</Text>
                    <TabBarIcon name="check" size={12} color="#2ECC71" />
                    <Text style={styles.alertStat}>{item.acceptedCount} acceptés</Text>
                </View>
            </View>
            <View style={[styles.statutBadge, { backgroundColor: getStatutColor(item.statut) }]}>
                <Text style={styles.statutText}>{getStatutLabel(item.statut)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Alertes</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <TabBarIcon name="refresh" size={22} color={color.primary} />
                </TouchableOpacity>
            </View>

            {alerts.length === 0 ? (
                <View style={styles.empty}>
                    <TabBarIcon name="bell-slash" size={48} color={color.textLight} />
                    <Text style={styles.emptyText}>Aucune alerte lancée</Text>
                    <Text style={styles.emptySubText}>
                        Appuyez sur "Lancer une alerte" depuis l'accueil
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.primary]} />
                    }
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background, paddingHorizontal: 20, paddingTop: 50 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 24,
    },
    title: { fontSize: 22, fontWeight: "800", color: color.textMain },
    alertCard: {
        flexDirection: "row", alignItems: "center", gap: 14,
        backgroundColor: "white", borderRadius: 16, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: color.border,
        shadowColor: color.shadow, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4, shadowRadius: 4, elevation: 3,
    },
    bloodCircle: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: color.dangerLight,
        justifyContent: "center", alignItems: "center",
    },
    bloodText: { color: color.primary, fontWeight: "900", fontSize: 16 },
    alertDate: { fontSize: 13, color: color.textSecondary, marginBottom: 6 },
    statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    alertStat: { fontSize: 12, color: color.textSecondary, marginRight: 8 },
    statutBadge: {
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    statutText: { color: "white", fontSize: 11, fontWeight: "700" },
    empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    emptyText: { fontSize: 18, fontWeight: "700", color: color.textMain },
    emptySubText: { fontSize: 13, color: color.textSecondary, textAlign: "center" },
});
