# VitaSang API Documentation 📚

## 🎯 API Endpoints Disponibles

### 📍 Base URL
```
Development: http://localhost:3000
Production: https://api.vitasang.com
```

### 📖 Swagger Documentation
```
http://localhost:3000/api/docs
```

---

## 🔐 Authentication

Tous les endpoints protégés nécessitent un JWT token dans le header `Authorization`:

```bash
Authorization: Bearer <token>
```

---

## 👤 User Endpoints

### 1. **Register** (Public)
```bash
POST /api/users/register
```

**Request Body:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+212612345678",
  "mot_de_passe": "SecurePass123",
  "groupe_sanguin": "O+",
  "ville": "Casablanca",
  "date_naissance": "1990-01-15"
}
```

**Response:**
```json
{
  "message": "Utilisateur créé et connecté avec succès",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id_utilisateur": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+212612345678",
    "groupe_sanguin": "O+",
    "ville": "Casablanca"
  }
}
```

**Status:** 201 Created

**Validations:**
- nom: 2-50 caractères
- prenom: 2-50 caractères
- telephone: Format +212XXX... ou 10-15 chiffres
- mot_de_passe: Min 6 chars, maj, chiffre
- groupe_sanguin: A+, A-, B+, B-, AB+, AB-, O+, O-

---

### 2. **Login** (Public)
```bash
POST /api/users/login
```

**Request Body:**
```json
{
  "telephone": "+212612345678",
  "mot_de_passe": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id_utilisateur": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "groupe_sanguin": "O+"
  }
}
```

**Status:** 200 OK

**Rate Limiting:** 5 tentatives / 15 minutes

---

### 3. **Get All Users** (Public)
```bash
GET /api/users
```

**Response:**
```json
{
  "users": [
    {
      "id_utilisateur": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "groupe_sanguin": "O+",
      "ville": "Casablanca",
      "latitude": 33.5731,
      "longitude": -7.5898
    }
  ]
}
```

---

### 4. **Search Donors** (Public)
```bash
GET /api/users/search?latitude=33.5731&longitude=-7.5898&radius=5&groupe_sanguin=O+
```

**Query Parameters:**
- `latitude` (required): Latitude (-90 à 90)
- `longitude` (required): Longitude (-180 à 180)
- `radius` (required): Rayon en km (1-100)
- `groupe_sanguin` (optional): A+, A-, B+, B-, AB+, AB-, O+, O-

**Response:**
```json
{
  "donors": [
    {
      "id_utilisateur": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "groupe_sanguin": "O+",
      "distance_km": 2.5
    }
  ]
}
```

---

### 5. **Get Users by Blood Group** (Public)
```bash
GET /api/users/groupe-sanguin/O+
```

**Response:**
```json
{
  "users": [
    {
      "id_utilisateur": 1,
      "groupe_sanguin": "O+",
      "nom": "Dupont",
      "ville": "Casablanca"
    }
  ]
}
```

---

### 6. **Get User Profile** (Protected)
```bash
GET /api/users/{id}/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id_utilisateur": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+212612345678",
    "groupe_sanguin": "O+",
    "ville": "Casablanca",
    "date_naissance": "1990-01-15",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "actif": true
  }
}
```

---

### 7. **Update Push Token** (Protected)
```bash
PUT /api/users/{id}/push-token
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**
```json
{
  "message": "Token mis à jour avec succès"
}
```

---

## 🚨 Alert Endpoints

### 1. **Create Alert** (Protected)
```bash
POST /api/alerts/search
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "groupe_sanguin": "O+",
  "urgence": "URGENT",
  "lieu": "Hôpital Ibn Sina, Casablanca",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "quantite_requise": 5,
  "description": "Transfusion d'urgence pour chirurgie"
}
```

**Response:**
```json
{
  "message": "Alerte créée et notifications envoyées",
  "alerte": {
    "id_alerte": 15,
    "id_utilisateur": 1,
    "groupe_sanguin": "O+",
    "urgence": "URGENT",
    "lieu": "Hôpital Ibn Sina, Casablanca",
    "quantite_requise": 5,
    "status": "ACTIVE",
    "date_creation": "2026-03-05T21:09:30Z"
  }
}
```

