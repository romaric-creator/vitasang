import React, { createContext, useContext, useEffect, useState } from 'react';
import { getData, storeData, removeData } from '@/utils/storage';
import { loginUser as apiLoginUser } from '@/services/user.service'; // Renommer pour éviter le conflit

interface AuthContextType {
  isAuth: boolean | null;
  isLoading: boolean;
  signIn: (telephone: string, mot_de_passe: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getData('token');
        setIsAuth(!!token); // true if token exists, false otherwise
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const signIn = async (telephone: string, mot_de_passe: string) => {
    setIsLoading(true);
    try {
      const data = await apiLoginUser(telephone, mot_de_passe);
      await storeData('token', data.token);
      const userToStore = {
        ...data.user,
        id_utilisateur: data.user.id || data.user.id_utilisateur,
      };
      await storeData('user', userToStore);
      setIsAuth(true);
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsAuth(false);
      throw error; // Re-throw to allow UI to handle specific login errors
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await removeData('token');
      await removeData('user');
      setIsAuth(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth, isLoading, signIn, signOut }}>
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
