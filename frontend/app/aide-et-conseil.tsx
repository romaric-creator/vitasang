import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function AideEtConseilScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuth } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const handleLaunchAlert = () => {
    router.push(isAuth ? "/create-alert" : "/guest-alert");
  };

  const quickFacts = [
    { icon: "clock-o", value: "42j", label: t("helpAndAdvice.statDays") },
    { icon: "tint", value: "450ml", label: t("helpAndAdvice.statMl") },
    { icon: "heart", value: "3", label: t("helpAndAdvice.statLivesSaved") },
  ];

  const sections = [
    {
      id: 1,
      icon: "heart",
      color: color.primary,
      bg: color.primaryGhost,
      title: t("helpAndAdvice.sectionAdvantagesTitle"),
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
      icon: "check-circle",
      color: color.success,
      bg: color.successLight,
      title: t("helpAndAdvice.sectionPreparationTitle"),
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
      icon: "heartbeat",
      color: color.warning,
      bg: color.warningLight,
      title: t("helpAndAdvice.sectionAfterDonationTitle"),
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
      icon: "users",
      color: color.accent,
      bg: color.accentLight,
      title: t("helpAndAdvice.sectionWhoCanDonateTitle"),
      items: [
        t("helpAndAdvice.sectionWhoCanDonateItem1"),
        t("helpAndAdvice.sectionWhoCanDonateItem2"),
        t("helpAndAdvice.sectionWhoCanDonateItem3"),
        t("helpAndAdvice.sectionWhoCanDonateItem4"),
        t("helpAndAdvice.sectionWhoCanDonateItem5"),
      ],
    },
  ];

  const faqs = [
    { q: t("helpAndAdvice.faqQuestion1"), a: t("helpAndAdvice.faqAnswer1") },
    { q: t("helpAndAdvice.faqQuestion2"), a: t("helpAndAdvice.faqAnswer2") },
    { q: t("helpAndAdvice.faqQuestion3"), a: t("helpAndAdvice.faqAnswer3") },
    { q: t("helpAndAdvice.faqQuestion4"), a: t("helpAndAdvice.faqAnswer4") },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <TabBarIcon name="arrow-left" size={20} color={color.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("helpAndAdvice.headerTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <TabBarIcon name="heartbeat" size={28} color={color.primary} />
          </View>
          <Text style={styles.heroTitle}>{t("helpAndAdvice.heroTitle")}</Text>
          <Text style={styles.heroSub}>{t("helpAndAdvice.heroText")}</Text>
        </View>

        {/* Quick facts row */}
        <View style={styles.factsRow}>
          {quickFacts.map((f, i) => (
            <View key={i} style={styles.factCard}>
              <TabBarIcon name={f.icon} size={16} color={color.primary} />
              <Text style={styles.factValue}>{f.value}</Text>
              <Text style={styles.factLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Sections accordéon */}
        <Text style={styles.sectionLabel}>{t("helpAndAdvice.heroTitle")}</Text>
        <View style={styles.accordionGroup}>
          {sections.map((s, idx) => {
            const open = expandedSection === s.id;
            return (
              <View key={s.id}>
                {idx > 0 && <View style={styles.accordionSep} />}
                <TouchableOpacity
                  style={styles.accordionRow}
                  onPress={() => setExpandedSection(open ? null : s.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accordionIcon, { backgroundColor: s.bg }]}>
                    <TabBarIcon name={s.icon} size={17} color={s.color} />
                  </View>
                  <Text style={styles.accordionTitle}>{s.title}</Text>
                  <TabBarIcon name={open ? "chevron-up" : "chevron-down"} size={14} color={color.textLight} />
                </TouchableOpacity>
                {open && (
                  <View style={styles.accordionContent}>
                    {s.items.map((item, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <View style={[styles.bullet, { backgroundColor: s.color }]} />
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>{t("helpAndAdvice.faqTitle")}</Text>
        <View style={styles.accordionGroup}>
          {faqs.map((faq, idx) => {
            const open = expandedFaq === idx;
            return (
              <View key={idx}>
                {idx > 0 && <View style={styles.accordionSep} />}
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => setExpandedFaq(open ? null : idx)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <TabBarIcon name={open ? "chevron-up" : "chevron-down"} size={14} color={color.primary} />
                </TouchableOpacity>
                {open && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={handleLaunchAlert} activeOpacity={0.85}>
          <TabBarIcon name="bolt" size={18} color={color.textWhite} />
          <Text style={styles.ctaText}>{t("home.launchAlert")}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: color.textMain,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },

  // Hero
  hero: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: color.primaryGhost,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: color.textMain,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 13,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
  },

  // Quick facts
  factsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  factCard: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: color.borderLight,
  },
  factValue: {
    fontSize: 20,
    fontWeight: "900",
    color: color.primary,
  },
  factLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 13,
  },

  // Labels de section
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  // Accordéon commun
  accordionGroup: {
    backgroundColor: color.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.borderLight,
    overflow: "hidden",
    marginBottom: 24,
  },
  accordionSep: {
    height: 1,
    backgroundColor: color.borderLight,
    marginLeft: 62,
  },

  // Sections
  accordionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  accordionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 10,
    backgroundColor: color.background,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: color.textSecondary,
    lineHeight: 18,
    fontWeight: "500",
  },

  // FAQ
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
    backgroundColor: color.background,
  },
  faqAnswerText: {
    fontSize: 13,
    color: color.textSecondary,
    lineHeight: 19,
    fontWeight: "500",
  },

  // CTA
  cta: {
    backgroundColor: color.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 4,
  },
  ctaText: {
    color: color.textWhite,
    fontSize: 15,
    fontWeight: "800",
  },
});
