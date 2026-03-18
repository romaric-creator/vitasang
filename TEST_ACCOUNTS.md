# 🧪 Comptes de Test - Desktop VitaSang

## Authentifiants de Connexion

Tous les comptes générés par le **seed.js** utilisent:

- **Mot de passe:** `Password123!`

## 📱 Récupérer les numéros de téléphone

Les numéros de téléphone sont générés aléatoirement lors de l'exécution du seed. Pour les récupérer:

### 1. Exécuter le seed

```bash
cd backend
npm run seed
```

### 2. Récupérer les utilisateurs depuis la base de données

```bash
mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -u eS49qYHfN2jBfa5.root -p vitasang
```

Mot de passe: `MsmJ1j86Tm3bJKPr`

### 3. Requêtes SQL pour récupérer les test accounts

```sql
-- Admin du premier centre
SELECT telephone, nom, prenom, email, role
FROM Utilisateur
WHERE role = 'admin'
LIMIT 1;

-- Personnel du premier centre
SELECT telephone, nom, prenom, email, role
FROM Utilisateur
WHERE role = 'personnel'
LIMIT 1;

-- Tous les personnels
SELECT telephone, nom, prenom, email, role, id_centre
FROM Utilisateur
WHERE role IN ('admin', 'personnel', 'centre_manager')
ORDER BY role DESC
LIMIT 10;
```

## 🔐 Données générées

Le seed crée:

- **50 centres** de santé autour de Douala, Cameroun
- **275 personnels** (3-7 par centre, le premier est admin)
- **10,000+ donneurs** (donors)
- **800+ stocks** de sang (8 groupes par centre)
- **3,000+ rendez-vous**
- **100+ alertes SOS**

## 📝 Format des données générés

### Numéros de téléphone

- Format: Cameroun (65-75 + 8 chiffres)
- Exemple: `65123456789`, `69987654321`

### Emails

- Format: `{prenom_initial}{nom_tronqué}{index}@vitasang.cm`
- Exemple: `jdurand00001@vitasang.cm`

### Centres

- Localisation: Autour de Douala (4.0822636°N, 9.7802427°E)
- Rayon: 500 km
- Villes: Douala, Yaoundé, Buea, Limbe, Tiko, etc.

## 🚀 Exemple de connexion

1. Exécutez le seed: `npm run seed`
2. Récupérez un numéro de téléphone depuis la BD
3. Connectez-vous avec:
   - **Téléphone:** (récupéré de la BD)
   - **Mot de passe:** `Password123!`
4. Vous accédez au dashboard avec le rôle associé

## 📊 Dashboard après connexion

Selon votre rôle:

- **Admin**: Accès complet à tous les centres
- **Personnel**: Accès à votre centre uniquement
- **Centre_manager**: Gestion du centre

## 🔗 URLs principales

- **Frontend Desktop**: http://localhost:5175/
- **Backend API**: http://localhost:3000/
- **Documentation Seed**: Voir [SEED_GUIDE.md](../backend/SEED_GUIDE.md)
