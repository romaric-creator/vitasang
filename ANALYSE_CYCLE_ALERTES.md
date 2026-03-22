# ANALYSE — CYCLE COMPLET DES ALERTES & NOTIFICATIONS
## VitaSang · Tous les fichiers impliqués · Mars 2026

> Analyse exhaustive du cycle de vie d'une alerte : de la création jusqu'à la résolution, en passant par la validation, l'envoi des notifications, le suivi et la réponse des donneurs.

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble du cycle](#1-vue-densemble-du-cycle)
2. [Phase 1 — Création de l'alerte](#2-phase-1--création-de-lalerte)
3. [Phase 2 — Auto-validation & file d'attente](#3-phase-2--auto-validation--file-dattente)
4. [Phase 3 — Traitement Worker BullMQ](#4-phase-3--traitement-worker-bullmq)
5. [Phase 4 — Envoi des notifications Expo](#5-phase-4--envoi-des-notifications-expo)
6. [Phase 5 — Réponse des donneurs](#6-phase-5--réponse-des-donneurs)
7. [Phase 6 — Résolution automatique](#7-phase-6--résolution-automatique)
8. [Phase 7 — Suivi côté frontend](#8-phase-7--suivi-côté-frontend)
9. [Inventaire complet des fichiers](#9-inventaire-complet-des-fichiers)
10. [Bugs & Incohérences du cycle](#10-bugs--incohérences-du-cycle)
11. [Diagramme de flux complet](#11-diagramme-de-flux-complet)

---

## 1. VUE D'ENSEMBLE DU CYCLE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CYCLE COMPLET D'UNE ALERTE VITASANG                      │
│                                                                             │
│  CRÉATION           VALIDATION          NOTIFICATION       RÉSOLUTION       │
│  ─────────          ──────────          ────────────       ──────────       │
│  POST /alerts  →   Joi validate    →   BullMQ job     →   Réponses         │
│  POST /alerts/guest    ↓              Worker async         donneurs         │
│       ↓         Auto-validation        Haversine SQL            ↓           │
│  Alerte en      (proche hôpital?)     Compat. sang       Quota atteint?    │
│  attente        ou validation admin   Expo Push SDK          ↓              │
│                        ↓              WhatsApp/SMS       Alerte résolue     │
│                  Statut "en_cours"    fallback                              │
│                                                                             │
│  STATUTS: en_attente_validation → en_cours → resolu / annule               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Fichiers principaux impliqués :**

| Couche | Fichier | Rôle |
|--------|---------|------|
| Route | `backend/routes/alerts.routes.js` | Définition des endpoints |
| Validation | `backend/validation/schemas.js` | Schémas Joi |
| Controller | `backend/controllers/alerts.controller.js` | Logique métier |
| Modèle | `backend/models/alerte.model.js` | Structure BDD |
| Modèle | `backend/models/log_notification.model.js` | Logs notifications |
| Queue | `backend/jobs/notification.queue.js` | Worker BullMQ |
| Utils | `backend/utils/geoHelpers.js` | Calcul distances |
| Utils | `backend/utils/bloodCompatibility.js` | Compatibilité sang |
| Utils | `backend/utils/expoNotifications.js` | Envoi push |
| Frontend | `frontend/app/create-alert.tsx` | UI création |
| Frontend | `frontend/app/guest-alert.tsx` | UI alerte sans compte |
| Frontend | `frontend/app/(tabs)/alertes.tsx` | Liste des alertes |
| Frontend | `frontend/app/alert-tracking/[id].tsx` | Suivi alerte |
| Frontend | `frontend/app/alert-response/[id].tsx` | Réponse donneur |
| Frontend | `frontend/hooks/useAlert.ts` | Hook alerte unique |
| Frontend | `frontend/hooks/useAlerts.ts` | Hook liste alertes |

---

## 2. PHASE 1 — CRÉATION DE L'ALERTE

### 2.1 Routes disponibles
**Fichier :** `backend/routes/alerts.routes.js`

```javascript
// Route 1 : Alerte utilisateur authentifié
router.post(
  "/",
  verifyToken,                              // JWT requis
  validateRequest(schemas.createAlert),     // Validation Joi
  alertsController.createAlert             // Controller
);

// Route 2 : Alerte invité (sans compte)
router.post(
  "/guest",
  validateRequest(schemas.createGuestAlert), // Validation Joi différente
  alertsController.createGuestAlert          // Controller différent
);
```

**Problème détecté :** La collection Postman et le fichier `swagger.docs.js` documentent `POST /api/alerts/search` pour créer une alerte. Cette URL **n'existe pas** dans le routeur. L'URL correcte est `POST /api/alerts/`.

---

### 2.2 Schémas de validation
**Fichier :** `backend/validation/schemas.js`

**Schéma `createAlert` (utilisateur connecté) :**

```javascript
createAlert: Joi.object({
  latitude:         Joi.number().required().min(-90).max(90),
  longitude:        Joi.number().required().min(-180).max(180),
  groupe_sanguin:   Joi.string().valid("A+","A-","B+","B-","AB+","AB-","O+","O-").required(),
  radius:           Joi.number().integer().min(1).max(100).default(10),
  urgence:          Joi.string().valid("NORMAL","URGENT","TRES_URGENT").default("NORMAL"),
  quantite_requise: Joi.number().integer().min(1).default(1),
  lieu:             Joi.string().required(),
  description:      Joi.string().allow(""),
})
```

**Schéma `createGuestAlert` (invité) :**

```javascript
createGuestAlert: Joi.object({
  nom_patient:        Joi.string().required().min(2).max(100),
  telephone_contact:  Joi.string().required().pattern(/^6[5-9]\d{7}$/),
  groupe_sanguin:     Joi.string().valid("A+","A-","B+","B-","AB+","AB-","O+","O-").required(),
  lieu:               Joi.string().required(),
  latitude:           Joi.number().required(),
  longitude:          Joi.number().required(),
  description:        Joi.string().allow(""),
})
```

**Incohérence détectée :** Le modèle Alerte accepte `"INCONNU"` comme valeur ENUM pour `groupe_requis`. Ce cas est même géré spécifiquement dans le worker (`groupe_requis === "INCONNU" → compatibleGroups = ["O-"]`). Mais aucun des deux schémas Joi ne l'autorise. Le chemin "INCONNU" est mort côté API.

---

### 2.3 Controller — createAlert
**Fichier :** `backend/controllers/alerts.controller.js`

```javascript
exports.createAlert = async (req, res, next) => {
  const {
    latitude, longitude, groupe_sanguin, radius,
    urgence, quantite_requise, lieu, description, telephone_contact,
  } = req.body;
  const id_initiateur = req.user.id;

  const alerte = await Alerte.create({
    groupe_requis:     groupe_sanguin,
    degre_urgence:     urgence || "NORMAL",
    rayon_action_km:   radius || 10,
    id_initiateur:     id_initiateur,
    latitude, longitude, lieu, description,
    telephone_contact: telephone_contact || req.user.telephone, // ← BUG
    quantite_requise:  quantite_requise || 1,
    statut:            "en_attente_validation",
  });

  const isAutoValidated = await attemptAutoValidation(alerte);
  res.status(201).json({ success: true, alerte, autoValidated: isAutoValidated });
};
```

**Bug critique :** `req.user.telephone` n'est pas dans le payload JWT (`{ id, role }` seulement). Cette valeur sera toujours `undefined`, et `telephone_contact` sera enregistré `null` en base si l'utilisateur ne le fournit pas explicitement.

---

### 2.4 Controller — createGuestAlert

```javascript
exports.createGuestAlert = async (req, res, next) => {
  const { latitude, longitude, groupe_sanguin, lieu, description, nom_patient, telephone_contact } = req.body;

  const alerte = await Alerte.create({
    groupe_requis:    groupe_sanguin,
    degre_urgence:    "URGENT",   // ← Toujours URGENT pour les invités
    rayon_action_km:  15,          // ← Rayon fixe 15km pour les invités
    id_initiateur:    null,        // ← Explicitement null
    latitude, longitude, lieu,
    description: description || `Urgence pour ${nom_patient}`,
    nom_patient,
    telephone_contact,
    statut: "en_attente_validation",
  });

  const isAutoValidated = await attemptAutoValidation(alerte);
  res.status(201).json({ success: true, alertId: alerte.id_alerte, autoValidated: isAutoValidated });
};
```

**Différences avec createAlert :**
- `degre_urgence` forcé à "URGENT" (pas configurable)
- `rayon_action_km` forcé à 15km (pas configurable)
- `id_initiateur` = null (alerte publique)
- Réponse ne retourne que `alertId`, pas l'objet complet

---

### 2.5 Modèle Alerte
**Fichier :** `backend/models/alerte.model.js`

```javascript
// Champs clés :
id_alerte:       INTEGER PK autoIncrement
id_initiateur:   INTEGER FK → Utilisateurs (allowNull: true)  ← null pour guests
id_centre:       INTEGER FK → Centres_Sante (allowNull: true)
nom_patient:     STRING(100)   ← pour guests
telephone_contact: STRING(20)  ← pour guests
groupe_requis:   ENUM("A+","A-","B+","B-","AB+","AB-","O+","O-","INCONNU")
degre_urgence:   ENUM("NORMAL","URGENT","TRES_URGENT") default "NORMAL"
rayon_action_km: INTEGER default 20
lieu:            STRING(255)
description:     TEXT
latitude:        DOUBLE
longitude:       DOUBLE
quantite_requise: INTEGER default 1
statut:          ENUM("en_attente_validation","en_cours","resolu","annule")
                 default "en_attente_validation"

// Timestamps : OUI (createdAt, updatedAt)
// Table : "Alertes_Urgence"
// Index : ["statut"]
```

**Associations :**
```javascript
Alerte.hasMany(LogNotification, { foreignKey: "id_alerte", as: "notifications" });
Alerte.belongsTo(Centre, { foreignKey: "id_centre", as: "centre" });
Alerte.belongsTo(Utilisateur, { foreignKey: "id_initiateur", as: "initiateur" });
```

**Lacune :** Pas d'index sur `(latitude, longitude)` pour les recherches géographiques. Pas d'index sur `id_initiateur`.

---

## 3. PHASE 2 — AUTO-VALIDATION & FILE D'ATTENTE

### 3.1 Fonction attemptAutoValidation
**Fichier :** `backend/controllers/alerts.controller.js`

```javascript
const attemptAutoValidation = async (alerte) => {
  const { latitude, longitude, id_alerte, groupe_requis, rayon_action_km } = alerte;
  // ← degre_urgence manquant ici ! BUG CRITIQUE

  const haversine = haversineSQL(latitude, longitude);
  const [centresProches] = await db.sequelize.query(`
    SELECT id_centre, nom_centre, ${haversine} AS distance
    FROM Centres_Sante
    HAVING distance <= 2          ← seuil fixe 2km
    ORDER BY distance ASC
    LIMIT 1
  `);

  if (centresProches.length > 0) {
    alerte.statut = "en_cours";
    alerte.id_centre = centresProches[0].id_centre;
    await alerte.save();

    await notificationQueue.add("sendAlert", {
      alertId: id_alerte,
      groupe_requis,
      latitude, longitude,
      rayon_action_km,
      degre_urgence,  // ← ReferenceError: degre_urgence is not defined
      validatorId: null,
    });
    return true;
  }
  return false;
};
```

**Bug critique #1 :** `degre_urgence` n'est pas dans la destructuration mais est passé au job. `ReferenceError` garanti à l'exécution si un hôpital est à moins de 2km.

**Bug critique #2 :** La requête SQL utilise `HAVING distance <= 2` sans clause `WHERE`. Sur une grande base, cela calcule la distance pour TOUS les centres avant de filtrer. À l'échelle, c'est une requête lente. La clause correcte serait de filtrer d'abord par bounding box avec un `WHERE latitude BETWEEN ... AND longitude BETWEEN ...`.

**Problème de design :** Le seuil de 2km est hardcodé. Il devrait être configurable.

---

### 3.2 Validation manuelle par admin/personnel
**Route :** `POST /api/alerts/:id/validate`

```javascript
exports.validateAndNotifyAlert = async (req, res, next) => {
  const { id } = req.params;
  const validatorId = req.user.id;

  const alerte = await Alerte.findByPk(id);
  if (!alerte) throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");

  if (alerte.statut !== "en_attente_validation") {
    throw ErrorTypes.BAD_REQUEST(`L'alerte a déjà été traitée (statut: ${alerte.statut}).`);
  }

  alerte.statut = "en_cours";
  await alerte.save();

  const { groupe_requis, latitude, longitude, rayon_action_km, degre_urgence } = alerte;
  // ← Ici degre_urgence est bien destructuré ✅

  await notificationQueue.add("sendAlert", {
    alertId: alerte.id_alerte,
    groupe_requis, latitude, longitude,
    rayon_action_km, degre_urgence, validatorId,
  });

  res.status(202).json({ success: true, message: "Alerte validée. Notifications en cours." });
};
```

**Observation :** Dans cette fonction, `degre_urgence` est correctement destructuré. L'erreur n'existe que dans `attemptAutoValidation()`. C'est une incohérence entre les deux fonctions similaires.

**Restriction d'accès :**
```javascript
router.post("/:id/validate", isAdminOrPersonnel, alertsController.validateAndNotifyAlert);
// → Seuls admin et personnel peuvent valider manuellement
```

---

## 4. PHASE 3 — TRAITEMENT WORKER BULLMQ

### 4.1 Configuration de la queue
**Fichier :** `backend/jobs/notification.queue.js`

```javascript
// Désactivé complètement en mode test
if (process.env.NODE_ENV !== "test") {
  const { Queue, Worker } = require("bullmq");

  notificationQueue = new Queue("notifications", {
    connection,
    defaultJobOptions: {
      removeOnComplete: true,   // Supprime les jobs réussis (économise Redis)
      removeOnFail: 1000,       // Garde les 1000 derniers jobs échoués
      attempts: 3,              // 3 tentatives max
      backoff: { type: "exponential", delay: 1000 }, // Délai exponentiel
    },
  });
}
```

**3 types de jobs distincts traités par le même worker :**

| Nom du job | Déclencheur | Action |
|-----------|-------------|--------|
| `sendAlert` | Validation d'alerte | Trouver donneurs compatibles + notifier |
| `sendCampaignNotification` | Lancement campagne | Notifier donneurs ciblés |
| `sendMessageNotification` | Envoi message | Notifier le destinataire |

---

### 4.2 Logique Mode Nuit
**Fichier :** `backend/jobs/notification.queue.js`

```javascript
const currentHour = new Date().getHours();
const isNight = currentHour >= 22 || currentHour < 7;

if (isNight && degre_urgence !== "TRES_URGENT") {
  logger.info(`Night mode active. Skipping notification for ${degre_urgence} alert`);
  return { skipped: "night_mode", alertId };
}
```

**Logique :**
- Entre 22h et 7h : seules les alertes `TRES_URGENT` passent
- `NORMAL` et `URGENT` sont silencieuses la nuit

**Bug :** `new Date().getHours()` utilise l'heure du serveur (souvent UTC). Si le serveur est hébergé en UTC et que l'app cible le Cameroun (UTC+1), le mode nuit commence à 22h UTC = 23h Douala. Décalage d'1h pouvant manquer des alertes urgentes.

**Correction :**
```javascript
const cmHour = new Date().toLocaleString('fr-CM', {
  timeZone: 'Africa/Douala', hour: 'numeric', hour12: false
});
const isNight = parseInt(cmHour) >= 22 || parseInt(cmHour) < 7;
```

---

### 4.3 Recherche des donneurs éligibles
**Fichier :** `backend/jobs/notification.queue.js`

```javascript
// Étape 1 : Compatibilité sanguine
const { BLOOD_COMPATIBILITY } = require("../utils/bloodCompatibility");
const compatibleGroups = groupe_requis === "INCONNU"
  ? ["O-"]
  : Object.keys(BLOOD_COMPATIBILITY).filter(
      group => BLOOD_COMPATIBILITY[group].includes(groupe_requis)
    );

// Étape 2 : Requête SQL avec Haversine
const haversine = haversineSQL(latitude, longitude, "profilDonneur", "lat_actuelle", "long_actuelle");

const donors = await Utilisateur.findAll({
  where: { role: "donneur" },
  include: [{
    model: ProfilDonneur,
    as: "profilDonneur",
    where: {
      groupe_sanguin: compatibleGroups,
      disponible: true,
      [db.Sequelize.Op.and]: db.sequelize.where(
        db.sequelize.literal(haversine), "<=", rayon_action_km
      ),
    },
    required: true,
  }],
  attributes: {
    include: [[db.sequelize.literal(haversine), "distance"]]
  },
});
```

**Compatibilité sanguine — table complète :**
**Fichier :** `backend/utils/bloodCompatibility.js`

```javascript
const BLOOD_COMPATIBILITY = {
  "O-":  ["O-","O+","A-","A+","B-","B+","AB-","AB+"],  // Donneur universel
  "O+":  ["O+","A+","B+","AB+"],
  "A-":  ["A-","A+","AB-","AB+"],
  "A+":  ["A+","AB+"],
  "B-":  ["B-","B+","AB-","AB+"],
  "B+":  ["B+","AB+"],
  "AB-": ["AB-","AB+"],
  "AB+": ["AB+"],                                         // Receveur universel
};
```

**Lecture :** Clé = groupe du donneur, valeur = liste des groupes qu'il peut alimenter.  
Pour trouver qui peut donner à `O+`, on cherche toutes les clés dont la valeur inclut `O+` → `O-` et `O+`.

**Problème potentiel :** L'alias de table `"profilDonneur"` dans `haversineSQL()` génère du SQL avec `` `profilDonneur`.`lat_actuelle` ``. Si Sequelize utilise un alias différent dans le JOIN généré (ex: `profil_donneurs`), la requête SQL échoue. À valider en loggant le SQL généré avec `DB_LOGGING=true`.

---

### 4.4 Filtrage disponibilité
**Champ :** `ProfilDonneur.disponible = true`

Le donneur peut se marquer comme indisponible via :
```javascript
// Route : PUT /api/users/:id/donor-profile
exports.updateDonorProfile = async (req, res, next) => {
  const { disponible, raison_indisponibilite, date_disponibilite } = req.body;
  // Met à jour ProfilDonneur.disponible
};
```

Ce mécanisme est bien intégré dans la recherche — un donneur indisponible ne reçoit pas de notifications.

---

## 5. PHASE 4 — ENVOI DES NOTIFICATIONS EXPO

### 5.1 Architecture d'envoi
**Fichier :** `backend/jobs/notification.queue.js`

L'envoi suit une logique en cascade :

```
Pour chaque donneur trouvé :
  ├─ A un push_token ?
  │   OUI → Ajouter au batch Expo
  │   NON → Tenter WhatsApp → Tenter SMS
  │
Envoi batch Expo
  ├─ Succès → Log "reçu"
  └─ Échec  → Tenter WhatsApp → Tenter SMS → Log "échec"
```

**Code d'envoi batch :**

```javascript
// Construction des messages
for (const donor of donors) {
  const distance = parseFloat(donor.dataValues.distance).toFixed(2);
  const messageText = `Besoin urgent de sang ${groupe_requis} à seulement ${distance} km de vous.`;

  if (donor.push_token) {
    pushMessages.push(expoNotifications.buildPushMessage({
      to: donor.push_token,
      title: "Urgence Don de Sang",
      body: messageText,
      data: { alertId, groupe_sanguin: groupe_requis, distance },
    }));
    donorMap.set(donor.push_token, { donor, distance, messageText });
  } else {
    // Fallback immédiat pour donneurs sans token
    await deliveryService.sendWhatsApp(donor.telephone, `Vitasang SOS: ${messageText}`);
  }
}

// Envoi groupé
const { successful, failed } = await expoNotifications.sendPushNotifications(pushMessages);
```

---

### 5.2 Module Expo Notifications
**Fichier :** `backend/utils/expoNotifications.js`

```javascript
exports.sendPushNotifications = async (messages) => {
  let Expo;
  try {
    Expo = (await import("expo-server-sdk")).Expo; // Import dynamique ESM
  } catch (error) {
    // Si le module ne charge pas → tous marqués comme échec
    const failed = messages.map(msg => ({ token: msg.to, error: "Expo SDK unavailable" }));
    return { successful: [], failed, tickets: [] };
  }

  const expo = new Expo();
  const validMessages = messages.filter(msg => Expo.isExpoPushToken(msg.to));
  
  // Découpage en chunks (limite API Expo)
  const chunks = expo.chunkPushNotifications(validMessages);
  
  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    ticketChunk.forEach((ticket, index) => {
      if (ticket.id) successful.push(chunk[index].to);
      else failed.push({ token: chunk[index].to, error: ticket.message });
    });
  }
  
  return { successful, failed, tickets };
};
```

**Problème :** L'import dynamique ESM (`await import("expo-server-sdk")`) peut échouer en CommonJS strict. Si `Expo SDK` ne charge pas, tous les messages sont marqués comme échec silencieusement.

**Problème des tickets Expo :** L'API Expo fonctionne en deux temps : d'abord un ticket (succès de soumission), puis un receipt (succès de livraison). Ce code ne vérifie que les tickets. Les receipts (vraie confirmation de livraison) ne sont jamais vérifiés. Un token expiré ou révoqué peut retourner un ticket valide mais un receipt d'erreur.

---

### 5.3 Services de fallback (WhatsApp / SMS)
**Fichier :** `backend/jobs/notification.queue.js`

```javascript
const deliveryService = {
  sendWhatsApp: async (phone, message) => {
    logger.info(`[WhatsApp SOS] Tentative d'envoi à ${phone}`);
    // EXEMPLE TWILIO (commenté) :
    // const client = require('twilio')(...);
    // await client.messages.create({...});
    return { success: true, service: "mock" };  // ← Toujours "succès" (MOCK)
  },
  sendSMS: async (phone, message) => {
    logger.info(`[SMS SOS] Tentative d'envoi à ${phone}`);
    // EXEMPLE INFOBIP/ORANGE (commenté)
    return { success: true, service: "mock" };  // ← Toujours "succès" (MOCK)
  }
};
```

**Problème critique :** Les deux services retournent toujours `{ success: true, service: "mock" }`. En production, aucun SMS ni WhatsApp n'est jamais envoyé. Les logs montreront "envoyé" mais le donneur ne reçoit rien. Le code de fallback est entièrement fictif.

**Impact :** Tout donneur sans token push ne reçoit aucune notification réelle, quelle que soit l'urgence de l'alerte.

---

### 5.4 Journalisation des notifications
**Fichier :** `backend/models/log_notification.model.js`

```javascript
// Structure :
id_notification:   INTEGER PK autoIncrement
id_alerte:         INTEGER FK → Alertes_Urgence
id_utilisateur:    INTEGER FK → Utilisateurs
date_envoi:        DATE default NOW
statut_reception:  ENUM("envoye","lu","accepte","ignore","delivered","failed","no_token","reçu","échec","refuse")
canal:             ENUM("push","email","sms","whatsapp")
push_token:        TEXT (allowNull)
details_echec:     TEXT (allowNull)
push_ticket_id:    STRING(100) (allowNull)

// Timestamps : NON  ← lacune pour audit
// Table : "Notifications_Log"
// Index : ["id_alerte"]
```

**Problème ENUM incohérent :** Le champ `statut_reception` mélange français et anglais dans les valeurs :
- `"envoye"`, `"reçu"`, `"échec"`, `"accepte"`, `"ignore"` (français)
- `"delivered"`, `"failed"`, `"no_token"`, `"refuse"` (anglais-francisé)

Certains statuts semblent en doublon : `"envoye"` ≈ `"delivered"`, `"échec"` ≈ `"failed"`.

**Pas de timestamps :** La colonne `date_envoi` est définie manuellement mais `timestamps: false` signifie qu'il n'y a pas de `updatedAt`. Impossible de savoir quand un statut est passé de "envoye" à "lu" ou "accepte".

---

### 5.5 Logs créés en bulk
**Fichier :** `backend/jobs/notification.queue.js`

```javascript
if (logsToCreate.length > 0) {
  await LogNotification.bulkCreate(logsToCreate);
  logger.info(`${logsToCreate.length} notification logs created via bulkCreate`);
}

return { processed: donors.length };
```

**Observation :** `bulkCreate` est efficace mais ne retourne pas les IDs créés par défaut. Si une notification échoue plus tard (receipt Expo en erreur), il n'est pas possible de mettre à jour le log car les IDs ne sont pas récupérés.

---

## 6. PHASE 5 — RÉPONSE DES DONNEURS

### 6.1 Route de réponse
**Fichier :** `backend/routes/alerts.routes.js`

```javascript
router.post("/:id/respond", alertsController.respondToAlert);
// → Accessible aux utilisateurs authentifiés
```

### 6.2 Controller respondToAlert
**Fichier :** `backend/controllers/alerts.controller.js`

```javascript
exports.respondToAlert = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    if (!["accepte", "ignore"].includes(response)) {
      throw ErrorTypes.VALIDATION_ERROR("Réponse invalide. Utilisez 'accepte' ou 'ignore'.");
    }

    // Créer ou mettre à jour la notification
    let notification = await LogNotification.findOne({
      where: { id_alerte: id, id_utilisateur: userId },
      transaction,
    });

    if (!notification) {
      notification = await LogNotification.create(
        { id_alerte: id, id_utilisateur: userId, statut_reception: response },
        { transaction }
      );
    } else {
      notification.statut_reception = response;
      await notification.save({ transaction });
    }

    if (response === "accepte") {
      // Attribution XP
      const profil = await ProfilDonneur.findByPk(userId, { transaction });
      if (profil) {
        profil.points_xp = (profil.points_xp || 0) + 50;  // ← 50 XP par acceptation
        await profil.save({ transaction });
      }

      // Vérifier si le quota est atteint
      const alerte = await Alerte.findByPk(id, {
        lock: transaction.LOCK.UPDATE,  // ← Verrou pour éviter race condition
        transaction,
      });

      if (alerte.statut !== "en_cours") {
        await transaction.rollback();
        return res.status(410).json({ message: "Cette alerte n'est plus active." });
      }

      const acceptedCount = await LogNotification.count({
        where: { id_alerte: id, statut_reception: "accepte" },
        transaction,
      });

      if (acceptedCount >= alerte.quantite_requise) {
        alerte.statut = "resolu";
        await alerte.save({ transaction });
      }
    }

    await transaction.commit();
    res.json({ success: true, message: response === "accepte" ? "Merci !" : "Réponse enregistrée" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};
```

**Points positifs :**
- Transaction complète avec rollback ✅
- Verrou `SELECT ... FOR UPDATE` sur l'alerte pour éviter la résolution simultanée ✅
- Attribution XP au donneur qui accepte ✅
- Réponse 410 si l'alerte est déjà résolue ✅

**Problème :** Le champ `points_xp` n'est pas dans la définition du modèle `ProfilDonneur` (`profil_donneur.model.js`). L'opération `profil.points_xp = (profil.points_xp || 0) + 50` écrit sur un champ non défini dans le schéma Sequelize. Sequelize l'ignorera silencieusement lors du `save()` (ne lance pas d'erreur mais n'écrit pas en base non plus).

---

## 7. PHASE 6 — RÉSOLUTION AUTOMATIQUE

La résolution automatique intervient dans `respondToAlert` quand :

```javascript
acceptedCount >= alerte.quantite_requise
→ alerte.statut = "resolu"
```

**La résolution peut aussi survenir via `updateAlert` :**

```javascript
// Route : PUT /api/alerts/:id
exports.updateAlert = async (req, res, next) => {
  const validStatuses = ["en_attente_validation","en_cours","resolu","annule"];
  
  // Restriction : ne peut pas passer de "en_attente_validation" à autre chose sauf "annule"
  if (statut && statut !== "annule" && alerte.statut === "en_attente_validation") {
    throw ErrorTypes.BAD_REQUEST("Pour valider, utilisez le point de terminaison de validation.");
  }
  
  Object.assign(alerte, otherFields);
  if (statut) alerte.statut = statut;
  await alerte.save();
};
```

**Problème du schéma Joi updateAlert :**

```javascript
updateAlert: Joi.object({
  statut: Joi.string().valid("en_attente_validation","en_cours","resolu","annule").required(),
})
// ← stripUnknown: true élimine tous les autres champs
// → otherFields sera toujours {} malgré ce que le controller attend
```

Le schéma ne laisse passer que `statut`. Impossible de mettre à jour `urgence`, `quantite_requise`, `description` ou `lieu` via cette route, même si le controller tente de le faire avec `Object.assign(alerte, otherFields)`.

---

### 7.1 Annulation
```javascript
exports.deleteAlert = async (req, res, next) => {
  // N'efface pas réellement — soft delete
  alerte.statut = "annule";
  await alerte.save();
  res.status(200).json({ success: true, message: "Alerte annulée" });
};
```

L'annulation est un soft delete (changement de statut). Les données restent en base. Correct pour l'audit.

---

## 8. PHASE 7 — SUIVI CÔTÉ FRONTEND

### 8.1 Route de consultation statut
**Fichier :** `backend/routes/alerts.routes.js`

```javascript
// Route PUBLIQUE (avant router.use(verifyToken))
router.get("/:id/status", alertsController.getAlertStatus);
```

Cette route est accessible sans token. Nécessaire pour que les invités (guest alerts) puissent tracker leur alerte.

### 8.2 Controller getAlertStatus
**Fichier :** `backend/controllers/alerts.controller.js`

```javascript
exports.getAlertStatus = async (req, res, next) => {
  const userId = req.user ? Number(req.user.id) : null;
  const userRole = req.user ? req.user.role : null;

  const alerte = await Alerte.findByPk(id, {
    include: [
      { model: LogNotification, as: "notifications",
        include: [{ model: Utilisateur, as: "destinataire",
          attributes: ["nom","prenom","telephone"] }] },
      { model: Utilisateur, as: "initiateur",
        attributes: ["id_utilisateur","nom","prenom","telephone"] },
    ],
  });

  // Règles d'accès
  const isGuestAlert    = alerte.id_initiateur === null;
  const isInitiator     = userId !== null && alerte.id_initiateur === userId;
  const isAdmin         = userRole === "admin";
  const isNotified      = userId !== null && alerte.notifications.some(n => n.id_utilisateur === userId);
  const isPubliclyLive  = alerte.statut === "en_cours";

  if (!isGuestAlert && !isInitiator && !isAdmin && !isNotified && !isPubliclyLive) {
    throw ErrorTypes.UNAUTHORIZED_ACCESS();
  }

  const stats = {
    total:   alerte.notifications.length,
    envoye:  alerte.notifications.filter(n => n.statut_reception === "envoye").length,
    lu:      alerte.notifications.filter(n => n.statut_reception === "lu").length,
    accepte: alerte.notifications.filter(n => n.statut_reception === "accepte").length,
    ignore:  alerte.notifications.filter(n => n.statut_reception === "ignore").length,
  };

  res.json({ success: true, alerte: {...}, stats,
    details: isInitiator || isAdmin ? alerte.notifications.map(...) : [] });
};
```

**Points positifs :**
- Contrôle d'accès granulaire (5 conditions d'accès) ✅
- Statistiques de notifications incluses ✅
- Détails masqués pour les non-initiateurs ✅

**Problème :** Les statistiques `stats` filtrent sur des statuts spécifiques (`"envoye"`, `"lu"`, etc.) mais n'incluent pas tous les statuts possibles du ENUM (`"reçu"`, `"delivered"`, `"échec"`, etc.). Des notifications peuvent ne pas apparaître dans aucune catégorie.

---

### 8.3 Route liste des alertes publiques
**Fichier :** `backend/routes/alerts.routes.js`

```javascript
// Route publique avec cache 5 minutes
router.get("/public", cacheMiddleware(5 * 60), alertsController.getLiveAlerts);
```

```javascript
exports.getLiveAlerts = async (req, res, next) => {
  const alerts = await Alerte.findAll({
    where: { statut: "en_cours" },
    include: [{ model: Utilisateur, as: "initiateur",
      attributes: ["id_utilisateur","nom","prenom","telephone"] }],
    order: [["createdAt", "DESC"]],
    limit: 10,  // ← Limite à 10 alertes
  });
  res.json({ success: true, alerts: alerts.map(a => ({...})) });
};
```

**Limitation :** Maximum 10 alertes actives retournées, sans pagination. Si plus de 10 alertes sont actives simultanément, certaines ne seront pas visibles.

---

### 8.4 Route "mes alertes"
```javascript
router.get("/my-alerts", alertsController.getUserAlerts);

exports.getUserAlerts = async (req, res, next) => {
  const alerts = await Alerte.findAll({
    where: { id_initiateur: id_utilisateur },
    include: [{ model: LogNotification, as: "notifications" }],
    order: [["createdAt", "DESC"]],
  });
  // Retourne avec comptage : notifiedCount, acceptedCount
};
```

**Observation :** Pas de pagination, pas de limite. Si un utilisateur a créé 500 alertes (historique), toutes sont retournées en une requête.

---

### 8.5 Route alertes acceptées
```javascript
router.get("/accepted", alertsController.getAcceptedAlerts);

exports.getAcceptedAlerts = async (req, res, next) => {
  const acceptedNotifications = await LogNotification.findAll({
    where: { id_utilisateur: userId, statut_reception: "accepte" },
    include: [{ model: Alerte, as: "alerte",
      include: [{ model: Utilisateur, as: "initiateur", ... }] }],
  });
};
```

Permet à un donneur de voir toutes les alertes qu'il a acceptées.

---

## 9. INVENTAIRE COMPLET DES FICHIERS

### Backend — Fichiers du cycle alertes

| Fichier | Lignes | Rôle | État |
|---------|--------|------|------|
| `backend/routes/alerts.routes.js` | ~100 | Définition des 10 routes | ⚠️ URL doc incorrecte |
| `backend/controllers/alerts.controller.js` | ~380 | Logique métier complète | ❌ Bug degre_urgence |
| `backend/models/alerte.model.js` | ~75 | Schéma BDD Alerte | ⚠️ Pas d'index FK |
| `backend/models/log_notification.model.js` | ~50 | Schéma logs notifs | ⚠️ ENUM incohérent |
| `backend/jobs/notification.queue.js` | ~250 | Worker BullMQ | ❌ SMS/WA mocks |
| `backend/utils/geoHelpers.js` | ~45 | SQL Haversine | ⚠️ Injection potentielle |
| `backend/utils/bloodCompatibility.js` | ~20 | Table compatibilité | ✅ Correct |
| `backend/utils/expoNotifications.js` | ~80 | SDK Expo push | ⚠️ Receipts non vérifiés |
| `backend/validation/schemas.js` | ~130 | Schémas Joi | ❌ "INCONNU" bloqué |
| `backend/middleware/cache.js` | ~40 | Cache in-memory | ⚠️ Incompatible cluster |

### Frontend — Fichiers du cycle alertes

| Fichier | Rôle | État estimé |
|---------|------|-------------|
| `frontend/app/create-alert.tsx` | Formulaire création alerte | Présent |
| `frontend/app/guest-alert.tsx` | Formulaire alerte invité | Présent |
| `frontend/app/(tabs)/alertes.tsx` | Liste alertes actives | Présent |
| `frontend/app/alert-tracking/[id].tsx` | Suivi alerte (initiateur) | Présent |
| `frontend/app/alert-response/[id].tsx` | Réponse donneur | Présent |
| `frontend/app/alert-response/[id]/eligibility.tsx` | Test éligibilité avant réponse | Présent |
| `frontend/app/alert-confirmation.tsx` | Écran confirmation | Présent |
| `frontend/hooks/useAlert.ts` | Hook alerte unique | Présent |
| `frontend/hooks/useAlerts.ts` | Hook liste alertes | Présent |
| `frontend/hooks/useAlertRetryCheck.ts` | Vérification retry | Présent |
| `frontend/services/alertFatigueService.ts` | Anti-spam donneurs | Présent |
| `frontend/services/alertRetryService.ts` | Retry logique | Présent |

---

## 10. BUGS & INCOHÉRENCES DU CYCLE

### Bug #1 — CRITIQUE : ReferenceError dans attemptAutoValidation
**Fichier :** `backend/controllers/alerts.controller.js`  
**Sévérité :** Crash serveur en production

```javascript
// PROBLÈME : degre_urgence non destructuré
const { latitude, longitude, id_alerte, groupe_requis, rayon_action_km } = alerte;
// ↑ degre_urgence manquant

await notificationQueue.add("sendAlert", {
  degre_urgence, // ← ReferenceError: degre_urgence is not defined
});

// CORRECTION :
const { latitude, longitude, id_alerte, groupe_requis, rayon_action_km, degre_urgence } = alerte;
```

---

### Bug #2 — CRITIQUE : Services WhatsApp/SMS non implémentés
**Fichier :** `backend/jobs/notification.queue.js`  
**Sévérité :** Silence total en production pour les donneurs sans push token

```javascript
// Les deux services retournent success: true sans rien faire
sendWhatsApp: async (phone, message) => {
  return { success: true, service: "mock" }; // ← Mock permanent
},
sendSMS: async (phone, message) => {
  return { success: true, service: "mock" }; // ← Mock permanent
}
```

Les logs montrent "envoyé avec succès" mais aucun message n'est réellement envoyé.

---

### Bug #3 — CRITIQUE : points_xp inexistant dans le modèle
**Fichier :** `backend/controllers/alerts.controller.js`  
**Fichier modèle :** `backend/models/profil_donneur.model.js`

```javascript
// Dans respondToAlert :
profil.points_xp = (profil.points_xp || 0) + 50;
await profil.save();
// ← Sequelize ignore le champ car absent du modèle
// ← Aucune erreur, aucune écriture en base
```

Le système de gamification XP est silencieusement non fonctionnel.

---

### Bug #4 — WARNING : URL incorrectes dans la documentation
**Fichiers :** `backend/vitasang_api.postman_collection.json`, `backend/config/swagger.js`

```
Postman & Swagger documentent : POST /api/alerts/search
Routeur réel :                  POST /api/alerts/
```

---

### Bug #5 — WARNING : Limite 10 alertes sans pagination
**Fichier :** `backend/controllers/alerts.controller.js` (getLiveAlerts)

```javascript
limit: 10 // ← Fixe, pas de pagination
```

---

### Bug #6 — WARNING : Statuts ENUM mixte FR/EN
**Fichier :** `backend/models/log_notification.model.js`

```javascript
ENUM("envoye","lu","accepte","ignore","delivered","failed","no_token","reçu","échec","refuse")
```

"delivered" et "reçu" semblent synonymes. "failed" et "échec" aussi. À unifier.

---

### Bug #7 — WARNING : Receipts Expo non vérifiés
**Fichier :** `backend/utils/expoNotifications.js`

L'API Expo Push retourne d'abord un ticket (soumission OK), puis un receipt (livraison OK). Ce code ne vérifie que les tickets. Les tokens révoqués ou expirés seront détectés uniquement au niveau des receipts, jamais vérifiés ici.

---

### Bug #8 — INFO : Pas de pagination sur getUserAlerts / getAcceptedAlerts
**Fichier :** `backend/controllers/alerts.controller.js`

`findAll()` sans `limit`/`offset`. Peut retourner des milliers d'entrées.

---

### Bug #9 — INFO : Mode nuit UTC au lieu de UTC+1
**Fichier :** `backend/jobs/notification.queue.js`

Décalage d'une heure pour les utilisateurs camerounais.

---

### Bug #10 — INFO : Seuil auto-validation 2km hardcodé
**Fichier :** `backend/controllers/alerts.controller.js`

```javascript
HAVING distance <= 2  // ← Non configurable
```

Devrait être une variable d'environnement `AUTO_VALIDATE_RADIUS_KM=2`.

---

## 11. DIAGRAMME DE FLUX COMPLET

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              FLUX COMPLET — ALERTE VITASANG                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  [FRONTEND]                  [BACKEND]                    [SERVICES]         ║
║                                                                              ║
║  create-alert.tsx            POST /api/alerts/                               ║
║  ou guest-alert.tsx     →    validateRequest(Joi)                            ║
║                              ↓                                               ║
║                              alerts.controller.js                            ║
║                              createAlert() / createGuestAlert()              ║
║                              ↓                                               ║
║                              Alerte.create()              [MariaDB]          ║
║                              statut = "en_attente_validation"                ║
║                              ↓                                               ║
║                         ┌────attemptAutoValidation()──────────────┐         ║
║                         │    haversineSQL(lat,lng)                │         ║
║                         │    SELECT centres WHERE distance <= 2km │         ║
║                         │         ↓              ↓               │         ║
║                         │    centre trouvé   pas de centre        │         ║
║                         │         ↓              ↓               │         ║
║                         │    statut="en_cours"  reste "en_attente"│         ║
║                         └────────────────────────────────────────┘         ║
║                              ↓                                               ║
║                              notificationQueue.add("sendAlert")  [BullMQ]   ║
║                              ↓                                               ║
║  ──────────────── ASYNCHRONE ────────────────────────────────────────────   ║
║                                                                              ║
║                              notification.queue.js (Worker)                 ║
║                              ↓                                               ║
║                              Mode nuit ? → Skip si non TRES_URGENT          ║
║                              ↓                                               ║
║                              bloodCompatibility.js                          ║
║                              compatibleGroups = [groupes pouvant donner]    ║
║                              ↓                                               ║
║                              Utilisateur.findAll()                           ║
║                              WHERE role=donneur                              ║
║                              AND groupe_sanguin IN compatibleGroups          ║
║                              AND disponible=true                             ║
║                              AND haversineSQL <= rayon_action_km             ║
║                              ↓                                               ║
║                         ┌── Pour chaque donneur ──────────────────────┐    ║
║                         │   push_token ?                              │    ║
║                         │      OUI → pushMessages.push()             │    ║
║                         │      NON → sendWhatsApp() [MOCK]           │    ║
║                         └─────────────────────────────────────────────┘   ║
║                              ↓                                               ║
║                              expoNotifications.sendPushNotifications()       ║
║                              ↓                    ↓                          ║
║                         [Succès]            [Échec token]     [Expo Push]   ║
║                         Log "reçu"          → WhatsApp [MOCK]               ║
║                                             → SMS [MOCK]                    ║
║                                             Log "échec"                     ║
║                              ↓                                               ║
║                              LogNotification.bulkCreate()   [MariaDB]       ║
║                                                                              ║
║  ──────────────── CÔTÉ DONNEUR ──────────────────────────────────────────   ║
║                                                                              ║
║  alertes.tsx                [Push notification reçue]                        ║
║  alert-response/[id].tsx →  POST /api/alerts/:id/respond                    ║
║                              { response: "accepte" ou "ignore" }            ║
║                              ↓                                               ║
║                              Transaction                                     ║
║                              LogNotification.update(statut)                 ║
║                              +50 XP → ProfilDonneur [BUG: champ absent]     ║
║                              acceptedCount >= quantite_requise ?             ║
║                                   OUI → alerte.statut = "resolu"            ║
║                              COMMIT                                          ║
║                                                                              ║
║  ──────────────── SUIVI ─────────────────────────────────────────────────   ║
║                                                                              ║
║  alert-tracking/[id].tsx →  GET /api/alerts/:id/status (PUBLIQUE)           ║
║                              { stats: {total, envoye, accepte, ...},        ║
║                                alerte: {...},                                ║
║                                details: [...] (admin/initiateur seulement) } ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## RÉSUMÉ — ÉTAT DU CYCLE

| Phase | État | Problèmes |
|-------|------|-----------|
| Création alerte authentifiée | ✅ Fonctionnel | telephone_contact null |
| Création alerte invité | ✅ Fonctionnel | urgence/rayon fixes |
| Validation auto (< 2km) | ❌ Bug runtime | ReferenceError degre_urgence |
| Validation manuelle admin | ✅ Fonctionnel | — |
| Recherche donneurs (SQL) | ✅ Fonctionnel | Alias table à vérifier |
| Compatibilité sanguine | ✅ Fonctionnel | "INCONNU" bloqué par Joi |
| Push notifications Expo | ✅ Fonctionnel | Receipts non vérifiés |
| WhatsApp/SMS fallback | ❌ Mock en prod | Aucun envoi réel |
| Journalisation | ⚠️ Partielle | ENUM incohérent, pas de timestamps |
| Réponse donneur | ⚠️ Partielle | XP non enregistré |
| Résolution quota | ✅ Fonctionnel | — |
| Suivi frontend | ✅ Fonctionnel | Limite 10 alertes |

---

*Analyse établie par examen du code source — Mars 2026*
