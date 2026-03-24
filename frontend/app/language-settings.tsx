import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ThemedView from "@/components/ThemedView";
import { PageHeader } from "@/components/PageHeader";
import { color } from "@/constant/color";
import { TabBarIcon } from "@/components/TabBarIcon";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
];

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
    await AsyncStorage.setItem("user-language", langCode);
  };

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("profile.language") || "Choisir la langue"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLang === lang.code;
            return (
              <React.Fragment key={lang.code}>
                <TouchableOpacity
                  style={styles.langRow}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <View style={styles.langLeft}>
                    <Text
                      style={[
                        styles.langName,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <TabBarIcon name="check" size={20} color={color.primary} />
                  )}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: color.surface,
  },
  scroll: {
    paddingBottom: 40,
    paddingTop: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: color.border,
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 22,
  },
  langName: {
    fontSize: 15,
    fontWeight: "500",
    color: color.textMain,
  },
  selectedText: {
    fontWeight: "700",
    color: color.primary,
  },
  divider: {
    height: 1,
    backgroundColor: color.border,
    marginVertical: 4,
  },
});
