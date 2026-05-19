# Alert System End-to-End Guide

This document explains how the blood donation alert system works from creation through donor response and initiator notification.

## System Architecture

```
┌─ Alert Creation (Frontend)
│   ↓ POST /alerts
├─ Backend: Create Alert
│   ├─ Auto-validate if near center (status: en_cours)
│   └─ Or await manual validation (status: en_attente_validation)
│   ↓
├─ Notification Queue (BullMQ)
│   ├─ Job: sendAlert
│   ├─ Find compatible donors near location
│   └─ Send push notifications to donors
│   ↓
├─ Donor Receives Notification
│   ├─ Open alert via deep link → alert-response/[id]
│   ├─ View hero card with blood group, urgency, location
│   ├─ Optional: Check eligibility in modal
│   └─ Accept or Decline
│   ↓
├─ Donor Acceptance
│   ├─ POST /alerts/{id}/respond (response: "accepte")
│   ├─ Backend: respondToAlert()
│   │  ├─ Create/update LogNotification record
│   │  ├─ Check if required quantity reached
│   │  │  └─ If yes: Set alert status to "resolu"
│   │  └─ NEW: Queue initiator notification
│   │     └─ Job: sendInitiatorNotification
│   ↓
├─ Initiator Receives Real-time Push Notification
│   ├─ Title: "Donneur engagé!"
│   ├─ Body: "{DonorName} a accepté de donner du sang {BloodGroup}"
│   └─ Data: { type: "donor_accepted", alertId, donorName, groupe }
│   ↓
└─ Initiator Views Alert Tracking
    ├─ Open alert-tracking/[id] (automatic after creation)
    ├─ See live stats: total, accepted, read donors
    ├─ See donor details sorted by distance
    └─ Polls every 15 seconds for updates
```

## Frontend Pages

### 1. Alert Creation (Home Page)
- **File**: `frontend/app/(tabs)/index.tsx` + `components/home/LaunchAlertButton.tsx`
- **Purpose**: Initiator creates alert for emergency blood need
- **Flow**:
  1. User fills form: blood type, quantity, location, urgency
  2. Submits to backend
  3. Redirected to alert-confirmation splash screen
  4. Automatically opens alert-tracking/[id] after 2.5 seconds
  5. Shows live donor stats with polling

### 2. Alert Response (Donor View)
- **File**: `frontend/app/alert-response/[id].tsx`
- **Purpose**: Donor receives notification and responds
- **Modes**:

#### Before Acceptance
- **Hero Card**: Large blood group badge with urgency tag (pulsing animation)
- **Info Rows**: Location, quantity needed, patient info, description
- **Alert Stats**: Shows total notified, accepted, viewed donors (real-time)
- **Eligibility Check**: Optional 6-question modal for donor safety
- **Actions**:
  - "Accept" button → Triggers eligibility check or direct acceptance
  - "Decline" button → Returns to home

#### After Acceptance
- **Mission Mode**: Donor committed, show action items
- **Success Header**: Green checkmark with "You're a hero!" message
- **Recap Card**: Blood group, location, quantity recap
- **Contact Section**: Initiator name and avatar with:
  - Call button → `tel:` link
  - WhatsApp button → WhatsApp deep link
  - GPS button → Opens maps to location
- **Back Home**: Return to home after mission

### 3. Alert Tracking (Initiator View)
- **File**: `frontend/app/alert-tracking/[id].tsx`
- **Purpose**: Initiator monitors donor responses in real-time
- **Updates**: Polls `/alerts/{id}` every 15 seconds
- **Display**:
  - Alert recap (blood type, location, quantity, urgency)
  - Live stats: Total notified | Accepted | Viewed
  - Donor details list sorted by distance:
    - Donor name, status, distance, contact
  - Alert status: en_cours, resolu, en_attente_validation
- **After Alert Resolved**: Shows completion message

## Backend Services

### Alert Service (`backend/services/alert.service.js`)

#### `createAlert(alertData, initiatorId)`
- Validates alert data
- Creates alert record with status `en_attente_validation`
- Attempts auto-validation if near center
- Queues notification job if auto-validated
- Returns: `{ alerte, isAutoValidated }`

#### `validateAlert(alertId, validatorId)`
- Manual validation by health official
- Sets status to `en_cours`
- Queues notification to all compatible donors

