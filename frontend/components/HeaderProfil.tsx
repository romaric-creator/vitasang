import { Image, Text, View } from "react-native";
import React from "react";
import { color } from "@/constant/color";

export default function HeaderProfil() {
  return (
    <View style={{ marginTop: 50 }}>
      <Text style={{ fontSize: 25, fontWeight: 900,textAlign:'center' }}>Profil</Text>
      <View
        style={{
          backgroundColor: color.primary,
          height: 150,
          justifyContent: "center",
          alignItems: "center",
          width: 150,
          borderWidth: 5,
          marginTop:15,
          borderColor: color.background,
          borderRadius: 100,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
        }}
      >
        <Image
          source={require("@/assets/images/Capture d’écran du 2026-01-31 23-07-03.png")}
          style={{
            height: 100,
            width: 90,
            resizeMode: "contain",
          }}
        />
      </View>
    </View>
  );
}


