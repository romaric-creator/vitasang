# VitSang — Application de Don de Sang

## Stack Technique

| Couche | Technologie |
|--------|------------|
| **Mobile** | React Native, Expo 54, Expo Router |
| **Landing Page** | TanStack Start, Vite, Radix UI |
| **Backend** | Node.js, Express 5 |
| **Base de données** | MariaDB, Sequelize ORM |
| **Cache/Queue** | Redis, BullMQ |
| **Auth** | JWT, bcrypt |
| **Upload** | Cloudinary |
| **Monitoring** | Sentry |
| **Notifications** | Expo Server SDK (push) |
| **Mobile OS** | Android + iOS |

## Structure du Projet

```
blood-donation-app/
├── frontend/          # App mobile (React Native / Expo)
│   ├── app/          # Écrans (Expo Router)
│   ├── components/   # Composants réutilisables
│   ├── services/     # Appels API (Axios + TanStack Query)
│   ├── contexts/     # Contextes React
│   └── utils/        # Utilitaires
├── backend/           # API REST (Node.js / Express)
│   ├── controllers/  # Logique des endpoints
│   ├── routes/       # Définition des routes
│   ├── models/       # Modèles Sequelize
│   ├── middleware/   # Auth, validation, etc.
│   ├── services/     # Logique métier
│   ├── jobs/         # Tâches BullMQ
│   └── migrations/   # Migrations DB
├── vitasang-landing-page/  # Site vitrine TanStack Start
├── design/           # Assets de design
├── documentation/    # Documentation du projet
├── Dockerfile        # Docker backend
└── render.yaml       # Déploiement Render
```

## Modèles de Données

- `utilisateur` — Comptes utilisateurs (admin, staff, donneur)
- `profil_donneur` — Profil étendu des donneurs
- `centre` — Centres de don
- `rendezvous` — Rendez-vous de don
- `campagne` — Campagnes de sensibilisation
- `alerte` — Alertes (besoin urgent de sang)
- `message` — Messages entre utilisateurs
- `stock_sang` — Stocks de sang par groupe
- `historique_don` — Historique des dons
- `type_don` — Types de dons (sang total, plasma, etc.)
- `log_notification` — Logs des notifications push