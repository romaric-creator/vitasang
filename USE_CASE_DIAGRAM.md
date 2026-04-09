# Diagramme de Cas d'Utilisation - Blood Donation App

```mermaid
usecaseDiagram
    actor Donneur as D
    actor Personnel as P
    actor Admin as A
    actor CNTS as C
    actor Système as S

    rectangle "Blood Donation App" {
        ' ===== AUTHENTIFICATION =====
        usecase Auth_Register as "S'inscrire"
        usecase Auth_Login as "Se connecter"
        usecase Auth_Logout as "Se déconnecter"
        usecase Auth_ResetPassword as "Réinitialiser mot de passe"

        ' ===== GESTION PROFIL =====
        usecase Profile_View as "Consulter profile"
        usecase Profile_Edit as "Modifier profile"
        usecase Profile_ViewDonationEligibility as "Vérifier éligibilité don"

        ' ===== RENDEZ-VOUS =====
        usecase RDV_SearchCenters as "Rechercher centres"
        usecase RDV_ViewAvailability as "Voir disponibilités"
        usecase RDV_Reserve as "Réserver rendez-vous"
        usecase RDV_Cancel as "Annuler rendez-vous"
        usecase RDV_Confirm as "Confirmer rendez-vous"
        usecase RDV_ViewMyAppointments as "Consulter mes RDV"
        usecase RDV_ViewHistory as "Voir historique dons"

        ' ===== ALERTES SANG =====
        usecase Alert_ViewActive as "Consulter alertes actives"
        usecase Alert_GetNotified as "Recevoir notifications alerte"
        usecase Alert_Create as "Créer alerte urgente"
        usecase Alert_Validate as "Valider alerte"
        usecase Alert_Close as "Clôturer alerte"
        usecase Alert_NearbyNotification as "Recevoir alerte proximité"

        ' ===== STOCK SANG =====
        usecase Stock_View as "Consulter stock sanguin"
        usecase Stock_Update as "Mettre à jour stock"
        usecase Stock_AlertLow as "Alerter stock faible"

        ' ===== CAMPAGNES =====
        usecase Campaign_View as "Consulter campagnes"
        usecase Campaign_Create as "Créer campagne"
        usecase Campaign_Launch as "Lancer campagne"
        usecase Campaign_ViewResults as "Voir résultats campagne"

        ' ===== MESSAGERIE =====
        usecase Message_Send as "Envoyer message"
        usecase Message_Receive as "Recevoir message"
        usecase Message_ViewConversation as "Consulter conversation"

        ' ===== NOTIFICATIONS =====
        usecase Notif_Receive as "Recevoir notifications"
        usecase Notif_Track as "Tracker notifications"
        usecase Notif_MuteAlerts as "Désactiver notifications"

        ' ===== GESTION CENTRES =====
        usecase Center_Manage as "Gérer centre"
        usecase Center_ViewStaff as "Gérer personnel"
        usecase Center_ViewSchedule as "Consulter planning"

        ' ===== GESTION UTILISATEURS =====
        usecase Admin_ManageUsers as "Gérer utilisateurs"
        usecase Admin_SetRoles as "Attribuer rôles"
        usecase Admin_ViewStats as "Consulter statistiques"
        usecase Admin_GenerateReports as "Générer rapports"
        usecase Admin_ConfigSettings as "Configuration système"

        ' ===== GESTION NATIONALE =====
        usecase CNTS_ViewNationalStats as "Voir stats nationales"
        usecase CNTS_MonitorCenters as "Superviser centres"
        usecase CNTS_ApproveAlerts as "Valider alertes nationales"
        usecase CNTS_StockOptimization as "Optimiser distribution"
    }

    ' ===== RELATIONS DONNEUR =====
    D --> Auth_Register
    D --> Auth_Login
    D --> Auth_Logout
    D --> Auth_ResetPassword
    D --> Profile_View
    D --> Profile_Edit
    D --> Profile_ViewDonationEligibility
    D --> RDV_SearchCenters
    D --> RDV_ViewAvailability
    D --> RDV_Reserve
    D --> RDV_Cancel
    D --> RDV_ViewMyAppointments
    D --> RDV_ViewHistory
    D --> Alert_ViewActive
    D --> Alert_GetNotified
    D --> Alert_NearbyNotification
    D --> Campaign_View
    D --> Message_Send
    D --> Message_Receive
    D --> Message_ViewConversation
    D --> Notif_Receive
    D --> Notif_MuteAlerts
    D --> Stock_View

    ' ===== RELATIONS PERSONNEL =====
    P --> Auth_Login
    P --> Auth_Logout
    P --> Profile_View
    P --> Center_Manage
    P --> Center_ViewSchedule
    P --> RDV_Confirm
    P --> RDV_ViewMyAppointments
    P --> Stock_View
    P --> Stock_Update
    P --> Stock_AlertLow
    P --> Alert_ViewActive
    P --> Alert_Create
    P --> Alert_Validate
    P --> Alert_Close
    P --> Campaign_View
    P --> Message_Send
    P --> Message_Receive
    P --> Notif_Receive

    ' ===== RELATIONS ADMIN =====
    A --> Auth_Login
    A --> Auth_Logout
    A --> Admin_ManageUsers
    A --> Admin_SetRoles
    A --> Admin_ViewStats
    A --> Admin_GenerateReports
    A --> Admin_ConfigSettings
    A --> Center_Manage
    A --> Center_ViewStaff
    A --> Alert_Validate
    A --> Campaign_Create
    A --> Campaign_Launch
    A --> Campaign_ViewResults

    ' ===== RELATIONS CNTS =====
    C --> Auth_Login
    C --> Auth_Logout
    C --> CNTS_ViewNationalStats
    C --> CNTS_MonitorCenters
    C --> CNTS_ApproveAlerts
    C --> CNTS_StockOptimization
    C --> Alert_Create
    C --> Campaign_Create
    C --> Campaign_Launch

    ' ===== RELATIONS SYSTÈME =====
    S -.-> Notif_Receive : envoi
    S -.-> Alert_NearbyNotification : détermine proximité
    S -.-> Stock_AlertLow : vérifie seuils
    S -.-> Campaign_Launch : distribution SMS
    S -.-> Notif_Track : log événements

    ' ===== INCLUSIONS / EXTENSIONS =====
    Alert_Create -.-> |<<include>>| Alert_Validate
    Campaign_Launch -.-> |<<include>>| Campaign_ViewResults
    RDV_Reserve -.-> |<<include>>| Profile_ViewDonationEligibility
    RDV_Cancel -.-> |<<include>>| RDV_ViewMyAppointments
    Message_Send -.-> |<<include>>| Auth_Login
    Admin_GenerateReports -.-> |<<extend>>| Admin_ViewStats
    CNTS_MonitorCenters -.-> |<<extend>>| Admin_ViewStats
```

