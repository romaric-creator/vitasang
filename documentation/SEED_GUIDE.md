# 🏥 VitaSang - Guide de Population de la Base de Données

## 📊 Aperçu

Ce guide vous permet de peupler rapidement la base de données VitaSang avec des données réalistes pour le testing et le développement.

### Données générées

- **50 centres de santé** répartis autour de Douala (Cameroun) dans un rayon de 500km
- **10,000+ utilisateurs** (personnel des centres + donneurs)
- **400 stocks de sang** (8 groupes × 50 centres)
- **~3,000 rendez-vous** (30% des donneurs)
- **~100 alertes SOS** (10% des centres)
- **~4,000 historiques de dons** (40% des donneurs)

### Répartition géographique

- **Position centrale**: Douala (4.0822636°N, 9.7802427°E)
- **Rayon**: 500km
- **Villes couvvertes**: Douala, Yaoundé, Buea, Limbe, Tiko, Edéa, Kribi, Dschang, Bamenda, Garoua, Ngaoundéré, Maroua, Kousseri, Ebolowa, Bertoua, et autres

---

## 🚀 Utilisation

### Prérequis

```bash
# Assurez-vous que:
# 1. Node.js est installé
# 2. MySQL est en cours d'exécution
# 3. Variables .env du backend sont configurées
```

### Étape 1: Configurer le backend

```bash
cd backend
npm install
```

### Étape 2: Configurer la base de données

Vérifiez que votre `.env` contient:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vitasang
DB_USER=root
DB_PASSWORD=your_password
NODE_ENV=development
```

### Étape 3: Exécuter le seed

```bash
# Option 1: Utiliser npm script
npm run seed

# Option 2: Exécuter directement avec Node
node scripts/seed.js
```

### Résultat attendu

```
╔════════════════════════════════════════════════════╗
║   🏥 VITASANG - BASE DE DONNÉES SEED SCRIPT 🏥   ║
║   Position: Douala (4.08°N, 9.78°E)               ║
║   Rayon: 500km | Centres: 50 | Utilisateurs: 10K ║
╚════════════════════════════════════════════════════╝

✅ Connexion à la BD établie
✅ Synchronisation BD complète

📋 Création des types de dons...
✓ Types de dons déjà existants

🏥 Création des centres de santé...
✓ 50 centres de santé créés

🩸 Création des stocks de sang...
✓ 400 stocks de sang créés

👥 Création des utilisateurs (10000+)...
  → 275 personnel + 9725 donneurs
  ✓ 2000/9725 donneurs créés...
  ✓ 4000/9725 donneurs créés...
  ...
  ✓ Total: 10000 utilisateurs créés

... [autres tables]

╔════════════════════════════════════════════════════╗
║   ✅ SEED DATABASE COMPLETED SUCCESSFULLY!  ✅   ║
╚════════════════════════════════════════════════════╝

📊 STATISTIQUES FINALES:
  • Types de dons: 3
  • Centres de santé: 50
  • Utilisateurs: 10000
  • Stocks de sang: 400
  • Rendez-vous: ~2900
  • Alertes SOS: ~5
  • Historiques: ~3900
```

---

## 👤 Utilisateurs de Test

### Compte Admin (par centre)

```
- Accès: Automatique, un admin par centre
- Rôle: admin
- Mot de passe: Password123!
- Téléphone: Généré aléatoirement (65-75 + 8 chiffres)
```

### Comptes Personnel

```
- Accès: Personnel centre, 3-7 par centre
- Rôle: personnel
- Mot de passe: Password123!
```

### Comptes Donneurs

```
- Accès: Donneurs, ~9725 donneurs
- Rôle: donneur
- Mot de passe: Password123!
- Localisation: Aléatoire autour de Douala (500km)
```

---

## 🔍 Verifier les données

### Via MySQL Workbench

```sql
-- Compter les utilisateurs
SELECT COUNT(*) as total, role, est_actif FROM Utilisateurs GROUP BY role, est_actif;

-- Voir les centres
SELECT id_centre, nom_centre, ville, latitude, longitude FROM Centres_Sante LIMIT 10;

