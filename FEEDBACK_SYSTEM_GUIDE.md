# Feedback & Toast System Guide

## Overview

The app uses a **unified toast system** to provide real-time feedback to users. Toasts are non-blocking notifications that appear at the top of the screen with animations and can auto-dismiss or require user interaction.

## System Architecture

### Toast Provider
- **File**: `frontend/context/ToastContext.tsx`
- **Mounting Location**: `frontend/app/_layout.tsx` (Root layout)
- **Lifecycle**: Persists throughout app lifetime
- **Mount Order**:
  ```jsx
  <Stack.Navigator>
    <ToastProvider>
      {/* All screens render here */}
    </ToastProvider>
  </Stack.Navigator>
  ```

### Toast Component
- **File**: `frontend/components/UnifiedToast.tsx`
- **Rendering**: Rendered at END of ToastProvider
- **Type**: Animated.View with spring animation
- **Position**: `position: absolute, top: 50` (below header)
- **Z-index**: High (implicit from rendering order)

### Toast Hook
- **File**: `frontend/hooks/useUnifiedToast.ts`
- **Purpose**: State management and queue handling
- **Methods**: 
  - `showToast(message, type, options)` - Generic
  - `success(message, options)` - Green toast
  - `error(message, options)` - Red toast
  - `warning(message, options)` - Yellow toast
  - `info(message, options)` - Blue toast

## Visual Specifications

### Toast Types & Colors

| Type | Background | Accent | Icon | Default Duration |
|------|-----------|--------|------|------------------|
| **success** | `#ECFDF5` | `#10B981` | check-circle | 3000ms |
| **error** | `#FEE2E2` | `#EF4444` | times-circle | 5000ms |
| **warning** | `#FEF3C7` | `#F59E0B` | exclamation-triangle | 4000ms |
| **info** | `#EFF6FF` | `#3B82F6` | info-circle | 3500ms |

### Layout Structure
```
┌─────────────────────────────────────┐
│                                     │
│  Accent Bar (4px left border)       │
│  ┌───────────────────────────────┐  │
│  │ ✓ Message Text       [Dismiss]│  │
│  │ [Optional Action Button]      │  │
│  └───────────────────────────────┘  │
│  Progress Bar (bottom, shows time)  │
│                                     │
└─────────────────────────────────────┘
```

### Animation
- **Entry**: Slide from top (-120px) + fade in over 300ms
- **Exit**: Fade out + slide up over 300ms
- **Progress Bar**: Linear animation shows remaining time

## Usage Examples

### Success Feedback
```typescript
import { useToast } from "@/context/ToastContext";

export function MyComponent() {
  const { success } = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      success("Données enregistrées avec succès!");
    } catch (error) {
      error(error.message);
    }
  };
  
  return <TouchableOpacity onPress={handleSave}>Enregistrer</TouchableOpacity>;
}
```

### Error with Retry Action
```typescript
const { error } = useToast();

try {
  await riskyOperation();
} catch (err) {
  error(err.message, {
    duration: 5000,
    action: {
      label: "Réessayer",
      onPress: () => retryOperation()
    }
  });
}
```

### Persistent Toast (No Auto-dismiss)
```typescript
const { info } = useToast();

info("Chargement en cours...", {
  persistent: true
});

// User must tap dismiss button or it stays until dismissed
```

### Custom Options
```typescript
success("Alert created!", {
  duration: 2000,  // Custom duration in milliseconds
  action: {
    label: "View",
    onPress: () => navigate("/alerts")
  }
});
```

## Alert System Integration

### When Donor Accepts Alert
**File**: `frontend/app/alert-response/[id].tsx` (line 105)

```typescript
if (response === "accepte") {
  // API call succeeds
  const refreshed = await getAlertStatus(Number(id));
  setAlertData(refreshed.alerte);
  setAlertStats(refreshed.stats);
  setHasAccepted(true);
  
  // Show success toast
  success(t("alertPublic.thankYou"));  // "Merci pour votre engagement!"
  
  // Transition to mission mode
}
```

**Toast Behavior**:
1. Green success toast appears at top
2. Message: "Merci pour votre engagement!"
3. Shows for 3 seconds automatically
4. User can dismiss manually by tapping X
5. Meanwhile, page transitions to mission mode (Call/WhatsApp/GPS actions)

### When Donor Declines
**File**: `frontend/app/alert-response/[id].tsx` (line 107)

```typescript
else {
  // No toast shown
  // Direct navigation back to home
  router.replace("/(tabs)");
}
```

### When API Error Occurs
**File**: `frontend/app/alert-response/[id].tsx` (line 110)

```typescript
catch (err: any) {
  error(err.message || t("common.error"));
  setIsResponding(false);
}
```

**Toast Behavior**:
1. Red error toast appears
2. Message: Error from backend or generic "Une erreur s'est produite"
3. Shows for 5 seconds
4. Page stays in accept/decline state for retry

## Frontend Trigger Points

### Success Toasts
| Event | Message | File | Line |
|-------|---------|------|------|
| Donor accepts alert | "Merci pour votre engagement!" | alert-response/[id].tsx | 105 |
| Alert created | "Alerte créée avec succès" | (tabs)/index.tsx | TBD |
| Donation confirmed | "Don enregistré" | alert-response/[id].tsx | 105 |

