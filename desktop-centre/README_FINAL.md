# VitaSang Desktop - Centre Management Dashboard

Version finale de l'application de gestion des centres de transfusion sanguine pour VitaSang.

## 📋 Description

L'application desktop VitaSang pour les centres de santé permet aux administrateurs et au personnel des centres de:

- **Tableau de Bord**: Vue d'ensemble des statistiques en temps réel
- **Gestion des Stocks**: Mise à jour et suivi des stocks de sang par groupe sanguin
- **Validation des Alertes SOS**: Validation et diffusion des alertes de demande urgente de sang
- **Gestion des Rendez-vous**: Affichage et gestion des rendez-vous des donneurs
- **Carte des Centres**: Visualisation du réseau des centres agréés

## 🚀 Features

### Authentification

- Login avec numéro de téléphone et mot de passe
- Authentification JWT
- Gestion des rôles (personnel, admin, centre_manager)
- Sessions persistantes

### Dashboard

- Statistiques en temps réel
- Alertes critiques
- Stock sanguin par groupe
- Rendez-vous prévus

### Gestion des Stocks

- Affichage des stocks actuels
- Mise à jour facile avec modal
- Indicateurs de statut (Critique, Faible, Suffisant)
- Données en temps réel du backend

### Validation des Alertes

- Liste des demandes SOS en attente
- Détails complets de chaque alerte
- Validation et diffusion aux donneurs
- Rejet des demandes invalides
- Statuts urgence: Normal, Urgent, Très Urgent

### Rendez-vous

- Liste des rendez-vous planifiés
- Validation des nouvelles arrivées
- Rejet des rendez-vous
- Historique des dons

### Carte Interactive

- Liste de tous les centres agréés
- Filtrage par groupe sanguin
- Filtrage par rayon de proximité
- Informations de contact pour chaque centre
- Capacité de stockage

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── Layout.tsx       # Layout principal avec sidebar
│   └── ProtectedRoute.tsx # Route protégée par rôle
├── context/             # Context React
│   └── AuthContext.tsx   # Gestion d'authentification
├── pages/               # Pages de l'application
│   ├── Login.tsx        # Page de connexion
│   ├── Dashboard.tsx    # Tableau de bord
│   ├── BloodStock.tsx   # Gestion des stocks
│   ├── Alerts.tsx       # Validation des alertes
│   ├── Appointments.tsx # Gestion des rendez-vous
│   └── Map.tsx          # Carte des centres
├── services/            # Services API
│   └── api.ts           # Configuration Axios
├── hooks/               # Hooks personnalisés
│   └── useApi.ts        # Hook pour les appels API
├── types/               # Types TypeScript
│   └── index.ts         # Types génériques de l'API
└── main.tsx             # Point d'entrée
```

## 🔄 Intégration API

L'application est intégrée avec l'API VitaSang backend (Node.js + Express).

### Endpoints utilisés

**Authentification**

- `POST /users/login` - Connexion

**Centres**

- `GET /centres` - Récupérer tous les centres
- `GET /centres/:id/stats` - Statistiques du centre
- `GET /centres/:id/stock` - Stock sanguin du centre
- `PUT /centres/:id/stock` - Mettre à jour le stock

**Alertes**

- `GET /alerts/pending` - Alertes en attente de validation
- `POST /alerts/:id/validate` - Valider une alerte
- `PUT /alerts/:id` - Mettre à jour une alerte
- `DELETE /alerts/:id` - Rejeter une alerte

**Rendez-vous**

- `GET /rendezvous/centre/:id` - Rendez-vous du centre
- `PUT /rendezvous/:id` - Mettre à jour le statut

## 📦 Dépendances

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^7.13.1",
  "axios": "^1.13.6",
  "lucide-react": "^0.577.0",
  "date-fns": "^3.6.0"
}
```

## 🔐 Authentification

L'authentification utilise JWT tokens stockés en localStorage:

```typescript
// Structure du token
{
  "token": "jwt_token_string",
  "user": {
    "id_utilisateur": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "6XXXXXXXX",
    "email": "user@example.com",
    "role": "admin",
    "centre": {
      "id_centre": 1,
      "nom_centre": "CHU Central",
      "adresse": "123 Rue",
      "...": "other fields"
    }
  }
}
```

## 🌐 Environnement

### Variables d'environnement

Créez un fichier `.env` à la racine du projet:

```env
VITE_API_URL=https://votre-api.com/api
```

### Configuration

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`

## 🎯 États & Rôles

### Rôles Autorisés

- `admin` - Accès complet
- `personnel` - Accès limité
- `centre_manager` - Gestion du centre

### Statuts des Alertes

- `en_attente_validation` - En attente de validation
- `en_cours` - Active
- `termine` - Terminée
- `annule` - Annulée

### Statuts des Rendez-vous

- `planifie` - Planifié
- `valide` - Validé
- `absent` - Absent à RDV
- `annule` - Annulé

## 🛠️ Développement

### Ajouter une nouvelle page

1. Créer le fichier dans `src/pages/NomPage.tsx`
2. Ajouter la route dans `App.tsx`
3. Ajouter le lien dans `Layout.tsx`

### Ajouter une nouvelle fonction API

1. Utiliser le hook `useApi()` ou directement `api` service
2. Ajouter le type dans `src/types/index.ts`
3. Gérer les erreurs et le loading

```typescript
const { request, loading, error } = useApi();

const fetchData = async () => {
  const data = await request("get", "/endpoint");
};
```

## 🐛 Gestion d'erreurs

Les erreurs sont gérées globalement dans:

- AuthContext (expiration token, déconnexion)
- useApi hook (centralisation erreurs)
- Chaque page (affichage utilisateur)

## 📱 Responsive Design

L'application utilise Tailwind CSS et est responsive sur:

- Desktop (1280px+)
- Tablet (768px+)
- Mobile (320px+)

## 🔒 Sécurité

- JWT tokens pour authentification
- ProtectedRoute pour protéger les pages
- CORS configuré via axios interceptor
- Gestion des sessions expirants
- Données sensibles en localStorage (token/user)

## 📝 Notes de Développement

- Les types TypeScript sont centralisés dans `src/types/index.ts`
- L'API est configurée dans `src/services/api.ts`
- Dark mode supporté via CSS variables
- Support du français (i18n avec date-fns)

## 🚀 Déploiement

L'application peut être déployée via:

- **Vercel**: `npm run build` puis push sur GitHub
- **Netlify**: Même process avec intégration GitHub
- **Docker**: À configurer selon besoins
- **Autres**: Serveur avec support SPA

## 📞 Support

Pour les problèmes ou questions:

1. Vérifier les logs de la console (F12)
2. Vérifier la connectivité API
3. Vérifier les variables d'environnement
4. Vérifier les tokens JWT

## 📄 License

VitaSang © 2025 - Tous droits réservés

## 🙏 Crédits

Création: TENDA BOUPDA CHRISTIAN ROMARIC
Projet: VitaSang - Plateforme de Gestion du Don de Sang
Année: 2025
