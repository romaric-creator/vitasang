import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { getData, storeData, removeData } from '@/utils/storage';
import { loginUser as apiLoginUser, sendAlert } from '@/services/user.service'; // Renommer pour éviter le conflit
import { usePostHog } from 'posthog-react-native';
import { setAuthToken } from '@/config/axiosConfig';
import { ANALYTICS_EVENT, AnalyticsEvent } from '@/services/analyticsService';

interface AuthContextType {
  isAuth: boolean | null;
  user: any | null;
  isLoading: boolean;
  signIn: (telephone: string, mot_de_passe: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeAuth: (user: any, token: string) => Promise<void>;
  updateUser: (user: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const posthog = usePostHog();

  useEffect(() => {
    // Écouter l'événement de déconnexion forcée (depuis axiosConfig)
    const logoutSubscription = DeviceEventEmitter.addListener('FORCE_LOGOUT', async () => {
      setAuthToken(null);
      await removeData('token');
      await removeData('user');
      posthog?.reset();
      setUser(null);
      setIsAuth(false);
    });

    // Écouter les événements de tracking globaux
    const analyticsSubscription = DeviceEventEmitter.addListener(ANALYTICS_EVENT, (event: AnalyticsEvent) => {
      if (posthog) {
        posthog.capture(event.name, event.properties);
      }
    });

    const checkAuthStatus = async () => {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      try {
        const [token, user] = await Promise.all([
          Promise.race([getData('token'), timeout]),
          Promise.race([getData('user'), timeout]),
        ]);
        if (token && user) {
          setAuthToken(token as string);
          posthog?.identify((user as any).id_utilisateur?.toString(), {
            nom: (user as any).nom,
            prenom: (user as any).prenom,
            role: (user as any).role
          });
          setUser(user);
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();

    return () => {
      logoutSubscription.remove();
      analyticsSubscription.remove();
    };
  }, [posthog]);

  const completeAuth = async (userData: any, token: string) => {
    try {
      setAuthToken(token);
      await storeData('token', token);
      
      const userToStore = {
        ...userData,
        id_utilisateur: userData.id || userData.id_utilisateur,
      };
      await storeData('user', userToStore);

      posthog?.identify(userToStore.id_utilisateur.toString(), {
        nom: userToStore.nom,
        prenom: userToStore.prenom,
        role: userToStore.role
      });

      setUser(userToStore);
      setIsAuth(true);
    } catch (error) {
      console.error("Complete auth failed:", error);
    }
  };

  const signIn = async (telephone: string, mot_de_passe: string) => {
    setIsLoading(true);
    posthog?.capture('login_started');
    try {
      const data = await apiLoginUser(telephone, mot_de_passe);
      await completeAuth(data.user, data.token);
      posthog?.capture('login_success', { role: data.user.role });

      // TRAITER L'ALERTE EN ATTENTE (Guest flow)
      try {
        const pendingAlert = await getData('pending_alert');
        if (pendingAlert) {
          await sendAlert(pendingAlert);
          await removeData('pending_alert');
        }
      } catch (e) {
        console.error("Erreur lors de l'envoi de l'alerte en attente:", e);
      }

    } catch (error: any) {
      console.error("Sign in failed:", error);
      posthog?.capture('login_failed', { error: error.message });
      setIsAuth(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: any) => {
    try {
      const userToStore = {
        ...userData,
        id_utilisateur: userData.id || userData.id_utilisateur,
      };
      await storeData('user', userToStore);
      setUser(userToStore);
    } catch (error) {
      console.error("Update user in context failed:", error);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      setAuthToken(null);
      await removeData('token');
      await removeData('user');
      posthog?.reset();
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, isLoading, signIn, signOut, completeAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
