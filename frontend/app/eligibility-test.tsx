import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PageHeader } from "@/components/PageHeader";
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
        <View style={styles.container}>
          <PageHeader title={t("alert.response.eligibility.resultTitle")} />
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.resultIcon,
                { backgroundColor: isEligible ? "#DEF7EC" : "#FDE8E8" },
              ]}
            >
              <TabBarIcon
                name={isEligible ? "check-circle" : "exclamation-circle"}
                size={80}
                color={isEligible ? "#0E9F6E" : color.primary}
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

            <View style={styles.notebox}>
              <Text style={styles.noteTitle}>{t("alert.response.eligibility.noteTitle")}</Text>
              <Text style={styles.noteText}>
                {t("alert.response.eligibility.noteText")}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <PrimaryButton
                title={isEligible ? t("common.actions.findCenter") : t("common.actions.retry")}
                onPress={() =>
                  isEligible ? router.push("/(tabs)/map") : resetTest()
                }
              />
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.secondaryBtnText}>{t("common.actions.backHome")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];
  const progress = (currentStep / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PageHeader title={t("alert.response.eligibility.testTitle")} />

        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepText}>
            {t("alert.response.eligibility.stepText", { current: currentStep + 1, total: QUESTIONS.length })}
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <View style={styles.hintBox}>
            <TabBarIcon
              name="info-circle"
              size={16}
              color={color.textSecondary}
            />
            <Text style={styles.hintText}>{currentQuestion.hint}</Text>
          </View>
        </View>

        <View style={styles.answerSection}>
          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: "#F3F4F6" }]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.answerBtnText}>{t("common.actions.yes")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: "#F3F4F6" }]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.answerBtnText}>{t("common.actions.no")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  progressSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: color.primary,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: color.textSecondary,
    textAlign: "right",
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 40,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    color: color.textMain,
    lineHeight: 32,
    marginBottom: 20,
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  hintText: {
    fontSize: 14,
    color: color.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  answerSection: {
    flexDirection: "row",
    gap: 16,
  },
  answerBtn: {
    flex: 1,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  answerBtnText: {
    fontSize: 20,
    fontWeight: "800",
    color: color.textMain,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  resultIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: color.textMain,
    textAlign: "center",
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 16,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  notebox: {
    backgroundColor: "#FFFBEB",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    marginBottom: 40,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#B45309",
    lineHeight: 18,
  },
  actionButtons: {
    width: "100%",
    gap: 16,
  },
  secondaryBtn: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: color.textSecondary,
  },
});
