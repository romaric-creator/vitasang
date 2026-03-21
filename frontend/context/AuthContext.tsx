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
      try {
        const token = await getData('token');
        const user = await getData('user');
        if (token && user) {
          setAuthToken(token);
          posthog?.identify(user.id_utilisateur?.toString(), {
            nom: user.nom,
            prenom: user.prenom,
            role: user.role
          });
          setUser(user);
        }
        setIsAuth(!!token); // true if token exists, false otherwise
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

  const signIn = async (telephone: string, mot_de_passe: string) => {
    setIsLoading(true);
    posthog?.capture('login_started');
    try {
      const data = await apiLoginUser(telephone, mot_de_passe);
      posthog?.capture('login_success', { role: data.user.role });
      setAuthToken(data.token);
      await storeData('token', data.token);
      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };
      await storeData('user', userToStore);

      // Identification PostHog
      posthog?.identify(userToStore.id_utilisateur.toString(), {
        nom: userToStore.nom,
        prenom: userToStore.prenom,
        role: userToStore.role
      });
      setUser(userToStore);

      // TRAITER L'ALERTE EN ATTENTE (Guest flow)
      try {
        const pendingAlert = await getData('pending_alert');
        if (pendingAlert) {
          console.log("Envoi de l'alerte en attente...");
          await sendAlert(pendingAlert);
          await removeData('pending_alert');
          console.log("Alerte en attente envoyée avec succès.");
        }
      } catch (e) {
        console.error("Erreur lors de l'envoi de l'alerte en attente:", e);
      }

      setIsAuth(true);
    } catch (error: any) {
      console.error("Sign in failed:", error);
      posthog?.capture('login_failed', { error: error.message });
      setIsAuth(false);
      throw error; // Re-throw to allow UI to handle specific login errors
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      setAuthToken(null);
      await removeData('token');
      await removeData('user');
      posthog?.reset(); // Réinitialiser PostHog
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth, user, isLoading, signIn, signOut }}>
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
