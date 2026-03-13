/**
 * Aide et Conseil - Page Principale
 * Écran complet de sensibilisation sur le don de sang
 */

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

interface Section {
  id: number;
  title: string;
  icon: string;
  color: string;
  items: string[];
}

const sections: Section[] = [
  {
    id: 1,
    title: "Avantages du Don",
    icon: "heart",
    color: color.primary,
    items: [
      "Réduit le risque de maladies cardiovasculaires",
      "Équilibre le taux de fer dans le sang",
      "Améliore la circulation sanguine",
      "Stimule la production de nouvelles cellules sanguines",
      "Détection précoce de problèmes de santé",
    ],
  },
  {
    id: 2,
    title: "Préparation au Don",
    icon: "check-circle",
    color: color.success,
    items: [
      "Buvez abondamment (eau) 48h avant",
      "Mangez sainement et équilibré",
      "Évitez l'alcool 24h avant",
      "Dormez suffisamment (7-8h)",
      "Apportez une bonne alimentation riche en fer",
    ],
  },
  {
    id: 3,
    title: "Après le Don",
    icon: "heartbeat",
    color: color.secondary,
    items: [
      "Repos de 10-15 minutes à la clinique",
      "Buvez beaucoup d'eau (1,5L minimum)",
      "Mangez une collation légère",
      "Évitez l'exercice intense 24h",
      "Mangez des aliments riches en fer",
    ],
  },
  {
    id: 4,
    title: "Qui Peut Donner?",
    icon: "users",
    color: color.info,
    items: [
      "18-65 ans (ou plus selon la santé)",
      "Poids minimum: 50 kg",
      "Bonne santé générale",
      "Ne pas être enceinte",
      "Pas de maladie transmissible",
    ],
  },
];

export default function AideEtConseilScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={24} color={color.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Sensibilisation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <TabBarIcon name="heart" size={48} color={color.primary} />
          </View>
          <Text style={styles.heroTitle}>Pourquoi Donner du Sang?</Text>
          <Text style={styles.heroText}>
            Chaque don peut sauver jusqu'à 3 vies. En donnant votre sang, vous
            participez à une chaîne de solidarité vitale.
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatCard value="42" label="jours entre\nchaque don" />
          <StatCard value="450" label="ml prélevés\npar don" />
          <StatCard value="3" label="vies sauvées\npar don" />
        </View>

        {/* Sections Expandables */}
        <View style={styles.sectionsContainer}>
          {sections.map((section) => (
            <SectionCard
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

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Questions Fréquentes</Text>

          <FaqItem
            question="Est-ce que c'est douloureux?"
            answer="Non, la piqûre initiale est mineure. Après quelques secondes, vous ne sentirez plus rien."
          />
          <FaqItem
            question="Combien de temps dure un don?"
            answer="En général, le don prend entre 8 et 10 minutes. Compter 30 minutes au total avec l'accueil et le repos."
          />
          <FaqItem
            question="Peut-on donner si on a des tatouages?"
            answer="Oui, si les tatouages ont plus de 4 mois. Sinon, il faut attendre 4 mois après pour donner."
          />
          <FaqItem
            question="Quels sont les risques?"
            answer="Les risques sont très minimes. Les aiguilles stériles réduisent les risques d'infection à quasi zéro."
          />
        </View>

        {/* Call to Action */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/create-alert")}
        >
          <TabBarIcon name="bolt" size={24} color="white" />
          <Text style={styles.ctaText}>Lancer une Alerte</Text>
        </TouchableOpacity>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <TabBarIcon name="info-circle" size={20} color={color.info} />
          <Text style={styles.infoText}>
            Pour plus d'informations, consultez votre centre de transfusion
            local.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/**
 * Composant StatCard
 */
const StatCard: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Composant SectionCard
 */
const SectionCard: React.FC<{
  section: Section;
  isExpanded: boolean;
  onPress: () => void;
}> = ({ section, isExpanded, onPress }) => (
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

/**
 * Composant FaqItem
 */
const FaqItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <TabBarIcon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={color.primary}
          family="fontawesome"
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

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
  statCard: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: color.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
  sectionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
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
  faqSection: {
    marginBottom: 30,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: color.textMain,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: color.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: color.textMain,
  },
  faqAnswer: {
    fontSize: 13,
    color: color.textSecondary,
    marginTop: 12,
    lineHeight: 18,
    fontWeight: "500",
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