#### `respondToAlert(alertId, userId, response)`
- **NEW**: Queues push notification to initiator when donor accepts
- Updates LogNotification record
- If accepted: Checks if quantity requirement met
- If met: Sets alert status to `resolu`
- Flow:
  ```javascript
  1. Update donor's response in LogNotification
  2. If response === "accepte":
     a. Fetch alert data
     b. Check required quantity
     c. If requirement met → Set status to "resolu"
     d. Queue initiator notification job
        - Title: "Donneur engagé!"
        - Body: "{DonorName} a accepté du sang {BloodGroup}"
  ```

#### `getAlertStatus(alertId)`
- Returns complete alert state with:
  - Alert info: groupe, statut, lieu, urgence, etc.
  - Stats: total notified, accepted, read
  - Donor details list with distance sorting
- Used by both donor view (for stats) and initiator view (for tracking)

### Notification Processor (`backend/jobs/notification.processor.js`)

#### Job: `sendAlert` (Default)
- Finds compatible donors near location using:
  1. Bounding box pre-filter (fast)
  2. Haversine distance calculation (precise)
  3. Blood compatibility check
- Builds push notifications with:
  ```json
  {
    "title": "Urgence Don de Sang",
    "body": "Besoin urgent de sang {group} à seulement {distance} km",
    "data": { "alertId", "groupe_sanguin", "distance" }
  }
  ```
- Creates LogNotification records for successful sends

#### Job: `sendMessageNotification`
- Handles private messages between users
- Sends to recipient with sender name

#### Job: `sendInitiatorNotification` (NEW)
- **Triggered**: When donor accepts alert
- **Receiver**: Alert initiator (creator)
- **Message**:
  ```json
  {
    "title": "Donneur engagé!",
    "body": "{DonorName} a accepté de donner du sang {BloodGroup}",
    "data": {
      "type": "donor_accepted",
      "alertId": number,
      "donorName": string,
      "groupe": string
    }
  }
  ```
- Only sends if initiator has push_token (registered device)

## Data Flow Sequence Diagram

```
Initiator          Frontend           Backend            Queue           Donors
   │                  │                 │                 │               │
   ├─ Create Alert ──→│                 │                 │               │
   │                  ├─ POST /alerts ──→│                 │               │
   │                  │                 ├─ Create Record  │               │
   │                  │                 ├─ Auto-validate? │               │
   │                  │                 ├─ Queue Job ─────→│               │
   │                  │                 │                 ├─ Find Donors ─→│
   │                  │                 │                 │   Send Push    │
   │                  │                 ├─ Return ID      │                │
   │                  │← Redirect ←─────│←────────────────│                │
   │                  ├─ Show Tracking  │                 │                │
   │                  ├─ Poll /alerts/{id}               │                │
   │
Donor 1                                  │                                 │
   │                                     │                  Notification   │
   │←────────────────────────────────────────────────────────────────────│
   ├─ Tap Notification                  │                 │               │
   ├─ Deep Link → alert-response/[id]   │                 │               │
   ├─ View Hero Card                    │                 │               │
   ├─ Accept                            │                 │               │
   │                  POST /alerts/{id}/respond (accepte)                 │
   │                  ├─ respondToAlert()                │               │
   │                  ├─ Update LogNotification          │               │
   │                  ├─ Check quantity                  │               │
   │                  ├─ Queue Initiator Notification ──→│               │
   │                  │                 │                 ├─ Send to Init. →
   │                  ├─ Show Toast ────→│                 │               │
   │                  ├─ Mission Mode                     │               │
   │                  ├─ Show Contact                     │               │
   │                  └─ Call/WhatsApp/GPS               │               │
   │
Initiator            └─ Receives Push Notification        │               │
   │                   (In real-time, not polling)        │               │
   │                   Title: "Donneur engagé!"           │               │
   │                   Body: "Donor Name a accepté..."    │               │
   │                   Can tap to open alert-tracking     │               │
   └─ OR polls tracking page every 15 seconds             │               │
```

## Key Data Structures

