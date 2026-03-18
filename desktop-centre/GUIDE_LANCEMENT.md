# GUIDE DE LANCEMENT - VitaSang Desktop

## 🚀 Lancement Rapide

### Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0
- Accès à l'API VitaSang backend (Node.js/Express)
- Base de données MySQL connectée

### Installation

```bash
# 1. Accéder au dossier desktop-centre
cd desktop-centre

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF

# Note: Remplacer http://localhost:3000/api par l'URL de votre backend
```

## 🎯 Environnements

### Development

```bash
# Démarrer le serveur de développement
npm run dev

# Accéder via le navigateur
# http://localhost:5173

# La app se recharge automatiquement lors de modifications
```

**Caractéristiques du mode dev:**

- Hot reload activé
- Source maps complètes
- Erreurs détaillées console
- API en développement (localhost par défaut)

### Production Build

```bash
# Compiler pour production
npm run build

# Vérifier le build
npm run preview

# Accéder via le navigateur
# http://localhost:5173 (preview seulement)
```

**Taper la commande pour déployer:**

```bash
npm run build
# Puis déployer le dossier ./dist/ sur votre serveur
```

## 🔍 Configuration API

### Développement Local

```bash
# .env (développement)
VITE_API_URL=http://localhost:3000/api
```

Assurez-vous que le backend tourne:

```bash
cd ../backend
npm run dev
# Backend devrait écouter sur http://localhost:3000
```

### Production Distante

```bash
# .env (production)
VITE_API_URL=https://api.example.com/api
```

Remplacer `https://api.example.com/api` par l'URL réelle de votre API.

## 🧪 Tests Rapides

### 1. Vérifier la Connexion API

```bash
# Dans la console navigateur (F12)
fetch('http://localhost:3000/api/centres')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 2. Tester Login

```
URL: http://localhost:5173/login
Téléphone: (tester avec un utilisateur créé dans la DB)
Mot de passe: (vérifier dans la DB users table)
```

### 3. Vérifier les Erreurs

Ouvrir DevTools:

- **F12** ou **Ctrl+Maj+I**
- Aller à l'onglet **Console**
- Vérifier pas de red errors
- Vérifier que les API calls réussissent (Network tab)

## 📚 Commandes npm

```bash
# Développement
npm run dev          # Démarrer serveur dev
npm run lint         # Vérifier erreurs TypeScript
npm run preview      # Preview du build production

# Production
npm run build        # Compiler pour production
npm run build-only   # Build sans lint
npm run type-check   # Vérifier types TypeScript

# Nettoyage
npm run clean        # Supprimer le build
```

## 🔐 Données de Test

**Utilisateurs de test dans la DB (exemple):**

```
Téléphone: 691234567
Mot de passe: Password123!
Rôle: admin

Téléphone: 695678901
Mot de passe: Password123!
Rôle: personnel
```

Adapter selon les utilisateurs réels dans votre base MySQL.

## 🐛 Dépannage

### Erreur: "Cannot find module"

```bash
# Solution
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur: "VITE_API_URL not defined"

```bash
# Vérifier le fichier .env existe
cat .env

# Doit contenir:
# VITE_API_URL=http://localhost:3000/api
```

### Erreur: "Cannot login"

1. Vérifier que le backend tourne:

   ```bash
   curl http://localhost:3000/api/centres
   ```

2. Vérifier les identifiants dans la DB MySQL

3. Vérifier les logs du backend

### Erreur: "Network tab shows 404"

```bash
# Vérifier l'URL API dans .env
# Doit correspondre à l'URL du backend
# Vérifier pas d'erreur typo
```

### Page blanche après login

1. Ouvrir DevTools (F12)
2. Vérifier Console pour erreurs
3. Vérifier qu'AuthContext initialise correctement
4. Vérifier localStorage contient le token

## 📝 Logs & Débogage

### Voir les Logs du Navigateur

```javascript
// Dans la console F12
localStorage.getItem("authToken"); // Affiche le token
localStorage.getItem("user"); // Affiche les infos utilisateur
localStorage.clear(); // Efface tout (logout)
```

### Activer les Logs API

Modifier `src/services/api.ts`:

```typescript
// Ajouter après la création du client axios
api.interceptors.request.use((config) => {
  console.log(`API REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});
```

### MonitorerLes Erreurs

Ouvrir DevTools, Network tab:

- Voir les requêtes HTTP
- Vérifier les statuts (200, 401, 404, 500)
- Cliquer sur la requête pour détails

## 🚀 Déploiement

### Option 1: Vercel (Recommandé)

```bash
# 1. Push le code sur GitHub

# 2. Connecter le repo à Vercel
# https://vercel.com/new

# 3. Configurer les variables d'environnement
# VITE_API_URL = https://votre-api-backend.com/api

# 4. Déployer automatiquement sur push
```

### Option 2: Netlify

```bash
# 1. Build localement
npm run build

# 2. Drag & drop le dossier ./dist sur Netlify

# Ou:
# 3. Installer Netlify CLI
npm install -g netlify-cli

# 4. Déployer
netlify deploy --prod --dir=dist
```

### Option 3: Serveur Custom

```bash
# 1. Build
npm run build

# 2. Copier le fichier dist vers le serveur
scp -r dist/* user@server:/var/www/html/

# 3. Configurer Nginx/Apache pour SPA (rewrite vers index.html)
```

## 🔒 Sécurité

### Points à Vérifier

- [x] JWT tokens en localStorage
- [x] HTTPS en production
- [x] CORS configuré correctement
- [x] Tokens expiration gérée
- [x] Pas de secrets en env public

### Avant Production

```bash
# 1. Vérifier les variables sensibles
cat .env   # Ne doit pas contenir de secrets

# 2. Vérifier les builds
npm run build
ls -la dist/

# 3. Tester l'app production
npm run preview
```

## 📞 Aide & Support

### Ressources

- [Vite Documentation](https://vitejs.dev/)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Commandes Utiles

```bash
# Vérifier version Node
node --version

# Vérifier version npm
npm --version

# Émettre npm cache
npm cache clean --force

# Mettre à jour npm
npm install -g npm@latest

# Mettre à jour les packages
npm update
```

---

**Dernière Mise à Jour**: 2025
**Version**: 1.0.0
**Status**: Production Ready
