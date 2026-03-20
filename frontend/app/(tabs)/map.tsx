import React, { useEffect, useState, useRef } from "react";
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

  // Filtrer les centres pour ne garder que ceux avec des coordonnées valides et des IDs uniques
  const mappableCentres = centres
    .filter((c) => {
      // Accepte id ou id_centre
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

      {viewMode === "map" ? (
        <View style={styles.mapContainer}>
          <MapView
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            ref={mapRef}
            style={styles.map}
            initialRegion={
              userLocation
                ? {
                    ...userLocation,
                    latitudeDelta: 5, // Increased delta
                    longitudeDelta: 5, // Increased delta
                  }
                : {
                    ...doualaRegion,
                    latitudeDelta: 5, // Increased delta
                    longitudeDelta: 5, // Increased delta
                  }
            }
            showsUserLocation={true}
          >
            {mappableCentres.map((centre) => (
              <Marker
                key={centre.id_centre || centre.id}
                coordinate={{
                  latitude: Number(centre.latitude),
                  longitude: Number(centre.longitude),
                }}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerPin}>
                    <TabBarIcon name="hospital-o" size={14} color="white" />
                  </View>
                  <View style={styles.markerArrow} />
                </View>
                <Callout
                  tooltip
                  onPress={() =>
                    router.push(`/book-appointment/${centre.id_centre}`)
                  }
                >
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{centre.nom}</Text>
                    <Text style={styles.calloutText}>{centre.adresse}</Text>
                    <Text style={styles.calloutPhone}>{centre.telephone}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
      ) : (
        <FlatList
          data={centres}
          keyExtractor={(item) =>
            item.id_centre
              ? item.id_centre.toString()
              : `centre-${Math.random()}`
          }
          renderItem={renderCentreItem}
          contentContainerStyle={styles.listContent}
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
      )}

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
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    width: 180,
    borderWidth: 1,
    borderColor: color.border,
  },
  calloutTitle: {
    fontWeight: "800",
    fontSize: 13,
    color: color.textMain,
    marginBottom: 4,
  },
  calloutText: { fontSize: 11, color: color.textSecondary, marginBottom: 4 },
  calloutPhone: { fontSize: 11, fontWeight: "700", color: color.primary },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { marginTop: 10, color: color.textSecondary, fontWeight: "600" },
  loaderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
