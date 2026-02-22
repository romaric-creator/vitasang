import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ThemedView";
import { TabBarIcon } from "@/components/TabBarIcon";
import { color } from "@/constant/color";
import { profileItems } from "@/data/profileData";
import { getData, removeData, getUserIdFromStorage } from "@/utils/storage";
import { getUserProfile } from "@/services/user.service";
import { useRouter } from "expo-router";

const ProfileItem = ({ icon, label }: { icon: string; label: string }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuLeft}>
      <View style={styles.iconContainer}>
        <TabBarIcon name={icon as any} size={20} color={color.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <TabBarIcon name="chevron-right" size={18} color={color.textLight} />
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await getUserIdFromStorage();
        if (userId) {
          const res = await getUserProfile(userId);
          if (res.success) setUserData(res.user);
        }
      } catch (error) {
        console.error("Erreur chargement profil :", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await removeData("token");
          await removeData("user");
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  const fullName = userData
    ? `${userData.prenom || ""} ${userData.nom || ""}`.trim()
    : "Utilisateur";
  const bloodType = userData?.groupe_sanguin || "—";
  const donsCount = userData?.donsCount ?? 0;
  const alertesCount = userData?.alertesCount ?? 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mon Profil</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <TabBarIcon name="user" size={60} color={color.textWhite} />
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <TabBarIcon name="edit" size={14} color={color.textWhite} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{fullName}</Text>
          <View style={styles.bloodBadge}>
            <TabBarIcon name="heart" size={14} color={color.primary} />
            <Text style={styles.bloodText}>Groupe {bloodType}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donsCount}</Text>
            <Text style={styles.statLabel}>Dons</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{alertesCount}</Text>
            <Text style={styles.statLabel}>Alertes</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Paramètres</Text>
        <View style={styles.menuContainer}>
          {profileItems.map((item, index) => (
            <ProfileItem key={index} icon={item.icon} label={item.label} />
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <TabBarIcon name="sign-out" size={20} color={color.primary} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: color.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: color.textMain,
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 18,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: color.dangerLight,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: color.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: color.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 12,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: color.dangerLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bloodText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: color.surface,
    borderRadius: 16,
    marginBottom: 28,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: color.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: color.textSecondary,
    fontWeight: "600",
  },
  dividerVertical: {
    width: 1,
    backgroundColor: color.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: color.textSecondary,
    marginBottom: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  menuContainer: {
    gap: 10,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: color.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    backgroundColor: color.surface,
    padding: 10,
    borderRadius: 10,
  },
  menuLabel: {
    fontSize: 14,
    color: color.textMain,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  logoutText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});
