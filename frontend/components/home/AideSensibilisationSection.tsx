import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useRouter } from "expo-router";

interface AideSensibilisationSectionProps {
  t: (key: string) => string;
}

export const AideSensibilisationSection = React.memo(({ t }: AideSensibilisationSectionProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.aideSection}
      onPress={() => router.push("/aide-et-conseil")}
      activeOpacity={0.7}
    >
      <View style={styles.aideSectionLeft}>
        <View style={styles.aideSectionIcon}>
          <TabBarIcon name="heart" size={22} color={color.primary} />
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
        size={18}
        color={color.textLight}
        family="fontawesome"
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  aideSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.surface,
    borderRadius: color.radius.l,
    padding: color.spacing.m,
    marginBottom: color.spacing.l,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  aideSectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  aideSectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  aideSectionText: {
    flex: 1,
  },
  aideSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 2,
  },
  aideSectionDesc: {
    fontSize: 12,
    color: color.textLight,
    fontWeight: "500",
  },
});
