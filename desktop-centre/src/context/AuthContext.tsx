import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

// Enhanced Auth Types with Centre information
interface Centre {
  id_centre: string | number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
}

interface User {
  id_utilisateur?: string | number;
  nom: string;
  prenom: string;
  email?: string;
  telephone: string;
  role: "personnel" | "admin" | "centre_manager";
  centre?: Centre;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Check local storage for existing session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    validateToken();
    setLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    // Can be used to clear error messages if needed
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        login,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