**Status:** 201 Created

**Validations:**
- groupe_sanguin: A+, A-, B+, B-, AB+, AB-, O+, O-
- urgence: NORMAL, URGENT, TRES_URGENT
- lieu: Min 3 caractères
- latitude/longitude: Coordonnées valides
- quantite_requise: 1-100 poches

---

### 2. **Get Alert Status** (Protected)
```bash
GET /api/alerts/{id}/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "alerte": {
    "id_alerte": 15,
    "groupe_sanguin": "O+",
    "urgence": "URGENT",
    "status": "ACTIVE",
    "quantite_requise": 5,
    "quantite_recueillie": 3,
    "date_creation": "2026-03-05T21:09:30Z"
  }
}
```

---

### 3. **Get My Alerts** (Protected)
```bash
GET /api/alerts/my-alerts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "alertes": [
    {
      "id_alerte": 15,
      "groupe_sanguin": "O+",
      "urgence": "URGENT",
      "lieu": "Hôpital Ibn Sina",
      "status": "ACTIVE",
      "date_creation": "2026-03-05T21:09:30Z"
    }
  ]
}
```

---

## ⚡ Rate Limiting

### Limites Appliquées:
- **Global**: 100 requêtes / 15 minutes
- **Login**: 5 tentatives / 15 minutes
- **Register**: 10 par jour

### Réponse Rate Limited:
```json
{
  "error": "Too many requests from this IP, please try again later"
}
```

**Status:** 429 Too Many Requests

---

## ❌ Error Handling

### Format d'Erreur Standard:
```json
{
  "error": "Description de l'erreur",
  "details": [
    {
      "field": "nom_du_champ",
      "message": "Message d'erreur détaillé"
    }
  ]
}
```

### Codes d'Erreur Courants:
- **400** Bad Request - Validation failed
- **401** Unauthorized - Invalid credentials
- **403** Forbidden - Token missing or invalid
- **404** Not Found - Resource not found
- **429** Too Many Requests - Rate limit exceeded
- **500** Internal Server Error

---

## 📝 Examples avec cURL

### 1. Register
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+212612345678",
    "mot_de_passe": "SecurePass123",
    "groupe_sanguin": "O+",
    "ville": "Casablanca"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+212612345678",
    "mot_de_passe": "SecurePass123"
  }'
```

### 3. Create Alert
```bash
curl -X POST http://localhost:3000/api/alerts/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "groupe_sanguin": "O+",
    "urgence": "URGENT",
    "lieu": "Hôpital Ibn Sina",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "quantite_requise": 5
  }'
```

---

## 🔍 Testing with Swagger UI

1. Accéder à: `http://localhost:3000/api/docs`
2. Cliquer sur un endpoint
3. Cliquer "Try it out"
4. Remplir les paramètres
5. Cliquer "Execute"

Pour les endpoints protégés:
1. Cliquer le bouton "Authorize" en haut
2. Entrer le token JWT: `Bearer <token>`
3. Cliquer "Authorize"

---

## 📊 Logging

Tous les requêtes sont loggées:

**Console Output:**
```
POST /api/users/login 200 50ms
GET /api/users 200 10ms
POST /api/alerts/search 201 200ms
```

**Error Log:** `logs/error.log`
**Combined Log:** `logs/combined.log`

---

## 🚀 Deployment

### Environment Variables
```
NODE_ENV=production
DB_HOST=your-db-host
DB_NAME=vitasang
DB_USER=root
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key
PORT=3000
```

### Rate Limiting en Production
Modifier `/middleware/rateLimiter.js` pour adapter les limites

### Swagger en Production
Désactiver le doc public via:
```javascript
// In production
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
}
```

---

## 📞 Support

Pour tout problème:
1. Vérifier les logs: `/backend/logs/`
2. Consulter Swagger: `http://localhost:3000/api/docs`
3. Vérifier les validations: `/backend/validation/schemas.js`
4. Tester les routes: utiliser cURL ou Postman

