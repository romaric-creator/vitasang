import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function TrackingScreen() {
  const router = useRouter();
  // Simulation de coordonnées (Douala)
  const userPos = { latitude: 4.058, longitude: 9.712 };
  const hospitalPos = { latitude: 4.0511, longitude: 9.7085 };

  return (
    <View style={styles.container}>
      {/* Carte en plein écran */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...hospitalPos,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Tracé de l'itinéraire */}
        <Polyline
          coordinates={[userPos, hospitalPos]}
          strokeColor={color.primary}
          strokeWidth={4}
          lineDashPattern={[1, 5]}
        />

        {/* Marqueur Hôpital */}
        <Marker coordinate={hospitalPos}>
          <View style={styles.markerContainer}>
            <View style={styles.hospitalMarker}>
              <TabBarIcon name="hospital-o" size={15} color="white" />
            </View>
            <View style={styles.markerPin} />
          </View>
        </Marker>

        {/* Marqueur Utilisateur */}
        <Marker coordinate={userPos}>
          <View style={styles.userDotContainer}>
            <View style={styles.userDotCore} />
            <View style={styles.userDotHalo} />
          </View>
        </Marker>
      </MapView>

      {/* Bouton Retour Flottant */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <TabBarIcon name="chevron-left" size={20} color="black" />
      </TouchableOpacity>

      {/* Panneau de Navigation Bas */}
      <View style={styles.bottomPanel}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.timeLabel}>Arrivée prévue dans</Text>
            <Text style={styles.timeValue}>
              12 min <Text style={styles.distValue}>(2.4 km)</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => {
              alert("Merci pour votre engagement !");
              router.replace("/(tabs)");
            }}
          >
            <Text style={styles.finishText}>Arrivé</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.iconCircle}>
            <TabBarIcon name="arrow-up" size={24} color={color.primary} />
          </View>
          <View>
            <Text style={styles.instructionTitle}>Continuer sur 500m</Text>
            <Text style={styles.instructionSub}>
              Puis tourner à droite vers l&apos;Hôpital
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "white",
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  // Custom Markers
  markerContainer: { alignItems: "center" },
  hospitalMarker: {
    backgroundColor: color.primary,
    padding: 8,
    borderRadius: 10,
    elevation: 5,
  },
  markerPin: { width: 2, height: 10, backgroundColor: color.primary },
  userDotContainer: { alignItems: "center", justifyContent: "center" },
  userDotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3498DB",
    zIndex: 2,
    borderWidth: 2,
    borderColor: "white",
  },
  userDotHalo: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(52, 152, 219, 0.3)",
  },

  // Panel
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  timeLabel: { fontSize: 13, color: color.textSecondary },
  timeValue: { fontSize: 22, fontWeight: "bold", color: color.textMain },
  distValue: { fontWeight: "normal", color: color.textSecondary, fontSize: 16 },
  finishBtn: {
    backgroundColor: color.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
  },
  finishText: { color: "white", fontWeight: "bold" },

  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: color.surface,
    padding: 15,
    borderRadius: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionTitle: { fontSize: 16, fontWeight: "bold" },
  instructionSub: { fontSize: 13, color: color.textSecondary },
});
