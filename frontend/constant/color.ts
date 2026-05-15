/**
 * DESIGN SYSTEM - VitaSang Modern Healthcare & Vitality
 * Style: Vibrant Health + Professional Trust
 * Palette: Vital Red (#F43F5E) & Healthcare Teal (#0D9488)
 * Règles: No hard borders, soft shadows, breathing whitespace
 * Date: 15 mai 2026
 */

export const color = {
  // ===== COULEURS VITALES (Sang & Énergie) =====
  primary: "#F43F5E", // Rose-500 (Plus vivant que le rouge sang classique)
  primaryLight: "#FB7185", // Rose-400
  primaryDark: "#E11D48", // Rose-600
  primaryGhost: "#FFF1F2", // Rose-50 (Fond très léger)

  // ===== COULEURS SANTÉ (Confiance & Professionnalisme) =====
  secondary: "#0D9488", // Teal-600 (Sérieux mais frais)
  secondaryLight: "#14B8A6", // Teal-500
  secondaryDark: "#0F766E", // Teal-700
  secondaryGhost: "#F0FDFA", // Teal-50 (Fond apaisant)

  // Accent: Sky Blue (Pour l'aspect technologique/moderne)
  accent: "#0EA5E9", // Sky-500
  accentLight: "#F0F9FF", // Sky-50

  // Success: Nature Green
  success: "#10B981", 
  successLight: "#ECFDF5",
  successDark: "#047857",

  // Warning: Sun Amber
  warning: "#F59E0B",
  warningLight: "#FFFBEB",

  // ===== COULEURS DE FOND & SURFACES (Clean & Breathing) =====
  background: "#F8FAFC", // Gris bleuté très clair (Ultra propre)
  screenBackground: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceDark: "#F1F5F9",
  surfaceHighlight: "#F0FDFA", // Teinte teal légère

  // ===== TEXTE (High Legibility, No Pure Black) =====
  text: "#0F172A", // Slate-900 (Très sombre mais pas noir pur)
  textMain: "#1E293B", // Slate-800
  textSecondary: "#64748B", // Slate-500
  textLight: "#94A3B8", // Slate-400
  textWhite: "#FFFFFF",
  textMuted: "#CBD5E1",

  // ===== ÉLÉMENTS SANS BORDURES DURES =====
  border: "#E2E8F0", // Gris très doux
  borderLight: "#F1F5F9",
  borderDark: "#0D9488", // Teal pour le focus (confiance)
  divider: "#F1F5F9",

  // Shadows (Modern Floating Depth)
  shadowLight: "rgba(13, 148, 136, 0.04)",
  shadow: "rgba(13, 148, 136, 0.08)",
  shadowMedium: "rgba(0, 0, 0, 0.05)",
  shadowDark: "rgba(0, 0, 0, 0.1)",

  // ===== ÉTATS & INTERACTIONS =====
  disabled: "#E2E8F0",
  disabledBg: "#F8FAFC",
  error: "#F43F5E",
  errorLight: "#FFF1F2",
  danger: "#F43F5E",

  // Dark Mode (Modern Night)
  darkBg: "#0F172A",
  darkSurface: "#1E293B",
  darkText: "#F8FAFC",

  // ===== LAYOUT CONSTANTS (Modern Rounded) =====
  radius: {
    none: 0,
    s: 10,
    m: 16, // Plus rond = plus amical/moderne
    l: 24,
    xl: 32,
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

  // shadows
  shadows: {
    none: "none",
    xs: "0 2px 4px rgba(13, 148, 136, 0.04)",
    sm: "0 4px 12px rgba(13, 148, 136, 0.06)",
    md: "0 10px 20px rgba(13, 148, 136, 0.08)",
    lg: "0 20px 30px rgba(13, 148, 136, 0.12)",
    elevated: "0 8px 16px rgba(0, 0, 0, 0.05)",
  },

  timing: {
    microInteraction: 100,
    transition: 250,
    smooth: 400,
    reveal: 700,
  },
};


