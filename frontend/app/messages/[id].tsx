import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { color } from "@/constant/color";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import {
    getConversation,
    sendMessage,
    MessageData,
} from "@/services/messages.service";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { getUserIdFromStorage } from "@/utils/storage";

export default function ConversationScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id, name } = useLocalSearchParams();
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [myUserId, setMyUserId] = useState<number | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        getUserIdFromStorage().then((uid) => {
            if (uid) setMyUserId(Number(uid));
        });
    }, []);

    const fetchMessages = useCallback(async () => {
        try {
            const data = await getConversation(Number(id));
            setMessages(data.messages || []);
        } catch (e) {
            console.error("Error fetching messages:", e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMessages();
        // Refresh every 10s
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleSend = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            await sendMessage(Number(id), text.trim());
            setText("");
            await fetchMessages();
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        } catch (e) {
            console.error("Error sending message:", e);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <LoadingOverlay visible fullScreen />;

    const renderItem = ({ item }: { item: MessageData }) => {
        const isMe = item.id_expediteur === myUserId;
        return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                    {item.contenu}
                </Text>
                <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                    {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <TabBarIcon name="arrow-left" size={22} color={color.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {name || t("messages.title")}
                </Text>
                <View style={{ width: 22 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <TabBarIcon name="comments-o" size={48} color={color.textLight} />
                        <Text style={styles.emptyText}>{t("messages.noMessages")}</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => String(item.id_message)}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: false })
                        }
                    />
                )}

                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder={t("messages.typeMessage")}
                        placeholderTextColor={color.textLight}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]}
                        onPress={handleSend}
                        disabled={!text.trim() || sending}
                    >
                        <TabBarIcon name="send" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    headerTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: color.textMain,
        flex: 1,
        textAlign: "center",
        marginHorizontal: 10,
    },
    listContent: { padding: 16, paddingBottom: 8 },
    bubble: {
        maxWidth: "78%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    bubbleMe: {
        backgroundColor: color.primary,
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: "white",
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: color.border,
    },
    bubbleText: { fontSize: 14, color: color.textMain, lineHeight: 20 },
    bubbleTextMe: { color: "white" },
    bubbleTime: { fontSize: 10, color: color.textLight, marginTop: 4, textAlign: "right" },
    bubbleTimeMe: { color: "rgba(255,255,255,0.7)" },
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 12,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: color.border,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: color.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 14,
        color: color.textMain,
        borderWidth: 1,
        borderColor: color.border,
    },
    sendBtn: {
        backgroundColor: color.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    emptyText: { fontSize: 14, color: color.textLight, fontWeight: "600" },
});
