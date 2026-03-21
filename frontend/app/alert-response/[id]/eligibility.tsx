import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { useTranslation } from "react-i18next";
import ThemedView from "@/components/ThemedView";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function EligibilityScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [answers, setAnswers] = useState<Record<string, boolean>>({
        q1: false,
        q2: false,
        q3: false,
        q4: false,
        q5: false,
        q6: false,
    });

    const toggleAnswer = (key: string) => {
        setAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isEligible = !answers.q4 && !answers.q5 && !answers.q6 && answers.q1 && answers.q2 && answers.q3;

    const handleConfirm = () => {
        if (isEligible) {
            router.replace({
                pathname: "/alert-response/[id]",
                params: { id, confirmedEligibility: "true" },
            });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <TabBarIcon name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("alert.response.eligibility.title")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>{t("alert.response.eligibility.subtitle")}</Text>

                <View style={styles.questionsContainer}>
                    {[1, 2, 3, 4, 5, 6].map((num) => {
                        const key = `q${num}`;
                        const isNegativeQuestion = num >= 4; // q4, q5, q6 are negative (should be false)
                        return (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.questionCard,
                                    isNegativeQuestion
                                        ? (answers[key] && styles.questionCardActive)
                                        : (!answers[key] && styles.questionCardActive)
                                ]}
                                onPress={() => toggleAnswer(key)}
                            >
                                <Text style={[
                                    styles.questionText,
                                    isNegativeQuestion
                                        ? (answers[key] && styles.questionTextActive)
                                        : (!answers[key] && styles.questionTextActive)
                                ]}>
                                    {t(`alert.response.eligibility.questions.q${num}.text`)}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    isNegativeQuestion
                                        ? (answers[key] && styles.checkboxActive)
                                        : (answers[key] && styles.checkboxActive)
                                ]}>
                                    {answers[key] && <TabBarIcon name="check" size={14} color="white" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {!isEligible && (
                    <View style={styles.warningBox}>
                        <TabBarIcon name="exclamation-triangle" size={20} color={color.error} />
                        <Text style={styles.warningText}>
                            {t("alert.response.eligibility.warning")}
                        </Text>
                    </View>
                )}

                <PrimaryButton
                    title={t("alert.response.eligibility.confirmBtn")}
                    onPress={handleConfirm}
                    disabled={!isEligible}
                    style={styles.confirmBtn}
                />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "white",
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: color.textMain },
    content: { padding: 20 },
    subtitle: {
        fontSize: 14,
        color: color.textSecondary,
        marginBottom: 24,
        textAlign: "center",
    },
    questionsContainer: { gap: 12, marginBottom: 24 },
    questionCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "white",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: color.border,
        gap: 12,
    },
    questionCardActive: {
        borderColor: color.error,
        backgroundColor: color.dangerLight,
    },
    questionText: { fontSize: 14, color: color.textMain, flex: 1, fontWeight: "600" },
    questionTextActive: { color: color.error },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: color.border,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxActive: {
        borderColor: color.error,
        backgroundColor: color.error,
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 24,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: color.error,
        fontWeight: "700",
    },
    confirmBtn: { marginTop: 10 },
});
