# 🧪 GUIDE DE TEST - CORRECTIONS APPLIQUÉES

**Date:** 7 mars 2026  
**Statut:** 5 priorités complétées sur 7  
**Progression globale:** ~70%

---

## ✅ PRIORITÉ 1: Logging Winston - Comment Tester

### 1️⃣ Vérifier que les logs sont générés
```bash
cd backend

# Démarrer le serveur
npm start

# Vous devriez voir:
# - Logs en console avec couleurs
# - Fichiers créés: logs/combined.log et logs/error.log
```

### 2️⃣ Générer une erreur pour tester les logs
```bash
# Faire une requête POST /api/users/register avec données invalides
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Jean"}'

# Vérifier les logs:
tail -f logs/combined.log

# Vous devriez voir quelque chose comme:
# [2026-03-07 10:15:32] [ERROR] Validation error... 
```

### 3️⃣ Vérifier les fichiers de logs
```bash
# Fichier d'erreurs uniquement
cat logs/error.log

# Tous les logs
cat logs/combined.log

# Voir les logs en temps réel (new entries)
tail -f logs/combined.log
```

✅ **Test réussi si:** Les logs s'affichent avec timestamps et métadonnées complètes

---

## ✅ PRIORITÉ 2: Validation Backend Joi - Comment Tester

### 1️⃣ Test Registration avec données invalides
```bash
# Test 1: Téléphone invalide
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "invalid",
    "mot_de_passe": "Pass123",
    "groupe_sanguin": "O+"
  }'

# Résultat attendu: 400 Bad Request
# {
#   "message": "Erreur de validation",
#   "errors": {
#     "telephone": "Format: +237 6XXXXXXXX ou 2XXXXXXXX..."
#   }
# }
```

### 2️⃣ Test Login avec mot de passe trop court
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+237612345678",
    "mot_de_passe": "short"
  }'

# Résultat attendu: 400 avec message d'erreur
# "Au minimum 6 caractères"
```

### 3️⃣ Test création d'alerte avec groupe sanguin invalide
```bash
curl -X POST http://localhost:3000/api/alerts/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude": 33.5731,
    "longitude": -7.5898,
    "groupe_sanguin": "INVALID",
    "urgence": "URGENT",
    "lieu": "Hôpital",
    "quantite_requise": 5
  }'

# Résultat attendu: 400 avec erreur de validation
```

✅ **Test réussi si:** Les requêtes invalides retournent 400 avec messages clairs

---

## ✅ PRIORITÉ 3: Validation Frontend Formik - Comment Tester

### 1️⃣ Tester l'écran de Registration
```
1. Lancer l'app frontend:
   cd frontend
   npm start

2. Naviguez à /register

3. Testez les validations:
   - Laissez tous les champs vides → error messages
   - Entrez "A" dans nom → "Au minimum 2 caractères"
   - Entrez téléphone invalide → "Format: +237 6XXXXXXXX..."
   - Entrez "pass" en mot de passe → "Au minimum 6 caractères"
   - Selectionnez groupe sanguin → OK

4. Soumettez avec données valides → devrait fonctionner
```

### 2️⃣ Tester l'écran de Login
```
1. Naviguez à /login

2. Testez les validations:
   - Laissez téléphone vide → error
   - Entrez téléphone invalide → error
   - Entrez mot de passe trop court → error

3. Testez avec données valides
```

### 3️⃣ Tester la création d'alerte
```
1. Connectez-vous avec un compte donneur

2. Allez à /create-alert

3. Testez les validations:
   - Laissez les champs vides
   - Entrez quantité = 0 → error "Minimum 1"
   - Entrez lieu vide → error du champ

4. Soumettez avec données valides
```

✅ **Test réussi si:**
- Les messages d'erreur s'affichent immédiatement sous les champs
- Les erreurs disparaissent quand vous corrigez


---

## ✅ PRIORITÉ 4: Gestion Erreurs Frontend - Comment Tester

### 1️⃣ Tester le hook useApiCall avec retry
```bash
# Testez avec le backend arrêté:
1. npm start (frontend)
2. Arrêtez le backend (Ctrl+C)
3. Essayez de vous connecter
4. Vous devriez voir:
   - "Tentative 1/3..." (implicit en UI)
   - Après 3 tentatives: message d'erreur clair
   - Bouton "Réessayer"
```

### 2️⃣ Tester le timeout
```bash
# Le timeout est configuré à 10 secondes
1. Démarrez le backend avec un délai:
   # Arrêtez certains endpoints ou ralentissez la BD
2. Essayez une requête
3. Attendez > 10 secondes
4. Vous devriez voir: "Timeout de connexion"
```

### 3️⃣ Tester les composants d'erreur
```bash
# Une fois intégrés dans les écrans:
1. Provoquez une erreur API
2. Vous devriez voir:
   - ErrorAlert avec message clair
   - Bouton "Réessayer"
   - Bouton "OK"
