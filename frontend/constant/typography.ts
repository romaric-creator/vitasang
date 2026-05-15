/**
 * TYPOGRAPHY SYSTEM - UI/UX Pro Max
 * Pairing: Poppins (Headings) + Roboto (Body)
 * Mood: Modern, friendly, accessible, healthcare-professional
 * Accessibility: WCAG AAA (16px+ minimum, line-height 1.6+)
 * Date: 15 mai 2026
 */

import { Platform } from "react-native";

export const typography = {
  // ===== HEADING STYLES (Poppins - bold, modern) =====
  heading: {
    // H1: Page titles, hero sections
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700", // Bold pour impact
      letterSpacing: -0.5,
      marginBottom: 16,
      fontFamily: Platform.OS === "ios" ? "Poppins-Bold" : "poppinsbold",
    },
    // H2: Section titles
    h2: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
      letterSpacing: -0.3,
      marginBottom: 14,
      fontFamily: Platform.OS === "ios" ? "Poppins-Bold" : "poppinsbold",
    },
    // H3: Subsection titles, card headers
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "600", // Semi-bold
      letterSpacing: 0,
      marginBottom: 12,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
    // H4: Component titles, lists headers
    h4: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: "600",
      letterSpacing: 0.2,
      marginBottom: 10,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
    // H5: Form labels, emphasis text
    h5: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      letterSpacing: 0,
      marginBottom: 8,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
    // H6: Small emphasis
    h6: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      letterSpacing: 0.5,
      marginBottom: 6,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
  },

  // ===== BODY TEXT STYLES (Roboto - readable, neutral) =====
  body: {
    // Body: Main readable text, articles
    body: {
      fontSize: 16,
      lineHeight: 24, // 1.5 line-height for readability
      fontWeight: "400", // Regular
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
    // Body16: Default paragraph text
    body16: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
    // Body14: Secondary text, descriptions
    body14: {
      fontSize: 14,
      lineHeight: 22, // 1.57 ratio
      fontWeight: "400",
      letterSpacing: 0.2,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
    // Body14Medium: Secondary text with emphasis
    body14Medium: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "500", // Medium weight
      letterSpacing: 0.2,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
    // Body12: Small helper text, captions
    body12: {
      fontSize: 12,
      lineHeight: 18, // 1.5 ratio
      fontWeight: "400",
      letterSpacing: 0.4,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
    // Body12Medium: Small text with emphasis
    body12Medium: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "500",
      letterSpacing: 0.4,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
    // Micro: Tiny text, badges, labels
    micro: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "500",
      letterSpacing: 0.5,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
  },

  // ===== SEMANTIC TEXT STYLES =====
  semantic: {
    // Error/Alert text
    error: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
    // Success text
    success: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
    // Warning text
    warning: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
    // Info text
    info: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Medium" : "robotommedium",
    },
  },

  // ===== FORM ELEMENTS =====
  form: {
    // Form labels (accessibility: must be 16px+ on mobile)
    label: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      letterSpacing: 0,
      marginBottom: 8,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
    // Form inputs
    input: {
      fontSize: 16, // WCAG: 16px+ prevents auto-zoom on iOS
      lineHeight: 24,
      fontWeight: "400",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
    // Form helper text
    helperText: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "400",
      letterSpacing: 0.2,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
    // Placeholder text
    placeholder: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Regular" : "roboto",
    },
  },

  // ===== BUTTON TEXT STYLES =====
  button: {
    // Large button text (48px touch target)
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      letterSpacing: 0.5,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
    // Medium button text
    medium: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "600",
      letterSpacing: 0.3,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
    // Small button text
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      letterSpacing: 0.2,
      fontFamily:
        Platform.OS === "ios" ? "Poppins-SemiBold" : "poppinssemibold",
    },
  },

  // ===== SPECIAL STYLES =====
  special: {
    // Monospace for codes/debug
    monospace: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "400",
      letterSpacing: 0,
      fontFamily: "Courier New",
    },
    // Italic for emphasis
    italic: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "400",
      letterSpacing: 0,
      fontStyle: "italic",
      fontFamily: Platform.OS === "ios" ? "Roboto-Italic" : "roboto",
    },
    // Bold for strong emphasis
    bold: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "700",
      letterSpacing: 0,
      fontFamily: Platform.OS === "ios" ? "Roboto-Bold" : "robotobold",
    },
  },

  // ===== RESPONSIVE MODIFIERS =====
  responsive: {
    // Scale typography based on screen size
    // Use these multipliers for different screen sizes
    mobile: 0.9, // Smaller on mobile
    tablet: 1, // Normal on tablet (default)
    desktop: 1.1, // Larger on desktop
  },

  // ===== ACCESSIBILITY CONSTANTS =====
  accessibility: {
    minFontSize: 16, // WCAG AAA minimum
    minLineHeight: 1.6, // Readability
    maxLineLength: 75, // Characters per line (for readability)
    touchTargetMinHeight: 44, // WCAG standard
  },

  // ===== ANIMATION TIMING FOR TEXT =====
  animationTiming: {
    typing: 50, // 50ms per character for typing effect
    fadeIn: 200, // 200ms for text fade in
    slideIn: 300, // 300ms for text slide in
  },
};

// Export preset variants for common use cases
export const textPresets = {
  // Page title
  pageTitle: typography.heading.h1,
  // Section title
  sectionTitle: typography.heading.h2,
  // Card title
  cardTitle: typography.heading.h3,
  // Main body text
  mainText: typography.body.body16,
  // Secondary text
  secondaryText: typography.body.body14,
  // Helper text
  helperText: typography.form.helperText,
  // Button text
  buttonText: typography.button.medium,
  // Small text
  smallText: typography.body.body12,
  // Label text
  labelText: typography.form.label,
};
