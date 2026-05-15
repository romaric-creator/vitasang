import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";

export default function EligibilityTestScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const QUESTIONS = useMemo(() => [
    { id: 1, question: t("alert.response.eligibility.questions.q1.text"), hint: t("alert.response.eligibility.questions.q1.hint") },
    { id: 2, question: t("alert.response.eligibility.questions.q2.text"), hint: t("alert.response.eligibility.questions.q2.hint") },
    { id: 3, question: t("alert.response.eligibility.questions.q3.text"), hint: t("alert.response.eligibility.questions.q3.hint") },
    { id: 4, question: t("alert.response.eligibility.questions.q4.text"), hint: t("alert.response.eligibility.questions.q4.hint"), negative: true },
    { id: 5, question: t("alert.response.eligibility.questions.q5.text"), hint: t("alert.response.eligibility.questions.q5.hint"), negative: true },
    { id: 6, question: t("alert.response.eligibility.questions.q6.text"), hint: t("alert.response.eligibility.questions.q6.hint"), negative: true },
  ], [t]);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: answer };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const checkEligibility = () => {
    return QUESTIONS.every((q) => {
      const ans = answers[q.id];
      if (q.negative) return ans === false;
      return ans === true;
    });
  };

  const resetTest = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  if (showResult) {
    const isEligible = checkEligibility();
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.resultContent}>
            <View
              style={[
                styles.resultIconWrapper,
                { backgroundColor: isEligible ? color.successLight : color.errorLight },
              ]}
            >
              <TabBarIcon
                name={isEligible ? "check-circle" : "times-circle"}
                size={80}
                color={isEligible ? color.success : color.primary}
              />
            </View>
            <Text style={styles.resultTitle}>
              {isEligible
                ? t("alert.response.eligibility.eligible")
                : t("alert.response.eligibility.notEligible")}
            </Text>
            <Text style={styles.resultDescription}>
              {isEligible
                ? t("alert.response.eligibility.eligibleDesc")
                : t("alert.response.eligibility.notEligibleDesc")}
            </Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{t("alert.response.eligibility.noteTitle")}</Text>
              <Text style={styles.infoText}>
                {t("alert.response.eligibility.noteText")}
              </Text>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => isEligible ? router.push("/(tabs)/map") : resetTest()}
              >
                <Text style={styles.primaryBtnText}>
                  {isEligible ? t("common.actions.findCenter") : t("common.actions.retry")}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.ghostBtnText}>{t("common.actions.backHome")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <TabBarIcon name="arrow-left" size={24} color={color.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("alert.response.eligibility.testTitle")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.stepLabel}>Question {currentStep + 1} / {QUESTIONS.length}</Text>
            <Text style={styles.percentageLabel}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <View style={styles.hintContainer}>
            <TabBarIcon name="info-circle" size={18} color={color.primary} />
            <Text style={styles.hintText}>{currentQuestion.hint}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.answerOption, styles.answerYes]}
            onPress={() => handleAnswer(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.answerTextYes}>{t("common.actions.yes")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.answerOption, styles.answerNo]}
            onPress={() => handleAnswer(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.answerTextNo}>{t("common.actions.no")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: color.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: color.secondary,
  },
  progressContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textSecondary,
  },
  percentageLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: color.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: color.background,
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: color.primary,
    borderRadius: 4,
  },
  questionSection: {
    flex: 1,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "900",
    color: color.secondary,
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  hintContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: color.background,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: color.primary,
  },
  hintText: {
    fontSize: 15,
    color: color.textSecondary,
    flex: 1,
    lineHeight: 22,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },
  answerOption: {
    flex: 1,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  answerYes: {
    backgroundColor: color.errorLight,
    borderColor: color.primary,
  },
  answerNo: {
    backgroundColor: color.background,
    borderColor: color.border,
  },
  answerTextYes: {
    fontSize: 18,
    fontWeight: "800",
    color: color.primary,
  },
  answerTextNo: {
    fontSize: 18,
    fontWeight: "800",
    color: color.secondary,
  },
  resultContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  resultIconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: color.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: color.secondary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  resultDescription: {
    fontSize: 16,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFFBEB",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#FEF3C7",
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 14,
    color: "#B45309",
    lineHeight: 20,
    fontWeight: "600",
  },
  footerActions: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 24,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  ghostBtn: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  ghostBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: color.textSecondary,
  },
});

