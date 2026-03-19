# Diagrammes UML - VitaSang Blood Donation App

## 1. DIAGRAMME DE CLASSE

```
classDiagram
    class Utilisateur {
        -id_utilisateur: int
        -nom: string
        -prenom: string
        -email: string
        -telephone: string
        +mot_de_passe: string
        -role: enum(donneur, personnel, admin)
        -id_centre: int
        -est_actif: boolean
        -createdAt: datetime
        -updatedAt: datetime
        +login()
        +logout()
        +updateProfile()
    }

    class ProfilDonneur {
        -id_profil: int
        -id_donneur: int
        -groupe_sanguin: string
        -lat_actuelle: float
        -long_actuelle: float
        -dernier_don: datetime
        +getDonHistory()
        +updateLocation()
        +getBloodType()
    }

    class Centre {
        -id_centre: int
        -nom_centre: string
        -adresse: string
        -ville: string
        -latitude: float
        -longitude: float
        -contact_urgence: string
        -capacite_stockage_max: int
        +getStockStatus()
        +addStaff()
        +getStaffList()
        +updateLocation()
    }

    class RendezVous {
        -id_rendez_vous: int
        -id_donneur: int
        -id_centre: int
        -date_demande: datetime
        -statut: enum(pending, confirmed, completed, cancelled)
        -type_don: string
        -notes: string
        +confirmAppointment()
        +cancelAppointment()
        +markAsCompleted()
    }

    class HistoriqueDon {
        -id_historique: int
        -id_donneur: int
        -id_centre: int
        -date_don: datetime
        -volume_ml: int
        -type_don: string
        -groupe_sanguin: string
        -statut_sante: string
        +getDetails()
        +validateDonation()
    }

    class StockSang {
        -id_stock: int
        -id_centre: int
        -groupe_sanguin: string
        -quantite_unite: int
        -date_collecte: datetime
        -date_expiration: datetime
        +updateStock()
        +getAvailableQuantity()
        +checkExpiration()
    }

    class Alerte {
        -id_alerte: int
        -id_centre: int
        -type_alerte: string
        -message: string
        -severite: enum(low, medium, high)
        -est_resolu: boolean
        +createAlert()
        +resolveAlert()
        +notifyStaff()
    }

    class Message {
        -id_message: int
        -id_emetteur: int
        -id_recepteur: int
        -contenu: string
        -date_envoi: datetime
        -est_lu: boolean
        +sendMessage()
        +markAsRead()
    }

    class TypeDon {
        -id_type: int
        -libelle: string
        -delai_attente_jours: int
        -description: string
    }

    Utilisateur "1" -- "*" ProfilDonneur
    Utilisateur "1" -- "*" RendezVous
    Utilisateur "1" -- "*" HistoriqueDon
    Utilisateur "1" -- "*" Message

    Centre "1" -- "*" Utilisateur
    Centre "1" -- "*" RendezVous
    Centre "1" -- "*" HistoriqueDon
    Centre "1" -- "*" StockSang
    Centre "1" -- "*" Alerte

    RendezVous "*" -- "1" TypeDon
    HistoriqueDon "*" -- "1" TypeDon

    StockSang "*" -- "1" Centre
```

---

## 2. DIAGRAMME DE SÉQUENCE - PROCESSUS DE CONNEXION

```
sequenceDiagram
    actor User as Utilisateur Desktop
    participant FE as Frontend<br/>(Login.tsx)
    participant API as API Backend
    participant DB as Base de Données
    participant AUTH as AuthContext

    User->>FE: Entre téléphone + mot de passe
    FE->>FE: Valide format téléphone
    FE->>FE: Vérifie mot de passe > 6 chars

    alt Validation échoue
        FE->>User: Affiche message erreur
        Note over User,FE: Fin du processus
    else Validation réussie
        FE->>API: POST /users/login
        Note over FE,API: {telephone, mot_de_passe}

        API->>DB: Cherche utilisateur par téléphone

        alt Utilisateur non trouvé
            DB-->>API: null
            API-->>FE: Status 401 "Identifiants incorrects"
            FE->>User: Affiche erreur 401
        else Utilisateur trouvé
            DB-->>API: User object + mot_de_passe hashé
            API->>API: Vérifie password avec bcrypt

            alt Mot de passe incorrect
                API-->>FE: Status 401 "Identifiants incorrects"
                FE->>User: Affiche erreur 401
            else Mot de passe correct
                API->>API: Génère JWT token
                API->>API: Récupère centre si personnel/admin
                API-->>FE: Status 200 + token + userData

                FE->>AUTH: Appelle login(token, userData)
                AUTH->>AUTH: Sauvegarde token dans localStorage
                AUTH->>AUTH: Sauvegarde user dans localStorage
                AUTH->>FE: Met à jour état isAuthenticated

                FE->>User: Redirige vers /dashboard
                Note over User,FE: Connexion réussie ✅
            end
        end
    end
```

---

## 3. DIAGRAMME DE CAS D'UTILISATION

