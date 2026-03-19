# Récapitulatif des Corrections Apportées

Ce document liste toutes les modifications et corrections effectuées sur le projet backend et frontend, dans le but d'améliorer la qualité du code, la robustesse, la sécurité et la cohérence, sans ajouter de nouvelles fonctionnalités.

---

## Corrections Backend

### `backend/index.js`
*   **Gestion d'erreurs globale :** Ajout d'un middleware de gestion d'erreurs global pour capturer les exceptions non gérées, prévenir l'exposition des traces de pile en production et assurer des réponses d'erreur cohérentes.

### `backend/package.json`
*   **Dépendance redondante :** Suppression de la dépendance `body-parser` car `express.json()` et `express.urlencoded()` remplissent déjà cette fonction.
    *   _Action requise : L'utilisateur doit exécuter `npm install` dans le dossier `backend` pour supprimer physiquement le paquet._

### `backend/config/db.js`
*   **Correction de faute de frappe :** Changement de `process.env.USERS` en `process.env.USER` pour la configuration du nom d'utilisateur de la base de données.

### `backend/models/index.js`
*   **Option obsolète :** Suppression de l'option `operatorsAliases: 0` qui est dépréciée dans les versions récentes de Sequelize.
*   **Configuration des logs :** Rendu le `logging` des requêtes SQL de Sequelize configurable via la variable d'environnement `process.env.DB_LOGGING`.

### `backend/models/utilisateur.model.js`
*   **Cohérence du champ `email` :** Suppression de la contrainte `unique: true` du champ `email`, car elle était incohérente avec `allowNull: true` (plusieurs `NULL` sont autorisés dans une colonne unique, ce qui peut prêter à confusion).

### `backend/models/profil_donneur.model.js`
*   **Intégrité des données :** Les champs `groupe_sanguin`, `lat_actuelle` et `long_actuelle` ont été rendus non-nullables (`allowNull: false`) pour garantir que chaque profil de donneur dispose de ces informations essentielles.

### `backend/models/centre.model.js`
*   **Intégrité des données :**
    *   Le champ `contact_urgence` a été rendu non-nullable (`allowNull: false`).
    *   Le champ `capacite_stockage_max` a été rendu non-nullable (`allowNull: false`) et une `defaultValue: 0` a été ajoutée.

### `backend/controllers/users.controller.js`
*   **Correction du parsing du groupe sanguin :** La fonction `searchUsers` a été modifiée pour gérer correctement le signe `+` dans les groupes sanguins (ex: `A+`) qui était interprété comme un espace dans l'URL.
*   **Cohérence des réponses API :** Les fonctions `searchUsers`, `getAllUsers`, `getUserById`, `getUsersByBloodGroup` ont été modifiées pour exclure explicitement le champ `id_centre` des réponses pour les donneurs, car cette information n'est pas pertinente pour eux.
*   **Gestion d'erreurs améliorée :** Tous les blocs `catch` des fonctions du contrôleur ont été mis à jour pour utiliser `next(error)` pour les erreurs génériques 500, assurant ainsi que le middleware de gestion d'erreurs global est utilisé.

### `backend/utils/geoHelpers.js`
*   **Création de fichier manquant :** Création du fichier `geoHelpers.js` contenant la fonction `calculateDistance` (formule de Haversine) qui était importée mais n'existait pas.

### `backend/scripts/seed.js`
*   **Génération de données de test :** Mise à jour du script pour générer 250 donneurs de test aléatoires et plus réalistes en utilisant `@faker-js/faker`.

### `backend/vitasang_api.postman_collection.json`
*   **Mise à jour de la collection Postman :** Ajout d'une nouvelle requête pour `GET /api/users/search` et organisation des requêtes existantes dans des dossiers pour une meilleure clarté.

---

## Corrections Frontend

### `frontend/app/_layout.tsx`
*   **Nettoyage de code :** Suppression d'une instruction `console.log` de débogage.
*   **Logique de redirection :** Modification de la redirection pour les utilisateurs non authentifiés de `Splash.tsx` vers `login.tsx` pour une meilleure cohérence logique.

### `frontend/app/create-alert.tsx`
*   **Navigation Expo Router :** Remplacement des appels `navigation.goBack()` par `router.back()` pour s'aligner avec les conventions d'Expo Router.

### `frontend/app/register.tsx`
*   **Cohérence des données :** Modification de l'interface utilisateur et de la gestion de l'état pour accepter des champs `nom` et `prenom` séparés au lieu d'un seul champ `nomComplet`, afin de correspondre au modèle `Utilisateur` du backend.

### `frontend/services/user.service.ts`
*   **Cohérence des données :** Mise à jour de la fonction `registerUser` pour accepter et envoyer `nom` et `prenom` séparément, en accord avec les changements dans `register.tsx` et l'API backend.

### `frontend/app/tracking.tsx`
*   **Nettoyage de code :** Suppression de la prop `navigation` inutilisée du composant.

### `frontend/components/Header.tsx`
*   **Dynamisation du contenu :** Le nom d'utilisateur et le nombre de notifications sont maintenant passés via des props (`userName`, `notificationCount`) au lieu d'être codés en dur.

### `frontend/components/HeaderProfil.tsx`
*   **Dynamisation du contenu et style :** Remplacement de l'image de profil codée en dur par une prop `profileImageUri` (avec une icône par défaut) et déplacement des styles inline vers `StyleSheet.create` pour une meilleure maintenabilité.

---
