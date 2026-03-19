# 🔧 Frontend-Backend Connection Issues - Diagnostic & Fix

## Status: Backend Works ✅

**Vérification effectuée:**

- ✅ Backend tourne sur port 3000
- ✅ IP locale: 10.37.82.208
- ✅ Backend répond à: http://10.37.82.208:3000/
- ✅ CORS activé sur le backend

**Le problème vient du frontend**, pas du backend.

---

## 🚨 Problèmes Possibles & Solutions

### 1. **Problème le plus commun: Mauvaise URL frontend**

**Vérifie ton app.json:**

```json
{
  "expo": {
    "extra": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://10.37.82.208:3000/api"
      }
    }
  }
}
```

**Selon ton type de test, utilise:**

| Scenario | URL à utiliser |
|----------| |
| iOS/Android Simulator (même machine) | `http://127.0.0.1:3000/api` |
| Android Device (réseau local) | `http://10.37.82.208:3000/api` |
| iPhone Device (réseau local) | `http://10.37.82.208:3000/api` |
| Expo Go App local | `http://127.0.0.1:3000/api` |

---

### 2. **Solution rapide: Tu viens de changer app.json?**

Après changer l'URL, tu DOIS:

```bash
# 1. Arrête npm start
# (Ctrl+C ou Cmd+C)

# 2. Nettoie le cache
cd frontend
npm start -- --reset-cache

# 3. Dans Expo:
# Appuie sur 'r' pour Full Reload
# (ou 'Shift+r' or 'cmd+r')
```

---

### 3. **Diagnostic interactif dans l'app**

J'ai créé un écran de debug. Accède-le ainsi:

```bash
# URL directe (dans Expo):
http://localhost:19000/debug-api
# ou via exp://localhost:19000
```

Ou ajoute un bouton dans ton app:

```tsx
import { useRouter } from "expo-router";

function SettingsScreen() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push("/debug-api")}>
      <Text>🔧 API Debug</Text>
    </TouchableOpacity>
  );
}
```

---

### 4. **Problèmes de réseau spécifiques**

#### Simulator ne peut pas atteindre l'IP locale

```
❌ http://10.37.82.208:3000/api  (Won't work)
✅ http://127.0.0.1:3000/api  (Works)
✅ http://localhost:3000/api   (Works)
```

#### Device physique ne peut pas accéder à ta machine

```
Verify:
1. Device et machine sur MÊME réseau WiFi
2. Pas de firewall bloquant le port 3000
3. firewall check: sudo ufw status

Si bloqué:
sudo ufw allow 3000/tcp
```

#### Backend répond mais frontend reçoit erreur CORS

```
Backend a déjà: cors() middleware
Donc CORS n'est PAS le problème

Mais vérifier les headers:
- Authorization: bien envoyé
- Content-Type: application/json
```

---

## 🧪 Test Manual (Vérifier la connexion)

### Test 1: Backend répond?

```bash
curl http://10.37.82.208:3000/

# Ou avec l'IP locale de ta machine:
# Get it with: hostname -I | awk '{print $1}'
```

**Résultat attendu:**

```json
{ "message": "bienvenu sur vitasang.api.com", "version": "1.0.0" }
```

### Test 2: API endpoint fonctionne?

```bash
# Test une requête POST
curl -X POST http://10.37.82.208:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"telephone":"1234567890","mot_de_passe":"test"}'
```

**Résultat attendu:**

- Succès: JSON response
- Fail: Error message qu'on peut gérer

### Test 3: Variable d'environnement chargée?

Dans ton composant frontend:

```tsx
import Constants from "expo-constants";

function DebugComponent() {
  const apiUrl = Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL;

  return <Text>API URL: {apiUrl}</Text>;
}
```

Si vide/undefined → Le problème vient de app.json!

---

## ✅ Vérification Complète (Checklist)

- [ ] Backend tourne: `lsof -i :3000`
- [ ] Backend répond: `curl http://localhost:3000/`
- [ ] app.json mise à jour avec bonne URL
- [ ] npm start arrêté et redémarré
- [ ] Cache Expo réinitialisé: `npm start -- --reset-cache`
- [ ] App reloadée (appuie 'r' dans Expo)
- [ ] Vérifier IP locale correcte: `hostname -I`
- [ ] Device/Simulator sur même réseau si nécessaire