```
graph TB
    subgraph Acteurs
        Donneur["👤 Donneur"]
        Personnel["👨‍⚕️ Personnel Centre"]
        Admin["🔐 Administrateur"]
    end

    subgraph Système VitaSang
        Login["🔑 Se Connecter"]
        Dashboard["📊 Voir Tableau de Bord"]
        GerererStock["📦 Gérer Stock Sanguin"]
        GererRendezVous["📅 Gérer Rendez-vous"]
        ViewGeoMap["🗺️ Voir Carte Géolocalisation"]
        CreateAlerts["⚠️ Créer Alertes"]
        ViewAlerts["👁️ Consulter Alertes"]
        ManageUsers["👥 Gérer Utilisateurs"]
        ExportReports["📄 Exporter Rapports"]
    end

    subgraph Fonctionnalités Communes
        UpdateProfile["✏️ Mettre à Jour Profil"]
        Logout["🚪 Se Déconnecter"]
        ViewHistory["📝 Voir Historique"]
    end

    %% Relations Donneur
    Donneur -->|utilise| Login
    Donneur -->|accède| Dashboard
    Donneur -->|peut| UpdateProfile
    Donneur -->|peut| ViewHistory
    Donneur -->|peut| Logout
    Donneur -->|prend| GererRendezVous
    Donneur -->|peut voir| ViewGeoMap

    %% Relations Personnel
    Personnel -->|utilise| Login
    Personnel -->|accède| Dashboard
    Personnel -->|gère| GerererStock
    Personnel -->|gère| GererRendezVous
    Personnel -->|consulte| ViewGeoMap
    Personnel -->|crée| CreateAlerts
    Personnel -->|consulte| ViewAlerts
    Personnel -->|peut| UpdateProfile
    Personnel -->|peut| Logout

    %% Relations Admin
    Admin -->|utilise| Login
    Admin -->|accède| Dashboard
    Admin -->|supervise| GerererStock
    Admin -->|supervise| GererRendezVous
    Admin -->|supervise| CreateAlerts
    Admin -->|supervise| ViewAlerts
    Admin -->|gère| ManageUsers
    Admin -->|exporte| ExportReports
    Admin -->|peut| UpdateProfile
    Admin -->|peut| Logout

    style Login fill:#ff6b6b
    style Dashboard fill:#4ecdc4
    style GerererStock fill:#45b7d1
    style GererRendezVous fill:#96ceb4
    style ViewGeoMap fill:#ffeaa7
    style CreateAlerts fill:#dfe6e9
    style ManageUsers fill:#a29bfe
```

---

## 4. DIAGRAMME D'ÉTAT/TRANSITION - CYCLE DE VIE DE LA CONNEXION

```
stateDiagram-v2
    [*] --> NonAuthentifie: Application Démarrée

    NonAuthentifie --> FormulaireSaisie: Utilisateur Ouvre Login

    FormulaireSaisie --> ValidationForm: Utilisateur Soumet

    ValidationForm --> FormulaireSaisie: ❌ Erreur Format
    note right of FormulaireSaisie
        - Téléphone invalide
        - Mot de passe trop court
    end note

    ValidationForm --> EnvoiRequete: ✅ Validation OK

    EnvoiRequete --> Chargement: Envoi POST /login
    note right of Chargement
        Loading = true
        Invite désActivée
    end note

    Chargement --> ErreurReseau: ❌ Erreur Réseau
    note right of ErreurReseau
        Status: Network Error
        Message: Vérifiez connexion
    end note

    Chargement --> ErreurAuthent: ❌ Identifiants Incorrects
    note right of ErreurAuthent
        Status: 401
        Utilisateur non trouvé
        ou Mot de passe incorrect
    end note

    Chargement --> ErreurAcces: ❌ Accès Refusé
    note right of ErreurAcces
        Status: 403
        Rôle non autorisé
        (ex: Donneur sur app Desktop)
    end note

    Chargement --> Authentifie: ✅ Connexion Réussie
    note right of Authentifie
        Token généré et sauvegardé
        Données utilisateur chargées
        localStorage mis à jour
    end note

    ErreurReseau --> FormulaireSaisie: Réessayer
    ErreurAuthent --> FormulaireSaisie: Réessayer
    ErreurAcces --> FormulaireSaisie: Réessayer

    Authentifie --> Dashboard: Redirection Automatique
    note right of Dashboard
        isAuthenticated = true
        Accès aux pages protégées
    end note

    Dashboard --> Connecte: Chargement Complété

    Connecte --> EnCours: Navigation App
    note right of EnCours
        - Consulter Stock
        - Gérer Rendez-vous
        - Voir Alertes
        - etc...
    end note

    EnCours --> Connecte: Navigation (boucle)

    Connecte --> Deconnexion: Clic Logout

    Deconnexion --> NonAuthentifie: localStorage vidé

    NonAuthentifie --> [*]: Fin Session
```

---

## Résumé Architecture

### Architecture Globale

- **Frontend Desktop**: React + TypeScript + TailwindCSS (app bureau)
- **Frontend Mobile**: React Native + Expo (app mobile)
- **Backend**: Node.js + Express + MySQL + JWT
- **BDD**: Sequelize ORM + MySQL

### Flux Authentification

1. Utilisateur saisit identifiants
2. Frontend valide format
3. POST vers `/api/users/login`
4. Backend cherche utilisateur + vérifie mot de passe
5. Si valide → génère JWT + retourne données
6. Frontend sauvegarde token et user
7. Redirection vers dashboard

### Rôles Autorisés Desktop

- `admin` ✅
- `centre_manager` ✅
- `personnel` ✅
- `donneur` ❌ (erreur 403)
