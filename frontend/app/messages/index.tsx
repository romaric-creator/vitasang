import React, { useEffect, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { color } from "@/constant/color";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getInbox, ConversationSummary } from "@/services/messages.service";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function MessagesInbox() {
    const { t } = useTranslation();
    const router = useRouter();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInbox = useCallback(async () => {
        try {
            const data = await getInbox();
            setConversations(data.conversations || []);
        } catch (e) {
            console.error("Error fetching inbox:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInbox();
    }, [fetchInbox]);

    if (loading) return <LoadingOverlay visible fullScreen />;

    const renderItem = ({ item }: { item: ConversationSummary }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() =>
                router.push({
                    pathname: "/messages/[id]",
                    params: {
                        id: item.partner_id,
                        name: `${item.prenom} ${item.nom}`,
                    },
                })
            }
        >
            <View style={styles.avatar}>
                {item.photo_profil ? (
                    <Image source={{ uri: item.photo_profil }} style={styles.avatarImage} />
                ) : (
                    <TabBarIcon name="user" size={22} color={color.textWhite} />
                )}
            </View>
            <View style={styles.msgContent}>
                <View style={styles.msgHeader}>
                    <Text style={styles.msgName} numberOfLines={1}>
                        {item.prenom} {item.nom}
                    </Text>
                    <Text style={styles.msgTime}>
                        {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                    </Text>
                </View>
                <View style={styles.msgFooter}>
                    <Text style={styles.msgPreview} numberOfLines={1}>
                        {item.contenu}
                    </Text>
                    {item.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unread_count}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <TabBarIcon name="arrow-left" size={22} color={color.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("messages.title")}</Text>
                <View style={{ width: 22 }} />
            </View>

            {conversations.length === 0 ? (
                <View style={styles.emptyState}>
                    <TabBarIcon name="envelope-o" size={48} color={color.textLight} />
                    <Text style={styles.emptyText}>{t("messages.noMessages")}</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.partner_id)}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        paddingBottom: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: color.border,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: color.textMain },
    listContent: { padding: 16 },
    conversationItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        backgroundColor: "white",
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: color.border,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: color.primary,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarImage: { width: "100%", height: "100%" },
    msgContent: { flex: 1 },
    msgHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    msgName: { fontSize: 14, fontWeight: "700", color: color.textMain, flex: 1 },
    msgTime: { fontSize: 11, color: color.textLight },
    msgFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    msgPreview: { fontSize: 13, color: color.textSecondary, flex: 1 },
    unreadBadge: {
        backgroundColor: color.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadText: { fontSize: 11, fontWeight: "800", color: "white" },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    emptyText: { fontSize: 14, color: color.textLight, fontWeight: "600" },
});
