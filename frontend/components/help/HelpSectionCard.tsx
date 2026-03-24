import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";

interface Section {
  id: number;
  title: string;
  icon: string;
  color: string;
  items: string[];
}

interface HelpSectionCardProps {
  section: Section;
  isExpanded: boolean;
  onPress: () => void;
}

export const HelpSectionCard = ({ section, isExpanded, onPress }: HelpSectionCardProps) => (
  <TouchableOpacity style={styles.sectionCard} onPress={onPress}>
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIconBox,
          { backgroundColor: `${section.color}15` },
        ]}
      >
        <TabBarIcon
          name={section.icon}
          size={24}
          color={section.color}
          family="fontawesome"
        />
      </View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <TabBarIcon
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={20}
        color={color.textSecondary}
        family="fontawesome"
      />
    </View>

    {isExpanded && (
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemDot} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: color.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  sectionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: color.textMain,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: color.background,
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.primary,
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "600",
    lineHeight: 18,
  },
});
