import React, { useEffect, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    AppState,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import FormField from "@/components/FormField";
import { color } from "@/constant/color";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { ModernSpinner } from "@/components/ModernSpinner";
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
        const partnerId = Number(id);
        if (!id || isNaN(partnerId)) return;
        try {
            const data = await getConversation(partnerId);
            setMessages(data.messages || []);
        } catch (e) {
            console.error("Error fetching messages:", e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchMessages();
            const interval = setInterval(() => {
                if (AppState.currentState === "active") {
                    fetchMessages();
                }
            }, 5000); // Polling plus rapide (5s) mais seulement si focalisé

            return () => clearInterval(interval);
        }, [fetchMessages])
    );

    const handleSend = async () => {
        const partnerId = Number(id);
        if (!text.trim() || sending || isNaN(partnerId)) return;
        setSending(true);
        try {
            await sendMessage(partnerId, text.trim());
            setText("");
            await fetchMessages();
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        } catch (e) {
            console.error("Error sending message:", e);
        } finally {
            setSending(false);
        }
    };

    if (isNaN(Number(id))) {
        return (
            <View style={styles.center}>
                <Text style={{ color: color.textSecondary }}>{t("common.errors.unexpected")}</Text>
            </View>
        );
    }

    if (loading) return <LoadingOverlay visible fullScreen />;

  const renderItem = ({ item }: { item: MessageData }) => {
    const isMe = item.id_expediteur === myUserId;
    return (
      <View style={[styles.bubbleWrapper, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
        <View style={styles.bubbleContainer}>
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {item.contenu}
            </Text>
            <View style={styles.bubbleFooter}>
              <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {isMe && (
                <TabBarIcon name="check" size={10} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
              )}
            </View>
          </View>
        </View>
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
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

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={text}
                    onChangeText={setText}
                    placeholder={t("messages.typeMessage") || "Écrire un message..."}
                    multiline
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, !text.trim() && { opacity: 0.5, backgroundColor: "#CBD5E1" }]}
                    onPress={handleSend}
                    disabled={!text.trim() || sending}
                  >
                    {sending ? (
                      <ModernSpinner size="small" color="white" />
                    ) : (
                      <TabBarIcon name="send" size={18} color="white" />
                    )}
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
        fontSize: 15,
        fontWeight: "900",
        color: color.textMain,
        flex: 1,
        textAlign: "center",
        marginHorizontal: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: { padding: 16, paddingBottom: 20 },
    bubbleWrapper: { width: '100%', marginBottom: 12 },
    bubbleContainer: { maxWidth: '85%' },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    bubbleMe: {
        backgroundColor: color.primary,
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: "white",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    bubbleText: { fontSize: 14, color: "#334155", lineHeight: 20, fontWeight: '500' },
    bubbleTextMe: { color: "white" },
    bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    bubbleTime: { fontSize: 10, color: "#94A3B8", fontWeight: "600" },
    bubbleTimeMe: { color: "rgba(255,255,255,0.8)" },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 12,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingTop: 10,
        fontSize: 14,
        color: color.textMain,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sendBtn: {
        backgroundColor: color.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        opacity: 0.5,
    },
    emptyText: { fontSize: 14, color: color.textLight, fontWeight: "600" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
