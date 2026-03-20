import React, { useEffect, useState, useRef, useMemo, memo } from "react";
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
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { getAllCentres, searchCentresNearby } from "@/services/user.service";
import { getCurrentPositionAsync } from "@/utils/location";
import { useTranslation } from "react-i18next";
import { DataCard, DataCardRow } from "@/components/DataCard";

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [centres, setCentres] = useState<any[]>([]);
  const [allCentres, setAllCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<any | null>(null);

  const doualaRegion = {
    latitude: 4.0511,
    longitude: 9.7085,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchCentres(), fetchUserLocation()]);
    setLoading(false);
  };

  const fetchUserLocation = async () => {
    try {
      const loc = await getCurrentPositionAsync();
      if (loc) setUserLocation(loc);
    } catch (e) {
      console.warn("Could not get location:", e);
    }
  };

  const fetchCentres = async () => {
    try {
      const res = await getAllCentres();
      if (res.success && res.centres) {
        setAllCentres(res.centres);
        setCentres(res.centres);
      }
    } catch (error) {
      console.error("Error fetching centres:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCentres();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setCentres(allCentres);
    } else {
      const filtered = allCentres.filter(
        (c) =>
          c.nom.toLowerCase().includes(text.toLowerCase()) ||
          c.ville.toLowerCase().includes(text.toLowerCase()),
      );
      setCentres(filtered);
    }
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
      text: t("appointments.book"),
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

  // Optimisation : Mémoïser le calcul des centres affichables
  const mappableCentres = useMemo(() => {
    return centres
      .filter((c) => {
        const id = c.id_centre || c.id;
        const lat = c.latitude;
        const lng = c.longitude;
        return id && lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
      })
      .reduce((uniqueCentres: any[], centre) => {
        const id = centre.id_centre || centre.id;
        if (!uniqueCentres.find((u) => (u.id_centre || u.id) === id)) {
          uniqueCentres.push(centre);
        }
        return uniqueCentres;
      }, []);
  }, [centres]);

  // Composant Marqueur optimisé pour les téléphones bas de gamme
  const CentreMarker = useMemo(() => memo(({ centre }: { centre: any }) => {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
      // Désactive le tracking après le rendu initial pour économiser du CPU
      const timer = setTimeout(() => setTracksViewChanges(false), 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <Marker
        key={centre.id_centre || centre.id}
        coordinate={{
          latitude: Number(centre.latitude),
          longitude: Number(centre.longitude),
        }}
        tracksViewChanges={tracksViewChanges}
        onPress={() => setSelectedCentre(centre)}
      >
        <View style={styles.markerContainer}>
          <View style={styles.markerPin}>
            <TabBarIcon name="hospital-o" size={14} color="white" />
          </View>
          <View style={styles.markerArrow} />
        </View>
      </Marker>
    );
  }), [setSelectedCentre]);

  return (
    <ThemedView style={styles.container}>
      {/* Header & Search */}
      <View style={styles.headerLayer}>
        <View style={styles.searchBar}>
          <TabBarIcon name="search" size={16} color={color.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("centers.searchPlaceholder")}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={color.textLight}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => handleSearch("")}>
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

      <View style={[styles.mapContainer, viewMode !== "map" && { display: 'none' }]}>
        <MapView
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          ref={mapRef}
          style={styles.map}
          initialRegion={
            userLocation
              ? {
                ...userLocation,
                latitudeDelta: 5,
                longitudeDelta: 5,
              }
              : {
                ...doualaRegion,
                latitudeDelta: 5,
                longitudeDelta: 5,
              }
          }
          showsUserLocation={true}
        >
          {mappableCentres.map((centre) => (
            <CentreMarker key={centre.id_centre || centre.id} centre={centre} />
          ))}
        </MapView>
      </View>

      <View style={[viewMode !== "list" && { display: 'none' }, { flex: 1 }]}>
        <FlatList
          data={centres}
          keyExtractor={(item) =>
            item.id_centre ? item.id_centre.toString() : `c-${item.id}`
          }
          renderItem={renderCentreItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[color.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TabBarIcon name="hospital-o" size={48} color={color.textLight} />
              <Text style={styles.emptyText}>{t("centers.noResults")}</Text>
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
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCentre(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
            </View>

            {selectedCentre && (
              <View style={styles.modalBody}>
                <View style={styles.modalIconContainer}>
                  <TabBarIcon name="hospital-o" size={32} color={color.primary} />
                </View>

                <Text style={styles.modalTitle}>{selectedCentre.nom}</Text>
                <Text style={styles.modalVille}>{selectedCentre.ville}</Text>

                <View style={styles.modalDivider} />

                <View style={styles.modalInfoRow}>
                  <TabBarIcon name="map-marker" size={18} color={color.textSecondary} />
                  <Text style={styles.modalInfoText}>{selectedCentre.adresse}</Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <TabBarIcon name="phone" size={18} color={color.textSecondary} />
                  <Text style={[styles.modalInfoText, { color: color.primary, fontWeight: '700' }]}>
                    {selectedCentre.telephone}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => {
                    setSelectedCentre(null);
                    router.push(`/book-appointment/${selectedCentre.id_centre}`);
                  }}
                >
                  <Text style={styles.bookBtnText}>{t("appointments.book")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedCentre(null)}
                >
                  <Text style={styles.closeBtnText}>{t("alert.actions.close")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {loading && !refreshing && <LoadingOverlay visible={true} fullScreen />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  headerLayer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: color.textMain,
  },
  toggleBtn: {
    width: 48,
    height: 48,
    backgroundColor: color.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  listContent: { paddingTop: 120, paddingBottom: 100 },
  markerContainer: { alignItems: "center" },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: color.primary,
    marginTop: -1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 12,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: color.border,
    borderRadius: 2,
  },
  modalBody: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.dangerLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: color.textMain,
    textAlign: "center",
  },
  modalVille: {
    fontSize: 14,
    color: color.textSecondary,
    marginBottom: 20,
  },
  modalDivider: {
    width: "100%",
    height: 1,
    backgroundColor: color.border,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginBottom: 16,
  },
  modalInfoText: {
    fontSize: 14,
    color: color.textMain,
    flex: 1,
  },
  bookBtn: {
    width: "100%",
    backgroundColor: color.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
    elevation: 2,
  },
  bookBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  closeBtn: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  closeBtnText: {
    color: color.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { marginTop: 10, color: color.textSecondary, fontWeight: "600" },
  loaderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
