import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useAllCentres } from "@/hooks/useQueryHooks";
import { useTranslation } from "react-i18next";
import { DataCard, DataCardRow } from "@/components/DataCard";
import { getCurrentPositionAsync } from "@/utils/location";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const { data: centresData, isLoading: centresLoading, refetch: refetchCentres } = useAllCentres();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<any | null>(null);
  const [radius, setRadius] = useState<number>(25); // Augmenté à 25km par défaut car 10km c'est trop peu au Cameroun
  const [locating, setLocating] = useState(false);

  const doualaRegion = {
    latitude: 4.0511,
    longitude: 9.7085,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  // useCallback pour éviter les recalculs inutiles (performance sur low-end)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  const centres = useMemo(() => {
    if (!centresData) return [];

    let filtered = centresData;

    // Filter by radius if userLocation is available (et si rayon non illimité)
    if (userLocation && radius < 200) {
      filtered = filtered.filter((c: any) => {
        if (!c.latitude || !c.longitude) return false;
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          Number(c.latitude),
          Number(c.longitude)
        );
        return dist <= radius;
      });
    }

    if (searchQuery.trim() === "") return filtered;

    return filtered.filter(
      (c: any) =>
        c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ville.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [centresData, searchQuery, userLocation, radius, calculateDistance]);

  const loading = centresLoading || (centresData === undefined);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    setLocating(true);
    try {
      const loc = await getCurrentPositionAsync();
      if (loc) {
        setUserLocation(loc);
        if (mapRef.current && viewMode === "map") {
          mapRef.current.animateToRegion({
            ...loc,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }, 1000);
        }
      }
    } catch (e) {
      console.warn("Could not get location:", e);
      // Pas de blocage, l'utilisateur verra Douala/Yaoundé par défaut
    } finally {
      setLocating(false);
    }
  };

  const onRefresh = async () => {
    await refetchCentres();
  };

  const renderCentreItem = ({ item }: { item: any }) => {
    const data: DataCardRow[] = [
      { label: t("centers.address"), value: item.adresse },
      {
        label: t("centers.phone"),
        value: item.telephone,
        valueColor: color.primary,
      },
    ];

    const actionButton = {
      text: "Prendre RDV",
      onPress: () => router.push(`/book-appointment/${item.id_centre}`),
      color: color.primary,
    };

    return (
      <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
        <DataCard
          title={item.nom}
          subtitle={item.ville}
          data={data}
          actionButton={actionButton}
        />
      </View>
    );
  };

  const mappableCentres = useMemo(() => {
    return centres
      .filter((c: any) => {
        const lat = c.latitude;
        const lng = c.longitude;
        return lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
      });
  }, [centres]);

  return (
    <ThemedView style={styles.container}>
      {/* Header & Search */}
      <View style={styles.headerLayer}>
        <View style={styles.searchBar}>
          <TabBarIcon name="search" size={16} color={color.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un centre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={color.textLight}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <TabBarIcon
                name="times-circle"
                size={16}
                color={color.textLight}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setViewMode(viewMode === "map" ? "list" : "map")}
        >
          <TabBarIcon
            name={viewMode === "map" ? "list" : "map"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Radius Selector */}
      <View style={styles.radiusLayer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusScroll}>
          {[5, 10, 25, 50, 100, 500].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>
                {r > 100 ? "Tout le pays" : `${r} km`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* GPS Status / Retry */}
      {!userLocation && !locating && viewMode === "map" && (
        <View style={styles.gpsLayer}>
          <TouchableOpacity style={styles.gpsRetryBtn} onPress={fetchUserLocation}>
            <TabBarIcon name="map-marker" size={14} color="white" />
            <Text style={styles.gpsRetryText}>Activer ma position</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.mapContainer, viewMode !== "map" && { display: 'none' }]}>
        <MapView
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          ref={mapRef}
          style={styles.map}
          initialRegion={doualaRegion}
          showsUserLocation={true}
          onPress={() => setSelectedCentre(null)}
        >
          {mappableCentres.map((centre) => (
            <Marker
              key={centre.id_centre || centre.id}
              coordinate={{
                latitude: Number(centre.latitude),
                longitude: Number(centre.longitude),
              }}
              onPress={() => setSelectedCentre(centre)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerPin}>
                  <TabBarIcon name="hospital-o" size={14} color="white" />
                </View>
                <View style={styles.markerArrow} />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={[viewMode !== "list" && { display: 'none' }, { flex: 1 }]}>
        <FlatList
          data={centres}
          keyExtractor={(item) => (item.id_centre || item.id).toString()}
          renderItem={renderCentreItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={centresLoading} onRefresh={onRefresh} colors={[color.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TabBarIcon name="hospital-o" size={48} color={color.textLight} />
              <Text style={styles.emptyText}>Aucun centre trouvé</Text>
            </View>
          }
        />
      </View>

      <Modal
        visible={!!selectedCentre}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedCentre(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedCentre(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><View style={styles.modalIndicator} /></View>
            {selectedCentre && (
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedCentre.nom}</Text>
                <Text style={styles.modalVille}>{selectedCentre.ville}</Text>
                <View style={styles.modalDivider} />
                <View style={styles.modalInfoRow}>
                  <TabBarIcon name="map-marker" size={18} color={color.textSecondary} />
                  <Text style={styles.modalInfoText}>{selectedCentre.adresse}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <TabBarIcon name="phone" size={18} color={color.textSecondary} />
                  <Text style={[styles.modalInfoText, { color: color.primary, fontWeight: '700' }]}>{selectedCentre.telephone}</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn} onPress={() => {
                  setSelectedCentre(null);
                  router.push(`/book-appointment/${selectedCentre.id_centre}`);
                }}>
                  <Text style={styles.bookBtnText}>Prendre RDV</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {(loading || locating) && <LoadingOverlay visible={true} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  headerLayer: { position: "absolute", top: 50, left: 0, right: 0, zIndex: 10, flexDirection: "row", paddingHorizontal: 20, gap: 12 },
  radiusLayer: { position: "absolute", top: 110, left: 0, right: 0, zIndex: 10 },
  gpsLayer: { position: "absolute", bottom: 120, right: 20, zIndex: 10 },
  gpsRetryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, elevation: 4, gap: 8 },
  gpsRetryText: { color: 'white', fontWeight: '700', fontSize: 13 },
  radiusScroll: { paddingHorizontal: 20, gap: 8 },
  radiusBtn: { backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: color.border, elevation: 2 },
  radiusBtnActive: { backgroundColor: color.primary, borderColor: color.primary },
  radiusText: { fontSize: 12, fontWeight: "700", color: color.textSecondary },
  radiusTextActive: { color: "white" },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 12, paddingHorizontal: 12, height: 48, elevation: 4 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: color.textMain },
  toggleBtn: { width: 48, height: 48, backgroundColor: color.primary, borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 4 },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  listContent: { paddingTop: 180, paddingBottom: 100 },
  markerContainer: { alignItems: "center" },
  markerPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: color.primary, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "white" },
  markerArrow: { width: 0, height: 0, backgroundColor: "transparent", borderStyle: "solid", borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: color.primary, marginTop: -1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingHorizontal: 24 },
  modalHeader: { alignItems: "center", paddingVertical: 12 },
  modalIndicator: { width: 40, height: 4, backgroundColor: color.border, borderRadius: 2 },
  modalBody: { alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: color.textMain, textAlign: "center" },
  modalVille: { fontSize: 14, color: color.textSecondary, marginBottom: 16 },
  modalDivider: { width: "100%", height: 1, backgroundColor: color.border, marginBottom: 16 },
  modalInfoRow: { flexDirection: "row", alignItems: "center", gap: 12, width: "100%", marginBottom: 12 },
  modalInfoText: { fontSize: 14, color: color.textMain, flex: 1 },
  bookBtn: { width: "100%", backgroundColor: color.primary, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  bookBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { marginTop: 10, color: color.textSecondary, fontWeight: "600" },
});