### Alert Record
```javascript
{
  id_alerte: number,
  groupe_requis: "O+", "O-", "B+", etc.
  degre_urgence: "TRES_URGENT" | "URGENT" | "NORMAL",
  lieu: string,
  latitude: number,
  longitude: number,
  rayon_action_km: number,
  quantite_requise: number,
  statut: "en_attente_validation" | "en_cours" | "resolu",
  id_initiateur: number,
  id_centre?: number,
  description?: string,
  nom_patient?: string,
  telephone_contact: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### LogNotification Record
```javascript
{
  id_notification: number,
  id_alerte: number,
  id_utilisateur: number,
  canal: "push",
  statut_reception: "reçu" | "lu" | "accepte" | "refuse" | "don_effectue",
  push_token?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Frontend Toast System

### Toast Provider Architecture
- **Location**: `frontend/context/ToastContext.tsx`
- **Mounted At**: Root layout (app/_layout.tsx) inside Stack.Navigator
- **Rendered**: At end of ToastProvider JSX
- **Positioning**: Absolute, top: 50 (below header)
- **Animations**: Spring animation for show/hide, progress bar for auto-dismiss

### Toast Trigger Points
1. **Donor Accepts Alert**:
   - `success(t("alertPublic.thankYou"))` 
   - Message: "Merci pour votre engagement!"
   - Shows when `respondToAlert` succeeds

2. **Donor Declines Alert**:
   - Router returns to home tab
   - No toast shown

3. **Errors**:
   - `error(err.message)` when API call fails
   - Shows error message for 5 seconds

### Toast Lifecycle
```
1. Call success/error/warning/info method
2. Toast queued in state with ID
3. ToastProvider renders UnifiedToast component
4. Component slides up with animation
5. Auto-dismisses after duration (unless persistent)
6. onClick dismiss button removes manually
7. Toast removed from state
```

## Testing the Alert Flow

### Test Scenario: Donor Accepts Alert
1. **Create Alert** (as initiator):
   - Open app, tap "Créer une Alerte"
   - Fill: O+, 2 poches, location, urgency
   - Submit
   - You're redirected to tracking page

2. **Receive as Donor** (different phone/account):
   - Wait for push notification
   - Tap notification → Opens alert-response/[id]
   - See hero card with blood type and urgency

3. **Verify Toast After Accept**:
   - Tap "Accepter"
   - Green toast appears: "Merci pour votre engagement!"
   - Toast animates from top, displays 3 seconds, auto-hides
   - Page transitions to mission mode

4. **Verify Initiator Notification**:
   - Go back to initiator device
   - Should receive push notification:
     - Title: "Donneur engagé!"
     - Body: "[Donor Name] a accepté de donner du sang O+"
   - Can tap to open alert-tracking page
   - OR: Manually poll tracking page to see stats update

### Debugging Checklist
- [ ] Push token registered on startup (check ExpoNotifications setup)
- [ ] ToastProvider mounted in root layout
- [ ] UnifiedToast renders with correct positioning
- [ ] Toast animations play smoothly
- [ ] Initiator push_token exists in database
- [ ] Backend jobs are processing (check logs)
- [ ] Deep links open correct screens
- [ ] Alert data properly populated with all fields
- [ ] Distance calculation works for donor sorting

## Environment Variables

```env
# Backend notifications
EXPO_PUSH_TOKEN_SERVER_URL=https://exp.host/--/api/v2/push/send

# Redis (if using)
REDIS_URL=redis://localhost:6379

# Notifications
NODE_ENV=production  # or development (skips night mode)
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Toast not visible | Not mounted in root layout | Verify ToastProvider wraps Stack.Navigator |
| Initiator not notified | No push_token registered | Ensure ExpoNotifications initialized on app start |
| Donors not found | Outside search radius | Adjust rayon_action_km or donor location |
| Alert status stuck | Transaction failed | Check database logs, restart queue worker |
| Distance calculation wrong | Coordinates in wrong format | Verify lat/long as numbers, not strings |
| Night mode silences alerts | NODE_ENV=production at night | Set NODE_ENV=development for testing |

## Production Checklist

- [ ] Push token registration working on all devices
- [ ] Toast animations smooth on low-end phones
- [ ] Database indexes on id_alerte, id_utilisateur, statut
- [ ] Redis connection pooled and resilient
- [ ] BullMQ worker process monitoring and alerting
- [ ] Error handling in notification processor
- [ ] Initiator notification queuing doesn't block donor response
- [ ] Deep links configured and tested
- [ ] Timezone handling correct in timestamps
- [ ] Rate limiting on alert creation endpoint
- [ ] Audit logging for all alert state changes
- [ ] Push notification payload encryption (if sensitive)
