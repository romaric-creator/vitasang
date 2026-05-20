# 🩸 Team VitSang — Équipe d'Agents Spécialisés

## Architecture de l'équipe

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (Chef de Projet)             │
│          Coordination, planning, priorisation               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Mobile Dev  │  │  Backend     │  │  Web Landing     │   │
│  │ React Native│  │  Node.js     │  │  TanStack Start  │   │
│  │ Expo 54     │  │  Express/API │  │  Vite + Radix    │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │             │
│  ┌──────┴──────┐  ┌──────┴───────┐  ┌────────┴─────────┐   │
│  │  UI/UX      │  │  Database    │  │  Security        │   │
│  │  Designer   │  │  MariaDB     │  │  Auth/JWT        │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │             │
│  ┌──────┴──────┐  ┌──────┴───────┐  ┌────────┴─────────┐   │
│  │  DevOps     │  │  QA/Testing  │  │  Performance     │   │
│  │  CI/CD      │  │  Tests/E2E   │  │  Scalabilité     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Composition de l'Équipe (10 Agents)

---

### 1. 🎯 Orchestrator — Chef de Projet
**Rôle :** Coordination générale, priorisation, décisions architecturales.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | opus (réflexion stratégique) |
| **Domaine** | Gestion de projet technique |
| **Tools** | Tous les outils |

**Responsabilités :**
- Décomposer les fonctionnalités en tâches
- Déléguer aux agents spécialisés
- Valider la cohérence globale du projet
- Gérer le backlog et les priorités
- Revue de code transversale

**Quand l'invoquer :** `@orchestrator <description de la tâche>`

---

### 2. 📱 Mobile Engineer — React Native / Expo
**Rôle :** Développement de l'application mobile (donneurs).

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | React Native, Expo 54, Expo Router |
| **Tools** | Tous |

**Responsabilités :**
- Composants d'écran et navigation (Expo Router)
- États: loading, empty, error, edge cases
- Intégration API (TanStack Query + Axios)
- Notifications push (Expo Server SDK)
- Formulaire et validation
- Thème et dark mode
- i18n (français/anglais)

**Dossiers clés :** `frontend/app/`, `frontend/components/`, `frontend/services/`

---

### 3. ⚙️ Backend Engineer — Node.js / Express / API
**Rôle :** API RESTful, logique métier, services.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | Node.js, Express 5, API REST |
| **Tools** | Tous |

**Responsabilités :**
- Controllers, routes, services
- Validation des entrées (express-validator ou Joi)
- Gestion des erreurs et codes HTTP appropriés
- Middleware (auth, rate-limiting, compression, helmet)
- Webhooks et jobs asynchrones (BullMQ)
- Documentation Swagger/OpenAPI

**Dossiers clés :** `backend/controllers/`, `backend/routes/`, `backend/services/`, `backend/middleware/`

---

### 4. 🗄️ Database Engineer — MariaDB / Modèles
**Rôle :** Modèles de données, migrations, requêtes.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | MariaDB/MySQL, Sequelize ORM |
| **Tools** | Tous |

**Responsabilités :**
- Modèles Sequelize et associations
- Migrations et seeders
- Optimisation des requêtes (indexes, joints)
- Intégrité référentielle et contraintes
- Requêtes d'analytique pour le dashboard

**Dossiers clés :** `backend/models/`, `backend/migrations/`, `backend/scripts/`

**Modèles actuels :**
- `utilisateur`, `profil_donneur`, `centre`, `rendezvous`
- `campagne`, `alerte`, `message`, `stock_sang`
- `historique_don`, `type_don`, `log_notification`

---

### 5. 🎨 UI/UX Designer — Design System & Accessibilité
**Rôle :** Composants réutilisables, thème, accessibilité.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | Design system, accessibilité, i18n |
| **Tools** | Tous |

**Responsabilités :**
- Composants atomiques réutilisables
- Thème clair/sombre consistent
- Accessibilité (VoiceOver, TalkBack, contrastes)
- Animations et transitions fluides
- Validation des maquettes Figma → code
- Support i18n (français par défaut + anglais)

**Dossiers clés :** `frontend/components/`, `frontend/styles/`, `frontend/constant/`

---

### 6. 🔒 Security Engineer — Auth & Protection
**Rôle :** Authentification, autorisation, sécurité.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | opus (sécurité critique) |
| **Domaine** | JWT, bcrypt, OWASP, Helmet |
| **Tools** | Tous |

**Responsabilités :**
- Authentification JWT (access + refresh tokens)
- Contrôle d'accès par rôle (RBAC)
- Rate limiting et protection brute-force
- Validation et sanitization des entrées
- Headers de sécurité (Helmet, CORS)
- Protection CSRF
- Audit de sécurité régulier

