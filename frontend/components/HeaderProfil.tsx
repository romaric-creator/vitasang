import { Image, Text, View, StyleSheet } from "react-native";
import React from "react";
import { color } from "@/constant/color";
import { TabBarIcon } from "./TabBarIcon"; // Assurez-vous d'importer TabBarIcon

export default function HeaderProfil({ profileImageUri }: { profileImageUri?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.profileTitle}>Profil</Text>
      <View style={styles.profileImageCircle}>
        {profileImageUri ? (
          <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        ) : (
          <TabBarIcon name="user-circle" size={90} color="white" /> // Icône par défaut
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    alignItems: 'center', // Centrer le contenu
  },
  profileTitle: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  profileImageCircle: {
    backgroundColor: color.primary,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    borderWidth: 5,
    marginTop: 15,
    borderColor: color.background,
    borderRadius: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  profileImage: {
    height: 100,
    width: 90,
    resizeMode: "contain",
    borderRadius: 50, // Pour les images circulaires
  },
});


