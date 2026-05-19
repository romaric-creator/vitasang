# Alert Response Page Guide

## What This Page Does

The **Alert Response Page** (`frontend/app/alert-response/[id].tsx`) is where donors view urgent blood alerts and decide whether to help. When they accept, they enter a special **mission mode** that guides them to complete the donation.

## Important: It's NOT a Redirect

When you tap "Accepter" and see the page change, **this is not navigation to a different page**. Instead:
- The same page component is still active
- Internal state changes: `hasAccepted = true`
- The JSX output completely changes to show mission mode
- Router history is NOT pushed (you can't use back button to see the old hero card)

This keeps donors focused on the donation mission without navigation complexity.

## Two Modes of the Same Page

### Mode 1: Before Acceptance (Hero Card View)
Shows alert details for donor decision

**What's Displayed:**
- Hero Card: Large blood type badge (pulsing animation) + urgency tag
- Info Rows:
  - Location icon + address + distance pill
  - Blood drop icon + quantity needed
  - Patient info + description
  - Optional: Why this type of blood?
- Alert Stats: How many donors were notified, accepted, viewed
- Action Buttons:
  - "Accepter" → Triggers eligibility check or direct acceptance
  - "Refuser" → Returns to home tab

**State Variables:**
```typescript
hasAccepted: false
isResponding: false  // API in progress
isEligibilityVisible: false  // Modal shown?
```

**User Journey:**
1. Tap "Accepter" button
2. Optional: See eligibility modal (6 safety questions)
3. Confirm acceptance
4. API call: `POST /alerts/{id}/respond`
5. Success: Toast shows "Merci pour votre engagement!"
6. State updates: `hasAccepted = true`
7. UI re-renders with mission mode

### Mode 2: After Acceptance (Mission Mode)
Guides donor to complete the donation

**What's Displayed:**
- Success Header: Green checkmark + "Vous êtes un héros!" message
- Mission Recap: Blood type, location, quantity needed
- Contact Section: Initiator info + action buttons:
  - **Call Button** → Opens phone dialer
    - Endpoint: `tel:{phone}`
    - Tap to call immediately
  - **WhatsApp Button** → Opens WhatsApp chat
    - Pre-filled message with blood type
    - Endpoint: `whatsapp://send?phone={phone}&text=...`
  - **GPS Button** → Opens maps app
    - Endpoint: `maps://` (iOS) or `geo://` (Android)
    - Shows location address
- Back Home: Button to return to home tab

**State Variables:**
```typescript
hasAccepted: true
alertData: { ... }  // Fully populated
initiatorName: string  // "Jean Dupont"
```

**User Journey:**
1. Page shows mission mode
2. Read requester info
3. Choose action: Call / WhatsApp / GPS
4. Complete donation at location
5. Return home when done

## Data Flow

### Fetching Alert Data
**On Page Load** (`useEffect` at line 67):
```typescript
const data = await getAlertStatus(Number(id));
// Returns:
{
  alerte: {
    id, groupe, statut, createdAt, lieu,
    latitude, longitude, urgence, quantite_requise,
    description, nom_patient, telephone_contact,
    initiateur: { id, nom, prenom, telephone }
  },
  stats: {
    total,      // Total donors notified
    accepte,    // Donors who accepted
    lu          // Donors who viewed
  },
  details: [    // Donor details with distance
    { donneur, statut, telephone, distance }
  ]
}
```

### Checking Current Donor's Response
**At line 74**:
```typescript
const myResponse = data.details?.find((d: any) => d.isMe) ?? null;
if (myResponse?.statut === "accepte" || myResponse?.statut === "don_effectue") {
  setHasAccepted(true);  // Auto-enter mission mode if refreshed
}
```

This handles the case where donor accepts, then refreshes the page. They should stay in mission mode.

### Submitting Acceptance
**On "Accepter" tap** (line 93):
```typescript
const handleResponse = async (response: "accepte" | "ignore") => {
  try {
    setIsResponding(true);
    await respondToAlert(Number(id), response);  // POST to backend
    
    if (response === "accepte") {
      analyticsService.trackEvent(...);  // Log acceptance
      setIsEligibilityVisible(false);     // Close modal if open
      const refreshed = await getAlertStatus(Number(id));  // Get fresh data
      setAlertData(refreshed.alerte);
      setAlertStats(refreshed.stats);
      setHasAccepted(true);  // SWITCH TO MISSION MODE
      success(t("alertPublic.thankYou"));  // Show toast
    } else {
      router.replace("/(tabs)");  // Go home if declined
    }
  } catch (err: any) {
    error(err.message);  // Show error toast
  } finally {
    setIsResponding(false);
  }
};
```

## Components & Styling

### Hero Card (Before Acceptance)
- **File**: Lines 256-265
- **Animation**: Pulsing scale animation (1 → 1.05 → 1)
- **Styling**: 
  - Border color matches urgency
  - Background: `color.surface`
  - Rounded corners: `color.radius.l`

### Info Rows Layout
- **File**: Lines 268-305
- **Pattern**: Icon | Label + Value | Optional Pill
- **Responsive**: Uses flex layout for wrapping

### Mission Header Success State
- **File**: Lines 170-176
- **Elements**:
  - Green circle with white checkmark
  - Success title from i18n
  - Success subtitle

### Contact Card
- **File**: Lines 196-229
- **Layout**: Avatar + Name | Action Buttons
- **Buttons**:
  - Call & WhatsApp in 2-column grid
  - GPS full-width below
- **Icon Colors**: White on colored backgrounds

## Styling Reference

### Colors Used
```typescript
// From color.constant.ts
urgency.color     // Error/Warning/Success based on urgency
urgency.bg        // Light background version
color.primary     // Action buttons (blue)
color.success     // Mission success state (green)
color.error       // Blood drop icon (red)
color.textMain    // Primary text
color.textSecondary // Secondary text
color.surface     // Card backgrounds
color.surfaceContainer // Light background sections
```

### Spacing
```typescript
color.spacing.s   // 8px (small gap)
color.spacing.m   // 12px (medium gap)
color.spacing.l   // 16px (large gap)
```

### Radius
```typescript
color.radius.s    // 6px (small pills)
color.radius.l    // 12px (large cards)
```

## Eligibility Check Modal

### Purpose
Ensures donor is healthy enough to donate before API call

### Questions Asked
```typescript
const questions = [
  "q1": "Avez-vous dîné aujourd'hui?",           // Must be yes
  "q2": "Vous sentiez-vous en bonne santé?",    // Must be yes
  "q3": "Avez-vous > 50 kg?",                   // Must be yes
  "q4": "Avez-vous une maladie chronique?",     // Must be no
  "q5": "Prenez-vous des antibiotiques?",       // Must be no
  "q6": "Avez-vous voyagé récemment?",          // Must be no
];
```

### Eligibility Logic (Line 56)
```typescript
const isEligible = 
  answers.q1 && answers.q2 && answers.q3 &&
  !answers.q4 && !answers.q5 && !answers.q6;
```

### Flow
1. Tap "Accepter" without modal already shown
2. Modal opens with questions
3. Donor can verify eligibility
4. If eligible: "Confirmer" button becomes enabled
5. Tap "Confirmer" → triggers `respondToAlert()`

## Handling Different Urgency Levels

The page dynamically styles based on urgency:

### TRÈS_URGENT (Red)
- Hero card border: Red (#EF4444)
- Urgency pill: Red background
- Icon: Dot pulsing red
- Implies immediate action needed

### URGENT (Orange)
- Hero card border: Orange (#F59E0B)
- Urgency pill: Orange background
- Icon: Dot pulsing orange
- Implies soon action needed

### NORMAL (Green)
- Hero card border: Green (#10B981)
- Urgency pill: Green background
- Icon: Dot pulsing green
- Implies routine action

## Testing This Page

### Test Case 1: View Hero Card
**Prerequisites**: Alert created, donor has notification
**Steps**:
1. Tap notification → Page opens
2. Verify blood type shows correctly
3. Verify location displays
4. Verify urgency tag matches alert urgency
5. Verify stats show (e.g., "12 notified, 3 accepted")

**Expected**: Hero card fully visible with pulsing animation

### Test Case 2: Accept with Eligibility Check
**Prerequisites**: Same as above
**Steps**:
1. Tap "Accepter"
2. Modal opens with 6 questions
3. Answer all questions as eligible:
   - q1: Yes (radio button)
   - q2: Yes
   - q3: Yes
   - q4: No
   - q5: No
   - q6: No
4. Tap "Confirmer"
5. Verify success toast appears
6. Wait for mission mode to render

**Expected**: Page switches to mission mode with contact section

### Test Case 3: View Mission Mode
**Prerequisites**: Acceptance completed
**Steps**:
1. Verify success header with checkmark
2. Read mission title and subtitle
3. Verify contact section shows initiator name
4. Tap "Appeler" → Phone dialer opens
5. Tap back
6. Tap "WhatsApp" → WhatsApp opens
7. Tap back
8. Tap "Itinéraire" → Maps opens
9. Tap "Retour" → Returns to home tab

**Expected**: All action buttons work, GPS shows location

### Test Case 4: Refresh Page in Mission Mode
**Prerequisites**: Acceptance completed, on mission mode
**Steps**:
1. Hard refresh (pull down refresh or close/reopen)
2. Page refetches alert data
3. Detects current user accepted
4. Re-enters mission mode automatically

**Expected**: Page shows mission mode immediately

### Test Case 5: Error Handling
**Prerequisites**: Alert ID invalid or network down
**Steps**:
1. Open page with invalid ID
2. Verify error state shows
3. Verify error message displayed
4. Tap "Retour" button
5. Returns to home tab

**Expected**: User-friendly error message with retry button

## Performance Notes

### Animations
- Hero card pulsing uses `useNativeDriver: true` for GPU acceleration
- Smooth on low-end phones (60fps minimum)

### Network
- Initial alert fetch: 1 API call
- Acceptance: 1 API call to respond + 1 API call to refresh data
- Mission mode: No additional calls (uses cached data)

### Memory
- Alert data stored in state (small payload)
- Eligibility answers stored in state (small object)
- Toast managed separately (doesn't impact this page)

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Page shows blank error | Alert ID invalid | Check deep link has correct ID |
| Hero card not pulsing | Animation disabled | Check Animated.View rendering |
| Mission mode won't show | State not updating | Check `handleResponse` success path |
| Contact buttons don't work | Deep links not configured | Verify Linking.openURL permissions |
| Toast doesn't show | ToastContext issue | Verify ToastProvider mounted |
| Distance calculation wrong | Coordinates malformed | Check data from backend |
| Eligibility modal stuck | State not synchronizing | Verify `confirmed Eligibility` effect |

## Code Locations

| Feature | File | Line |
|---------|------|------|
| Component export | alert-response/[id].tsx | 36 |
| Urgency styling | - | 25-34 |
| Data fetching | - | 67-85 |
| Acceptance handler | - | 93-114 |
| Hero card rendering | - | 256-265 |
| Mission mode rendering | - | 165-238 |
| Contact section | - | 196-229 |
| GPS handler | - | 126-134 |
| WhatsApp handler | - | 121-124 |
| Phone handler | - | 116-119 |
| Eligibility modal | - | TBD |
| Toast on success | - | 105 |
| Toast on error | - | 110 |

## Summary

The Alert Response page is a **single component with two visual states**:
1. **Hero card state** (before acceptance): Shows alert info and decision buttons
2. **Mission mode state** (after acceptance): Guides donor to complete donation

When user taps "Accepter", the same page switches from state 1 to state 2 via state update, not navigation. This creates a seamless flow while remaining on the same screen component. After completion, the donor can tap "Retour" to go home or receive push notification about next steps.