---

## 📱 Configuration pour Différents Environments

### Configuration locale (Simulator - RECOMMANDÉ)

**frontend/app.json:**

```json
"EXPO_PUBLIC_API_BASE_URL": "http://127.0.0.1:3000/api"
```

**Pourquoi?**

- Aucun problème réseau
- Plus rapide
- Pas de problème d'IP qui change

---

### Configuration Device (réseau local)

**frontend/app.json:**

```json
"EXPO_PUBLIC_API_BASE_URL": "http://10.37.82.208:3000/api"
```

**Avant:**

1. Backend tourne: `cd backend && npm start`
2. Device branché en USB
3. Device et machine MÊME WiFi (optionnel si USB)

---

### Configuration Production (Vercel/Deploÿé)

**frontend/app.json:**

```json
"EXPO_PUBLIC_API_BASE_URL": "https://vitasang.vercel.app/api"
```

---

## 🐛 Messages d'erreur courants et solutions

| Erreur           | Cause                               | Solution                                     |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| Network Error    | Backend not running                 | `cd backend && npm start`                    |
| 404 Not Found    | Mauvaise URL endpoint               | Vérifier `EXPO_PUBLIC_API_BASE_URL`          |
| ECONNREFUSED     | Backend pas écoute sur port         | Vérifier `PORT` env var                      |
| Timeout          | Backend trop lent ou non accessible | Augmenter `REQUEST_TIMEOUT` dans axiosConfig |
| CORS error       | Backend pas accepte URL             | Vérifier `cors()` middleware                 |
| 401 Unauthorized | Token expiré/invalide               | Vérifier token dans AsyncStorage             |

---

## 🚀 Guide Rapide (TL;DR)

```bash
# 1. Terminal 1: Démarrer le backend
cd backend
npm start

# 2. Terminal 2: Démarrer Expo
cd frontend
npm start

# 3. Dans Expo: Choisir simulator ou device
i (pour iOS simulator)
a (pour Android emulator)
w (pour web)

# 4. Si ça ne marche pas:
# - Vérifier app.json a bonne URL
# - Arrêter npm start et relancer
# - Appuyer 'r' dans Expo pour reload

# 5. Pour debug:
# - Aller sur /debug-api screen
# - Ou utiliser: curl http://10.37.82.208:3000/
```

---

## 📞 Support Debugging

**Si rien marche:**

1. **Partage ces infos:**

```bash
# Terminal 1
hostname -I              # IP locale
lsof -i :3000           # Port listen?
curl http://localhost:3000/  # Backend repeat?

# Terminal 2 (Frontend)
cat frontend/app.json | grep EXPO_PUBLIC_API_BASE_URL
```

2. **Logs Expo:**

- Ouvre les DevTools: Appuyer 'i' ou 'a' dans Expo
- Cherche "[API Request]" logs dans console
- Post les erreurs exactes

3. **Screenshot de /debug-api**

- C'est très utile pour voir la config réelle

---

## Next Steps

Une fois que ça marche:

1. **Test login:** Essayer de te connecter
2. **Check AsyncStorage:** Token bien sauvegardé?
3. **Monitor API calls:** Ouvrir DevTools et faire opération
4. **Done!** La communication marche

---

## Files Implicated

```
frontend/
├── app.json                        ← URL configurée ici
├── config/axiosConfig.ts          ← Client HTTP
├── services/user.service.ts       ← Appels API
├── app/debug-api.tsx              ← 🆕 Debug screen
└── hooks/useErrorHandler.ts       ← Error handling

backend/
├── index.js                        ← Server config
├── config/logger.js               ← Logs
├── .env                           ← Port et DB config
└── controllers/                    ← Endpoints
```

---

Status quo:

- ✅ Backend: RUNNING & RESPONSIVE
- ❓ Frontend: CONFIG TO CHECK
- 🔧 Solution: Update app.json + npm restart

Bonne chance! 🚀
