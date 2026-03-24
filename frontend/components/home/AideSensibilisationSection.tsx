import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface AideSensibilisationSectionProps {
  t: (key: string) => string;
}

export const AideSensibilisationSection = ({ t }: AideSensibilisationSectionProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.aideSection}
      onPress={() => router.push("/aide-et-conseil")}
      activeOpacity={0.7}
    >
      <View style={styles.aideSectionLeft}>
        <View style={styles.aideSectionIcon}>
          <TabBarIcon name="heart" size={28} color={color.primary} />
        </View>
        <View style={styles.aideSectionText}>
          <Text style={styles.aideSectionTitle}>
            {t("home.helpAndAwareness")}
          </Text>
          <Text style={styles.aideSectionDesc}>
            {t("home.discoverTips")}
          </Text>
        </View>
      </View>
      <TabBarIcon
        name="chevron-right"
        size={24}
        color={color.primary}
        family="fontawesome"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  aideSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: color.primary,
  },
  aideSectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  aideSectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  aideSectionText: {
    flex: 1,
  },
  aideSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 2,
  },
  aideSectionDesc: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
  },
});
