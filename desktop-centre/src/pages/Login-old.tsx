import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Heart,
  Droplet,
  Users,
  Zap,
  Plus,
} from "lucide-react";

const Login = () => {
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    if (!telephone.trim()) {
      setError("Le numéro de téléphone est requis");
      return false;
    }
    if (telephone.replace(/\D/g, "").length < 9) {
      setError("Numéro de téléphone invalide (minimum 9 chiffres)");
      return false;
    }
    if (!password.trim()) {
      setError("Le mot de passe est requis");
      return false;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        telephone: telephone.trim(),
        mot_de_passe: password,
      });

      if (response.data.success && response.data.token && response.data.user) {
        const userData: User = {
          ...response.data.user,
          telephone: response.data.user.telephone || telephone,
        };

        if (
          !userData.role ||
          !["personnel", "admin", "centre_manager"].includes(userData.role)
        ) {
          setError(
            "Accès réservé au personnel des centres. Veuillez vous connecter avec un compte autorisé.",
          );
          setLoading(false);
          return;
        }

        login(response.data.token, userData);
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.data.message || "Erreur de connexion");
      }
    } catch (err: any) {
      console.error("Erreur de connexion:", err);

      if (err.response?.status === 401) {
        setError("Numéro de téléphone ou mot de passe incorrect");
      } else if (err.response?.status === 404) {
        setError("Utilisateur non trouvé");
      } else if (err.response?.status === 403) {
        setError("Accès refusé. Compte non autorisé pour cette application.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === "Network Error") {
        setError(
          "Erreur de connexion réseau. Vérifiez votre connexion Internet.",
        );
      } else {
        setError("Une erreur est survenue lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: "4s" }}></div>
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }}></div>
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-red-600/10 rounded-full mix-blend-screen filter blur-3xl animate-blob" style={{ animationDelay: "2s", animationDuration: "8s" }}></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>

      {/* Main asymmetric layout */}
      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left side - Visual block (hidden on mobile) */}
          <div className="hidden lg:col-span-5 lg:flex flex-col justify-between h-full min-h-[500px] animate-slideDown">
            {/* Top visual element */}
            <div className="space-y-6">
              <div className="relative w-fit">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl blur-xl opacity-40"></div>
                <div className="relative p-4 bg-red-600 rounded-xl">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/4436/4436481.png" 
                    alt="Goutte de sang" 
                    className="w-10 h-10"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black text-white mb-2">
                  VitaSang
                </h1>
                <p className="text-lg text-red-200/80">Gestion du don de sang</p>
              </div>
            </div>

            {/* Nurses illustrations - Real photos */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300 h-64 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop" 
                      alt="Infirmière africaine" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="group">
                  <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300 h-64 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1609666171245-11d7f178fdd9?w=400&h=400&fit=crop" 
                      alt="Infirmière professionnelle" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center italic">
                Connecté aux professionnels de santé d'Afrique
              </p>
            </div>

            {/* Stats cards with hover effect */}
            <div className="space-y-4">
              <div className="group cursor-default">
                <div className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm hover:border-red-500/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-sm text-slate-400 mb-2">Donneurs</div>
                    <div className="text-4xl font-black text-white">10K+</div>
                  </div>
                </div>
              </div>
              <div className="group cursor-default">
                <div className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-sm text-slate-400 mb-2">Centres</div>
                    <div className="text-4xl font-black text-white">50</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom - Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full backdrop-blur-sm w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-200">Plateforme sécurisée</span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block lg:col-span-1 h-96">
            <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-600/50 to-transparent"></div>
          </div>

          {/* Right side - Form */}
          <div className="lg:col-span-6 flex flex-col justify-center animate-slideUp">
            {/* Mobile header */}
            <div className="lg:hidden mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative p-3 bg-red-600 rounded-lg">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black text-white">VitaSang</h1>
              </div>
            </div>

            {/* Form card */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-red-600/50 to-red-500/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-slate-900 rounded-2xl p-8 backdrop-blur-xl border border-slate-700/50">
                {/* Form header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white mb-1">Se connecter</h2>
                  <p className="text-slate-400 text-sm">Accédez à votre espace personnel</p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                {/* Form fields */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Phone input */}
                  <div className="group/field">
                    <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within/field:text-red-400 transition-colors">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      value={telephone}
                      onChange={(e) => {
                        setTelephone(e.target.value);
                        setError("");
                      }}
                      className="w-full px-5 py-3.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 hover:border-slate-600"
                      disabled={loading}
                    />
                  </div>

                  {/* Password input */}
                  <div className="group/field">
                    <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within/field:text-red-400 transition-colors">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full px-5 py-3.5 pr-12 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 hover:border-slate-600"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative mt-8 group/btn"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur opacity-75 group-hover/btn:opacity-100 group-disabled/btn:opacity-50 transition duration-300"></div>
                    <div className="relative px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover/btn:scale-[1.02] active:scale-95 group-disabled/btn:scale-100">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          Se connecter
                        </>
                      )}
                    </div>
                  </button>
                </form>

                {/* Info box */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-200">
                    <span>🔒</span>
                    Personnel des centres uniquement
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-500 mt-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
              © 2026 VitaSang • Tous droits réservés
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
