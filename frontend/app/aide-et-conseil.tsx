import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

// Extracted Components
import { HelpStatCard } from "@/components/help/HelpStatCard";
import { HelpSectionCard } from "@/components/help/HelpSectionCard";
import { HelpFaqItem } from "@/components/help/HelpFaqItem";

export default function AideEtConseilScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuth } = useAuth();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const handleLaunchAlert = () => {
    if (isAuth) {
      router.push("/create-alert");
    } else {
      router.push("/guest-alert");
    }
  };

  const sections = [
    {
      id: 1,
      title: t("helpAndAdvice.sectionAdvantagesTitle"),
      icon: "heart",
      color: color.primary,
      items: [
        t("helpAndAdvice.sectionAdvantagesItem1"),
        t("helpAndAdvice.sectionAdvantagesItem2"),
        t("helpAndAdvice.sectionAdvantagesItem3"),
        t("helpAndAdvice.sectionAdvantagesItem4"),
        t("helpAndAdvice.sectionAdvantagesItem5"),
      ],
    },
    {
      id: 2,
      title: t("helpAndAdvice.sectionPreparationTitle"),
      icon: "check-circle",
      color: color.success,
      items: [
        t("helpAndAdvice.sectionPreparationItem1"),
        t("helpAndAdvice.sectionPreparationItem2"),
        t("helpAndAdvice.sectionPreparationItem3"),
        t("helpAndAdvice.sectionPreparationItem4"),
        t("helpAndAdvice.sectionPreparationItem5"),
      ],
    },
    {
      id: 3,
      title: t("helpAndAdvice.sectionAfterDonationTitle"),
      icon: "heartbeat",
      color: color.secondary,
      items: [
        t("helpAndAdvice.sectionAfterDonationItem1"),
        t("helpAndAdvice.sectionAfterDonationItem2"),
        t("helpAndAdvice.sectionAfterDonationItem3"),
        t("helpAndAdvice.sectionAfterDonationItem4"),
        t("helpAndAdvice.sectionAfterDonationItem5"),
      ],
    },
    {
      id: 4,
      title: t("helpAndAdvice.sectionWhoCanDonateTitle"),
      icon: "users",
      color: color.info,
      items: [
        t("helpAndAdvice.sectionWhoCanDonateItem1"),
        t("helpAndAdvice.sectionWhoCanDonateItem2"),
        t("helpAndAdvice.sectionWhoCanDonateItem3"),
        t("helpAndAdvice.sectionWhoCanDonateItem4"),
        t("helpAndAdvice.sectionWhoCanDonateItem5"),
      ],
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={24} color={color.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("helpAndAdvice.headerTitle")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <TabBarIcon name="heart" size={48} color={color.primary} />
          </View>
          <Text style={styles.heroTitle}>{t("helpAndAdvice.heroTitle")}</Text>
          <Text style={styles.heroText}>{t("helpAndAdvice.heroText")}</Text>
        </View>

        <View style={styles.statsContainer}>
          <HelpStatCard value="42" label={t("helpAndAdvice.statDays")} />
          <HelpStatCard value="450" label={t("helpAndAdvice.statMl")} />
          <HelpStatCard value="3" label={t("helpAndAdvice.statLivesSaved")} />
        </View>

        <View style={styles.sectionsContainer}>
          {sections.map((section) => (
            <HelpSectionCard
              key={section.id}
              section={section}
              isExpanded={expandedSection === section.id}
              onPress={() =>
                setExpandedSection(
                  expandedSection === section.id ? null : section.id,
                )
              }
            />
          ))}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>{t("helpAndAdvice.faqTitle")}</Text>

          <HelpFaqItem
            question={t("helpAndAdvice.faqQuestion1")}
            answer={t("helpAndAdvice.faqAnswer1")}
          />
          <HelpFaqItem
            question={t("helpAndAdvice.faqQuestion2")}
            answer={t("helpAndAdvice.faqAnswer2")}
          />
          <HelpFaqItem
            question={t("helpAndAdvice.faqQuestion3")}
            answer={t("helpAndAdvice.faqAnswer3")}
          />
          <HelpFaqItem
            question={t("helpAndAdvice.faqQuestion4")}
            answer={t("helpAndAdvice.faqAnswer4")}
          />
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleLaunchAlert}
        >
          <TabBarIcon name="bolt" size={24} color="white" />
          <Text style={styles.ctaText}>{t("home.launchAlert")}</Text>
        </TouchableOpacity>

        <View style={styles.infoBanner}>
          <TabBarIcon name="info-circle" size={20} color={color.info} />
          <Text style={styles.infoText}>{t("helpAndAdvice.infoBanner")}</Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: color.textMain,
    marginBottom: 10,
    textAlign: "center",
  },
  heroText: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  sectionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  faqSection: {
    marginBottom: 30,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: color.textMain,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginBottom: 20,
  },
  ctaText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  infoBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: color.info,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: color.info,
    fontWeight: "600",
    lineHeight: 16,
  },
});