-- Voir les stocks
SELECT c.nom_centre, s.groupe_sanguin, s.quantite_poches
FROM Stocks_Sang s
JOIN Centres_Sante c ON s.id_centre = c.id_centre
LIMIT 20;

-- Voir les rendez-vous
SELECT COUNT(*) as total, statut_rdv FROM Rendez_Vous GROUP BY statut_rdv;

-- Voir les alertes
SELECT COUNT(*) as total, degre_urgence, statut FROM Alertes GROUP BY degre_urgence, statut;
```

### Via l'API

```bash
# Lister les centres
curl http://localhost:3000/api/centres

# Lister les utilisateurs
curl http://localhost:3000/api/users

# Lister les alertes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/alerts/pending
```

---

## 🛠️ Personnalisation

### Modifier le nombre de centres

Éditer `backend/scripts/seed.js`:

```javascript
const NUM_CENTRES = 50; // Changer ce nombre
const NUM_USERS_PER_CENTRE = 200; // Utilisateurs par centre
```

### Modifier la position centrale

```javascript
const BASE_LAT = 4.0822636; // Latitude (Douala)
const BASE_LON = 9.7802427; // Longitude (Douala)
const RADIUS_KM = 500; // Rayon en km
```

### Modifier les villes couvertes

```javascript
const CITIES = [
  "Douala",
  "Yaoundé",
  "Buea",
  // Ajouter/modifier des villes ici
];
```

---

## ⚠️ Notes Importantes

### ✅ Ce que le script fait

- ✓ Crée les tables s'il y en a besoin
- ✓ Insère des données réalistes
- ✓ Respecte les relations FK
- ✓ Utilise des transactions batch pour la performance
- ✓ Hash les mots de passe avec bcrypt
- ✓ 90% des donneurs sont actifs
- ✓ 30% des donneurs ont des rendez-vous
- ✓ 40% des donneurs ont un historique de dons

### ⚠️ Ce que le script ne fait PAS

- ✗ Ne supprime pas les données existantes (sûr à relancer)
- ✗ Ne modifie pas les données existantes
- ✗ Dédouble Si tables déjà peuplées (à vérifier)

### 🔒 Sécurité

- Tous les mots de passe sont hashés avec bcrypt
- Les numéros de téléphone sont uniques
- Les emails sont générés aléatoirement
- Les tokens sont générés de manière sécurisée

---

## 📱 Tester sur le mobile / desktop

### Login test

```
Numéro: Utilisez le numéro généré pour un utilisateur
Mot de passe: Password123!
Rôle: admin (pour accès complet), personnel (pour centre), donneur (pour app mobile)
```

### Visuall sur la carte

- 50 centres répartis autour de Douala
- Filtrer par groupe sanguin
- Filtrer par rayon de proximité

---

## 🚨 Erreurs courantes

### "ER_ACCESS_DENIED_ERROR"

```bash
# Vérifier les credentials MySQL dans .env
# Vérifier que MySQL est en cours d'exécution
service mysql status
```

### "ER_BAD_DB_ERROR"

```bash
# Créer la base de données
# Dans MySQL:
CREATE DATABASE vitasang;
```

### "Cannot find module 'models'"

```bash
# Vérifier que vous êtes dans le dossier backend
cd backend
node scripts/seed.js
```

---

## 📊 Performance

- **Temps d'exécution**: ~30-60 secondes pour 10,000 utilisateurs
- **Taille BD**: ~50-100MB après seed complet
- **Insérations par lot**: 500 (optimisé pour performance)

---

## ♻️ Réinitialiser les données

### Option 1: Garder le schema, supprimer les données

```bash
# Éditer seed.js et passer force à true
await db.sequelize.sync({ force: true });

# Puis relancer
npm run seed
```

### Option 2: Supprimer manuellement en MySQL

```sql
-- Dans MySQL:
DROP DATABASE vitasang;
CREATE DATABASE vitasang;

-- Puis relancer le seed
npm run seed
```

---

## 📞 Support

Pour des questions ou problèmes:

1. Vérifier les logs dans `/backend/logs/`
2. Vérifier la console pour les erreurs
3. Vérifier la BD avec `mysql -u root -p vitasang`

---

**Version**: 1.0.0
**Dernière mise à jour**: 2026-03-18
**Créateur**: VitaSang Development Team
