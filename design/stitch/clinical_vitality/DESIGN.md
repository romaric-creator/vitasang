---
name: Clinical Vitality
colors:
  surface: '#f7f9ff'
  surface-dim: '#c9dcf3'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e3efff'
  surface-container-high: '#d9eaff'
  surface-container-highest: '#d1e4fb'
  on-surface: '#091d2e'
  on-surface-variant: '#59413d'
  inverse-surface: '#203243'
  inverse-on-surface: '#e8f2ff'
  outline: '#8d706c'
  outline-variant: '#e1bfb9'
  surface-tint: '#b02d21'
  primary: '#9e2016'
  on-primary: '#ffffff'
  primary-container: '#c0392b'
  on-primary-container: '#ffe5e1'
  inverse-primary: '#ffb4a9'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#7bf8a1'
  on-secondary-container: '#007239'
  tertiary: '#814000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a55400'
  on-tertiary-container: '#ffe6d8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4a9'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#8e130c'
  secondary-fixed: '#7efba4'
  secondary-fixed-dim: '#61de8a'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f7f9ff'
  on-background: '#091d2e'
  surface-variant: '#d1e4fb'
typography:
  screen-title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  section-title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 32px
---

## Brand & Style
The design system is anchored in a **Corporate/Modern** aesthetic with a clinical focus, designed to evoke trust, reliability, and biological urgency. It targets donors and medical staff, prioritizing a "clean-room" interface that minimizes cognitive load during critical tasks like finding donation centers or responding to urgent alerts.

The visual language balances the intensity of its primary "Blood Red" with vast amounts of white space and soft neutral surfaces. This creates a professional atmosphere that feels high-tech yet human-centric, ensuring the user feels capable and secure within a life-saving ecosystem.

## Colors
The palette is dominated by **#C0392B**, a deep red that signifies life and medical authority. This is balanced by a high-contrast foundation of pure white backgrounds and soft gray surfaces (#F5F5F5) to maintain a sterile, organized appearance.

Status colors are functionally mapped:
- **Success/Normal**: #27AE60 (Safe levels/completed actions).
- **Urgent**: #E67E22 (Immediate attention required).
- **Very Urgent**: #E74C3C (Critical shortages).

Text utilizes a deep navy-black (#2C3E50) for maximum legibility against light backgrounds, while secondary information uses a muted slate gray (#7F8C8D).

## Typography
This design system uses **Inter** for all roles to leverage its high legibility and systematic, professional character. 

Hierarchy is strictly maintained through weight and scale. Screen titles use bold weights with tight letter spacing to command attention, while body text remains regular weight for optimal reading comfort. Captions and labels utilize a slightly higher font weight (Medium/500) at smaller sizes to ensure they remain legible on mobile displays.

## Layout & Spacing
The layout follows a **fluid grid** model optimized for a 375px mobile viewport. It utilizes a 4-column structure with 16px gutters and 20px outer margins to ensure content is safely away from the device edges.

Spacing follows an 8px rhythmic scale. Vertical stacking of elements should primarily use 12px (small), 24px (medium), or 32px (large) increments to maintain a disciplined, organized structure common in medical software.

## Elevation & Depth
Hierarchy is established through **Tonal Layers** and extremely subtle **Ambient Shadows**. 

- **Level 0 (Background)**: #FFFFFF - Pure white for the main canvas.
- **Level 1 (Surface)**: #F5F5F5 - Light gray used for grouping sections or secondary containers.
- **Level 2 (Cards)**: #FFFFFF with a shadow (0px 4px 12px rgba(44, 62, 80, 0.08)). These are the primary interactive containers.

Avoid heavy blurs or colorful glows. The goal is to make elements look physically distinct and "placed" on the surface without creating visual noise.

## Shapes
The shape language is **Rounded**, using a varied corner radius strategy to distinguish between different element types:

- **Primary Inputs**: 8px (Soft) to feel technical and precise.
- **Buttons**: 12px (Rounded) to provide a friendly, touchable target.
- **Cards & Modal Sheets**: 16px (Rounded-LG) to create a modern, approachable container for dense information.

All badges and status indicators utilize a full "Pill" radius for maximum distinction from structural UI elements.

## Components

### Buttons
- **Primary**: #C0392B background, White text, 12px radius, 52px height. Center-aligned text with 600 weight.
- **Secondary**: Transparent background, #C0392B border (1px solid), 12px radius.

### Input Fields
- Height: 48px. 
- Border: 1px solid #E0E0E0. 
- Radius: 8px.
- Focus State: 2px solid #C0392B.

### Cards
- Background: #FFFFFF.
- Radius: 16px.
- Shadow: Light ambient shadow (8% opacity of Text Primary).
- Padding: 16px internal padding.

### Badges (Status)
- **Normal**: #27AE60 background (15% opacity), #27AE60 text.
- **Urgent**: #E67E22 background (15% opacity), #E67E22 text.
- **Very Urgent**: #E74C3C background (15% opacity), #E74C3C text.
- Shape: Pill-shaped (fully rounded).

### Navigation
- **Bottom Tabs**: 4 items (Accueil, Carte, Alertes, Profil).
- Active State: #C0392B icon and label.
- Inactive State: #7F8C8D icon and label.
- Background: Solid white with a 1px #F5F5F5 top border.