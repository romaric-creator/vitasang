import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { getCurrentPositionAsync } from "@/utils/location";
import { useTranslation } from "react-i18next";
import FormField from "@/components/FormField";
import { DataCard, DataCardRow } from "@/components/DataCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAllCentres } from "@/hooks/useCentersAndAppointments";
import { SkeletonListLoader } from "@/components/SkeletonLoader";

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
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

  // ✅ Utilise React Query pour le cache automatique entre les tabs
  const { data, isLoading, isRefetching, refetch } = useAllCentres();
  const allCentres = data?.centres || [];

  useEffect(() => {
    checkPermissionAndLoad();
  }, []);

  const checkPermissionAndLoad = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') return;
      fetchUserLocation();
    } catch (e) {
      if (__DEV__) console.error("Permission error:", e);
    }
  };

  const fetchUserLocation = async () => {
    try {
      const loc = await getCurrentPositionAsync();
      if (loc) setUserLocation(loc);
    } catch (e) {
      if (__DEV__) console.warn("[Map] Could not get location:", e);
    }
  };

  const onRefresh = () => refetch();

  const handleSearch = (text: string) => setSearchQuery(text);

  // ✅ Filtrage mémoïsé — ne se recalcule que si allCentres ou searchQuery changent
  const filteredCentres = useMemo(() => {
    if (!searchQuery.trim()) return allCentres;
    const q = searchQuery.toLowerCase();
    return allCentres.filter(
      (c: any) =>
        c.nom?.toLowerCase().includes(q) ||
        c.ville?.toLowerCase().includes(q)
    );
  }, [allCentres, searchQuery]);

  // ✅ Marqueurs valides mémoïsés — ne se recalcule pas à chaque rendu
  const mappableCentres = useMemo(() => {
    const seen = new Set<string>();
    return filteredCentres.filter((c: any) => {
      const id = c.id_centre || c.id;
      const lat = c.latitude;
      const lng = c.longitude;
      if (!id || !lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) return false;
      const key = String(id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredCentres]);

  const renderCentreItem = ({ item }: { item: any }) => {
    const data: DataCardRow[] = [
      { label: t("centers.address"), value: item.adresse },
      {
        label: t("centers.phone"),
        value: item.telephone,
        valueColor: color.primary,
      },
    ];

    return (
      <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
        <DataCard
          title={item.nom}
          subtitle={item.ville}
          data={data}
        />
      </View>
    );
  };

  const loading = isLoading && !data;

  return (
    <View style={styles.container}>
      <View style={[styles.headerLayer, { top: insets.top + 10 }]}>
        <View style={{ flex: 1 }}>
          <FormField
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={t("centers.searchPlaceholder")}
            leftIcon="search"
            containerStyle={{ marginBottom: 0 }}
          />
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
          {permissionStatus === 'denied' ? (
            <View style={styles.center}>
              <TabBarIcon name="map-marker" size={50} color={color.textLight} />
              <Text style={styles.emptyText}>{t("alert.locationError")}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={checkPermissionAndLoad}>
                <Text style={styles.retryText}>{t("common.errors.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <MapView
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              ref={mapRef}
              style={styles.map}
              initialRegion={
                userLocation
                  ? {
                    ...userLocation,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }
                  : {
                    ...doualaRegion,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }
              }
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {mappableCentres.map((centre: any) => (
                <Marker
                  key={String(centre.id_centre || centre.id)}
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
                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{centre.nom}</Text>
                      <Text style={styles.calloutText}>{centre.adresse}</Text>
                      <Text style={styles.calloutPhone}>{centre.telephone}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      ) : loading ? (
        // ✅ Skeleton pendant le chargement initial de la liste
        <View style={[styles.listContent, { paddingTop: insets.top + 70 }]}>
          <SkeletonListLoader count={5} itemHeight={110} />
        </View>
      ) : (
        <FlatList
          data={filteredCentres}
          // ✅ keyExtractor stable — plus de Math.random() qui détruisait le cache React
          keyExtractor={(item) =>
            item.id_centre
              ? `centre-${item.id_centre}`
              : item.id
                ? `centre-${item.id}`
                : `centre-fallback-${item.nom}`
          }
          renderItem={renderCentreItem}
          contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 70 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
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

      {loading && !isRefetching && <LoadingOverlay visible={true} fullScreen={false} style={styles.loaderArea} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerLayer: {
    position: "absolute",
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
    backgroundColor: color.surfaceDark, // Gris léger comme WhatsApp/FB
    borderRadius: 24, // Entièrement arrondi (pilule)
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "transparent",
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
    borderRadius: 24, // Pill/Circle
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  listContent: { paddingBottom: 100, paddingHorizontal: 0 },
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
  emptyText: { marginTop: 10, color: color.textSecondary, fontWeight: "600", textAlign: 'center' },
  loaderArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 20
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: color.primary,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '700'
  }
});
