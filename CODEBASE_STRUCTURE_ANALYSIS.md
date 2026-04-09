# Blood Donation App - Codebase Structure Analysis

**Generated:** April 6, 2026

---

## Table of Contents

1. [Backend Models & Database Schema](#backend-models--database-schema)
2. [Backend Controllers](#backend-controllers)
3. [Backend Services](#backend-services)
4. [Frontend Components Structure](#frontend-components-structure)
5. [Frontend Context & Hooks](#frontend-context--hooks)
6. [Frontend Services](#frontend-services)
7. [Entity Relationships & Associations](#entity-relationships--associations)
8. [Data Flow Architecture](#data-flow-architecture)

---

## Backend Models & Database Schema

### 1. **Utilisateur** (User)

**Table:** `Utilisateurs`

**Attributes:**

- `id_utilisateur` (INTEGER, PK, AUTO)
- `nom` (STRING 100, NOT NULL)
- `prenom` (STRING 100)
- `region` (STRING 100)
- `email` (STRING 150, UNIQUE, EMAIL validation)
- `mot_de_passe` (STRING 255, NOT NULL)
- `telephone` (STRING 20, UNIQUE)
- `role` (ENUM: "donneur", "personnel", "admin", "cnts", DEFAULT: "donneur")
- `push_token` (TEXT)
- `est_actif` (BOOLEAN, DEFAULT: true)
- `id_centre` (INTEGER, FK → Centre, NULLABLE)
- `photo_profil` (STRING 255, NULLABLE)
- `createdAt`, `updatedAt` (TIMESTAMPS)

**Key Methods:**

- `createDonneur()` - Create donor user
- `createPersonnel()` - Create center staff
- `createCentreWithAdmin()` - Create center with admin user
- `authenticate()` - Login user
- `generateToken()` - JWT token generation

---

### 2. **ProfilDonneur** (Donor Profile)

**Table:** `Profils_Donneurs`

**Attributes:**

- `id_donneur` (INTEGER, PK, FK → Utilisateur.id_utilisateur)
- `groupe_sanguin` (ENUM: "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", NULLABLE)
- `poids` (DECIMAL 5,2)
- `taille` (DECIMAL 5,2)
- `dernier_don` (DATEONLY)
- `prochain_don_possible` (DATEONLY)
- `disponible` (BOOLEAN, DEFAULT: true) - _Indicates if donor accepts alerts_
- `raison_indisponibilite` (STRING 100, NULLABLE) - _Disease, travel, breastfeeding, etc._
- `date_disponibilite` (DATEONLY, NULLABLE) - _Return to availability date_
- `lat_actuelle` (DOUBLE, NULLABLE)
- `long_actuelle` (DOUBLE, NULLABLE)

**Indexes:** `groupe_sanguin`

---

### 3. **Centre** (Blood Donation Center)

**Table:** `Centres_Sante`

**Attributes:**

- `id_centre` (INTEGER, PK, AUTO)
- `nom_centre` (STRING 150, NOT NULL)
- `adresse` (TEXT)
- `ville` (STRING 100)
- `latitude` (DOUBLE, NOT NULL)
- `longitude` (DOUBLE, NOT NULL)
- `contact_urgence` (STRING 20, NOT NULL)
- `capacite_stockage_max` (INTEGER, DEFAULT: 0) - _Max pouches capacity_

**Key Methods:**

- Geolocation-based queries (Haversine formula)
- Dynamic availability calculation
- Appointment slot management

---

### 4. **RendezVous** (Appointment)

**Table:** `Rendez_Vous`

**Attributes:**

- `id_rdv` (INTEGER, PK, AUTO)
- `date_heure_rdv` (DATE, NOT NULL)
- `statut_rdv` (ENUM: "planifie", "valide", "absent", "annule", "confirme", "effectue", DEFAULT: "planifie")
- `code_unique` (STRING 12, UNIQUE, NULLABLE) - _QR code or text for arrival_
- `id_donneur` (INTEGER, FK → Utilisateur.id_utilisateur)
- `id_centre` (INTEGER, FK → Centre.id_centre)
- `id_type_don` (INTEGER, FK → TypeDon.id_type_don)
- `createdAt`, `updatedAt` (TIMESTAMPS)

**Indexes:** `statut_rdv`

**Key Features:**

- Anti-double-booking mechanism
- Slot capacity management
- Unique code generation

---

### 5. **HistoriqueDon** (Donation History)

**Table:** `Historique_Dons`

**Attributes:**

- `id_historique` (INTEGER, PK, AUTO)
- `date_don` (DATE, NOT NULL, DEFAULT: NOW)
- `volume_ml` (INTEGER) - _Volume in milliliters_
- `statut_don` (ENUM: "réussi", "échoué", "partiel", DEFAULT: "réussi")
- `id_donneur` (INTEGER, FK → Utilisateur.id_utilisateur)
- `id_centre` (INTEGER, FK → Centre.id_centre)
- `id_type_don` (INTEGER, FK → TypeDon.id_type_don)

---

### 6. **TypeDon** (Donation Type)

**Table:** `Types_Don`

**Attributes:**

- `id_type_don` (INTEGER, PK, AUTO)
- `libelle` (STRING 50, NOT NULL) - _e.g., "Sang Total", "Plaquettes"_
- `delai_attente_jours` (INTEGER, NOT NULL) - _Waiting period in days_

---

### 7. **StockSang** (Blood Stock)

**Table:** `Stocks_Sang`

**Attributes:**

- `id_stock` (INTEGER, PK, AUTO)
- `groupe_sanguin` (ENUM: "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", NOT NULL)
- `quantite_poches` (INTEGER, DEFAULT: 0) - _Number of pouches_
- `seuil_alerte_min` (INTEGER, DEFAULT: 5) - _Minimum alert threshold_
- `id_centre` (INTEGER, FK → Centre.id_centre)
- `createdAt`, `updatedAt` (TIMESTAMPS)

---

### 8. **Alerte** (Emergency Blood Alert)

**Table:** `Alertes_Urgence`

**Attributes:**

- `id_alerte` (INTEGER, PK, AUTO)
- `id_initiateur` (INTEGER, FK → Utilisateur.id_utilisateur, NULLABLE)
- `nom_patient` (STRING 100)
- `telephone_contact` (STRING 20)
- `id_centre` (INTEGER, FK → Centre.id_centre, NULLABLE)
- `groupe_requis` (ENUM: Blood groups + "INCONNU")
- `degre_urgence` (ENUM: "NORMAL", "URGENT", "TRES_URGENT", DEFAULT: "NORMAL")
- `rayon_action_km` (INTEGER, DEFAULT: 20) - _Notification radius_
- `lieu` (STRING 255)
- `description` (TEXT)
- `latitude` (DOUBLE)
- `longitude` (DOUBLE)
- `quantite_requise` (INTEGER, DEFAULT: 1)
- `statut` (ENUM: "en_attente_validation", "en_cours", "resolu", "annule", DEFAULT: "en_cours")
- `createdAt`, `updatedAt` (TIMESTAMPS)

**Indexes:** `statut`

**Key Features:**

- Auto-validation if alert is within 2km of center
- Geolocation-based donor targeting
- Multi-channel notification support

---

### 9. **LogNotification** (Notification Log)

**Table:** `Notifications_Log`

**Attributes:**

- `id_notification` (INTEGER, PK, AUTO)
- `date_envoi` (DATE, DEFAULT: NOW)
- `statut_reception` (ENUM: "envoye", "lu", "accepte", "ignore", "delivered", "failed", "no_token", "reçu", "échec", "refuse", DEFAULT: "envoye")
- `canal` (ENUM: "push", "email", "sms", "whatsapp")
- `push_token` (TEXT, NULLABLE)
- `details_echec` (TEXT, NULLABLE)
- `push_ticket_id` (STRING 100, NULLABLE)
- `id_utilisateur` (INTEGER, FK → Utilisateur.id_utilisateur)
- `id_alerte` (INTEGER, FK → Alerte.id_alerte, NULLABLE)

**Indexes:** `id_alerte`

---

### 10. **Message** (Direct Message)

**Table:** `Messages`

**Attributes:**

- `id_message` (INTEGER, PK, AUTO)
- `contenu` (TEXT)
- `est_lu` (BOOLEAN, DEFAULT: false)
- `id_expediteur` (INTEGER, FK → Utilisateur.id_utilisateur)
- `id_destinataire` (INTEGER, FK → Utilisateur.id_utilisateur)
- `createdAt`, `updatedAt` (TIMESTAMPS)

---

### 11. **Campagne** (Campaign)

**Table:** `Campagnes`

**Attributes:**

- `id_campagne` (INTEGER, PK, AUTO)
- `titre` (STRING 200, NOT NULL)
- `message` (TEXT, NOT NULL)
- `groupe_sanguin_cible` (STRING 5, NULLABLE) - _Filter blood group used at launch_
- `donneurs_touches` (INTEGER, DEFAULT: 0) - _Number of donors reached_
- `statut` (ENUM: "lancee", "terminee", "annulee", DEFAULT: "lancee")
- `id_centre` (INTEGER, FK → Centre.id_centre)
- `createdAt`, `updatedAt` (TIMESTAMPS)

---

## Backend Controllers

### 1. **users.controller.js**

**Key Methods:**

| Method                   | Description                             | Endpoint Implied               |
| ------------------------ | --------------------------------------- | ------------------------------ |
| `addUser()`              | Create user (donneur/personnel/centre)  | POST /users                    |
| `login()`                | Authenticate user with phone + password | POST /auth/login               |
| `getAllUsers()`          | Fetch paginated user list               | GET /users?page=X&limit=Y      |
| `getUserById()`          | Fetch single user with profile          | GET /users/:id                 |
| `getUsersByBloodGroup()` | Get donors by blood group               | GET /users/blood-group/:groupe |

**Roles Handled:**

- Donor registration & management
- Center personnel creation
- Center admin creation
- Authentication & tokenization

---

### 2. **centres.controller.js**

**Key Methods:**

| Method                    | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `getAllCentres()`         | List all blood centers with caching             |
| `searchCentresNearby()`   | Find centers within radius (geolocation)        |
| `getCentreDetail()`       | Get single center details                       |
| `getCentreAvailability()` | Dynamic availability based on real appointments |

**Features:**

- Redis caching (1-hour TTL for center list)
- Haversine distance calculation
- Time-slot availability computation
- Anti-double-booking validation

---

### 3. **rendezvous.controller.js**

**Key Methods:**

| Method                  | Description                          |
| ----------------------- | ------------------------------------ |
| `createRendezVous()`    | Book appointment with capacity check |
| `getUserRendezVous()`   | Get user's appointments              |
| `cancelRendezVous()`    | Cancel user's appointment            |
| `getRendezVousDetail()` | Get single appointment details       |

**Features:**

- Anti-double-booking via capacity limits
- Unique code generation per appointment
- Authorization: users can only manage their own RDVs
- Time-slot management relative to center capacity

---

### 4. **alerts.controller.js**

**Key Methods:**

| Method                     | Description                              |
| -------------------------- | ---------------------------------------- |
| `createAlert()`            | Create emergency alert                   |
| `createGuestAlert()`       | Create SOS alert without auth            |
| `validateAndNotifyAlert()` | Validate alert and trigger notifications |
| `getPendingAlerts()`       | Get alerts awaiting validation           |
| `getLiveAlerts()`          | Get active alerts (max 10)               |
| `getNearbyAlerts()`        | Get alerts within radius                 |
| `getAlertStatus()`         | Get alert status with notification count |
| `getUserAlerts()`          | Get user's created alerts                |
| `deleteAlert()`            | Delete alert                             |

---

### 5. **campaigns.controller.js**

**Key Methods:**

| Method             | Description                        |
| ------------------ | ---------------------------------- |
| `launchCampaign()` | Launch targeted campaign to donors |
| `getCampaigns()`   | Get campaign history for center    |

**Features:**

- Targeting by blood group
- Bulk notification job queuing (BullMQ)
- Persistence to database
- Retry logic with exponential backoff

---

### 6. **messages.controller.js**

**Key Methods:**

| Method          | Description                |
| --------------- | -------------------------- |
| `sendMessage()` | Send message between users |

**Features:**

- Recipient existence validation
- Async notification queuing
- Logging of message events

---

## Backend Services

### 1. **user.service.js**

**Class: UserService**

**Key Methods:**

| Method                          | Purpose                              |
| ------------------------------- | ------------------------------------ |
| `createDonneur(data)`           | Create donor with profile            |
| `createPersonnel(data)`         | Create center staff                  |
| `createCentreWithAdmin(data)`   | Create center + admin in transaction |
| `authenticate(phone, password)` | Login & verify credentials           |
| `generateToken(user)`           | Create JWT token                     |

**Dependencies:**

- Bcrypt for password hashing
- JWT for tokenization
- Blood compatibility utilities

**Key Logic:**

- Validates blood group (defaults to NULL if invalid)
- Hashes passwords with salt=10
- Transactional center creation
- Token-based authentication

---

### 2. **alert.service.js**

**Class: AlertService**

**Key Methods:**

| Method                                     | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| `createAlert(alertData, initiatorId)`      | Create alert with auto-validation attempt |
| `attemptAutoValidation(alerte)`            | Validate if center within 2km             |
| `enqueueNotification(alerte, validatorId)` | Add alert to notification queue           |
| `validateAlert(id, validatorId)`           | Manually validate alert                   |
| `getAlertStatus(id)`                       | Get alert + notification status           |

**Features:**

- Automatic validation if alert is within 2km of center
- Haversine distance calculation
- BullMQ job queuing
- Detailed logging

**Alert Flow:**

1. Alert created (guest or authenticated user)
2. Auto-validation attempts (geolocation check)
3. If validated: notification queued
4. If pending: manual validation required
5. Notifications sent to nearby donors

---

### 3. **cache.service.js**

**Features:**

- Redis-based caching
- TTL support
- Used for center list (1-hour cache)

---

## Frontend Components Structure

### Root Components

| Component                | Type   | Purpose                      |
| ------------------------ | ------ | ---------------------------- |
| `Splash.tsx`             | Screen | Splash screen initialization |
| `OnboardingCarousel.tsx` | Screen | App onboarding flow          |
| `_layout.tsx`            | Layout | Route configuration          |

### Shared UI Components

| Component                                 | Purpose                             |
| ----------------------------------------- | ----------------------------------- |
| `PrimaryButton.tsx`                       | Primary call-to-action button       |
| `FormField.tsx`                           | Reusable form field with validation |
| `SelectField.tsx`                         | Dropdown/select field               |
| `BloodGroupSelector.tsx`                  | Blood group picker component        |
| `PageHeader.tsx`                          | Header with title & subtitle        |
| `ConfirmationModal.tsx`                   | Confirmation dialog                 |
| `ErrorAlert.tsx`                          | Error display component             |
| `AlertToast.tsx`                          | Toast notifications                 |
| `LoadingSpinner.tsx`, `ModernSpinner.tsx` | Loading indicators                  |
| `SkeletonLoader.tsx`                      | Skeleton placeholder                |
| `LoadingOverlay.tsx`                      | Full-screen loading overlay         |
| `CachedImage.tsx`                         | Optimized image component           |
| `ErrorBoundary.tsx`                       | Error boundary wrapper              |
| `ThemedView.tsx`                          | Themed view wrapper                 |
| `TabBarIcon.tsx`                          | Bottom tab bar icon                 |
| `haptic-tab.tsx`                          | Haptic feedback tab                 |

### Mascot Components (Feedback UI)

| Component          | Purpose                  |
| ------------------ | ------------------------ |
| `SanguHappy.tsx`   | Happy mascot state       |
| `SanguNeutral.tsx` | Neutral mascot state     |
| `SanguHero.tsx`    | Hero/action mascot state |

---

### Feature-Specific Components

#### **Home Screen Sub-Components** (`/components/home/`)

| Component                        | Purpose                             |
| -------------------------------- | ----------------------------------- |
| `HomeHeader.tsx`                 | Displays user greeting & profile    |
| `LaunchAlertButton.tsx`          | Button to trigger alert creation    |
| `UrgentAlertsSection.tsx`        | Shows active emergency alerts       |
| `AideSensibilisationSection.tsx` | Educational/awareness section       |
| `BentoStats.tsx`                 | Statistics dashboard (bento layout) |

#### **Tracking Components** (`/components/tracking/`)

| Component           | Purpose                    |
| ------------------- | -------------------------- |
| `AlertHeroCard.tsx` | Featured alert display     |
| `DonorItem.tsx`     | Individual donor list item |
| `PulseButton.tsx`   | Animated pulse button      |
| `StatCard.tsx`      | Statistic card display     |

#### **Help Components** (`/components/help/`)

| Component             | Purpose                |
| --------------------- | ---------------------- |
| `HelpFaqItem.tsx`     | FAQ item component     |
| `HelpSectionCard.tsx` | Help section container |
| `HelpStatCard.tsx`    | Statistic card in help |

---

### Screen Components (Routes)

#### **(tabs)/ - Main Tab Navigation**

| Screen              | Purpose             |
| ------------------- | ------------------- |
| `(tabs)/home`       | Home dashboard      |
| `(tabs)/historique` | Donation history    |
| `(tabs)/messages`   | Messaging interface |
| `(tabs)/alertes`    | Active alerts view  |
| `(tabs)/profil`     | User profile        |

#### **Appointment Management**

| Screen               | Purpose              |
| -------------------- | -------------------- |
| `/rendezvous.tsx`    | View appointments    |
| `/book-appointment/` | Book new appointment |

#### **Alert Flow**

| Screen                     | Purpose                        |
| -------------------------- | ------------------------------ |
| `/create-alert.tsx`        | Create emergency alert         |
| `/guest-alert.tsx`         | Guest alert creation (no auth) |
| `/alert-confirmation.tsx`  | Alert confirmation screen      |
| `/alert-response/[id].tsx` | Respond to alert               |
| `/alert-tracking/[id].tsx` | Track alert status             |

#### **User Management**

| Screen                  | Purpose                   |
| ----------------------- | ------------------------- |
| `/login.tsx`            | Login screen              |
| `/register.tsx`         | Registration screen       |
| `/edit-profile.tsx`     | Edit profile              |
| `/aide-et-conseil.tsx`  | Help & advice             |
| `/eligibility-test.tsx` | Donation eligibility quiz |

#### **Settings & Admin**

| Screen                        | Purpose                  |
| ----------------------------- | ------------------------ |
| `/language-settings.tsx`      | Language selection       |
| `/notifications-settings.tsx` | Notification preferences |

#### **Messages**

| Screen       | Purpose             |
| ------------ | ------------------- |
| `/messages/` | Messaging interface |

#### **Debug**

| Screen           | Purpose             |
| ---------------- | ------------------- |
| `/debug-api.tsx` | API debugging tools |

---

## Frontend Context & Hooks

### Context Providers

#### **AuthContext.tsx**

**Type:**

```typescript
interface AuthContextType {
  isAuth: boolean | null;
  user: any | null;
  isLoading: boolean;
  signIn: (telephone: string, mot_de_passe: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Features:**

- Token storage in device storage
- Force logout events
- PostHog analytics integration
- Auto-logout on token expiration (401)
- User identification for analytics

#### **NotificationContext.tsx**

**Features:**

- Push notification handling
- Notification display management
- Alert state subscription

---

### Custom Hooks

| Hook                          | Purpose                       |
| ----------------------------- | ----------------------------- |
| `useAuth()`                   | Access auth context           |
| `useAlert()`                  | Single alert operations       |
| `useAlerts()`                 | Multiple alerts management    |
| `useNotification()`           | Notification handling         |
| `useApiRequest()`             | Generic API calls             |
| `useApiCall()`                | Specific API endpoint mapping |
| `useQueryHooks()`             | React Query integration       |
| `useCentersAndAppointments()` | Center & appointment data     |
| `useCachedImage()`            | Image caching utility         |
| `useErrorHandler()`           | Error handling logic          |
| `useAlertRetryCheck()`        | Alert retry mechanism         |

---

## Frontend Services

| Service                  | Purpose                           |
| ------------------------ | --------------------------------- |
| `user.service.ts`        | User authentication & profile API |
| `alertFatigueService.ts` | Track user alert fatigue          |
| `alertRetryService.ts`   | Retry logic for failed alerts     |
| `analyticsService.ts`    | Event tracking & analytics        |
| `errorService.ts`        | Error handling & reporting        |
| `messages.service.ts`    | Messaging API calls               |
| `toastService.ts`        | Toast notification display        |

---

## Entity Relationships & Associations

### Relational Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────┐                                           │
│  │ Utilisateur  │◄────────────────┐                         │
│  │ (User)       │                  │                         │
│  └──────────────┘                  │                         │
│       │ 1                          │ FK (id_centre)         │
│       │                            │                        │
│       ├─────────┬──────┬──────┬───┴──────┬────────┐         │
│       │         │      │      │          │        │         │
│   HAS ONE    HAS MANY  │      │          │        │         │
│       │         │      │      │          │        │         │
│  ProfilDonneur │      │      │    Message     (Self)       │
│       │    HistoriqueDon   RendezVous  │        │         │
│       │    RendezVous      Alerte      └────────┘         │
│       │    Message                     (expediteur/       │
│       │                                 destinataire)      │
│  (1:1 PK)                                                  │
│       │                                                    │
│       └─────────────────────────┐                          │
│                                 │                          │
│        ┌─────────────────────────────────────┐             │
│        │                        │             │             │
│   ┌────▼────────┐      ┌────────▼──┐    ┌───▼───────┐     │
│   │  ProfilDonneur     │  Alerte  │    │LogNotification   │
│   │  (1:1 PK)          │  (N:1)   │    │  (N:1)       │   │
│   └─────────────┘      │    │     │    └────────────┘    │
│                        │    │     │         │             │
│               (AUTO)   │    │     │    (M:1 to User)      │
│                        │    │     │    (M:1 to Alerte)    │
│                        └────┼─────┘                       │
│                             │                             │
│                     (M:1 to Centre)                       │
│                             │                             │
│        ┌────────────────────┼──────────────────┐          │
│        │                    │                  │          │
│   ┌────▼────────────┐   ┌───▼──────┐    ┌────▼──────┐   │
│   │  Centre         │   │ StockSang│    │ Campagne  │   │
│   │  (Health Center)│   │(N:1)     │    │(N:1)      │   │
│   └────────────────┘   └───────────┘    └───────────┘   │
│        │ 1                                                 │
│        │ (1:N)                                             │
│        │                                                  │
│   ┌────▼──────────┐                                       │
│   │  RendezVous   │                                       │
│   │  (N:1)        │                                       │
│   └───────────────┘                                       │
│        │ FK (id_type_don)                                 │
│        │                                                  │
│   ┌────▼──────────┐                                       │
│   │  TypeDon      │                                       │
│   │  (Donation Type)                                      │
│   └───────────────┘                                       │
│        │ 1:N                                              │
│        │                                                  │
│   ┌────▼──────────┐                                       │
│   │HistoriqueDon  │                                       │
│   │ (Donation Hist)                                       │
│   └───────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### Key Associations

**1:1 Relationships:**

- `Utilisateur` → `ProfilDonneur` (User has one donor profile)

**1:N Relationships:**

- `Utilisateur` → `HistoriqueDon` (Donor has many donation history records)
- `Utilisateur` → `RendezVous` (Donor has many appointments)
- `Utilisateur` → `Message` (User sends/receives multiple messages)
- `Centre` → `Utilisateur` (Center has many staff members)
- `Centre` → `StockSang` (Center has multiple blood stocks by type)
- `Centre` → `RendezVous` (Center hosts many appointments)
- `Centre` → `HistoriqueDon` (Center records many donations)
- `Centre` → `Alerte` (Center initiates many alerts)
- `TypeDon` → `RendezVous` (Donation type links to many appointments)
- `TypeDon` → `HistoriqueDon` (Donation type links to many history records)

**Self-Referencing Relationships:**

- `Message`: `id_expediteur` → `id_destinataire` (User to User)

**Many-to-One Relationships:**

- `Alerte` → `Utilisateur` (Alert initiated by user)
- `Alerte` → `Centre` (Alert belongs to center)
- `LogNotification` → `Utilisateur` (Notification for user)
- `LogNotification` → `Alerte` (Notification about alert)
- `Campagne` → `Centre` (Campaign by center)

---

## Data Flow Architecture

### Authentication Flow

```
Frontend (Login Screen)
    ↓
User Service (loginUser)
    ↓
Backend: users.controller.login()
    ↓
User Service: authenticate(phone, password)
    ↓
Bcrypt verify + JWT token generation
    ↓
AuthContext: setAuthToken() + storeData()
    ↓
User stored in device storage + Redux/Context
```

### Alert Creation & Notification Flow

```
Frontend (Create/Guest Alert Screen)
    ↓
Alerts Controller: createAlert() or createGuestAlert()
    ↓
Alert Service: createAlert()
    ├→ Create Alerte record
    ├→ attemptAutoValidation()
    │  ├→ Fetch nearby center (< 2km)
    │  └→ Auto-validate if found
    │
    └→ enqueueNotification()
       ↓
    BullMQ Queue: sendAlert job
    ↓
    Notification Worker
    ├→ Find nearby donors (geolocation + blood group)
    ├→ Create LogNotification records
    └→ Send via push/SMS/email
       ↓
    Frontend: NotificationContext updates
```

### Appointment Booking Flow

```
Frontend (Book Appointment Screen)
    ↓
Backend: rendezvous.controller.createRendezVous()
    ├→ Validate center exists
    ├→ Calculate max slots per time (capacity / 10)
    ├→ Check existing bookings for slot
    ├→ Anti-double-booking validation
    └→ Generate unique code
       ↓
    RendezVous record created
       ↓
    Frontend: Confirmation screen
       ↓
    User can: view appointment, cancel, or view history
```

### Campaign Launch Flow

```
Backend: Authenticated center staff/admin
    ↓
Campaigns Controller: launchCampaign()
    ├→ Define targeting criteria (blood group, availability)
    ├→ Query matching donors via ProfilDonneur
    ├→ Create Campagne record
    │
    └→ BullMQ: Add bulk notification jobs (3 retry attempts)
       ↓
       Per donor:
       ├→ Resolve push token
       ├→ Queue notification
       └→ Exponential backoff (2s initial delay)
          ↓
       Notification delivered to app
```

---

## Technology Stack Summary

### Backend

- **Runtime:** Node.js
- **ORM:** Sequelize (SQL)
- **Framework:** Express.js
- **Authentication:** JWT + Bcrypt
- **Queue:** BullMQ
- **Cache:** Redis
- **Database:** SQL (PostgreSQL/MySQL)
- **Logging:** Custom logger config
- **Utilities:** Haversine for geolocation

### Frontend

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** Context API + React Query
- **Routing:** Expo Router
- **Analytics:** PostHog
- **Styling:** React Native StyleSheet
- **Storage:** AsyncStorage (device storage)
- **i18n:** Custom i18n.ts
- **Build Tools:** Metro bundler, Babel, ESLint

---

## API Endpoints Summary

### Users API

- `POST /users` - Create user
- `POST /auth/login` - Login
- `GET /users` - List users (paginated)
- `GET /users/:id` - Get user details
- `GET /users/blood-group/:groupe` - Get donors by blood group

### Centres API

- `GET /centres` - List centers (cached)
- `GET /centres/search/nearby` - Search nearby centers
- `GET /centres/:id` - Center details
- `GET /centres/:id/availability` - Dynamic availability

### Rendez-vous API

- `POST /rendezvous` - Create appointment
- `GET /rendezvous` - User's appointments
- `DELETE /rendezvous/:id` - Cancel appointment
- `GET /rendezvous/:id` - Appointment details

### Alerts API

- `POST /alerts` - Create alert (authenticated)
- `POST /alerts/guest` - Create SOS alert (guest)
- `POST /alerts/:id/validate` - Validate alert
- `GET /alerts/pending` - Pending validation
- `GET /alerts/live` - Active alerts
- `GET /alerts/nearby` - Nearby alerts
- `GET /alerts/:id/status` - Alert status
- `DELETE /alerts/:id` - Delete alert

### Campaigns API

- `POST /campaigns` - Launch campaign
- `GET /campaigns` - Campaign history

### Messages API

- `POST /messages` - Send message

---

## Database Table Names

| Model           | Table Name          |
| --------------- | ------------------- |
| Utilisateur     | `Utilisateurs`      |
| ProfilDonneur   | `Profils_Donneurs`  |
| Centre          | `Centres_Sante`     |
| TypeDon         | `Types_Don`         |
| StockSang       | `Stocks_Sang`       |
| RendezVous      | `Rendez_Vous`       |
| HistoriqueDon   | `Historique_Dons`   |
| Alerte          | `Alertes_Urgence`   |
| LogNotification | `Notifications_Log` |
| Message         | `Messages`          |
| Campagne        | `Campagnes`         |

---

## Key Design Patterns

### 1. **Service Layer Pattern**

- Business logic separated into services
- Controllers delegate to services
- Examples: UserService, AlertService

### 2. **Repository Pattern (Implicit)**

- Models act as data access layer via Sequelize ORM
- Queries centralized in model definitions

### 3. **Singleton Pattern**

- Queue instance (BullMQ)
- Cache service (Redis)
- Database connection (Sequelize)

### 4. **Observer Pattern**

- DeviceEventEmitter for logout events
- Context-based state updates in React

### 5. **Strategy Pattern**

- Multiple alert validation strategies (auto vs. manual)
- Different notification channels (push, SMS, email)

### 6. **Factory Pattern**

- Token generation
- User creation variants (donneur, personnel, admin)

---

## Security Features

1. **Password Hashing:** Bcrypt (salt=10)
2. **Authentication:** JWT tokens
3. **Authorization:** Role-based (donneur, personnel, admin, cnts)
4. **Input Validation:** Formik + custom validators
5. **Geolocation Privacy:** Stored coordinates per user
6. **Message Authorization:** Users can only access own messages
7. **Appointment Authorization:** Users can only modify their own RDVs

---

## Performance Optimizations

1. **Caching:** Redis cache for center list (1-hour TTL)
2. **Pagination:** User list query uses pagination
3. **Geolocation:** Haversine distance calculation in SQL
4. **Async Jobs:** BullMQ for background notifications
5. **Indexed Columns:** Alerts (statut), RendezVous (statut_rdv)
6. **Selective Attributes:** Controllers exclude passwords from responses
7. **Image Optimization:** CachedImage component

---

## Scalability Considerations

1. **Horizontal Scaling:** BullMQ supports multiple worker instances
2. **Database Indexing:** Strategic indexes on frequently queried columns
3. **Caching Layer:** Redis reduces database queries
4. **Connection Pooling:** Sequelize manages connection pool
5. **Stateless Services:** API servers are stateless (JWT-based)
6. **Queue Processing:** Asynchronous notification handling
