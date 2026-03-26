# 🩸 CAHIER DES CHARGES : VITASANG MOBILE (Reconstruction)

## 1. VISION DU PROJET
**VitaSang** est une application mobile d'intérêt public visant à fluidifier la chaîne de don de sang. Elle connecte en temps réel les donneurs volontaires avec les centres de santé en situation d'urgence via la géolocalisation et les notifications push.

---

## 2. ACTEURS ET RÔLES
### A. Le Donneur (Application Mobile)
- Créer et gérer son profil (groupe sanguin, antécédents, localisation).
- Recevoir des alertes de besoin urgent à proximité.
- Prendre rendez-vous dans un centre.
- Consulter son historique de dons.

### B. Le Centre de Santé (Interface Desktop/Mobile)
- Émettre des alertes de sang (par groupe sanguin).
- Gérer les stocks de poches de sang.
- Valider les rendez-vous et les dons effectués.

### C. L'Administrateur (Dashboard Web)
- Superviser les utilisateurs et les centres.
- Analyser les statistiques globales de don.

---

## 3. SPÉCIFICATIONS FONCTIONNELLES

### F1 : Authentification & Profil
- Inscription/Connexion sécurisée (JWT).
- Profil détaillé : Nom, Groupe Sanguin (A+, O-, etc.), Ville, Téléphone.
- Statut de disponibilité pour le don.

### F2 : Géolocalisation & Recherche
- Affichage des centres de don sur une carte (OpenStreetMap/Google Maps).
- Calcul de distance entre le donneur et le centre (Formule Haversine).
- Recherche de donneurs par groupe sanguin en cas d'urgence.

### F3 : Système d'Alertes (Push)
- Notification immédiate si un centre à moins de 20km a besoin du groupe sanguin du donneur.
- Historique des alertes reçues.

### F4 : Gestion des Rendez-vous
- Sélection d'un créneau horaire dans un centre.
- Rappels automatiques (Notifications locales).

### F5 : Historique & Gamification
- Journal des dons passés.
- Calcul du prochain don autorisé (délai de 3 mois pour les hommes, 4 pour les femmes).
- Badges de reconnaissance (Donneur Bronze, Argent, Or).

---

## 4. ARCHITECTURE TECHNIQUE

### Stack Mobile
- **Framework** : React Native avec Expo (pour la rapidité et la gestion des notifications).
- **Langage** : TypeScript (pour la robustesse du code).
- **Gestion d'état** : React Context API ou Redux Toolkit.
- **Cartographie** : `react-native-maps`.

### Stack Backend (Existant & Optimisé)
- **Runtime** : Node.js (Express.js).
- **Base de données** : MariaDB / MySQL (via Sequelize ORM).
- **Authentification** : JWT (Json Web Tokens) + Bcrypt.
- **Notifications** : Expo Server SDK.

---

## 5. DESIGN UI/UX (Directives Designer)

### Palette de Couleurs
- **Primaire** : `#E63946` (Rouge Sang / Urgence).
- **Secondaire** : `#F1FAEE` (Blanc Cassé / Pureté).
- **Accent** : `#457B9D` (Bleu Médical / Confiance).
- **Texte** : `#1D3557` (Bleu Foncé / Lisibilité).

### Expérience Utilisateur
- **Navigation** : Bottom Tab Bar (Accueil, Carte, Alertes, Profil).
- **Accessibilité** : Boutons de min 44px, contrastes élevés (WCAG AA).
- **Feedback** : Skeletons pendant le chargement, vibrations sur alertes.

---

## 6. MODÈLE DE DONNÉES (Entités Clés)
- **Utilisateur** : `id, nom, email, mdp, groupe_sanguin, role (donneur/admin/personnel), id_centre`.
- **Centre** : `id, nom, adresse, latitude, longitude, telephone`.
- **Alerte** : `id, id_centre, groupe_sanguin, niveau_urgence, message`.
- **RendezVous** : `id, id_utilisateur, id_centre, date, statut`.
- **StockSang** : `id_centre, groupe_sanguin, quantite_poches`.

---

## 7. SÉCURITÉ & PERFORMANCE
- **Chiffrement** : SSL/TLS pour toutes les communications.
- **Validation** : Validation des entrées côté client et serveur (Joi/Zod).
- **Rate Limiting** : Protection contre les attaques par force brute sur le login.
- **Offline Mode** : Mise en cache des données essentielles via `AsyncStorage`.

---

## 8. PLAN DE RÉALISATION (8 Semaines)
1. **Semaine 1-2** : Setup Backend, Auth, et Base de données.
2. **Semaine 3-4** : UI Mobile (Écrans de base) & Intégration API.
3. **Semaine 5** : Géolocalisation & Cartographie.
4. **Semaine 6** : Système de Notifications Push & Alertes.
5. **Semaine 7** : Gestion des RDV & Stocks.
6. **Semaine 8** : Tests QA, Corrections et Déploiement.
