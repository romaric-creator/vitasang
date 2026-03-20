/**
 * Aide et Conseil Section Component
 * Affiche des conseils de sensibilisation sur le don de sang
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { TabBarIcon } from "./TabBarIcon";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

interface AdviceTip {
  id: number;
  icon: string;
  iconFamily: "fontawesome" | "material" | "feather";
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  details: string[];
}


interface AideEtConseilSectionProps {
  tips?: AdviceTip[];
  onTipPress?: (tip: AdviceTip) => void;
  profileImage?: any;
}

export const AideEtConseilSection: React.FC<AideEtConseilSectionProps> = ({
  tips: propsTips,
  onTipPress,
  profileImage,
}) => {
  const { t } = useTranslation();
  const [expandedTipId, setExpandedTipId] = useState<number | null>(null);

  const defaultTips: AdviceTip[] = React.useMemo(() => [
    {
      id: 1,
      icon: "heartbeat",
      iconFamily: "fontawesome",
      title: t('home.tipsSection.tips.heart.title'),
      description: t('home.tipsSection.tips.heart.desc'),
      bgColor: "#FFF0F0",
      iconColor: color.primary,
      details: [
        t('helpAndAdvice.sectionAdvantagesItem3'),
        t('helpAndAdvice.sectionAdvantagesItem1'),
        t('helpAndAdvice.sectionAdvantagesItem1'), // Reusing some if possible or just hardcoding the keys
      ],
    },
    // Actually, I should check if I have these specific details in translation.ts
    // Let's use simpler ones for now or just add them to translation context
  ], [t]);

  // Actually, I'll just use the keys from helpAndAdvice if they match.
  // let's look at translation.ts helpAndAdvice section.

  const adviceTips: AdviceTip[] = React.useMemo(() => [
    {
      id: 1,
      icon: "heartbeat",
      iconFamily: "fontawesome",
      title: t('home.tipsSection.tips.heart.title'),
      description: t('home.tipsSection.tips.heart.desc'),
      bgColor: "#FFF0F0",
      iconColor: color.primary,
      details: [
        t('helpAndAdvice.sectionAdvantagesItem3'),
        t('helpAndAdvice.sectionAdvantagesItem2'),
        t('helpAndAdvice.sectionAdvantagesItem1'),
      ],
    },
    {
      id: 2,
      icon: "coffee",
      iconFamily: "fontawesome",
      title: t('home.tipsSection.tips.hydration.title'),
      description: t('home.tipsSection.tips.hydration.desc'),
      bgColor: "#F0F7FF",
      iconColor: color.secondary,
      details: [
        t('helpAndAdvice.sectionPreparationItem1'),
        t('helpAndAdvice.sectionPreparationItem3'),
        t('helpAndAdvice.sectionAfterDonationItem2'),
      ],
    },
    {
      id: 3,
      icon: "shield",
      iconFamily: "fontawesome",
      title: t('home.tipsSection.tips.safety.title'),
      description: t('home.tipsSection.tips.safety.desc'),
      bgColor: "#F0FFF4",
      iconColor: color.success,
      details: [
        t('helpAndAdvice.faqAnswer4'),
        t('helpAndAdvice.sectionWhoCanDonateItem5'),
      ],
    },
    {
      id: 4,
      icon: "plus-circle",
      iconFamily: "fontawesome",
      title: t('home.tipsSection.tips.impact.title'),
      description: t('home.tipsSection.tips.impact.desc'),
      bgColor: "#FFF9E6",
      iconColor: color.warning,
      details: [
        t('home.tipsData.d1'),
        t('helpAndAdvice.heroText'),
      ],
    },
  ], [t]);

  const tips = propsTips || adviceTips;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("home.tipsSection.title")}</Text>
        <Text style={styles.subtitle}>{t("home.tipsSection.subtitle")}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.cardsContainer}
      >
        {tips.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            style={styles.tipCard}
            onPress={() => {
              setExpandedTipId(expandedTipId === tip.id ? null : tip.id);
              onTipPress?.(tip);
            }}
            activeOpacity={0.7}
          >
            {/* Header */}
            <View style={styles.tipHeader}>
              <View
                style={[styles.tipIconBox, { backgroundColor: tip.bgColor }]}
              >
                <TabBarIcon
                  name={tip.icon}
                  size={24}
                  color={tip.iconColor}
                  family={tip.iconFamily}
                />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc} numberOfLines={1}>
                  {tip.description}
                </Text>
              </View>
            </View>

            {/* Details expandable */}
            {expandedTipId === tip.id && (
              <View style={styles.tipDetails}>
                {tip.details.map((detail, idx) => (
                  <View key={idx} style={styles.detailItem}>
                    <View style={styles.detailDot} />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer indicator */}
            <View style={styles.tipFooter}>
              <TabBarIcon
                name={expandedTipId === tip.id ? "chevron-up" : "chevron-down"}
                size={16}
                color={color.textSecondary}
                family="fontawesome"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Awarenness Banner */}
      <View style={styles.awarenessBanner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerIconBox}>
            <TabBarIcon
              name="lightbulb-o"
              size={28}
              color={color.warning}
              family="fontawesome"
            />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t("home.tipsSection.didYouKnow")}</Text>
            <Text style={styles.bannerMessage}>
              {t("home.tipsSection.didYouKnowText")}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.profilePreview,
            profileImage && { borderColor: color.primary },
          ]}
        >
          {profileImage ? (
            <TabBarIcon
              name="check-circle"
              size={16}
              color={color.success}
              family="fontawesome"
            />
          ) : (
            <TabBarIcon
              name="question-circle"
              size={16}
              color={color.textSecondary}
              family="fontawesome"
            />
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, styles.statPrimary]}>
          <Text style={styles.statValue}>42 {t("helpAndAdvice.statDays").split(' ')[0]}</Text>
          <Text style={styles.statLabel}>{t("home.tipsSection.stats.frequency")}</Text>
        </View>
        <View style={[styles.statItem, styles.statSecondary]}>
          <Text style={styles.statValue}>450 ml</Text>
          <Text style={styles.statLabel}>{t("home.tipsSection.stats.perDonation")}</Text>
        </View>
        <View style={[styles.statItem, styles.statSuccess]}>
          <Text style={styles.statValue}>10 min</Text>
          <Text style={styles.statLabel}>{t("home.tipsSection.stats.duration")}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: color.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: color.textSecondary,
    fontWeight: "600",
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tipCard: {
    width: width * 0.72,
    backgroundColor: color.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: color.border,
    marginRight: 4,
  },
  tipHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  tipIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
    lineHeight: 16,
  },
  tipDetails: {
    backgroundColor: color.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.primary,
  },
  detailText: {
    fontSize: 11,
    color: color.textMain,
    fontWeight: "600",
    flex: 1,
  },
  tipFooter: {
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: color.divider,
  },
  awarenessBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: color.warning,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: color.textMain,
  },
  bannerMessage: {
    fontSize: 11,
    color: color.textSecondary,
    fontWeight: "600",
    marginTop: 2,
    lineHeight: 15,
  },
  profilePreview: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.background,
    borderWidth: 2,
    borderColor: color.border,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  statPrimary: {
    backgroundColor: "#FFF0F0",
    borderColor: color.primary,
  },
  statSecondary: {
    backgroundColor: "#F0F7FF",
    borderColor: color.secondary,
  },
  statSuccess: {
    backgroundColor: "#F0FFF4",
    borderColor: color.success,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: color.textMain,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: color.textSecondary,
    textAlign: "center",
  },
});

export default AideEtConseilSection;
