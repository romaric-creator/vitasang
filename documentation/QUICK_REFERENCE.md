# Blood Donation App - Quick Reference Guide

## Database Schema Quick View

### Core Entities

```
┌─────────────────────────────────────────────────────────────────────┐
│ UTILISATEUR (User)                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ id_utilisateur (PK) | nom | prenom | email | telephone (UQ)        │
│ mot_de_passe | role (donneur|personnel|admin|cnts) | est_actif      │
│ push_token | id_centre (FK) | photo_profil                          │
└─────────────────────────────────────────────────────────────────────┘
          │              │                          │
          │ 1:1          │ 1:N                      │ N:1
          │              │                          │ (staff)
     ┌────▼──────┐   ┌───▼─────────────────────┐   │
     │PROFIL     │   │RENDEZ_VOUS              │   │
     │DONNEUR    │   │HISTORIQUE_DONS          │   │
     │MESSAGES   │   │ALERTE (initiateur)      │   │
     │CAMPAGNE   │   │MESSAGE                  │   │
     └───────────┘   └─────────────────────────┘   │
                                                    │
                                  ┌─────────────────▼────────┐
                                  │ CENTRE (Health Center)   │
                                  ├──────────────────────────┤
                                  │ id_centre (PK)           │
                                  │ nom_centre | adresse     │
                                  │ latitude | longitude     │
                                  │ contact_urgence          │
                                  │ capacite_stockage_max    │
                                  └──────────────────────────┘
                                           │
                                      1:N  │
                          ┌─────────────────┼─────────────────┐
                          │                 │                 │
                     ┌────▼───────┐  ┌─────▼─────┐  ┌────────▼──┐
                     │STOCK_SANG  │  │ ALERTE    │  │CAMPAGNE   │
                     │(1:N)       │  │URGENCE    │  │(1:N)      │
                     └────────────┘  └───────────┘  └───────────┘
```

---

## Front-End Component Structure

### Navigation Structure

```
TAB NAVIGATION (Bottom Tabs)
├── Home Tab
│   └── HOME SCREEN
│       ├── HomeHeader
│       ├── LaunchAlertButton
│       ├── UrgentAlertsSection
│       ├── BentoStats
│       └── AideSensibilisationSection
│
├── History Tab
│   └── HISTORIQUE SCREEN
│
├── Messages Tab
│   └── MESSAGES SCREEN
│
├── Alerts Tab
│   └── ALERTES SCREEN
│       ├── AlertHeroCard
│       ├── DonorItem
│       └── StatCard
│
└── Profile Tab
    └── PROFIL SCREEN

MODAL/DRAWER NAVIGATION
├── Authentication
│   ├── Login
│   └── Register
│
├── Appointment
│   ├── Book Appointment
│   └── Rendezvous
│
├── Alerts
│   ├── Create Alert
│   ├── Guest Alert
│   ├── Alert Confirmation
│   ├── Alert Response [id]
│   └── Alert Tracking [id]
│
├── Settings
│   ├── Edit Profile
│   ├── Language Settings
│   └── Notifications Settings
│
├── Other
├── Aide et Conseil
├── Eligibility Test
└── Debug API
```

---

## Key Data Models Summary

### User Roles

| Role          | Permissions                                                 |
| ------------- | ----------------------------------------------------------- |
| **donneur**   | View appointments, donate, respond to alerts, send messages |
| **personnel** | Manage center operations, validate alerts, track donations  |
| **admin**     | Full center management, campaign launch                     |
| **cnts**      | National blood transfusion service oversight                |

### Appointment Status Flow

```
planifie → valide → effectue
  ↓         ↓
 absent   annule
  ↓         ↓
 (end)    (end)
```

### Alert Status Flow

```
en_attente_validation → en_cours → resolu
                          ↓
                       annule (end)
```

### Blood Groups

- A+ | A- | B+ | B- | AB+ | AB- | O+ | O-
- INCONNU (for emergency SOS alerts)

### Urgency Levels

- NORMAL (10km radius, 1:N notifications)
- URGENT (15km radius, more aggressive notifications)
- TRES_URGENT (20km radius, highest priority)

---

## Controller Methods Cheat Sheet

### Users Controller

```
POST   /api/users                 → addUser()
POST   /api/auth/login            → login()
GET    /api/users                 → getAllUsers()
GET    /api/users/:id             → getUserById()
GET    /api/users/blood-group/:groupe → getUsersByBloodGroup()
```

### Centers Controller

```
GET    /api/centres               → getAllCentres()
GET    /api/centres/search/nearby → searchCentresNearby()
GET    /api/centres/:id           → getCentreDetail()
GET    /api/centres/:id/availability → getCentreAvailability()
```

### Appointments Controller

```
POST   /api/rendezvous            → createRendezVous()
GET    /api/rendezvous            → getUserRendezVous()
DELETE /api/rendezvous/:id        → cancelRendezVous()
GET    /api/rendezvous/:id        → getRendezVousDetail()
```

### Alerts Controller

```
POST   /api/alerts                → createAlert()
POST   /api/alerts/guest          → createGuestAlert()
POST   /api/alerts/:id/validate   → validateAndNotifyAlert()
GET    /api/alerts/pending        → getPendingAlerts()
GET    /api/alerts/live           → getLiveAlerts()
GET    /api/alerts/nearby         → getNearbyAlerts()
GET    /api/alerts/:id/status     → getAlertStatus()
DELETE /api/alerts/:id            → deleteAlert()
```

### Campaigns Controller

```
POST   /api/campaigns             → launchCampaign()
GET    /api/campaigns             → getCampaigns()
```

