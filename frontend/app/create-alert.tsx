import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import ThemedView from "@/components/ThemedView";

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

export default function CreateAlert({ navigation }: any) {
  const [selectedGroup, setSelectedGroup] = useState("O-");
  const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];



  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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

        <Text style={styles.label}>Hôpital / Lieu</Text>
        <View style={styles.inputContainer}>
          <TabBarIcon name="hospital-o" size={18} color="gray" />
          <TextInput
            style={styles.input}
            placeholder="Nom de l&apos;établissement"
          />
        </View>

        <Text style={styles.label}>Nombre de poches (Optionnel)</Text>
        <TextInput
          style={[styles.input, { paddingLeft: 15 }]}
          placeholder="Ex: 2"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Message d'urgence</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Décrivez l'urgence ici..."
          multiline
          numberOfLines={4}
        />

        <View style={styles.warningBox}>
          <TabBarIcon name="info-circle" size={18} color={color.primary} />
          <Text style={styles.warningText}>
            Cette alerte sera envoyée à tous les donneurs compatibles dans un
            rayon de 10km.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.btnSend}
        onPress={() => {
          alert("Alerte diffusée avec succès !");
          navigation.goBack();
        }}
      >
        <Text style={styles.btnSendText}>DIFFUSER L&apos;ALERTE</Text>
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