```

✅ **Test réussi si:** Les erreurs sont gérées gracieusement avec retry logic

---

## ✅ PRIORITÉ 5: Configuration .env - Comment Tester

### 1️⃣ Vérifier les variables sont correctes
```bash
# Backend
head -20 backend/.env.example
# Doit contenrir: DB_HOST, DB_USER, JWT_SECRET, etc.

# Frontend
head -20 frontend/.env.example
# Doit contenir: EXPO_PUBLIC_API_BASE_URL, etc.
```

### 2️⃣ Créer des fichiers .env locaux (si nécessaire)
```bash
# Backend
cp backend/.env.example backend/.env
# Éditer avec vos valeurs réelles

# Frontend  
cp frontend/.env.example frontend/.env
# Éditer avec l'URL API correcte
```

### 3️⃣ Vérifier que l'app utilise les variables
```bash
# Frontend
grep -r "EXPO_PUBLIC_API_BASE_URL" frontend/
# Doit trouver dans axiosConfig.ts

# Backend
grep -r "process.env.JWT_SECRET" backend/
# Doit trouver plusieurs instances
```

✅ **Test réussi si:** Les variables sont utilisées et l'app démarre correctement

---

## ✅ PRIORITÉ 6: Tests Backend Jest - Comment Tester

### 1️⃣ Lancer les tests
```bash
cd backend

# Lancer tous les tests
npm test

# Lancer avec watch mode
npm run test:watch

# Lancer avec coverage
npm run test:coverage
```

### 2️⃣ Résultats attendus
```
PASS  __tests__/unit/geoHelpers.test.js
  GeoHelpers - calculateDistance
    ✓ should calculate distance between two coordinates
    ✓ should return 0 for same coordin
ates
    ✓ should return positive distance
    ...

Tests:       5 passed, 5 total
Coverage:    some % of statements
```

### 3️⃣ Tester un test spécifique
```bash
# Tester juste les auth middleware tests
npm test -- auth.middleware.test.js

# Tester avec output verbose
npm test -- --verbose
```

✅ **Test réussi si:** Au moins 5 tests passent

---

## 📋 CHECKLIST COMPLÈTE

### Backend ✅
- [x] Logging: console.error → logger.error
- [x] Validation: Joi schemas complètes
- [x] Erreurs: middleware global  
- [x] Tests: infrastructure + 5 tests
- [x] .env: configuration complete
- [ ] **À FAIRE:** Rate limiting (déjà installé)
- [ ] **À FAIRE:** Documentation Swagger

### Frontend ✅
- [x] Validation: Formik + Yup
- [x] Erreurs: ErrorAlert, LoadingSpinner, ErrorBoundary
- [x] Logging: logger utility
- [x] Hooks: useApiCall avec retry
- [x] .env: configuration correcte
- [ ] **À FAIRE:** Intégrer composants d'erreur
- [ ] **À FAIRE:** Tester avec déconnexion réseau

### Global ✅
- [x] Logging complet
- [x] Validation robuste
- [x] Erreurs gérées
- [x] Configuration centralisée
- [ ] **À FAIRE:** Tests complets (20+)
- [ ] **À FAIRE:** Documentation API
- [ ] **À FAIRE:** Déploiement

---

## 🚀 PROCHAINES ÉTAPES

1. **Immédiat:** Tester les corrections avec les instructions ci-dessus
2. **Cette semaine:**
   - Intégrer LoadingSpinner dans login/register
   - Intégrer ErrorAlert
   - Ajouter 20+ tests additionnels
   - Tester validation avec données réelles

3. **Semaine prochaine:**
   - Documentation Swagger complète
   - Rate limiting et gestion de sécurité
   - Endpoints manquants
   - Préparation for deployment

---

## 💡 TIPS DE DEBUG

### Si les logs ne s'affichent pas:
```bash
# Vérifiez que logger.js est importé:
grep -n "require.*logger" backend/index.js

# Vérifiez que les fichiers logs existent:
ls -la logs/

# Vérifiez les permissions:
chmod 755 logs/
```

### Si la validation ne fonctionne pas:
```bash
# Vérifiez que middleware est utilisé:
grep -n "validateRequest" backend/routes/*.js

# Vérifiez que schemas existent:
ls -la backend/validation/schemas.js
```

### Si les tests échouent:
```bash
# Vérifiez les dépendances:
npm install jest supertest @types/jest

# Nettoyer et relancer:
rm -rf node_modules/.cache
npm test -- --clearCache
npm test
```

---

**Questions?** Consultez [ANALYSE_COMPLETE.md](ANALYSE_COMPLETE.md) pour plus de détails!
