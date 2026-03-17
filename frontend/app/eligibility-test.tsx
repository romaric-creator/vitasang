import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PageHeader } from "@/components/PageHeader";

const QUESTIONS = [
    {
        id: 1,
        question: "Pesez-vous plus de 50 kg ?",
        hint: "Le volume de sang prélevé dépend de votre poids total.",
    },
    {
        id: 2,
        question: "Avez-vous entre 18 et 70 ans ?",
        hint: "C'est la tranche d'âge légale pour donner son sang.",
    },
    {
        id: 3,
        question: "Avez-vous mangé et êtes-vous bien hydraté ?",
        hint: "Ne jamais donner à jeun pour éviter les malaises.",
    },
    {
        id: 4,
        question: "Avez-vous eu de la fièvre au cours des 2 dernières semaines ?",
        hint: "Une infection récente peut être transmise par le sang.",
        negative: true,
    },
    {
        id: 5,
        question: "Avez-vous fait un tatouage ou piercing ces 4 derniers mois ?",
        hint: "C'est un délai de précaution pour les risques infectieux.",
        negative: true,
    },
    {
        id: 6,
        question: "Avez-vous pris des antibiotiques ces 7 derniers jours ?",
        hint: "Il faut attendre la fin du traitement.",
        negative: true,
    },
];

export default function EligibilityTestScreen() {
    const router = useRouter();
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
                    <PageHeader title="Résultat du test" />
                    <View style={styles.resultContainer}>
                        <View style={[styles.resultIcon, { backgroundColor: isEligible ? "#DEF7EC" : "#FDE8E8" }]}>
                            <TabBarIcon
                                name={isEligible ? "check-circle" : "exclamation-circle"}
                                size={80}
                                color={isEligible ? "#0E9F6E" : color.primary}
                            />
                        </View>
                        <Text style={styles.resultTitle}>
                            {isEligible ? "Vous semblez éligible !" : "Un report est peut-être nécessaire"}
                        </Text>
                        <Text style={styles.resultDescription}>
                            {isEligible
                                ? "D'après vos réponses, vous remplissez les conditions de base pour donner votre sang aujourd'hui."
                                : "Certaines de vos réponses indiquent qu'il est préférable d'attendre ou de consulter un médecin avant de donner."}
                        </Text>

                        <View style={styles.notebox}>
                            <Text style={styles.noteTitle}>Important</Text>
                            <Text style={styles.noteText}>
                                Ce test est indicatif. Seul le médecin du centre de don peut valider définitivement votre aptitude après un entretien confidentiel.
                            </Text>
                        </View>

                        <View style={styles.actionButtons}>
                            <PrimaryButton
                                title={isEligible ? "TROUVER UN CENTRE" : "RECOMMENCER"}
                                onPress={() => isEligible ? router.push('/(tabs)/map') : resetTest()}
                            />
                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
                                <Text style={styles.secondaryBtnText}>RETOUR À L'ACCUEIL</Text>
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
                <PageHeader title="Test d'éligibilité" />

                <View style={styles.progressSection}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.stepText}>Question {currentStep + 1} sur {QUESTIONS.length}</Text>
                </View>

                <View style={styles.questionCard}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                    <View style={styles.hintBox}>
                        <TabBarIcon name="info-circle" size={16} color={color.textSecondary} />
                        <Text style={styles.hintText}>{currentQuestion.hint}</Text>
                    </View>
                </View>

                <View style={styles.answerSection}>
                    <TouchableOpacity
                        style={[styles.answerBtn, { backgroundColor: '#F3F4F6' }]}
                        onPress={() => handleAnswer(true)}
                    >
                        <Text style={styles.answerBtnText}>OUI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.answerBtn, { backgroundColor: '#F3F4F6' }]}
                        onPress={() => handleAnswer(false)}
                    >
                        <Text style={styles.answerBtnText}>NON</Text>
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
