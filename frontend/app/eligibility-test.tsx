import React, { useState, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";

export default function EligibilityTestScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const QUESTIONS = useMemo(
    () => [
      {
        id: 1,
        question: t("alert.response.eligibility.questions.q1.text"),
        hint: t("alert.response.eligibility.questions.q1.hint"),
      },
      {
        id: 2,
        question: t("alert.response.eligibility.questions.q2.text"),
        hint: t("alert.response.eligibility.questions.q2.hint"),
      },
      {
        id: 3,
        question: t("alert.response.eligibility.questions.q3.text"),
        hint: t("alert.response.eligibility.questions.q3.hint"),
      },
      {
        id: 4,
        question: t("alert.response.eligibility.questions.q4.text"),
        hint: t("alert.response.eligibility.questions.q4.hint"),
        negative: true,
      },
      {
        id: 5,
        question: t("alert.response.eligibility.questions.q5.text"),
        hint: t("alert.response.eligibility.questions.q5.hint"),
        negative: true,
      },
      {
        id: 6,
        question: t("alert.response.eligibility.questions.q6.text"),
        hint: t("alert.response.eligibility.questions.q6.hint"),
        negative: true,
      },
    ],
    [t]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [pending, setPending] = useState<boolean | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const transition = (next: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -16, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      next();
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleAnswer = (answer: boolean) => {
    if (pending !== null) return;
    setPending(answer);
    setTimeout(() => {
      const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: answer };
      setAnswers(newAnswers);
      if (currentStep < QUESTIONS.length - 1) {
        transition(() => {
          setCurrentStep((s) => s + 1);
          setPending(null);
        });
      } else {
        setPending(null);
        setShowResult(true);
      }
    }, 300);
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
    setPending(null);
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  };

  const checkEligibility = () =>
    QUESTIONS.every((q) =>
      q.negative ? answers[q.id] === false : answers[q.id] === true
    );

  // ── Result screen ──────────────────────────────────────────────────────────

  if (showResult) {
    const eligible = checkEligibility();
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <View style={styles.resultPage}>
          {/* Close */}
          <View style={styles.resultTopBar}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <TabBarIcon name="times" size={16} color={color.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Status block */}
          <View style={styles.statusBlock}>
            <View
              style={[
                styles.statusCircle,
                { borderColor: eligible ? color.success : color.primary },
              ]}
            >
              <View
                style={[
                  styles.statusCircleInner,
                  { backgroundColor: eligible ? color.successLight : color.errorLight },
                ]}
              >
                <TabBarIcon
                  name={eligible ? "check" : "times"}
                  size={32}
                  color={eligible ? color.success : color.primary}
                />
              </View>
            </View>

            <View
              style={[
                styles.statusTag,
                { backgroundColor: eligible ? color.success : color.primary },
              ]}
            >
              <Text style={styles.statusTagText}>
                {eligible ? "Éligible au don" : "Non éligible"}
              </Text>
            </View>

            <Text style={styles.resultTitle}>
              {eligible
                ? t("alert.response.eligibility.eligible")
                : t("alert.response.eligibility.notEligible")}
            </Text>
            <Text style={styles.resultDesc}>
              {eligible
                ? t("alert.response.eligibility.eligibleDesc")
                : t("alert.response.eligibility.notEligibleDesc")}
            </Text>
          </View>

          {/* Answers recap */}
          <View style={styles.recapCard}>
            <Text style={styles.recapTitle}>Récapitulatif</Text>
            <View style={styles.recapGrid}>
              {QUESTIONS.map((q, i) => {
                const ans = answers[q.id];
                const ok = q.negative ? ans === false : ans === true;
                return (
                  <View key={q.id} style={styles.recapItem}>
                    <View
                      style={[
                        styles.recapCheck,
                        { backgroundColor: ok ? color.successLight : color.errorLight },
                      ]}
                    >
                      <TabBarIcon
                        name={ok ? "check" : "times"}
                        size={11}
                        color={ok ? color.success : color.primary}
                      />
                    </View>
                    <Text style={styles.recapItemLabel}>Q{i + 1}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteRow}>
            <View style={styles.noteIconWrap}>
              <TabBarIcon name="info-circle" size={14} color={color.warning} />
            </View>
            <Text style={styles.noteText}>
              {t("alert.response.eligibility.noteText")}
            </Text>
          </View>

          {/* CTA */}
          <View style={styles.resultCtas}>
            <TouchableOpacity
              style={[
                styles.ctaPrimary,
                { backgroundColor: eligible ? color.success : color.primary },
              ]}
              onPress={() => (eligible ? router.push("/(tabs)/map") : reset())}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaPrimaryText}>
                {eligible
                  ? t("common.actions.findCenter")
                  : t("common.actions.retry")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaGhost} onPress={() => router.back()}>
              <Text style={styles.ctaGhostText}>{t("common.actions.backHome")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────

  const q = QUESTIONS[currentStep];
  const progress = (currentStep + 1) / QUESTIONS.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <TabBarIcon name="arrow-left" size={18} color={color.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("alert.response.eligibility.testTitle")}
        </Text>
        <View style={styles.stepCounter}>
          <Text style={styles.stepCounterText}>
            {currentStep + 1}
            <Text style={styles.stepCounterTotal}>/{QUESTIONS.length}</Text>
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.progressDots}>
        {QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < currentStep
                ? { backgroundColor: color.primary, opacity: 0.3 }
                : i === currentStep
                ? { backgroundColor: color.primary, width: 20 }
                : { backgroundColor: color.border },
            ]}
          />
        ))}
      </View>

      {/* Question body */}
      <Animated.View
        style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Numéro */}
        <View style={styles.questionNumRow}>
          <View style={styles.questionNum}>
            <Text style={styles.questionNumText}>
              {String(currentStep + 1).padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.questionSeparator} />
        </View>

        {/* Question */}
        <Text style={styles.questionText}>{q.question}</Text>

        {/* Hint */}
        <View style={styles.hintBox}>
          <View style={styles.hintBar} />
          <Text style={styles.hintText}>{q.hint}</Text>
        </View>
      </Animated.View>

      {/* Answer buttons */}
      <View style={styles.answerRow}>
        <TouchableOpacity
          style={[
            styles.answerBtn,
            pending === true
              ? { backgroundColor: color.success, borderColor: color.success }
              : { backgroundColor: color.successLight, borderColor: "#BBF7D0" },
          ]}
          onPress={() => handleAnswer(true)}
          activeOpacity={0.8}
        >
          <TabBarIcon
            name="check"
            size={18}
            color={pending === true ? "white" : color.success}
          />
          <Text
            style={[
              styles.answerLabel,
              { color: pending === true ? "white" : color.secondary },
            ]}
          >
            {t("common.actions.yes")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.answerBtn,
            pending === false
              ? { backgroundColor: color.primary, borderColor: color.primary }
              : { backgroundColor: color.errorLight, borderColor: "#FECACA" },
          ]}
          onPress={() => handleAnswer(false)}
          activeOpacity={0.8}
        >
          <TabBarIcon
            name="times"
            size={18}
            color={pending === false ? "white" : color.primary}
          />
          <Text
            style={[
              styles.answerLabel,
              { color: pending === false ? "white" : color.secondary },
            ]}
          >
            {t("common.actions.no")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back question */}
      {currentStep > 0 && (
        <TouchableOpacity
          style={styles.prevRow}
          onPress={() => {
            transition(() => {
              setCurrentStep((s) => s - 1);
              setPending(null);
            });
          }}
        >
          <TabBarIcon name="chevron-left" size={12} color={color.textLight} />
          <Text style={styles.prevText}>Question précédente</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: color.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: color.secondary,
    letterSpacing: -0.3,
  },
  stepCounter: {
    width: 38,
    alignItems: "flex-end",
  },
  stepCounterText: {
    fontSize: 15,
    fontWeight: "900",
    color: color.primary,
  },
  stepCounterTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: color.textLight,
  },

  // Progress
  progressTrack: {
    height: 2,
    backgroundColor: color.border,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: color.primary,
    borderRadius: 1,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 5,
    marginBottom: 32,
  },
  progressDot: {
    height: 5,
    width: 5,
    borderRadius: 3,
  },

  // Body
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionNumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  questionNum: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: color.errorLight,
    justifyContent: "center",
    alignItems: "center",
  },
  questionNumText: {
    fontSize: 14,
    fontWeight: "900",
    color: color.primary,
    letterSpacing: -0.5,
  },
  questionSeparator: {
    flex: 1,
    height: 1,
    backgroundColor: color.border,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "900",
    color: color.secondary,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 22,
  },
  hintBox: {
    flexDirection: "row",
    backgroundColor: color.background,
    borderRadius: 14,
    overflow: "hidden",
    gap: 0,
  },
  hintBar: {
    width: 3,
    backgroundColor: color.primary,
    borderRadius: 2,
    margin: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: color.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
    paddingVertical: 13,
    paddingRight: 14,
  },

  // Answer buttons
  answerRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 6,
  },
  answerBtn: {
    flex: 1,
    height: 70,
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "800",
  },

  // Previous button
  prevRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 16,
  },
  prevText: {
    fontSize: 12,
    color: color.textLight,
    fontWeight: "600",
  },

  // Result page
  resultPage: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultTopBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 8,
    paddingBottom: 20,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: color.background,
    justifyContent: "center",
    alignItems: "center",
  },

  // Status block
  statusBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  statusCircle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTag: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  statusTagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: color.secondary,
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  resultDesc: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "500",
    paddingHorizontal: 12,
  },

  // Recap
  recapCard: {
    backgroundColor: color.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  recapTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: color.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  recapGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  recapItem: {
    alignItems: "center",
    gap: 4,
  },
  recapCheck: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  recapItemLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: color.textLight,
  },

  // Note
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: color.warningLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  noteIconWrap: {
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
    fontWeight: "500",
  },

  // CTAs
  resultCtas: { gap: 8 },
  ctaPrimary: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaPrimaryText: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ctaGhost: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaGhostText: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textSecondary,
  },
});