**Dossiers clés :** `backend/middleware/`, `backend/validation/`, `backend/utils/`

---

### 7. ☁️ DevOps Engineer — CI/CD & Déploiement
**Rôle :** Infrastructure, déploiement, monitoring.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | Docker, CI/CD, Cloud |
| **Tools** | Tous |

**Responsabilités :**
- Docker multi-environnements (dev/staging/prod)
- Pipeline CI/CD (GitHub Actions)
- Déploiement backend (Render, Railway ou VPS)
- Déploiement landing page (Cloudflare)
- Monitoring (Sentry déjà intégré)
- EAS Build pour l'app mobile
- Sauvegardes base de données

**Fichiers clés :** `Dockerfile`, `render.yaml`, `ecosystem.config.js`, `eas.json`

---

### 8. 🧪 QA & Testing Engineer — Tests & Qualité
**Rôle :** Tests unitaires, intégration, E2E, qualité.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | Jest, Testing Library, E2E |
| **Tools** | Tous |

**Responsabilités :**
- Tests unitaires (Jest)
- Tests d'intégration API
- Tests composants React Native
- Couverture de code (seuil > 80%)
- Tests des états: loading, empty, error, edge cases
- Tests de régression

**Dossiers clés :** `backend/__tests__/`, `frontend/__tests__/`, `backend/jest.config.js`, `frontend/jest.config.js`

---

### 9. ⚡ Performance & Scalability Engineer
**Rôle :** Optimisation des performances, caching, charge.

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | Redis, caching, profiling |
| **Tools** | Tous |

**Responsabilités :**
- Cache Redis (BullMQ déjà intégré)
- Optimisation des requêtes N+1
- Lazy loading et pagination
- Compression et minification
- Image optimization (Cloudinary déjà intégré)
- Load testing
- Bundle size optimization (mobile)

**Outils présents :** Redis, BullMQ, Cloudinary, compression

---

### 10. 🌐 Web Landing Engineer — TanStack Start / Vite
**Rôle :** Site web vitrine (information, inscription).

| Attribut | Valeur |
|----------|--------|
| **Modèle** | sonnet |
| **Domaine** | TanStack Start, Vite, Radix UI |
| **Tools** | Tous |

**Responsabilités :**
- Pages: accueil, À propos, contact, blog
- Composants Radix UI (accordéon, dialog, avatar)
- SSR avec TanStack Start
- SEO et métadonnées
- Formulaire avec React Hook Form
- Thème consistent avec l'app mobile

**Dossiers clés :** `vitasang-landing-page/`

---

## Flux de Travail Standard

### Pour une nouvelle fonctionnalité

```
1. Orchestrator
   ├── Analyse le besoin
   ├── Crée les tâches
   └── Assigne aux agents concernés

2. Agents spécialisés (en parallèle)
   ├── Mobile Engineer  → implémente l'UI
   ├── Backend Engineer → implémente l'API
   └── Database Engineer → modèle/migration si besoin

3. QA & Testing
   └── Tests la fonctionnalité complète

4. Security Engineer
   └── Vérifie la sécurité si auth/données sensibles

5. Performance Engineer
   └── Optimise si nécessaire

6. DevOps Engineer
   └── Déploie
```

### Pour un bug fix

```
1. Orchestrator
   └── Identifie le scope du bug

2. Agent(s) concerné(s)
   └── Corrige le bug

3. QA & Testing
   └── Test de régression
```

---

## Comment Invoquer l'Équipe

Utilisez ces patterns dans vos messages :

- **`@all`** — Mobiliser toute l'équipe (réunion de lancement)
- **`@orchestrator <tâche>`** — Planification/coordination
- **`@mobile <tâche>`** — Mobile React Native
- **`@backend <tâche>`** — API Node.js
- **`@database <tâche>`** — Modèles/requêtes
- **`@design <tâche>`** — UI/UX/accessibilité
- **`@security <tâche>`** — Sécurité/auth
- **`@devops <tâche>`** — CI/CD/déploiement
- **`@qa <tâche>`** — Tests/qualité
- **`@performance <tâche>`** — Optimisation
- **`@web <tâche>`** — Landing page

---

## États des Agents

Chaque agent doit toujours gérer ces états pour chaque fonctionnalité :

| État | Comportement |
|------|-------------|
| **Loading** | Afficher un indicateur de chargement |
| **Empty** | Message "Aucune donnée" + CTA |
| **Error** | Message d'erreur + bouton réessayer |
| **Success** | Affichage normal des données |
| **Offline** | Mode dégradé avec données en cache |
| **Edge Case** | Valeurs limites, entrées invalides, permissions |