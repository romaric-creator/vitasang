import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import * as Location from 'expo-location';
import { searchDonors, sendAlert } from "@/services/user.service";
import { getData } from "@/utils/storage";

const BloodOption = ({ label, selected, onSelect }: any) => (
  <TouchableOpacity
    style={[styles.bloodOption, selected === label && styles.bloodSelected]}
    onPress={() => onSelect(label)}
  >
    <Text style={[styles.bloodLabel, selected === label && styles.textWhite]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function CreateAlert() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState("O-");
  const [poches, setPoches] = useState("");
  const [loading, setLoading] = useState(false);
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (location && selectedGroup) {
      handleSearch();
    }
  }, [selectedGroup, location]);

  const handleSearch = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const data = await searchDonors(
        location.coords.latitude,
        location.coords.longitude,
        selectedGroup,
        10 // Rayon de 10km par défaut
      );
      setDonorCount(data.count);
    } catch (error) {
      console.error(error);
      setDonorCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDiffusion = async () => {
    if (!poches || parseInt(poches) <= 0) {
      alert("Veuillez indiquer le nombre de poches requis.");
      return;
    }

    if (!location) {
      alert("Localisation non disponible");
      return;
    }

    setLoading(true);
    try {
      const user = await getData("user");

      const result = await sendAlert({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        bloodType: selectedGroup,
        radius: 10,
        degree: "Urgent",
        poches: parseInt(poches),
        id_initiateur: user?.id_utilisateur
      });

      alert(`Succès : ${result.message}`);
      router.replace({
        pathname: "/alert-tracking/[id]",
        params: { id: result.alertId, notifiedDonors: JSON.stringify(result.notifiedDonors) }
      });
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue lors de la diffusion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <TabBarIcon name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Alerte NHR</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <Text style={styles.label}>Groupe Sanguin Requis</Text>
        <View style={styles.grid}>
          {groups.map((g) => (
            <BloodOption
              key={g}
              label={g}
              selected={selectedGroup}
              onSelect={setSelectedGroup}
            />
          ))}
        </View>

        <Text style={styles.label}>Nombre de poches (Obligatoire)</Text>
        <TextInput
          style={[styles.input, { paddingLeft: 15, backgroundColor: "#F8F9FA", borderRadius: 15, height: 55 }]}
          placeholder="Ex: 2"
          keyboardType="numeric"
          value={poches}
          onChangeText={setPoches}
        />

        <View style={styles.warningBox}>
          <TabBarIcon name="info-circle" size={18} color={color.primary} />
          {loading ? (
            <ActivityIndicator size="small" color={color.primary} />
          ) : (
            <Text style={styles.warningText}>
              {donorCount !== null
                ? `${donorCount} donneurs compatibles trouvés dans un rayon de 10km.`
                : "Recherche de donneurs compatibles dans un rayon de 10km..."}
            </Text>
          )}
        </View>
        {errorMsg && <Text style={{ color: 'red', fontSize: 12, marginTop: 10 }}>{errorMsg}</Text>}
      </ScrollView>

      <TouchableOpacity
        style={styles.btnSend}
        onPress={handleDiffusion}
      >
        <Text style={styles.btnSendText}>DIFFUSER L'ALERTE</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bloodOption: {
    width: "22%",
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  bloodSelected: { backgroundColor: color.primary, borderColor: color.primary },
  bloodLabel: { fontWeight: "bold", fontSize: 16 },
  textWhite: { color: "white" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 15,
    height: 100,
    textAlignVertical: "top",
  },
  warningBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF5F5",
    padding: 15,
    borderRadius: 15,
    marginTop: 25,
    alignItems: 'center'
  },
  warningText: { flex: 1, fontSize: 12, color: color.primary, lineHeight: 18 },
  btnSend: {
    backgroundColor: color.primary,
    margin: 25,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  btnSendText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

