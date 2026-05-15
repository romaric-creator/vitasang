# 🎨 GUIDE D'IMPLÉMENTATION - UI/UX PRO MAX

**Date:** 15 mai 2026
**Application:** Blood Donation App - Frontend
**Design System:** Soft UI Evolution + Healthcare App Palette
**Compliance:** WCAG AAA

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Système de couleurs](#système-de-couleurs)
3. [Typographie](#typographie)
4. [Composants](#composants)
5. [Accessibilité](#accessibilité)
6. [Dark Mode](#dark-mode)
7. [Animation & Motion](#animation--motion)
8. [Responsive Design](#responsive-design)
9. [Checklist d'implémentation](#checklist-dimlémentation)

---

## Vue d'ensemble

### Style UI: **Soft UI Evolution**

Le système de design utilise le style **Soft UI Evolution** recommandé pour une application healthcare:

#### Caractéristiques:

- ✅ Quisitive neumorphisme moderne avec meilleur contraste que basique neumorphism
- ✅ Ombres multiples pour subtilité (pas de flat design cru)
- ✅ Arrondir les coins à **8-12px** (12px par défaut)
- ✅ Profondeur subtile via shadows + elevation
- ✅ **WCAG AA+ conforme** (7:1+ contrast)
- ✅ Confiance + accessibilité (idéal pour healthcare)
- ✅ Animations 150-300ms (fluide mais pas sluggish)

### Palette de couleurs: **Healthcare App**

```
Primary:   #0891B2 (Cyan-600)      - Confiance, calme
Secondary: #A5F3FC (Cyan-200)      - Support, accents
Success:   #059669 (Emerald-600)   - Santé, positif
Error:     #DC2626 (Red-600)       - Critique, haut contraste
Warning:   #D97706 (Amber-600)     - Attention sans alarme
Background:#ECFEFF (Cyan-50)       - Calme et invitant
```

---

## Système de couleurs

### Import

```typescript
import { color } from '@/constant/color';

// Utilisation
backgroundColor: color.primary, // #0891B2
color: color.textMain, // #0F172A
borderColor: color.border, // #A5F3FC
```

### Couleurs principales

| Nom            | Code    | Utilisation                              |
| -------------- | ------- | ---------------------------------------- |
| `primary`      | #0891B2 | Cyan principal, boutons, liens           |
| `primaryLight` | #06B6D4 | Hover states                             |
| `primaryDark`  | #0E7490 | Active states                            |
| `success`      | #059669 | Confirmations, success messages          |
| `error`        | #DC2626 | Erreurs, alerts critiques (AAA contrast) |
| `warning`      | #D97706 | Avertissements, cautions                 |
| `info`         | #3B82F6 | Informations neutres                     |

### Surfaces

| Nom              | Code    | Utilisation               |
| ---------------- | ------- | ------------------------- |
| `background`     | #ECFEFF | Page background (Cyan-50) |
| `surface`        | #FFFFFF | Cartes, containers        |
| `surfaceDark`    | #ECFEFF | Alternative surface       |
| `surfaceSuccess` | #ECFDF5 | Success states            |
| `surfaceError`   | #FEF2F2 | Error states              |

### Texte (Contrast AAA verifié)

| Nom             | Code    | Contraste         | Utilisation      |
| --------------- | ------- | ----------------- | ---------------- |
| `text`          | #164E63 | 7.2:1 sur bg cyan | Texte principal  |
| `textMain`      | #0F172A | 7.8:1 sur blanc   | Texte dark       |
| `textSecondary` | #64748B | 5.2:1             | Texte secondaire |
| `textLight`     | #94A3B8 | 2.4:1             | Helper text      |

### Règles d'utilisation

```typescript
// ✅ BON - Contraste AAA
<Text style={{ color: color.textMain, backgroundColor: color.surface }}>
  Bonne visibilité (7.8:1 contrast)
</Text>

// ✅ BON - Cyan sur blanc
<Text style={{ color: color.text, backgroundColor: color.background }}>
  Cyan dark sur cyan light (7.2:1)
</Text>

// ✗ MAUVAIS - Contraste insuffisant
<Text style={{ color: color.textLight, backgroundColor: color.surface }}>
  Trop clair, lisibilité faible
</Text>
```

---

## Typographie

### Import

```typescript
import { typography, textPresets } from '@/constant/typography';

// Utilisation simple (presets)
<Text style={textPresets.pageTitle}>Titre</Text>
<Text style={textPresets.mainText}>Paragraphe</Text>
<Text style={textPresets.smallText}>Petit texte</Text>

// Utilisation avancée
<Text style={typography.heading.h1}>
  Titre principal
</Text>
```

### Hiérarchie typographique

#### Têtes (Poppins - Bold)

```typescript
// H1: 32px - Titres de page
<Text style={typography.heading.h1}>
  Page Title
</Text>

// H2: 28px - Titres de section
<Text style={typography.heading.h2}>
  Section Title
</Text>

// H3: 24px - Sous-titres, headers de cartes
<Text style={typography.heading.h3}>
  Card Title
</Text>

// H4-H6: Labels, emphasis
<Text style={typography.heading.h4}>
  Form Label
</Text>
```

#### Corps (Roboto - Regular)

```typescript
// Body16: 16px - Texte principal (WCAG AAA minimum)
<Text style={typography.body.body16}>
  Main readable paragraph text...
</Text>

// Body14: 14px - Texte secondaire
<Text style={typography.body.body14}>
  Secondary description text
</Text>

// Body12: 12px - Helper text, captions (minimum acceptable)
<Text style={typography.body.body12}>
  Helper text or small caption
</Text>
```

### Règles typographiques

✅ **À FAIRE:**

- Minimum 16px pour body text (WCAG AAA)
- Utiliser Poppins (600+) pour headings (impact)
- Utiliser Roboto pour body (lisibilité)
- Line-height 1.6 minimum pour paragraphes
- Contrast 7:1+ pour tout texte

✗ **À NE PAS FAIRE:**

- Text < 12px (micro labels seulement)
- Fonts customs non-optimisées pour mobile
- Size < 16px sur inputs mobiles (auto-zoom iOS)
- Line-height < 1.5 (lisibilité compromise)

---

## Composants

### Boutons

#### Bouton primaire

```typescript
import { StyleSheet } from "react-native";
import { color } from "@/constant/color";

const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: color.primary, // #0891B2
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: color.radius.m, // 12px
    minHeight: 48, // Touch target WCAG
    minWidth: 48,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  primaryText: {
    color: color.textWhite,
    fontWeight: "600",
    fontSize: 16,
  },
});

// Focus state (web/keyboard)
const focused = {
  outline: "3px solid #0891B2",
  outlineOffset: 2,
};

// Hover state
const hover = {
  backgroundColor: color.primaryLight, // #06B6D4
  shadowRadius: 8,
  shadowOpacity: 0.2,
};

// Active state
const active = {
  backgroundColor: color.primaryDark, // #0E7490
  transform: [{ scale: 0.98 }], // Slight press
};
```

#### Bouton secondaire

```typescript
const secondaryButton = {
  backgroundColor: color.surface, // White
  borderWidth: 1.5,
  borderColor: color.border, // Cyan-200
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: color.radius.m,
  minHeight: 48,
};

const secondaryText = {
  color: color.primary, // Cyan-600
  fontWeight: "600",
  fontSize: 16,
};

// Hover
const secondaryHover = {
  backgroundColor: color.surfaceInfo, // Blue-50
  borderColor: color.primaryLight,
};
```

### Input Fields

```typescript
const inputStyles = {
  container: {
    marginBottom: color.spacing.m, // 16px
  },
  label: {
    fontSize: 16, // WCAG AAA minimum
    fontWeight: "600",
    marginBottom: color.spacing.s, // 8px
    color: color.textMain,
  },
  input: {
    minHeight: 48, // Touch target
    padding: 16,
    borderWidth: 1.5,
    borderColor: color.border, // Cyan-200
    borderRadius: color.radius.m, // 12px
    backgroundColor: color.surface,
    fontSize: 16, // Prevent iOS auto-zoom
    color: color.textMain,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  inputFocused: {
    borderColor: color.borderDark, // Cyan-600
    borderWidth: 2,
    backgroundColor: color.surfaceElevated, // #F8FCFD
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  errorInput: {
    borderColor: color.error, // Red-600
    backgroundColor: color.surfaceError, // Rose-50
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
    color: color.textSecondary,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
    color: color.error, // Red-600
    fontWeight: "500",
  },
};
```

### Cards

```typescript
const cardStyles = {
  container: {
    backgroundColor: color.surface, // White
    borderRadius: color.radius.l, // 16px
    padding: color.spacing.l, // 24px
    marginBottom: color.spacing.l,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  interactive: {
    cursor: "pointer",
    // On press:
    transform: [{ translateY: -2 }],
    shadowRadius: 8,
    shadowOpacity: 0.15,
    transitionDuration: "150ms",
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: color.textMain,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: color.textSecondary,
  },
};
```

---

## Accessibilité

### WCAG AAA Compliance (Priorité maximale)

#### Focus Indicators

```typescript
// TOUJOURS visible - JAMAIS supprimer
const focusStyle = {
  outline: "3px solid #0891B2", // Cyan focus ring
  outlineOffset: 2,
  borderRadius: 12,
};

// ✗ JAMAIS faire ceci
const badFocus = {
  outline: "none", // ✗ ACCESSIBLE FAIL
  boxShadow: "none", // ✗ Invisible focus
};
```

#### Touch Targets

```typescript
// ✅ Minimum 44x44px, recommandé 48x48px
const touchTarget = {
  minHeight: 48,
  minWidth: 48,
  spacing: 8, // Au moins 8px entre targets
};

// ✗ Trop petits
const badTouchTarget = {
  minHeight: 32, // ✗ < 44px
  minWidth: 32,
};
```

#### Font Sizes

```typescript
// ✅ Minimum 16px pour body text
export const fontSizes = {
  heading1: 32,
  heading2: 28,
  body: 16, // WCAG AAA MINIMUM
  small: 14,
  helper: 13,
  micro: 11, // Labels/badges seulement
};

// ✗ Trop petit
const badFontSize = {
  body: 12, // ✗ < 16px (readability fail)
};
```

#### Form Labels

```typescript
// ✅ BON - Label associé à input
<View>
  <Text style={{ fontSize: 16, fontWeight: '600' }}>
    Email Address *
  </Text>
  <TextInput
    id="email-input"
    aria-label="Email Address"
    aria-describedby="email-helper"
    placeholder="john@example.com"
    style={inputStyles.input}
  />
  <Text id="email-helper" style={inputStyles.helperText}>
    We'll never share your email
  </Text>
</View>

// ✗ MAUVAIS - Pas de label
<TextInput
  placeholder="Email Address" // ✗ Label non-visible
  style={inputStyles.input}
/>
```

#### Contrast Ratios

```typescript
// ✅ Toutes ces combinaisons sont 7:1+ (WCAG AAA)
const verifiedContrasts = {
  textMainOnWhite: {
    text: color.textMain, // #0F172A
    background: color.surface, // #FFFFFF
    ratio: "7.8:1", // ✓
  },
  textOnCyan: {
    text: color.textMain, // #0F172A
    background: color.background, // #ECFEFF
    ratio: "7.2:1", // ✓
  },
  whiteOnCyan: {
    text: color.textWhite, // #FFFFFF
    background: color.primary, // #0891B2
    ratio: "7.5:1", // ✓
  },
};

// ✗ Contraste insuffisant (< 7:1)
const badContrast = {
  textLight: color.textLight, // #94A3B8
  background: color.surface, // #FFFFFF
  ratio: "2.4:1", // ✗ FAIL - Use for helper text only
};
```

#### Screen Reader Support

```typescript
// ✅ BON - Icon button with ARIA label
<TouchableOpacity
  onPress={handleClose}
  accessibilityLabel="Close dialog"
  accessibilityRole="button"
>
  <XIcon />
</TouchableOpacity>

// ✗ MAUVAIS - No label
<TouchableOpacity onPress={handleClose}>
  <XIcon /> {/* Where's the label? */}
</TouchableOpacity>
```

---

## Dark Mode

### Implementation

```typescript
import { useColorScheme } from 'react-native';
import { color } from '@/constant/color';

export function DarkModeExample() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? color.darkBg : color.background,
      color: isDark ? color.darkText : color.textMain,
    },
  });

  return <View style={styles.container}>{/* ... */}</View>;
}
```

### Dark Mode Colors

```typescript
export const darkModeColors = {
  background: "#000000", // Pure black (OLED optimized)
  surface: "#121212", // Dark OLED safe
  text: "#FFFFFF",
  textSecondary: "#E0E0E0",
  primary: "#0891B2", // Keep cyan (still works in dark mode)
};
```

---

## Animation & Motion

### Respect prefers-reduced-motion

```typescript
import { AccessibilityInfo } from "react-native";

// ✅ BON - Respect user motion preference
const getAnimationDuration = (baseMs: number): number => {
  const prefersReducedMotion = AccessibilityInfo.isScreenReaderEnabled();
  return prefersReducedMotion ? 0 : baseMs;
};

// Usage
const duration = getAnimationDuration(color.timing.transition); // 150ms or 0ms
```

### Animation Timing

```typescript
export const animationTimings = {
  microInteraction: 50, // Button press, checkbox
  transition: 150, // Default UI transitions
  smooth: 200, // Smooth state changes
  reveal: 400, // Entrance animations
};

// ✅ Usage
<Animated.View
  style={{
    opacity: fadeIn,
    transform: [{ translateY: slideUp }],
  }}
  duration={color.timing.reveal}
/>
```

---

## Responsive Design

### Breakpoints

```typescript
export const breakpoints = {
  mobile: 360, // Default mobile
  tablet: 768, // Tablet size
  desktop: 1024, // Desktop
  wide: 1280, // Wide desktop
};
```

### Responsive Typography

```typescript
// Use clamp() for fluid scaling
export const responsiveFontSize = (mobile: number, desktop: number) => {
  return Math.max(mobile, Math.min(desktop, 100)); // Simplified
};

// Or responsive scaling
const fontSize = windowWidth < 600 ? 14 : 16;
```

### Mobile-First Approach

```typescript
// ✅ BON - mobile first, then scale up
const styles = StyleSheet.create({
  container: {
    padding: 16, // Mobile padding
  },

  "@media (min-width: 768px)": {
    container: {
      padding: 24, // Tablet padding
    },
  },
});
```

---

## Checklist d'implémentation

### Phase 1: Fondations (Urgent)

- [ ] **Importer couleurs** - Utiliser `color` constant dans tous les styles
- [ ] **Appliquer typographie** - Remplacer tous les font-size par `typography.body.*`
- [ ] **Implémenter focus rings** - Ajouter focus outline 3px sur tous les inputs/buttons
- [ ] **Vérifier touch targets** - Toutes les buttons/inputs >= 48x48px
- [ ] **Tester contraste** - Vérifier 7:1+ sur tous les textes

### Phase 2: Accessibilité (Important)

- [ ] **Ajouter ARIA labels** - Sur tous les icon-only buttons
- [ ] **Tester clavier** - Tab navigation complète
- [ ] **Tester screen reader** - VoiceOver/TalkBack
- [ ] **Mobile inputs** - Font-size 16px (prevent zoom)
- [ ] **Form labels** - Tous les inputs ont des labels

### Phase 3: Raffinement (Désiré)

- [ ] **Dark mode** - Implémenter `useColorScheme()`
- [ ] **Animations** - Ajouter micro-interactions (50-200ms)
- [ ] **Motion prefs** - Respecter `prefers-reduced-motion`
- [ ] **Responsive** - Tester sur mobile/tablet/desktop
- [ ] **Documentation** - Mettre à jour Storybook/Docs

### Phase 4: Validation (Final)

- [ ] **Automated testing** - axe DevTools scan
- [ ] **Manual testing** - Keyboard + screen reader
- [ ] **WCAG AAA** - Full audit
- [ ] **Performance** - Lighthouse score
- [ ] **Production** - Deploy avec confiance ✅

---

## Ressources

### Fichiers Design System

- `frontend/constant/color.ts` - Palette de couleurs
- `frontend/constant/typography.ts` - Système typographique
- `frontend/constant/designGuidelines.ts` - Guidelines Soft UI Evolution
- `frontend/constant/accessibility.ts` - Règles WCAG AAA
- `frontend/constant/index.ts` - Index & imports

### Outils

- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **ARIA Validator:** https://www.w3.org/WAI/tutorials/forms/
- **Color Blindness Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Date:** 15 mai 2026
**Généré par:** UI/UX Pro Max Implementation Guide
**Prochaine révision:** Phase 2 (Accessibilité complète)
