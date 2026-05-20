# 📊 Quick Class Reference - Blood Donation

## 🎯 Les 11 Entités de l'Application

### 1️⃣ **Utilisateur** (Parent)

- **Champ clé:** `id_utilisateur` (INT, auto-increment)
- **Rôles:** donneur | personnel | admin | cnts
- **Relations:**
  - ➔ 1 ProfilDonneur (si donneur)
  - ➔ \* HistoriqueDon (dons)
  - ➔ \* RendezVous (RDV)
  - ➔ \* Message (envoyés/reçus)
  - ➔ \* Alerte (lancées)
  - ➔ 1 Centre (si personnel)

**Exemple:**

```json
{
  "id_utilisateur": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "telephone": "+33612345678",
  "role": "donneur",
  "region": "Île-de-France",
  "est_actif": true
}
```

---

### 2️⃣ **ProfilDonneur** (Spécialisation)

- **Champ clé:** `id_donneur` (INT, FK→Utilisateur)
- **Relation:** 1:1 avec Utilisateur (donneur)
- **Infos médico-biologiques**

**Exemple:**

```json
{
  "id_donneur": 1,
  "groupe_sanguin": "O+",
  "poids": 75.5,
  "taille": 180.0,
  "dernier_don": "2026-03-20",
  "prochain_don_possible": "2026-05-08",
  "disponible": true,
  "lat_actuelle": 48.8566,
  "long_actuelle": 2.3522
}
```

---

### 3️⃣ **Centre** (Aggregation)

- **Champ clé:** `id_centre` (INT, auto-increment)
- **Relation:** 1:N Utilisateurs (personnel), HistoriqueDon, RDV, etc.
- **Gère:** stocks, alertes, dons, campagnes

**Exemple:**

```json
{
  "id_centre": 5,
  "nom_centre": "Centre de Transfusion Paris",
  "adresse": "123 Rue de l'Hopital",
  "ville": "Paris",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "contact_urgence": "+33145000000",
  "capacite_stockage_max": 1000
}
```

---

### 4️⃣ **TypeDon** (Catalogue)

- **Champ clé:** `id_type_don` (INT, auto-increment)
- **Relation:** 1:N HistoriqueDon, RendezVous
- **Types:** Sang Total, Plaquettes, Plasma, etc.

**Exemple:**

```json
{
  "id_type_don": 2,
  "nom_type": "Sang Total",
  "composant": "450ml de sang complet"
}
```

---

### 5️⃣ **HistoriqueDon** (Transaction)

- **Champ clé:** `id_historique` (INT, auto-increment)
- **Relations:**
  - → Utilisateur (donneur)
  - → Centre (lieu)
  - → TypeDon (type)
- **Enregistre chaque don effectué**

**Exemple:**

```json
{
  "id_historique": 101,
  "id_donneur": 1,
  "id_centre": 5,
  "id_type_don": 2,
  "date_don": "2026-04-05T10:30:00",
  "volume_ml": 450,
  "statut_don": "réussi"
}
```

---

### 6️⃣ **RendezVous** (Booking)

- **Champ clé:** `id_rdv` (INT, auto-increment)
- **Relations:**
  - → Utilisateur (donneur)
  - → Centre (lieu)
  - → TypeDon (type)
- **Workflow:** planifie → valide → effectue (ou annule)

**Exemple:**

```json
{
  "id_rdv": 42,
  "id_donneur": 1,
  "id_centre": 5,
  "id_type_don": 2,
  "date_heure_rdv": "2026-04-10T09:00:00",
  "statut_rdv": "planifie",
  "code_unique": "ABC123XYZ456"
}
```

---

### 7️⃣ **Alerte** (Emergency)

- **Champ clé:** `id_alerte` (INT, auto-increment)
- **Relations:**
  - → Centre (source)
  - → LogNotification (\* alertes déclenchent notifications)
  - → Utilisateur (initiateur, nullable)
- **Workflow:** attente_validation → en_cours → resolu

**Exemple:**

```json
{
  "id_alerte": 99,
  "id_centre": 5,
  "nom_patient": "Dupont M.",
  "telephone_contact": "+33612345678",
  "groupe_requis": "O-",
  "degre_urgence": "TRÈS_URGENT",
  "rayon_action_km": 25,
  "lieu": "Hôpital Saint-Louis",
  "latitude": 48.876,
  "longitude": 2.356,
  "quantite_requise": 3,
  "statut": "en_cours"
}
```

---

### 8️⃣ **StockSang** (Inventory)

- **Champ clé:** `id_stock` (INT, auto-increment)
- **Relation:** \* → 1 Centre (1 stock par groupe sanguin par centre)
- **Gestion:** +1 quand don, -N quand transfusion

**Exemple:**

```json
{
  "id_stock": 50,
  "id_centre": 5,
  "groupe_sanguin": "O+",
  "quantite_poches": 45,
  "seuil_alerte_min": 5
}
```

---

### 9️⃣ **LogNotification** (Audit)

- **Champ clé:** `id_notif` (INT, auto-increment)
- **Relations:**
  - → Alerte
  - → Utilisateur (destinataire)
- **Statuts:** pending | sent | delivered | failed

**Exemple:**

```json
{
  "id_notif": 1001,
  "id_alerte": 99,
  "id_utilisateur": 1,
  "message": "Urgence! Groupe O- needed à Hôpital Saint-Louis",
  "type_notif": "alert",
  "statut_envoi": "delivered",
  "date_envoi": "2026-04-05T14:30:15"
}
```

