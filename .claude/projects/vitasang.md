---
name: vitasang
description: Projet VitaSang - Application de gestion de dons de sang
---

# Projet VitaSang

Application multi-plateforme de gestion de dons de sang avec alertes en temps réel, géolocalisation et messagerie.

## Équipe d'agents

| Agent | Rôle | Technologie |
|---|---|---|
| **orchestrator** | Chef de projet / Architecte | Coordination générale |
| **backend-engineer** | API & services | Node.js, Express 5, Sequelize |
| **frontend-mobile** | App mobile | React Native, Expo SDK 54 |
| **web-landing** | Site vitrine | TanStack Start, Tailwind CSS |
| **devops** | Infrastructure | Docker, GitHub Actions, Render |
| **database** | Base de données | MariaDB/MySQL, Sequelize |
| **security** | Sécurité & auth | JWT, Helmet, rate-limit |
| **testing** | Qualité & tests | Jest, Supertest |
| **performance-scalability** | Perf, cache, scalabilité | Redis, PM2, Sentry |
| **ui-ux-designer** | Design & accessibilité | Moti, Tailwind, i18n |

## Workflow
1. Une demande arrive → **orchestrator** analyse et décompose
2. Les tâches sont assignées aux agents spécialisés
3. Chaque agent travaille dans son domaine
4. **orchestrator** vérifie la cohérence inter-domaines
5. Intégration et validation finale

## Architecture
- **Backend**: API REST Express 5 avec MariaDB/MySQL + Redis
- **Mobile**: React Native Expo avec navigation par tabs
- **Web**: Landing page TanStack Start déployée sur Cloudflare
- **CI/CD**: GitHub Actions → Render (backend) + Cloudflare (web) + EAS (mobile)

## Commandes utiles
```bash
# Backend
cd backend && npm run dev    # Développement
cd backend && npm test       # Tests
cd backend && npm start      # Production

# Mobile
cd frontend && npx expo start  # Développement
cd frontend && npm test        # Tests

# Landing page
cd vitasang-landing-page && bun dev  # Développement
```