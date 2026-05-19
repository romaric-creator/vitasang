# Quick Test Guide - Alert System End-to-End

**Goal**: Verify the complete alert flow works: create → notify → respond → confirmation

**Time**: ~10 minutes per test
**Requirements**: 2 devices/accounts or emulator + physical phone

---

## Test 1: Basic Alert Creation & Notification

### Setup
- Create 2 user accounts (if not already done)
  - Account A: Role = "Agent de Centre" (Initiator)
  - Account B: Role = "Donneur" (Donor)
- Verify Account B has push notifications enabled
- Verify Account B has location enabled

### Steps

1. **Login as Account A (Initiator)**
   - Navigate to home page
   - Verify "Créer une Alerte" button visible

2. **Create Alert**
   - Tap "Créer une Alerte"
   - Fill form:
     - Groupe sanguin: O+
     - Quantité: 2 poches
     - Lieu: [Your location]
     - Urgence: URGENT
   - Tap "Créer"
   - **Verify**: Redirected to alert-tracking page
   - **Verify**: Alert tracking page shows stats (0 accepted, 0 read initially)
   - **Verify**: Page title shows alert ID

3. **Check Donor Received Notification**
   - Switch to Account B device
   - **Verify**: Push notification received
     - Title: "Urgence Don de Sang"
     - Body: "Besoin urgent de sang O+ à seulement X km de vous"
   - **Do NOT tap yet** (we'll test that next)

---

## Test 2: Toast Feedback System

### Prerequisites
- Completed Test 1
- Have alert notification on donor device

### Steps

1. **Tap Notification**
   - On donor device, tap the push notification
   - **Verify**: Opens alert-response page
   - **Verify**: Hero card displays
     - O+ badge pulsing
     - URGENT tag visible
     - Location shows
     - Stats show (e.g., "14 notified")

2. **View Hero Card Details**
   - Scroll down to view all info rows
   - **Verify**: Location row with distance
   - **Verify**: Quantity row showing "2 poches"
   - **Verify**: No errors or loading states

3. **Accept Alert**
   - Tap "Accepter" button
   - **Wait for modal** (eligibility check)
   - For simplicity, answer all "Yes" (or appropriate "No")
   - Tap "Confirmer"
   - **VERIFY TOAST APPEARS**:
     - ✓ Green toast at top
     - ✓ Message: "Merci pour votre engagement!"
     - ✓ Toast displays for ~3 seconds
     - ✓ Toast auto-dismisses (no manual dismiss needed)
   - **VERIFY PAGE TRANSITION**:
     - ✓ Page changes to mission mode
     - ✓ Green checkmark visible
     - ✓ "Vous êtes un héros!" message
     - ✓ Contact section shows initiator name
     - ✓ Call/WhatsApp/GPS buttons visible

---

## Test 3: Mission Mode Actions

### Prerequisites
- Completed Test 2 (in mission mode)

### Steps

1. **Call Button**
   - Tap "Appeler" button
   - **Verify**: Phone dialer opens
   - **Verify**: Shows correct phone number
   - Don't actually call (unless you want to!)

2. **WhatsApp Button**
   - Tap back (or close dialer)
   - Tap "WhatsApp" button
   - **Verify**: WhatsApp app opens (or web if not installed)
   - **Verify**: Phone number pre-filled
   - **Verify**: Message includes blood type "O+"

3. **GPS Button**
   - Tap back (or close WhatsApp)
   - Tap "Itinéraire" button
   - **Verify**: Maps app opens
   - **Verify**: Location marked on map
   - **Verify**: Address matches alert location

4. **Back Home**
   - Close maps app
   - Tap "Retour à l'accueil" button
   - **Verify**: Returns to home tab
   - **Verify**: Not showing mission mode anymore

---

## Test 4: Initiator Real-time Notification

### Prerequisites
- Completed Test 3
- Both devices side-by-side
- Account A still on alert-tracking page

### Steps

1. **Check Initiator Stats (Before)**
   - On initiator device, view alert-tracking page
   - **Note**: Stats show
     - Total notified: ~14
     - Accepted: 0 (or previous count)
     - Read: 0 or low

2. **Donor Just Accepted (Test 2 complete)**
   - On donor device, we completed acceptance
   - **Wait 2-3 seconds**

3. **Check for Push Notification on Initiator**
   - **VERIFY**: Push notification received on initiator device
     - Title: "Donneur engagé!"
     - Body: "[Donor Name] a accepté de donner du sang O+"
   - **Note**: This is NEW - initiator gets real-time notification
   - Tap notification to see tracking page

4. **Verify Updated Stats**
   - View tracking page stats
   - **Verify**: "Accepte" count increased by 1
   - **Verify**: Shows "[Donor Name] - accepté" in donor list
   - **Verify**: Distance shown if available

---

## Test 5: Error Handling

### Prerequisites
- None

### Steps

1. **Invalid Alert ID**
   - Manually navigate to alert-response with invalid ID
   - Example: `/alert-response/99999`
   - **Verify**: Error screen shown
   - **Verify**: Error message displayed
   - **Verify**: "Retour" button present
   - **Verify**: Tap returns to home

2. **Network Error During Accept**
   - Create new alert
   - Switch to donor, tap notification
   - **Disable network** (airplane mode)
   - Tap "Accepter"
   - **Verify**: Error toast appears (red)
   - **Verify**: Error message shown
   - **Verify**: Accept button still clickable
   - **Re-enable network**, try again
   - **Verify**: Succeeds on retry

3. **Missing Push Token**
   - This is hard to test, but if notifications don't appear:
   - Check device has ExpoNotifications registered
   - Check database has push_token for user
   - Check backend queue is processing jobs

---

## Test 6: Refresh & Session Persistence

### Prerequisites
- Completed Test 3 (donor in mission mode)

### Steps

1. **Refresh Page in Mission Mode**
   - While on mission mode page, refresh (pull down or F5)
   - **Verify**: Page refetches alert data
   - **Verify**: Automatically shows mission mode again
   - **Verify**: No flash of hero card

2. **Navigate Away & Back**
   - Tap "Retour à l'accueil"
   - Navigate to other tabs
   - Open alert notification again
   - **Verify**: Still shows mission mode (not hero card)
   - **Verify**: No duplicate acceptance possible

3. **Close & Reopen App**
   - Hard close app completely
   - Reopen app
   - Navigate to alert-response page
   - **Verify**: Correctly shows mission mode
   - **Verify**: All data persisted

---

## Test 7: Multiple Acceptances (Quantity Reached)

### Prerequisites
- Create new alert with quantity: 1 poches
- Have 2+ donor accounts ready

### Steps

1. **First Donor Accepts**
   - Donor 1 creates alert
   - Donor 2 accepts
   - **Verify**: Success toast shows
   - **Verify**: Initiator gets real-time notification

2. **Check Alert Status**
   - Initiator views tracking page
   - **Verify**: Status changed to "RÉSOLU" or similar
   - **Verify**: No "+" button to add more alerts

3. **Second Donor Receives Alert (After Quantity Met)**
   - Donor 3 still has notification pending
   - Tap notification → Opens alert-response
   - **Verify**: Can still view alert
   - **Verify**: Can still accept (system allows, might show "already resolved")

---

## Checklist: What to Look For

### Toast System
- [ ] Toast appears at top of screen
- [ ] Toast has correct color (success = green)
- [ ] Message is readable and appropriate
- [ ] Toast auto-dismisses after ~3 seconds
- [ ] Manual dismiss button works
- [ ] Multiple toasts can queue (if needed)

### Notifications
- [ ] Push notification sent to donors
- [ ] Notification has correct title and body
- [ ] Notification has deep link to alert
- [ ] Tapping notification opens correct alert
- [ ] Initiator notification sent when donor accepts
- [ ] Initiator notification has correct message

### Alert Response Page
- [ ] Hero card displays blood type
- [ ] Urgency tag shows correct color
- [ ] Info rows show all alert details
- [ ] Stats show live numbers
- [ ] Mission mode shows after acceptance
- [ ] Contact section shows initiator info
- [ ] Call/WhatsApp/GPS buttons work

### Data Integrity
- [ ] Alert data consistent across devices
- [ ] Donor list shows correct names
- [ ] Distance calculations correct
- [ ] Timestamps correct and localized
- [ ] No duplicate responses recorded

### Error Handling
- [ ] Invalid IDs show error screen
- [ ] Network errors show error toasts
- [ ] Error messages are helpful
- [ ] Retry buttons work
- [ ] No crashes on edge cases

---

## Quick Sanity Check (2 minute version)

If you only have time for one quick test:

1. Create alert as initiator
2. Switch to donor, tap notification
3. **Verify toast shows** when accepting
4. **Verify mission mode displays**
5. **Verify initiator gets notification** when donor accepts
6. **Check tracking page updated**

If all 6 steps work → System is functional ✓

---

## Debug Mode

If something isn't working, enable debug logging:

### Frontend
```javascript
// In any component
console.log("Alert Data:", alertData);
console.log("Toast triggered:", message);
console.log("Push token:", pushToken);
```

### Backend
```javascript
// Check logs
tail -f logs/app.log
// Look for:
// - [AlertService.create] Alert created
// - [NotificationProcessor] Found X donors
// - [AlertService.respondToAlert] Initiator notification enqueued
```

### Database Check
```sql
-- Verify alert created
SELECT * FROM Alertes WHERE id_alerte = XXX;

-- Verify notification logged
SELECT * FROM LogNotification WHERE id_alerte = XXX;

-- Check initiator has push token
SELECT push_token FROM Utilisateurs WHERE id_utilisateur = YYY;
```

---

## Success Criteria

**All 7 tests pass** = System ready for production

**6 tests pass** = Minor issue, identify which test failed

**< 5 tests pass** = Major issue, debug before deployment

---

## Common Test Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| No notifications received | Check push token registered, check NODE_ENV=development |
| Toast not visible | Verify ToastProvider in root layout |
| Wrong phone number dialed | Check alert telephone_contact field populated |
| Donor can't accept twice | By design - system prevents duplicates |
| Initiator notification delayed | Check Redis/queue running, check network |
| Page blank after accept | Check alert data refetch succeeded |
| Distance shows "null" | Check donor location enabled, backend calculating |

---

## Test Completion Log

When you complete each test, note:
- Test # and name: _______________
- Start time: _______________
- End time: _______________
- Result: [✓ Pass] [✗ Fail] [⚠ Partial]
- Notes: _______________

This helps track test coverage and identify patterns in failures.
