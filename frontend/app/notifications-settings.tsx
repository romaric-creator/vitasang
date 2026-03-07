import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Switch,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import ThemedView from '@/components/ThemedView';
import { PageHeader } from '@/components/PageHeader';
import { color } from '@/constant/color';
import { TabBarIcon } from '@/components/TabBarIcon';

import { useTranslation } from 'react-i18next';

export default function NotificationsSettings() {
    const { t } = useTranslation();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [urgentOnly, setUrgentOnly] = useState(false);

    return (
        <ThemedView style={styles.container}>
            <PageHeader title={t('notifications.title')} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Text style={styles.sectionTitle}>{t('notifications.channels')}</Text>

                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                <TabBarIcon name="bell-o" size={18} color="#2196F3" />
                            </View>
                            <View>
                                <Text style={styles.settingTitle}>{t('notifications.push.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.push.desc')}</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: color.primary }}
                            thumbColor={'#ffffff'}
                            onValueChange={setPushEnabled}
                            value={pushEnabled}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                                <TabBarIcon name="envelope-o" size={18} color="#4CAF50" />
                            </View>
                            <View>
                                <Text style={styles.settingTitle}>{t('notifications.email.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.email.desc')}</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: color.primary }}
                            thumbColor={'#ffffff'}
                            onValueChange={setEmailEnabled}
                            value={emailEnabled}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                                <TabBarIcon name="commenting-o" size={18} color="#FF9800" />
                            </View>
                            <View>
                                <Text style={styles.settingTitle}>{t('notifications.sms.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.sms.desc')}</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: color.primary }}
                            thumbColor={'#ffffff'}
                            onValueChange={setSmsEnabled}
                            value={smsEnabled}
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('notifications.preferences')}</Text>

                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: color.dangerLight }]}>
                                <TabBarIcon name="exclamation-circle" size={18} color={color.primary} />
                            </View>
                            <View>
                                <Text style={styles.settingTitle}>{t('notifications.urgentOnly.title')}</Text>
                                <Text style={styles.settingDesc}>{t('notifications.urgentOnly.desc')}</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: color.primary }}
                            thumbColor={'#ffffff'}
                            onValueChange={setUrgentOnly}
                            value={urgentOnly}
                        />
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
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: color.border,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
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
        backgroundColor: color.border,
        marginVertical: 10,
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
