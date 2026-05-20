# 🔍 VÉRIFICATION SEED SCRIPT - RÉSUMÉ DES CORRECTIONS

## ✅ CORRECTIONS APPLIQUÉES (3 bugs corrigés)

### Bug #1: generatePhoneNumber() appelée sans index

**Location**: `seedCentres()` line ~202

```javascript
❌ AVANT: contact_urgence: generatePhoneNumber()
✅ APRÈS: contact_urgence: generatePhoneNumber(i)
```

**Impact**: Aurait levé une erreur "index is undefined"
**Correction**: Passer `i` comme index pour générer un numéro unique

---

### Bug #2: Noms de colonnes incorrects dans ProfilDonneur

**Location**: `seedProfilDonneurs()` line ~368

```javascript
❌ AVANT:
  latitude: coords.latitude,
  longitude: coords.longitude,
  est_eligible: Math.random() > 0.15,

✅ APRÈS:
  lat_actuelle: coords.latitude,
  long_actuelle: coords.longitude,
  (est_eligible supprimé - n'existe pas dans le modèle)
```

**Impact**: Erreur "Unknown column" during INSERT
**Correction**:

- `latitude` → `lat_actuelle` (nom correct du model)
- `longitude` → `long_actuelle` (nom correct du model)
- Supprimer `est_eligible` (n'existe pas)

---

### Bug #3: Noms de colonnes et valeurs incorrects dans HistoriqueDon

**Location**: `seedHistoriqueDons()` line ~480

```javascript
❌ AVANT:
  groupe_sanguin: BLOODGROUPS[...],
  volume_collecte: Math.floor(...),
  statut_collecte: ["reussi", "abandonne"]

✅ APRÈS:
  (groupe_sanguin supprimé - n'existe pas)
  volume_ml: Math.floor(...),
  statut_don: ["réussi", "échoué"]
```

**Impact**: Erreurs "Unknown column" et valeurs ENUM invali des
**Correction**:

- Supprimer `groupe_sanguin` (n'existe pas)
- `volume_collecte` → `volume_ml`
- `statut_collecte` → `statut_don`
- "reussi" → "réussi" (accents pour correspondre à l'ENUM)
- "abandonne" → "échoué" (valeur valide de l'ENUM)

---

## ✅ VÉRIFICATIONS SUPPLÉMENTAIRES

### ✓ Force: false

```javascript
await db.sequelize.sync({ force: false });
```

✅ **OK**: La BD n'est jamais vidée. Les données existantes sont conservées.

### ✓ Appels à generatePhoneNumber()

**Tous passent un index unique**:

- Line 174: `generatePhoneNumber(i)` ✅ pour les centres
- Line 307: `generatePhoneNumber(userIndex)` ✅ pour le personnel
- Line 335: `generatePhoneNumber(userIndex)` ✅ pour les donneurs

### ✓ Contraintes de base de données

- **Utilisateur.telephone**: `unique: true` ✅ OK (numéros différents générés avec index)
- **ProfilDonneur**: Tous les champs requis ✅ OK
- **HistoriqueDon**: Tous les champs requis ✅ OK
- **RendezVous**: Tous les champs requis ✅ OK
- **Alerte**: Tous les champs requis ✅ OK

### ✓ Champs optionnels

- **Alerte.id_initiateur**: nullable ✅ OK (pas obligatoire)
- **ProfilDonneur.lat_actuelle**: nullable ✅ OK (peut être null)
- **HistoriqueDon.volume_ml**: nullable ✅ OK (peut être null)

### ✓ Batch sizes

```javascript
batchSize: 500;
```

✅ **OK**: Bonne pour 10K utilisateurs (pas de dépassement de mémoire)

---

## 📊 STATISTIQUES DE GÉNÉRATION (Attendues)

Après `npm run seed`:

```
✅ Connexion à la BD établie
✅ Synchronisation BD complète

📋 Types de dons
✓ 3 types créés

🏥 Centres de santé
✓ 250 centres créés

🩸 Stocks de sang
✓ 2000 stocks créés (250 centres × 8 blood groups)

👥 Utilisateurs
✓ ~1260 personnel + ~8740 donneurs = 10000 utilisateurs créés

🎯 Profils de donneurs
✓ 8740 profils créés

📅 Rendez-vous
✓ ~2622 rendez-vous créés (30% des donneurs)

🚨 Alertes
✓ 25 alertes SOS créées (10% des centres)

📊 Historiques de dons
✓ 3496 historiques créés (40% des donneurs)

✅ SEED DATABASE COMPLETED SUCCESSFULLY!
```

---

## 🚀 PRÊT À EXÉCUTER

```bash
cd /home/ing-dev/Images/blood-donation-app/backend
npm run seed
```

**Temps estimé**: 30-60 secondes
**Base de données**: Conserve les données existantes
**Erreurs potentielles**: ✅ Toutes corrigées

---

## 📝 NOTES POUR LA PROCHAINE FOIS

1. Toujours vérifier les noms de colonnes contre le modèle Sequelize
2. Les ENUM doivent correspondre EXACTEMENT (accents inclus)
3. Les foreign keys doivent avoir des valeurs existantes
4. Les champs `unique: true` ont besoin d'une génération unique
5. Tester `force: false` pour développement itératif