## Légende des Acteurs

| Acteur        | Description                          | Rôle                               |
| ------------- | ------------------------------------ | ---------------------------------- |
| **Donneur**   | Personne souhaitant donner son sang  | Utilisateur final principal        |
| **Personnel** | Infirmiers et responsables de centre | Gestion des rendez-vous et stock   |
| **Admin**     | Administrateur local/régional        | Gestion globale du centre          |
| **CNTS**      | Coordinateur national                | Supervision et stratégie nationale |
| **Système**   | Processus automatisés                | BullMQ, Redis, Expo notifications  |

## Cas d'Utilisation Principaux

### 1️⃣ **Authentification & Compte**

- S'inscrire avec email/téléphone
- Se connecter avec JWT
- Réinitialiser mot de passe
- Se déconnecter

### 2️⃣ **Gestion Profil**

- Consulter profil (groupe sanguin, disponibilités)
- Modifier informations personnelles
- Vérifier éligibilité au don (jours écoulés, santé)

### 3️⃣ **Rendez-Vous (Cœur de l'app)**

- Rechercher centres proches (Google Maps API)
- Voir disponibilités avec cache Redis
- Réserver créneaux (anti-double-booking)
- Annuler/Confirmer RDV
- Consulter historique des dons

### 4️⃣ **Alertes Sang (Urgences)**

- Consulter alertes actives par type sanguin
- Recevoir notifications géolocalisées (<2km)
- Créer alertes (personnel/CNTS)
- Valider alertes (auto-validation proximité)
- Clôturer alertes

### 5️⃣ **Gestion Stock**

- Voir stock par type sanguin et centre
- Mettre à jour quantités (personnel)
- Déclencher alertes stock faible (<10%)
- Expiration automatique

### 6️⃣ **Campagnes**

- Créer campagnes de sensibilisation
- Lancer campagnes (SMS/Push via BullMQ)
- Consulter résultats en temps réel

### 7️⃣ **Messagerie Directe**

- Envoyer messages entre utilisateurs
- Recevoir messages instantanés
- Consulter conversations

### 8️⃣ **Notifications**

- Recevoir push notifications (Expo)
- Tracking delivery/read status
- Contrôler préférences

### 9️⃣ **Administration**

- Gérer utilisateurs (CRUD + roles)
- Consulter statistiques (donneurs, dons, stock)
- Générer rapports (Excel, PDF)
- Configuration système

### 🔟 **Coordination Nationale**

- Vue d'ensemble stats nationales
- Supervision des centres
- Optimisation distribution sang
- Approbation alertes nationales

## Flux Critique: Création Alerte Urgente

```
Médecin/CNTS --[Créer alerte urgente]--> Système
                    ↓
         Alert_Create --include--> Alert_Validate
                    ↓
         Valider alerte (auto-proximité 2km)
                    ↓
         BullMQ queue job complétée
                    ↓
         Système --[Alert_NearbyNotification]--> Donneurs compatibles
                    ↓
         Expo push notification → React Native
                    ↓
         Donneur reçoit alerte + call-to-action
```

## Flux Critique: Réservation Rendez-Vous

```
Donneur --[Rechercher centres]--> RDV_SearchCenters
                    ↓
    Cache Redis (TTL: 30min) --[HIT/MISS]
                    ↓
    Voir disponibilités avec filtres
                    ↓
Donneur --[Vérifier éligibilité]--> Profile_ViewDonationEligibility
                    ↓
    Include: validation jours écoulés
                    ↓
Donneur --[Réserver]--> Anti-double-booking (Sequelize transaction)
                    ↓
    Redis invalidate + confirmation DB
                    ↓
    Notification confirmée + rappel -2h (BullMQ)
```

## Technologies par Cas d'Utilisation

| Cas d'Utilisation | Technologies                            |
| ----------------- | --------------------------------------- |
| Authentification  | JWT + Bcryptjs + Helmet                 |
| Recherche centres | Google Maps API + Redis cache           |
| RDV               | Sequelize + MySQL transactions + Redis  |
| Alertes           | BullMQ + Expo SDK + Redis geospatial    |
| Notifications     | Expo + BullMQ workers + Socket.io       |
| Stock             | Sequelize triggers + Redis invalidation |
| Campagnes         | BullMQ scheduler + SMS provider         |
| Admin             | Sequelize aggregations + Sentry logs    |
