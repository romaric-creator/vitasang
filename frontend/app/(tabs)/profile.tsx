import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { color } from "@/constant/color";
import { useUserProfile } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Constants from "expo-constants";
import { TabBarIcon } from "@/components/TabBarIcon";
import { updateDonorProfile } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";
import { PrimaryButton } from "@/components/PrimaryButton";

// --- Interfaces de Typage pour TypeScript ---
interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}

interface ActionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

const InfoItem = ({ icon, label, value, isLast }: InfoItemProps) => (
  <View style={[styles.infoItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.infoIconBox}>
      <TabBarIcon name={icon} size={18} color={color.textSecondary} />
    </View>
    <View style={styles.infoTextBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ActionItem = ({ icon, label, onPress, isLast }: ActionItemProps) => (
  <TouchableOpacity 
    style={[styles.actionItem, isLast && { borderBottomWidth: 0 }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionLeft}>
      <TabBarIcon name={icon} size={18} color={color.textMain} />
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
    <TabBarIcon name="chevron-right" size={14} color={color.textLight} />
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut, user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const userId = authUser?.id_utilisateur ?? authUser?.id ?? null;
  const profileQuery = useUserProfile(userId as number, !!userId);
  const loading = !userId || (profileQuery.isLoading && !profileQuery.data);
  const userData = profileQuery.data?.user;

  // ─── Toggle Disponibilité ─────────────────────────────────────
  const [disponible, setDisponible] = useState<boolean>(
    userData?.disponible ?? true
  );
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // Sync l'état initial quand userData charge
  React.useEffect(() => {
    if (userData?.disponible !== undefined) {
      setDisponible(!!userData.disponible);
    }
  }, [userData?.disponible]);

  const handleToggleAvailability = async () => {
    if (!userId || togglingAvailability) return;

    const newValue = !disponible;

    // Mise à jour optimiste (UX instantanée)
    setDisponible(newValue);

    setTogglingAvailability(true);
    try {
      await updateDonorProfile(userId as number, { disponible: newValue });
      success(
        newValue
          ? t("profile.availabilityUpdated") || "Vous êtes maintenant disponible ✓"
          : "Vous êtes maintenant indisponible"
      );
      // Rafraîchir les données du profil
      profileQuery.refetch();
    } catch (err) {
      // Rollback en cas d'erreur
      setDisponible(!newValue);
      showError("Erreur lors de la mise à jour de la disponibilité");
    } finally {
      setTogglingAvailability(false);
    }
  };
  // ──────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonLoader width={110} height={110} borderRadius={55} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="60%" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={16} />
      </View>
    );
  }

  const fullName = userData ? `${userData.prenom || ""} ${userData.nom || ""}`.trim() : t("profile.defaultUser");
  const donsCount = userData?.donsCount ?? 0;
  const alertesCount = userData?.alertesCount ?? 0;
  
  const profileImage = userData?.photo_profil
    ? {
        uri: userData.photo_profil.startsWith("http")
          ? userData.photo_profil
          : (Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL || "").replace("/api", "") + userData.photo_profil,
      }
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Material Design 3 */}
        <View style={styles.redHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
              accessibilityLabel="Retour"
            >
              <TabBarIcon name="arrow-left" size={20} color={color.textWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("profile.title") || "Profil"}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.avatarArea}>
            <View style={styles.avatarWrapper}>
              {profileImage ? (
                <Image source={profileImage} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{fullName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.editBadge}
                onPress={() => router.push("/edit-profile")}
                activeOpacity={0.8}
                accessibilityLabel="Modifier le profil"
              >
                <TabBarIcon name="pencil" size={12} color={color.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerName}>{fullName}</Text>
            <Text style={styles.headerRole}>
              {userData?.role === "medecin"
                ? t("profile.roleDoctor") || "Médecin"
                : t("profile.roleDonor") || "Donneur"}
            </Text>
            {userData?.groupe_sanguin ? (
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodBadgeText}>{userData.groupe_sanguin}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Stats Card flottante */}
        <View style={styles.statsCardContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{donsCount}</Text>
              <Text style={styles.statLabel}>{t("profile.donations") || "Dons"}</Text>
            </View>
            <View style={styles.statLine} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{alertesCount}</Text>
              <Text style={styles.statLabel}>{t("profile.alerts") || "Alertes"}</Text>
            </View>
          </View>
        </View>

        {/* Informations Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>{t("profile.informations") || "Informations"}</Text>
          <View style={styles.infoCard}>
            <InfoItem 
              icon="phone" 
              label={t("profile.phone") || "TÉLÉPHONE"} 
              value={userData?.telephone || t("common.notProvided") || "Non renseigné"} 
            />
            <InfoItem 
              icon="envelope-o" 
              label={t("profile.email") || "EMAIL"} 
              value={userData?.email || t("common.notProvided") || "Non renseigné"} 
            />
            <InfoItem 
              icon="tint" 
              label={t("profile.bloodGroup") || "GROUPE SANGUIN"} 
              value={userData?.groupe_sanguin || t("common.unknown") || "Inconnu"} 
            />
            <InfoItem
              icon="map-marker"
              label={t("profile.city") || "VILLE"}
              value={userData?.ville || userData?.region || "Cameroun"}
              isLast
            />
          </View>
        </View>

        {/* Statut Disponibilité — Toggle natif */}
        <View style={[styles.statusCard, togglingAvailability && { opacity: 0.7 }]}>
          <View style={styles.statusLeft}>
            <TabBarIcon
              name={disponible ? "heart" : "heart-o"}
              size={20}
              color={disponible ? color.primary : color.textSecondary}
            />
            <View>
              <Text style={[styles.statusText, !disponible && { color: color.textSecondary }]}>
                {disponible
                  ? t("profile.availableToDonate") || "Disponible pour donner"
                  : t("profile.unavailableStatus") || "Indisponible"}
              </Text>
            </View>
          </View>
          {togglingAvailability ? (
            <ActivityIndicator size="small" color={color.primary} />
          ) : (
            <Switch
              value={disponible}
              onValueChange={handleToggleAvailability}
              disabled={togglingAvailability}
              trackColor={{ false: color.borderLight, true: color.primary }}
              thumbColor={color.surface}
              accessibilityRole="switch"
              accessibilityState={{ checked: disponible }}
              accessibilityLabel={
                disponible
                  ? t("profile.availableToDonate") || "Disponible pour donner"
                  : t("profile.unavailableStatus") || "Indisponible"
              }
            />
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionHeading}>{t("profile.actions") || "Actions"}</Text>
          <View style={styles.actionsCard}>
            <ActionItem icon="history" label={t("profile.donationHistory") || "Historique des dons"} onPress={() => router.push("/historique")} />
            <ActionItem icon="calendar" label={t("profile.appointments") || "Mes rendez-vous"} onPress={() => router.push("/rendezvous")} />
            <ActionItem icon="check-circle-o" label={t("profile.eligibilityTest") || "Test d'éligibilité"} onPress={() => router.push("/eligibility-test")} />
            <ActionItem icon="bell-o" label={t("profile.notifications") || "Notifications"} onPress={() => router.push("/notifications-settings")} />
            <ActionItem icon="question-circle-o" label={t("profile.helpAdvice") || "Aide & Conseils"} onPress={() => router.push("/aide-et-conseil")} isLast />
          </View>
        </View>

        {/* Bouton Déconnexion */}
        <PrimaryButton
          title={t("profile.logout")}
          onPress={handleLogout}
          type="danger"
          style={styles.logoutBtn}
          accessibilityLabel={t("profile.logout")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  redHeader: {
    backgroundColor: color.primary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerTitle: {
    color: color.textWhite,
    fontSize: 20,
    fontWeight: "700",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  avatarArea: {
    marginTop: 10,
  },
  avatarWrapper: {
    position: "relative",
    zIndex: 10, // 2️⃣ Double sécurité pour l'avatar
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: color.surface,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: color.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: color.surface,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "bold",
    color: color.textWhite,
  },
  headerName: {
    color: color.textWhite,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  headerRole: {
    color: color.textWhite,
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.85,
    marginTop: 2,
  },
  bloodBadge: {
    marginTop: 10,
    backgroundColor: color.surface,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bloodBadgeText: {
    color: color.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  editBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: color.surface,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: color.border,
    elevation: 4,
    shadowColor: color.text,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 20, // Assure que le bouton crayon reçoit bien l'action "onPress"
  },
  statsCardContainer: {
    paddingHorizontal: 20,
    marginTop: -24,
    marginBottom: 24,
    zIndex: 1,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: color.surface,
    borderRadius: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: color.borderLight,
    shadowColor: color.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: color.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
  },
  statLine: {
    width: 1,
    height: "60%",
    backgroundColor: color.borderLight,
    alignSelf: "center",
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextBox: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: color.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: color.textMain,
  },
  statusCard: {
    marginHorizontal: 20,
    backgroundColor: color.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    color: color.textMain,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsCard: {
    backgroundColor: color.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: color.borderLight,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: color.textMain,
  },
  logoutBtn: {
    marginHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: color.background,
    justifyContent: "center",
    alignItems: "center",
  },
});