### Error Toasts
| Event | File | Trigger |
|-------|------|---------|
| API fails | alert-response/[id].tsx | catch block |
| Invalid input | home/LaunchAlertButton.tsx | validation |
| Network error | user.service.ts | axios error |

### Warning/Info Toasts
| Event | Message | Purpose |
|-------|---------|---------|
| No alerts found | "Aucune alerte urgente" | Informational |
| Location disabled | "Activez votre localisation" | Warning |

## Backend Push Notifications

These are **different** from toasts - they appear in device notification center:

### When Donor Receives Alert Notification
- **Type**: System push notification (outside app)
- **Title**: "Urgence Don de Sang"
- **Body**: "Besoin urgent de sang O+ à seulement 2 km de vous"
- **Tap Action**: Deep link → `alert-response/[id]`

### When Initiator Receives Donor Acceptance Notification (NEW)
- **Type**: System push notification (outside app)
- **Title**: "Donneur engagé!"
- **Body**: "Jean Dupont a accepté de donner du sang O+"
- **Tap Action**: Optional deep link → `alert-tracking/[id]`
- **Trigger**: Backend job when `respondToAlert()` succeeds

## Toast vs Push Notifications

| Feature | Toast | Push Notification |
|---------|-------|-------------------|
| **Location** | In-app, top of screen | Device notification center |
| **Trigger** | In-app action (button tap) | Backend event |
| **Dismissal** | Auto or manual tap | Tap or swipe |
| **Visibility** | Only if app open | Works even if app closed |
| **Animation** | Spring slide in | None |
| **Purpose** | Immediate feedback | Background updates |
| **Example** | "Alert accepted!" | "Donor just accepted your alert" |

## Styling & Customization

### Colors (Design System)
All colors defined in `frontend/constant/color.ts`:
```typescript
success: "#10B981",
error: "#EF4444",
warning: "#F59E0B",
info: "#3B82F6",
successLight: "#ECFDF5",
errorLight: "#FEE2E2",
warningLight: "#FEF3C7",
infoLight: "#EFF6FF",
```

### Custom Toast Style
To customize, modify `frontend/components/UnifiedToast.tsx`:
```typescript
const TOAST_CONFIG = {
  success: {
    bg: color.successLight,      // Background color
    accent: color.success,        // Border/icon color
    text: color.textMain,         // Text color
    textSecondary: "#065F46",     // Secondary text
    icon: "check-circle",         // Icon name
    defaultDuration: 3000,        // Auto-dismiss time
  },
  // ... other types
}
```

## Mobile Device Considerations

### Low-End Phones
- **Animation Performance**: Spring animations use `useNativeDriver: true` for 60fps
- **Memory**: Toast queue limits to prevent memory leaks
- **Battery**: Progress bar uses efficient Animated API

### High-End Phones
- Animations smooth at 120fps
- Multiple toasts can queue and display
- No performance degradation

## Testing Toast System

### Test Scenario 1: Verify Toast Displays
```typescript
// In app._layout.tsx temporarily add:
useEffect(() => {
  setTimeout(() => {
    success("Test toast!");
  }, 2000);
}, []);
```

### Test Scenario 2: Alert Acceptance Flow
1. Create alert (as initiator)
2. Switch to donor account
3. Tap alert notification
4. Tap "Accepter"
5. **Verify**: Green toast shows "Merci pour votre engagement!"
6. **Verify**: Toast auto-dismisses after 3 seconds
7. **Verify**: Page transitions to mission mode below toast

### Test Scenario 3: Error Handling
1. Manually edit alert endpoint to return error
2. Try to accept alert
3. **Verify**: Red toast appears with error message
4. **Verify**: Toast stays for 5 seconds
5. **Verify**: Accept/Decline buttons still functional for retry

## Common Issues

| Problem | Diagnosis | Solution |
|---------|-----------|----------|
| Toast doesn't appear | ToastProvider not mounted | Check app/_layout.tsx for `<ToastProvider>` |
| Toast invisible behind elements | Z-index issue | Move ToastProvider rendering to end (already done) |
| Multiple toasts stacking | Queue working correctly | Normal behavior - stacking shows all toasts |
| Toast doesn't disappear | Duration too long or persistent flag set | Check `persistent={false}` in component |
| Animation choppy on low-end | Performance issue | Check `useNativeDriver: true` setting |
| Touch behind toast | Pointer events issue | Add `pointerEvents: "box-none"` if needed |

## Implementation Checklist

- [x] ToastProvider mounted in root layout
- [x] UnifiedToast component created with animations
- [x] useUnifiedToast hook for state management
- [x] Context properly typed with methods
- [x] Colors match design system
- [x] Icons properly mapped to types
- [x] Auto-dismiss duration per type
- [x] Manual dismiss button with hitSlop
- [x] Progress bar shows remaining time
- [x] Action button optional support
- [x] Persistent toast support (no auto-dismiss)
- [x] All trigger points integrated

## Future Enhancements

- Add sound/vibration for alerts (via ExpoNotifications)
- Position customization (top, bottom, center)
- Swipe-to-dismiss gesture
- Dark mode styling variants
- Toast history/logging
- Analytics on toast interactions
- Localization of toast messages (currently uses i18n keys)
- Custom toast components (not just predefined types)