### Messages Controller

```
POST   /api/messages              → sendMessage()
```

---

## Service Layer Methods

### UserService

```
createDonneur(data)               # Create donor with profile
createPersonnel(data)             # Create center staff
createCentreWithAdmin(data)       # Transactional center + admin creation
authenticate(phone, password)     # Login verification
generateToken(user)               # JWT token generation
```

### AlertService

```
createAlert(alertData, initiatorId)    # Create alert + auto-validate
attemptAutoValidation(alerte)          # Check if within 2km of center
enqueueNotification(alerte, validatorId) # Queue notifications
validateAlert(id, validatorId)         # Manual validation
getAlertStatus(id)                     # Get alert + notification count
```

### CacheService

```
get(key)                          # Retrieve from Redis
set(key, value, ttl)              # Store with TTL
del(key)                          # Delete key
```

---

## Frontend Hooks Quick Reference

### Authentication

```typescript
const { isAuth, user, signIn, signOut } = useAuth();
```

### Alerts

```typescript
const { alert } = useAlert(alertId);
const { alerts, createAlert } = useAlerts();
```

### API Calls

```typescript
const { data, loading, error } = useApiCall("/endpoint");
const { makeRequest } = useApiRequest();
```

### Query Data

```typescript
const { centers, appointments } = useCentersAndAppointments();
```

### Error Handling

```typescript
const { handleError } = useErrorHandler();
```

---

## Frontend Service Methods

### user.service.ts

```typescript
loginUser(phone, password)        # POST /auth/login
registerUser(userData)            # POST /users
getUserProfile()                  # GET /users/:id
updateProfile(userData)           # PATCH /users/:id
sendAlert(alertData)              # POST /alerts
```

### messages.service.ts

```typescript
sendMessage(recipientId, content) # POST /messages
getMessages()                     # GET /messages
markAsRead(messageId)             # PATCH /messages/:id/read
```

### alertFatigueService.ts

```typescript
trackAlertFatigue(userId)         # Track notification fatigue
shouldSendNotification(userId)    # Check if user should be notified
```

---

## Database Indexes

| Table             | Index          | Purpose                        |
| ----------------- | -------------- | ------------------------------ |
| ProfilDonneur     | groupe_sanguin | Fast blood group queries       |
| RendezVous        | statut_rdv     | Filter appointments by status  |
| Alertes_Urgence   | statut         | Filter alerts by status        |
| Notifications_Log | id_alerte      | Notification history per alert |

---

## Key Validations

### User Creation

- Email format validation (if provided)
- Telephone must be unique
- Blood group validated against allowed values
- Password hashed with bcrypt (salt=10)

### Alert Creation

- Latitude/Longitude required
- Blood group from enum
- Urgency from allowed values
- Quantity >= 1

### Appointment Booking

- Center must exist
- Time slot must have available capacity
- Anti-double-booking check
- Donor must be authenticated

### Campaign Launch

- Title and message required
- Blood group filter optional
- Sender must be authenticated center user

---

## Cache Strategy

| Resource     | Duration  | Update Trigger            |
| ------------ | --------- | ------------------------- |
| Centers list | 1 hour    | Manual cache invalidation |
| User profile | Session   | On logout                 |
| Appointments | Real-time | On creation/cancellation  |
| Alerts       | Real-time | On validation/resolution  |

---

## Error Handling

### Common Error Codes

| Code | Meaning                                     |
| ---- | ------------------------------------------- |
| 400  | Bad request / validation error              |
| 401  | Unauthorized / invalid token                |
| 403  | Forbidden / insufficient permissions        |
| 404  | Resource not found                          |
| 409  | Conflict (e.g., duplicate email, full slot) |
| 500  | Server error                                |

### Frontend Error Boundary

- Catches component render errors
- Displays fallback UI
- Logs to analytics

---

## Queue Jobs (BullMQ)

### Notification Queue

```
📅 sendAlert
   - Send to nearby donors by blood group
   - Geolocation-based targeting

📅 sendCampaignNotification
   - Send campaign to targeted donors
   - 3 retry attempts with exponential backoff

📅 sendMessageNotification
   - Send message received notification
   - Push + SMS channels
```

---

## Environment Variables (Backend)

```bash
DATABASE_URL          # Database connection string
JWT_SECRET            # JWT signing key
REDIS_URL             # Redis connection
EXPO_PUSH_TOKEN_API   # Expo push service token
NODE_ENV              # Environment (dev/prod)
PORT                  # Server port
LOG_LEVEL             # Logging level
```

---

## Authentication Flow

```
Frontend Login → Backend Controller
                   ↓
              UserService.authenticate()
                   ↓
              Bcrypt.compare(password)
                   ↓
              JWT token generation
                   ↓
              Token + User stored locally
                   ↓
              AuthContext updated
                   ↓
              Navigation → Home screen
```

---

## Alert Notification Flow

```
Alert Created
      ↓
Auto-Validation Check (within 2km?)
      ├→ YES → en_cours → Queue notifications
      └→ NO  → en_attente_validation → Wait manual validation
                                  ↓
                         Manual Validation
                                  ↓
                         en_cours → Queue notifications
                                  ↓
                         BullMQ Worker
                                  ↓
              Find nearby donors (Haversine)
                                  ↓
              Filter by blood group match
                                  ↓
              Check notification fatigue
                                  ↓
              Send via push/SMS/email
                                  ↓
              Create LogNotification record
                                  ↓
              Update notification status
```

---

## Version History

| Date       | Notes                          |
| ---------- | ------------------------------ |
| 2026-04-06 | Initial comprehensive analysis |
