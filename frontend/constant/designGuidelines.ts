/**
 * DESIGN GUIDELINES - VitaSang Modern Healthcare
 * Style: Vibrant Health + Breathing UI
 * Accessibility: WCAG AA+ Compliant
 * Focus: Soft interaction, rounded corners, no hard borders
 * Date: 15 mai 2026
 */

import { color } from "./color";
import { typography } from "./typography";

export const designGuidelines = {
  // ===== MODERN HEALTHCARE CHARACTERISTICS =====
  healthcareUI: {
    description: "Breathing UI with teal trust accents and vibrant vitality red",
    characteristics: [
      "Soft shadows instead of borders",
      "Organic rounded corners (16px+)",
      "Vibrant but professional (Teal-600 focus)",
      "High whitespace for clarity",
      "Dynamic vitality red for alerts and primary actions",
      "Clean, distraction-free forms",
    ],
  },

  // ===== BUTTONS GUIDELINES (Vibrant & Tactile) =====
  buttons: {
    primary: {
      padding: { vertical: 14, horizontal: 28 },
      borderRadius: color.radius.m, // 16px
      backgroundColor: color.primary,
      textColor: color.textWhite,
      fontSize: 16,
      fontWeight: "800",
      minHeight: 56,
      shadowStyle: color.shadows.sm,

      states: {
        active: {
          backgroundColor: color.primaryDark,
          transform: "scale(0.96)", // Tactile response
          duration: color.timing.microInteraction,
        },
        hover: {
          backgroundColor: color.primaryLight,
          shadowStyle: color.shadows.md,
        },
      },
    },

    secondary: {
      padding: { vertical: 14, horizontal: 28 },
      borderRadius: color.radius.m,
      backgroundColor: color.secondaryGhost, // Light Teal background
      borderWidth: 0, // NO BORDERS
      textColor: color.secondary,
      fontSize: 16,
      fontWeight: "700",
      minHeight: 56,

      states: {
        active: {
          backgroundColor: color.border,
          duration: color.timing.microInteraction,
        },
      },
    },
  },

  // ===== INPUT FIELDS (Clean & Soft) =====
  inputs: {
    container: {
      marginBottom: color.spacing.m,
    },
    label: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
      color: color.secondaryDark,
      letterSpacing: 0.3,
    },
    input: {
      minHeight: 56,
      padding: 16,
      borderWidth: 1,
      borderColor: color.borderLight, // VERY SOFT BORDER
      borderRadius: color.radius.m, // 16px
      backgroundColor: color.surfaceDark, // Subtle gray background
      fontSize: 16,
      color: color.text,
      shadowStyle: "none",

      states: {
        focused: {
          borderColor: color.secondary, // Teal focus
          borderWidth: 1.5,
          backgroundColor: color.surface,
          shadowStyle: color.shadows.sm,
        },
        error: {
          borderColor: color.error,
          backgroundColor: color.errorLight,
        },
      },
    },
    placeholder: {
      color: color.textMuted,
    },
  },

  // ===== CARDS (Floating & Premium) =====
  cards: {
    container: {
      backgroundColor: color.surface,
      borderRadius: color.radius.l, // 24px
      padding: color.spacing.m,
      marginBottom: color.spacing.m,
      borderWidth: 0,
      shadowStyle: color.shadows.sm,

      states: {
        elevated: {
          shadowStyle: color.shadows.md,
        },
        interactive: {
          transform: "scale(1.02)", // Subtle organic growth
          duration: color.timing.transition,
        },
      },
    },
  },

  // ===== NAVIGATION =====
  navigation: {
    activeState: {
      color: color.secondary,
      fontWeight: "800",
    },
    bottomTab: {
      minHeight: 68,
      backgroundColor: color.surface,
      active: {
        color: color.secondary,
        iconSize: 28,
      },
      inactive: {
        color: color.textSecondary,
        iconSize: 24,
      },
    },
  },

  // ===== ANIMATIONS =====
  animations: {
    organic: {
      duration: color.timing.smooth,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)", // Premium fluid easing
    },
    quick: {
      duration: color.timing.transition,
      easing: "ease-out",
    },
  },
};

export type DesignGuidelinesType = typeof designGuidelines;
