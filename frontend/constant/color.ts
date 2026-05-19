export const color = {
  // ===== COULEURS VITALES (Sang & Urgence) =====
  primary: "#9E2016", // Rouge médical profond (Figma)
  primaryLight: "#C0392B", 
  primaryDark: "#410000", 
  primaryGhost: "#FFF1F2", // Fond d'alerte très léger

  // ===== COULEURS NEUTRES (Confiance & Propreté Clinique) =====
  secondary: "#1E293B", // Ardoise foncée (Neutre Professionnel)
  secondaryLight: "#F1F5F9", 
  secondaryDark: "#0F172A", 
  secondaryGhost: "#F8FAFC", 

  // Accentuation
  accent: "#2563EB", // Bleu médical standard (Optionnel)
  accentLight: "#EFF6FF",

  // Success/Stats
  success: "#16A34A",
  successLight: "#DCFCE7",
  successDark: "#14532D",

  // Warning (Ambre clinique)
  warning: "#D97706", 
  warningLight: "#FEF3C7",

  // ===== STRUCTURE & SURFACES (WhatsApp style: White/Light Gray) =====
  background: "#F9FAFB", // Gris neutre très léger (WhatsApp / iOS)
  screenBackground: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceContainer: "#F1F5F9", // MD3 alias sémantique
  surfaceDark: "#F1F5F9",
  surfaceHighlight: "#F9FAFB",
  inputBackground: "#F3F4F6",
  whatsapp: "#25D366",

  // ===== TEXTE (High Contrast) =====
  text: "#0F172A", 
  textMain: "#0F172A",
  textSecondary: "#475569", 
  textLight: "#94A3B8", 
  textWhite: "#FFFFFF",
  textMuted: "#94A3B8",

  // ===== BORDURES & ÉLÉMENTS =====
  border: "#E2E8F0", 
  borderLight: "#F1F5F9",
  borderDark: "#94A3B8", 

  // Shadows (Plus subtiles et neutres)
  shadow: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  shadowDark: "rgba(0, 0, 0, 0.12)",

  // ===== ÉTATS =====
  disabled: "#E2E8F0",
  disabledBg: "#F9FAFB",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  info: "#2563EB",
  infoLight: "#EFF6FF",

  // Dark Mode (Optionnel)
  darkBg: "#0F172A",
  darkSurface: "#1E293B",
  darkText: "#F8FAFC",

  // ===== CONSTANTES DE LAYOUT =====
  radius: {
    none: 0,
    s: 6,
    m: 10,
    l: 16,
    xl: 20,
    full: 9999,
  },

  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  shadows: {
    none: "none",
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 2px 8px rgba(0, 0, 0, 0.05)",
    md: "0 4px 12px rgba(0, 0, 0, 0.08)",
    lg: "0 12px 24px rgba(0, 0, 0, 0.12)",
    elevated: "0 20px 32px rgba(0, 0, 0, 0.1)",
  },

  timing: {
    microInteraction: 100,
    transition: 200,
    smooth: 350,
    reveal: 600,
  },
};
