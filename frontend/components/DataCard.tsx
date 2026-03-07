import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { color } from "@/constant/color";

export interface DataCardRow {
    label: string;
    value: string | React.ReactNode;
    valueColor?: string;
    isBold?: boolean;
}

interface DataCardProps {
    title: string;
    subtitle?: string;
    badgeText?: string;
    badgeColor?: string;
    data: DataCardRow[];
    actionButton?: {
        text: string;
        onPress: () => void;
        color?: string;
    };
}

export const DataCard: React.FC<DataCardProps> = ({
    title,
    subtitle,
    badgeText,
    badgeColor = color.primary,
    data,
    actionButton,
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {badgeText && (
                    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                        <Text style={styles.badgeText}>{badgeText}</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.content}>
                {data.map((row, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={styles.label}>{row.label}</Text>
                        <Text
                            style={[
                                styles.value,
                                row.valueColor && { color: row.valueColor },
                                row.isBold && { fontWeight: "bold" },
                            ]}
                        >
                            {row.value}
                        </Text>
                    </View>
                ))}
            </View>

            {actionButton && (
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        { backgroundColor: actionButton.color || color.primary },
                    ]}
                    onPress={actionButton.onPress}
                >
                    <Text style={styles.actionButtonText}>{actionButton.text}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: color.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: color.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: color.border,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: color.textMain,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: color.textSecondary,
        marginTop: 4,
        fontWeight: "600",
    },
    badge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        color: color.textWhite,
        fontSize: 12,
        fontWeight: "800",
    },
    divider: {
        height: 1.5,
        backgroundColor: color.divider,
        marginBottom: 20,
    },
    content: {
        gap: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    label: {
        fontSize: 14,
        color: color.textSecondary,
        fontWeight: "600",
        flex: 1,
    },
    value: {
        fontSize: 14,
        color: color.textMain,
        fontWeight: "700",
        flex: 1.5,
        textAlign: "right",
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 20,
        shadowColor: color.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    actionButtonText: {
        color: color.textWhite,
        fontSize: 14,
        fontWeight: "800",
    },
});
