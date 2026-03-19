# Guide de Déploiement Continu : API Backend sur Koyeb

Félicitations pour le choix de **Koyeb**. C'est une excellente plateforme qui déploiera votre API Node.js/Express gratuitement et sans mise en veille.

Le processus de **CI/CD** (Intégration Continue / Déploiement Continu) est géré nativement par Koyeb via sa connexion directe à votre compte GitHub. À chaque fois que vous ferez un `git push` sur la branche principale (ex: `main`), Koyeb téléchargera le code, reconstruira l'image Docker, et remplacera l'ancien serveur sans interruption (Zero Downtime Deployment).

---

## 🚀 Étape 1 : Préparation de la Base de Données (Redis & MariaDB)

Avant de lancer le backend, il a besoin de ses bases de données.
1. **MariaDB** : Assurez-vous d'avoir une URL de base de données MySQL ou MariaDB hébergée quelque part (PlanetScale, Aiven, Cleaver Cloud, ou votre précédent hébergeur).
2. **Redis (Gratuit)** :
   A. Allez sur [Upstash.com](https://upstash.com/) et créez un compte gratuit.
   B. Créez une nouvelle base de données Redis.
   C. Copiez le **Redis URL** (qui ressemble à : `redis://default:motdepasse@serveur.upstash.io:30000`).

## ⚙️ Étape 2 : Lier Koyeb à GitHub (CI/CD Automatique)

1. Allez sur [Koyeb.com](https://app.koyeb.com/) et créez un compte.
2. Cliquez sur le bouton **"Create App"** ou **"Deploy"**.
3. Choisissez **GitHub** comme méthode de déploiement.
4. Sélectionnez le dépôt `blood-donation-app` (donnez la permission à Koyeb d'y accéder si besoin).
5. Dans la section **Builder**, Koyeb devrait détecter automatiquement le `Dockerfile` situé dans votre dossier `backend`. 
   * **ATTENTION IMPORTANTE** : Puisque c'est un "Monorepo" (Frontend + Backend dans le même dépôt git), au moment de configurer le "Work directory" ou "Root directory" dans Koyeb, **assurez-vous d'écrire spécifiquement `/backend`**. Cela dira à Koyeb d'ignorer le code React Native et de ne compiler que l'API Express.
6. Assurez-vous que Koyeb utilise le type de build **Docker**.

## 🔐 Étape 3 : Variables d'Environnement (Les Secrets)

Durant la configuration sur Koyeb (juste avant de valider le déploiement), cherchez la section **Environment Variables**.
Puisque le fichier `.env` est ignoré par Docker (pour des raisons de sécurité), vous devez renseigner toutes vos variables manuellement dans l'interface de Koyeb :

| Clé | Valeur Exemple | Note |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Active le mode prod d'Express et coupe les logs inutiles. |
| `PORT` | `8000` | Port d'exposition interne (utilisé par notre Dockerfile). |
| `DB_HOST` | `tcp://votre-maria-db.com` | IP ou lien du serveur MariaDB. |
| `DB_USER` | `vitasang_admin` | Nom d'utilisateur SQL. |
| `DB_PASS` | `motDePasseSuperSecret` | Mot de passe SQL. |
| `DB_NAME` | `vitasang_db` | Nom de la base. |
| `JWT_SECRET` | `votre_cle_jwt_tres_longue` | Clé secrète pour générer les tokens de connexion. |
| `REDIS_URL` | `redis://...upstash.io:30000` | L'URL récupérée chez Upstash à l'Étape 1. |

> **Note sur le Port** : Koyeb détectera généralement tout seul le bon port. Si une option **Exposed Port** vous est demandée dans l'interface serveur Koyeb, indiquez `8000`.

## ✅ Étape 4 : Déploiement !

1. Renommez le service Koyeb si vous le souhaitez (ex: `vitasang-api`).
2. Cliquez sur **Deploy**.
3. Observez la console de logs en direct. Le conteneur exécutera la commande d'installation NPM, puis PM2 liera le processus aux cœurs virtuels disponibles.
4. Une fois l'indicateur passé au "Vert" (Healthy), Koyeb vous fournira un lien du type `https://vitasang-api-xyz.koyeb.app`. 

Ce lien est dorénavant **l'URL de votre Backend en production**.

---

## 📱 Étape 5 : Connecter vos Clients (Frontends)

Maintenant que l'API est en ligne, mettez à jour la destination de vos deux applications Clientes avec la nouvelle URL fournie par Koyeb :

**Dans l'application Mobile (Frontend) :**
Modifiez le fichier `.env` ou `app.json` :
`EXPO_PUBLIC_API_BASE_URL="https://vitasang-api-xyz.koyeb.app/api"`

**Dans le Tableau de Bord Web (Desktop-Centre) :**
Si vous le déployez sur Vercel, ajoutez cette variable d'environnement dans les paramètres Vercel du frontend :
`VITE_API_URL="https://vitasang-api-xyz.koyeb.app/api"`

*C'est terminé ! Désormais, un simple `git push origin main` mettra à jour l'API mondialement sans que vous n'ayez besoin de taper une seule ligne sur un serveur FTP ou Bash distant.*
