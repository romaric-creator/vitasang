import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Switch,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { color } from '@/constant/color';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useAuth';
import { updateDonorProfile } from '@/services/user.service';
import { useToast } from '@/context/ToastContext';

export default function NotificationsSettings() {
    const { t } = useTranslation();
    const router = useRouter();
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
            return <ActivityIndicator size="small" color={color.primary} style={{ width: 51 }} />;
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <TabBarIcon name="arrow-left" size={20} color={color.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Hero compact */}
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <TabBarIcon name="bell" size={22} color={color.primary} />
                    </View>
                    <Text style={styles.heroTitle}>{t('notifications.channels')}</Text>
                    <Text style={styles.heroSub}>
                        {t('notifications.commitment')}
                    </Text>
                </View>

                {/* Canaux */}
                <View style={styles.group}>
                    <SettingRow
                        icon="bell"
                        iconBg={color.primaryGhost}
                        iconColor={color.primary}
                        title={t('notifications.push.title')}
                        desc={t('notifications.push.desc')}
                        active={pushEnabled}
                        control={renderSwitch('push_notifications', pushEnabled, setPushEnabled)}
                    />
                    <View style={styles.sep} />
                    <SettingRow
                        icon="envelope-o"
                        iconBg={color.successLight}
                        iconColor={color.success}
                        title={t('notifications.email.title')}
                        desc={t('notifications.email.desc')}
                        active={emailEnabled}
                        control={renderSwitch('email_notifications', emailEnabled, setEmailEnabled)}
                    />
                    <View style={styles.sep} />
                    <SettingRow
                        icon="commenting-o"
                        iconBg={color.warningLight}
                        iconColor={color.warning}
                        title={t('notifications.sms.title')}
                        desc={t('notifications.sms.desc')}
                        active={smsEnabled}
                        control={renderSwitch('sms_notifications', smsEnabled, setSmsEnabled)}
                    />
                </View>

                {/* Préférences */}
                <Text style={styles.sectionLabel}>{t('notifications.preferences')}</Text>

                <View style={styles.group}>
                    <SettingRow
                        icon="exclamation-circle"
                        iconBg={color.errorLight}
                        iconColor={color.error}
                        title={t('notifications.urgentOnly.title')}
                        desc={t('notifications.urgentOnly.desc')}
                        active={urgentOnly}
                        control={renderSwitch('urgent_only', urgentOnly, setUrgentOnly)}
                    />
                </View>

                {/* Info footer */}
                <View style={styles.footer}>
                    <TabBarIcon name="lock" size={13} color={color.textLight} />
                    <Text style={styles.footerText}>
                        Vos préférences sont synchronisées sur tous vos appareils.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

function SettingRow({ icon, iconBg, iconColor, title, desc, active, control }: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    desc: string;
    active: boolean;
    control: React.ReactNode;
}) {
    return (
        <View style={rowStyles.row}>
            <View style={[rowStyles.iconBox, { backgroundColor: iconBg }]}>
                <TabBarIcon name={icon} size={17} color={iconColor} />
            </View>
            <View style={rowStyles.text}>
                <Text style={[rowStyles.title, !active && rowStyles.titleMuted]}>{title}</Text>
                <Text style={rowStyles.desc}>{desc}</Text>
            </View>
            {control}
        </View>
    );
}

const rowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: color.textMain,
        marginBottom: 2,
    },
    titleMuted: {
        color: color.textSecondary,
    },
    desc: {
        fontSize: 12,
        color: color.textLight,
        lineHeight: 16,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: color.surface,
        borderBottomWidth: 1,
        borderBottomColor: color.borderLight,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: color.textMain,
    },
    scroll: {
        paddingHorizontal: 16,
        paddingBottom: 48,
    },
    hero: {
        alignItems: 'center',
        paddingVertical: 28,
        gap: 8,
    },
    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: color.primaryGhost,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: color.textMain,
    },
    heroSub: {
        fontSize: 12,
        color: color.textSecondary,
        textAlign: 'center',
        lineHeight: 17,
        paddingHorizontal: 16,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: color.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 24,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    group: {
        backgroundColor: color.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: color.borderLight,
        overflow: 'hidden',
    },
    sep: {
        height: 1,
        backgroundColor: color.borderLight,
        marginLeft: 66,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
        marginTop: 32,
        paddingHorizontal: 16,
    },
    footerText: {
        fontSize: 11,
        color: color.textLight,
        textAlign: 'center',
        lineHeight: 15,
        flex: 1,
    },
});
