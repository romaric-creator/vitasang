import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { color } from "@/constant/color";
import { formStyles } from "@/styles/formStyles";

interface BloodGroupSelectorProps {
    value: string;
    onSelect: (group: string) => void;
    error?: string;
    touched?: boolean;
    isAlert?: boolean;
}

const BLOOD_GROUPS = ["A+", "A-", "AB+", "AB-", "B+", "B-", "O+", "O-"];
const UNKNOWN_VALUE = "";

import { useTranslation } from "react-i18next";

export const BloodGroupSelector: React.FC<BloodGroupSelectorProps> = ({
    value,
    onSelect,
    error,
    touched,
    isAlert,
}) => {
    const { t } = useTranslation();
    const isError = touched && !!error;

    return (
        <View style={formStyles.field}>
            <Text style={formStyles.label}>
                {t('common.bloodGroup')}
            </Text>
            <View style={[styles.grid, isError && { borderColor: color.error }]}>
                {BLOOD_GROUPS.map((group) => (
                    <TouchableOpacity
                        key={group}
                        style={[
                            styles.option,
                            value === group && styles.selectedOption,
                        ]}
                        onPress={() => onSelect(group)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.label,
                                value === group && styles.selectedLabel,
                            ]}
                        >
                            {group}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[
                        styles.unknownOption,
                        (value === UNKNOWN_VALUE || !value) && styles.selectedUnknownOption,
                    ]}
                    onPress={() => onSelect(UNKNOWN_VALUE)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.label,
                            (value === UNKNOWN_VALUE || !value) && styles.selectedLabel,
                        ]}
                    >
                        {t('register.bloodGroupUnknown') || "Je ne connais pas mon groupe"}
                    </Text>
                </TouchableOpacity>

                {isAlert && (
                    <TouchableOpacity
                        style={[
                            styles.sosOption,
                            value === "INCONNU" && styles.selectedSOSOption,
                        ]}
                        onPress={() => onSelect("INCONNU")}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.label,
                                value === "INCONNU" && styles.selectedLabel,
                            ]}
                        >
                            🆘 {t('alert.sosGeneral') || "SOS GÉNÉRAL (Inconnu)"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {error && isError && (
                <Text style={formStyles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 8,
        marginBottom: 4,
    },
    option: {
        width: "23%",
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: color.border,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    selectedOption: {
        backgroundColor: color.primary,
        borderColor: color.primary,
    },
    label: {
        fontWeight: "700",
        fontSize: 14,
        color: color.textMain,
    },
    selectedLabel: {
        color: color.textWhite,
    },
    unknownOption: {
        width: "100%",
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: color.border,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    selectedUnknownOption: {
        backgroundColor: color.primary,
        borderColor: color.primary,
    },
    sosOption: {
        width: "100%",
        marginTop: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: color.error,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF5F5",
    },
    selectedSOSOption: {
        backgroundColor: color.error,
        borderColor: color.error,
    },
});
