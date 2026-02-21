# 🩸 VitaSang - Application de Don de Sang

Une application complète de gestion des dons de sang avec localisation en temps réel et gestion d'alertes.

## 📱 Features

- ✅ Authentification sécurisée (JWT)
- ✅ Recherche de centres par localisation (Maps)
- ✅ Historique des dons
- ✅ Système d'alertes urgentes
- ✅ Gestion des rendez-vous
- ✅ Suivi des stocks sanguins

## 🏗️ Architecture

```
VitaSang/
├── backend/          # API Node.js/Express
│   ├── models/       # Modèles Sequelize
│   ├── controllers/  # Logique métier
│   ├── routes/       # Définition des endpoints
│   └── config/       # Configuration DB
└── frontend/         # App React Native/Expo
    ├── app/          # Navigation & Screens
    ├── components/   # Composants réutilisables
    ├── services/     # Appels API
    └── utils/        # Utilitaires
```

## 🛠️ Stack Technique

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework web
- **Sequelize** - ORM
- **MariaDB** - Base de données
- **JWT** - Authentification

### Frontend
- **React Native** - Framework mobile
- **Expo** - Tooling
- **React Navigation** - Navigation
- **React Native Maps** - Géolocalisation
- **TypeScript** - Type safety

## 🚀 Installation

### Prérequis
- Node.js 18+
- MariaDB 10.5+
- npm ou yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
# Choisir la plateforme (iOS/Android/Web)
```

## 📚 Documentation des APIs

[Voir la documentation Postman](./backend/vitasang_api.postman_collection.json)

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/users/register` | S'inscrire |
| POST | `/api/users/login` | Se connecter |
| GET | `/api/users` | Lister tous les utilisateurs |
| GET | `/api/users/:id` | Détails utilisateur |
| GET | `/api/users/groupe-sanguin/:groupe` | Filtrer par groupe |

## 🔐 Variables d'environnement

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_password
DB_NAME=vitasang
JWT_SECRET=votre_secret_jwt
PORT=3000
```

## 📋 Workflow Git

- `main` - Production (versions stables)
- `develop` - Développement
- `feature/*` - Nouvelles fonctionnalités
- `bugfix/*` - Corrections de bugs
- `hotfix/*` - Corrections urgentes

## 🤝 Contribution

1. Créer une branche `feature/ma-fonctionnalite`
2. Faire des commits clairs et descriptifs
3. Pousser et créer une Pull Request
4. Les PR seront revues avant merge

## 📝 Commits

Format recommandé :
```
feat: Ajouter la recherche par groupe sanguin
fix: Corriger le bug de connexion
docs: Mettre à jour le README
refactor: Refactoriser le service utilisateur
test: Ajouter les tests pour le modèle Alerte
```

## 📊 Statut du Projet

- [ ] Implémenter tous les endpoints API
- [ ] Ajouter la suite de tests
- [ ] Documentation complète
- [ ] Déploiement staging
- [ ] Déploiement production

## 👨‍💻 Auteur

[Votre Nom]

## 📄 Licence

ISC

## 📞 Support

Pour toute question, veuillez créer une issue.
