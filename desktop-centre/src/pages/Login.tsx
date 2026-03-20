import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { Eye, EyeOff, AlertCircle, Loader2, Heart, Phone, Lock } from "lucide-react";

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
          !["personnel", "admin"].includes(userData.role)
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Visual Hero Section */}
          <div className="hidden lg:flex flex-col justify-between space-y-8 animate-slideDown">
            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-slate-900">
                    VitaSang
                  </h1>
                  <p className="text-lg text-slate-600 font-semibold">
                    Gestion médicale
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Nurses */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">
                Professionnels de santé en ligne
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Gestion centralisée des dons de sang. Connectez-vous et sauvez
                des vies.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="group relative h-96 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Personnel médical"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent group-hover:from-slate-900/60 transition-colors duration-300"></div>
                </div>
                <div className="group relative h-96 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1524721696987-4879d41569d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Don de sang"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent group-hover:from-slate-900/60 transition-colors duration-300"></div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-slate-600 font-semibold">
                  Donneurs
                </div>
                <div className="text-3xl font-black text-red-600 mt-2">
                  10K+
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-slate-600 font-semibold">
                  Centres
                </div>
                <div className="text-3xl font-black text-blue-600 mt-2">50</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-slate-600 font-semibold">
                  Actif
                </div>
                <div className="text-3xl font-black text-green-600 mt-2">
                  24/7
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form Section */}
          <div className="flex items-center justify-center animate-slideUp">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-8 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4436/4436481.png"
                    alt="VitaSang"
                    className="w-6 h-6"
                  />
                </div>
                <h1 className="text-3xl font-black text-slate-900">VitaSang</h1>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100">
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">
                    Connexion
                  </h2>
                  <p className="text-slate-600">
                    Accédez à votre espace professionnel
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-100 border border-red-300 rounded-xl animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Phone */}
                  <div className="group">
                    <label
                      htmlFor="telephone"
                      className="block text-sm font-medium text-slate-700 group-focus-within:text-red-600 transition-colors duration-200 mb-2"
                    >
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 w-5 h-5 transition-colors duration-200" />
                      <input
                        type="tel"
                        id="telephone"
                        placeholder="6XXXXXXXX"
                        value={telephone}
                        onChange={(e) => {
                          setTelephone(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 placeholder:text-slate-400 transition-all duration-200 bg-slate-50 hover:bg-white text-slate-800"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 group-focus-within:text-red-600 transition-colors duration-200 mb-2"
                    >
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 w-5 h-5 transition-colors duration-200" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 placeholder:text-slate-400 transition-all duration-200 bg-slate-50 hover:bg-white text-slate-800"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
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

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        <span>Se connecter</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <p className="text-xs text-center text-slate-500">
                  © 2026 VitaSang • Tous droits réservés
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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

        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