---

### 🔟 **Message** (Communication)

- **Champ clé:** `id_message` (INT, auto-increment)
- **Relations:**
  - → Utilisateur (expediteur)
  - → Utilisateur (destinataire)
- **Bi-directionnel:** sender ↔ receiver

**Exemple:**

```json
{
  "id_message": 200,
  "id_expediteur": 1,
  "id_destinataire": 5,
  "titre": "RDV Confirmé",
  "corps": "Votre rendez-vous de demain est confirmé",
  "type_message": "confirmation",
  "lu": false
}
```

---

### 1️⃣1️⃣ **Campagne** (Marketing)

- **Champ clé:** `id_campagne` (INT, auto-increment)
- **Relation:** \* → 1 Centre
- **Ciblage:** groupe sanguin, région, etc.

**Exemple:**

```json
{
  "id_campagne": 10,
  "id_centre": 5,
  "titre": "Urgence Groupe AB",
  "message": "Nous avons besoin de donneurs AB!",
  "groupe_sanguin_cible": "AB+",
  "donneurs_touches": 45,
  "statut": "lancee"
}
```

---

## 🔗 Matrice de Relations

```
              Util  Prof  Cent  Type  Hist  RDV  Alrt  Stck  Notf  Mesg  Camp
Utilisateur    —    1:1   *:1   —     1:*   1:*   1:*   —     —    1:*   —
ProfilDonneur  1    —     —     —     —     —     —     —     —    —     —
Centre         *    —     —     —     1:*   1:*   1:*   1:*   —    —     *:1
TypeDon        —    —     —     —     1:*   1:*   —     —     —    —     —
HistoriqueDon  *    —     *     *     —     —     —     —     —    —     —
RendezVous     *    —     *     *     —     —     —     —     —    —     —
Alerte         *    —     *     —     —     —     —     —     1:*  —     —
StockSang      —    —     *     —     —     —     —     —     —    —     —
LogNotif       *    —     —     —     —     —     *     —     —    —     —
Message        *    —     —     —     —     —     —     —     —    —     —
Campagne       —    —     *     —     —     —     —     —     —    —     —
```

Legend: `1:1` = one-to-one | `1:*` = one-to-many | `*:1` = many-to-one | `—` = no relation

---

## 📊 Statistiques

| Métrique               | Valeur |
| ---------------------- | ------ |
| **Total Entités**      | 11     |
| **Relations**          | 25+    |
| **Cardinalité 1:N**    | 16     |
| **Cardinalité N:1**    | 9      |
| **Cardinalité 1:1**    | 1      |
| **Indexes**            | 5+     |
| **Unique Constraints** | 3      |
| **Nullable FKs**       | 5      |

---

## 🎯 3 Scenarios Majeurs

### Scenario 1: Un Don Réussi

```
1. Donneur crée RendezVous
2. Centre enregistre HistoriqueDon
3. Système met à jour:
   - ProfilDonneur.dernier_don = TODAY
   - ProfilDonneur.prochain_don_possible = TODAY + 56j
   - StockSang.quantite_poches += 1
   - RendezVous.statut = effectue
4. Si Stock < Seuil:
   - Centre reçoit notification LogNotification
```

### Scenario 2: Urgence Résolue

```
1. Personnel crée Alerte + statut=en_attente_validation
2. Admin valide → statut=en_cours
3. Système:
   - Recherche donneurs éligibles (groupe, dispo, distance)
   - Crée LogNotification pour chacun
   - Envoie push notifications
4. Donneur accepte:
   - Crée RendezVous immédiat
   - Effectue don → HistoriqueDon
5. Si quantite_requise atteinte:
   - Alerte.statut = resolu
   - LogNotification: "Urgence résolue"
```

### Scenario 3: Profil Indisponible

```
1. Donneur met available=false
2. Indique raison (ex: allaitement)
3. Indique date_disponibilite (ex: 2026-06-01)
4. Système:
   - L'exclut des alertes d'urgence
   - RDV existants: optionnel de canceler
5. À date_disponibilite:
   - Peut reset available=true
   - Revient dans pool de donneurs
```

---

## 🗂️ Fichiers Modèles Backend

```
backend/models/
├── utilisateur.model.js      ← User management
├── profil_donneur.model.js   ← Donor profiles
├── centre.model.js           ← Blood centers
├── type_don.model.js         ← Donation types
├── historique_don.model.js   ← Donation history
├── rendezvous.model.js       ← Appointments
├── alerte.model.js           ← Emergency alerts
├── stock_sang.model.js       ← Blood inventory
├── log_notification.model.js ← Notification logs
├── message.model.js          ← User messaging
├── campagne.model.js         ← Campaigns
└── index.js                  ← Model associations
```

---

## 🚀 Pour Visualiser

### Option 1: Voir CLASS_DIAGRAM.md

```bash
# Diagramme complet en ASCII (ce fichier)
cat documentation/CLASS_DIAGRAM.md
```

### Option 2: Openvisualiser le PlantUML

```bash
# Render le PlantUML en PNG/SVG:
# https://www.plantuml.com/plantuml/uml/
# (Copy-paste le contenu de CLASS_DIAGRAM.puml)
```

### Option 3: Utiliser VS Code Extension

```bash
# Marketplace: PlantUML
# Alt+D pour preview
```

---

**Last Generated:** 2026-04-05
**Version:** 1.0 - Simplified Reference
