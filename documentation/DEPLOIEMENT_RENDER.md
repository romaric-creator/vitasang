# Guide de Déploiement Gratuit (Sans Carte Bancaire) sur Render.com

Render est l'alternative gratuite la plus populaire aujourd'hui. L'inscription nécessite uniquement un compte GitHub, sans aucune carte de crédit exigée pour l'offre "Free".

---

## 🚀 Étape 1 : Créer votre compte
1. Allez sur la page d'inscription de [Render.com](https://dashboard.render.com/register).
2. Cliquez sur **GitHub** pour vous inscrire en 1 clic.

## 🛠️ Étape 2 : Déployer le Backend de l'Application
1. Une fois connecté sur le tableau de bord Render, cliquez sur le bouton **New +** puis sélectionnez **Web Service**.
2. Dans la section "Connect a repository", recherchez et sélectionnez votre dépôt GitHub contenant le projet `vitasang` (autorisez l'accès à Render si c'est votre première fois).
3. Remplissez le formulaire de configuration :
   * **Name** : `vitasang-api` (ou le nom de votre choix)
   * **Region** : `Frankfurt (EU)` (Le plus rapide pour l'Afrique et l'Europe)
   * **Branch** : `main` (ou master)
   * **Root Directory** : `backend` *(TRÈS IMPORTANT : cela indique à Render de n'exécuter que l'API)*
   * **Runtime** : `Docker` *(Render lira automatiquement notre fichier Dockerfile créé pour PM2)*
   * **Instance Type** : Sélectionnez bien `Free` ($0/month)

## 🔐 Étape 3 : Variables d'Environnement (Secrets)
Descendez jusqu'à la section **Environment Variables** (au bas de la page de création). Cliquez sur *Add Environment Variable* et copiez/collez les secrets de votre ancien fichier `.env` serveur :

| Key | Value Exemple |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DB_HOST` | `tcp://votre-maria-db-ailleurs.com` |
| `DB_USER` | `root_ou_vitasang` |
| `DB_PASS` | `motDePasseSecrett` |
| `DB_NAME` | `vitasang_db` |
| `JWT_SECRET` | `votre_cle_jwt_securisee` |
| `REDIS_URL` | L'URL générée gratuitement (sans carte bancaire) sur Upstash.com |

## ✅ Étape 4 : Lancement !
1. Cliquez tout en bas sur le gros bouton **Create Web Service**.
2. Une fenêtre de console (Logs) va apparaître. Render est en train de cloner votre code, d'installer les bibliothèques et de lancer le serveur.
3. Patientez quelques minutes. Dès que la console affiche *"Serveur VITASANG démarré..."*, votre API est officiellement en ligne !
4. Vous trouverez l'URL de production tout en haut à gauche de l'écran (qui ressemble à `https://vitasang-xxx.onrender.com`).

---

## 📱 Étape 5 : Connecter le Mobile à cette nouvelle adresse
Maintenant que Render héberge l'API Firebase, vous devez rediriger votre application mobile et votre Desktop vers ce serveur.

Prenez le lien Render que vous venez de recevoir, ajoutez-y la notion de versioning (api/v1), et mettez à jour votre code mobile :

**Dans le Frontend (Mobile) - Fichier .env ou app.json :**
`EXPO_PUBLIC_API_BASE_URL="https://vitasang-xxx.onrender.com/api"`

*(Vous n'aurez même plus à configurer votre box internet, votre IP locale etc. L'application mobile accédera à Internet pour de vrai !)*
