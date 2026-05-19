import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Switch,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import ThemedView from '@/components/ThemedView';
import { PageHeader } from '@/components/PageHeader';
import { color } from '@/constant/color';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useAuth';
import { updateDonorProfile } from '@/services/user.service';
import { useToast } from '@/context/ToastContext';

export default function NotificationsSettings() {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const { success, error: showError } = useToast();
    const userId = authUser?.id_utilisateur ?? authUser?.id ?? null;
    const profileQuery = useUserProfile(userId as number, !!userId);
    const userData = profileQuery.data?.user;

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [urgentOnly, setUrgentOnly] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        if (userData) {
            setPushEnabled(userData.push_notifications ?? true);
            setEmailEnabled(userData.email_notifications ?? false);
            setSmsEnabled(userData.sms_notifications ?? false);
            setUrgentOnly(userData.urgent_only ?? false);
        }
    }, [userData]);

    const handleToggle = async (field: string, value: boolean, setter: (v: boolean) => void) => {
        if (!userId || saving) return;
        setter(value);
        setSaving(field);
        try {
            await updateDonorProfile(userId as number, { [field]: value });
            success(t('notifications.saved') || 'Préférences enregistrées');
        } catch (err) {
            setter(!value);
            showError(t('notifications.error') || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(null);
        }
    };

    const renderSwitch = (field: string, value: boolean, setter: (v: boolean) => void) => {
        if (saving === field) {
            return <ActivityIndicator size="small" color={color.primary} />;
        }
        return (
            <Switch
                trackColor={{ false: color.borderLight, true: color.primary }}
                thumbColor={color.surface}
                onValueChange={(v) => handleToggle(field, v, setter)}
                value={value}
                disabled={!!saving}
            />
        );
    };

    return (
        <ThemedView style={styles.container}>
            <PageHeader title={t('notifications.title')} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.sectionTitle}>{t('notifications.channels')}</Text>

                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: color.accentLight }]}>
                                <TabBarIcon name="bell-o" size={18} color={color.accent} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingTitle}>{t('notifications.push.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.push.desc')}</Text>
                            </View>
                        </View>
                        {renderSwitch('push_notifications', pushEnabled, setPushEnabled)}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: color.successLight }]}>
                                <TabBarIcon name="envelope-o" size={18} color={color.success} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingTitle}>{t('notifications.email.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.email.desc')}</Text>
                            </View>
                        </View>
                        {renderSwitch('email_notifications', emailEnabled, setEmailEnabled)}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: color.warningLight }]}>
                                <TabBarIcon name="commenting-o" size={18} color={color.warning} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingTitle}>{t('notifications.sms.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.sms.desc')}</Text>
                            </View>
                        </View>
                        {renderSwitch('sms_notifications', smsEnabled, setSmsEnabled)}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('notifications.preferences')}</Text>

                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: color.errorLight }]}>
                                <TabBarIcon name="exclamation-circle" size={18} color={color.error} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingTitle}>{t('notifications.urgentOnly.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.urgentOnly.desc')}</Text>
                            </View>
                        </View>
                        {renderSwitch('urgent_only', urgentOnly, setUrgentOnly)}
                    </View>
                </View>

                <Text style={styles.infoText}>
                    {t('notifications.commitment')}
                </Text>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        backgroundColor: color.screenBackground,
    },
    scroll: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: color.textSecondary,
        marginTop: 16,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: color.surface,
        borderRadius: 16,
        padding: 12,
        shadowColor: color.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: color.borderLight,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        paddingRight: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: color.textMain,
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 11,
        color: color.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: color.borderLight,
        marginVertical: 8,
    },
    infoText: {
        fontSize: 11,
        color: color.textLight,
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 16,
        paddingHorizontal: 16,
    }
});
