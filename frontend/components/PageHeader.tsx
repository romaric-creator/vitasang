import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { TabBarIcon } from "./TabBarIcon";
import { color } from "@/constant/color";

interface PageHeaderProps {
    title: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBack = true,
    rightElement,
}) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            {showBack ? (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <TabBarIcon name="chevron-left" size={20} color={color.primary} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}
            <Text style={styles.title}>{title}</Text>
            {rightElement ? (
                <View style={styles.rightContainer}>{rightElement}</View>
            ) : (
                <View style={styles.placeholder} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        marginBottom: 8,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        backgroundColor: color.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: color.border,
    },
    rightContainer: {
        width: 46,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    placeholder: {
        width: 46,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: color.textMain,
        textAlign: "center",
        flex: 1,
        letterSpacing: -0.5,
    },
});
