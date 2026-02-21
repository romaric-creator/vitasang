import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Header from "@/components/Header";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { markers } from "@/data/mapData";

export default function MapScreen() {
  const doualaRegion = {
    latitude: 4.0511,
    longitude: 9.7085,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={doualaRegion}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.coordinate}>
            <View style={styles.customMarker}>
              <View style={styles.tooltip}>
                <Text style={styles.tTitle}>{marker.title}</Text>
                <Text style={styles.tSub}>{marker.subtitle}</Text>
              </View>
              <TabBarIcon 
                name="map-pin" 
                size={40} 
                color={color.primary} 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.headerContainer}>
        <Header />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab}>
          <TabBarIcon name="layers" size={20} color={color.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab}>
          <TabBarIcon name="navigation-2" size={20} color={color.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    ...StyleSheet.absoluteFillObject 
  },
  headerContainer: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    right: 20, 
    backgroundColor: color.background, 
    padding: 16, 
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  customMarker: { 
    alignItems: 'center' 
  },
  tooltip: { 
    backgroundColor: color.background, 
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12, 
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  tTitle: { 
    fontWeight: '700', 
    fontSize: 12,
    color: color.textMain,
  },
  tSub: { 
    fontSize: 10, 
    color: color.textSecondary,
    marginTop: 2,
  },
  fabContainer: { 
    position: 'absolute', 
    right: 20, 
    bottom: 100, 
    gap: 12,
  },
  fab: { 
    backgroundColor: color.background, 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  }
});