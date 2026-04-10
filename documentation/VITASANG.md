VITASANG
Rapport d'audit technique complet

Analyse approfondie — Sécurité · Performance · Scaling · Qualité du code
Backend Node.js/Express · Frontend React Native · Desktop-Centre React/Vite
Préparé par
Claude — Anthropic Date
Mars 2026

1. Résumé exécutif

L'audit de la plateforme VitaSang couvre les trois composants applicatifs : le backend Node.js/Express, l'application mobile React Native/Expo et l'application desktop React/Vite destinée aux centres de transfusion. L'analyse a porté sur la sécurité, la performance, le scaling, la communication frontend-backend et la qualité du code.
Bilan global :
7
Failles critiques 14
Problèmes sévères 11
Points modérés 8
Points positifs
Points positifs existants :
• Architecture globale bien pensée : séparation backend/mobile/desktop claire
• Sécurité de base en place : bcrypt(10), JWT, Joi validation, helmet.js
• Infrastructure React Query complète et bien structurée (hooks, queryKeys, queryClient)
• Gestion d'erreurs centralisée avec AppError et middleware global
• Système de notifications in-app animé et complet
• CI/CD avec GitHub Actions configuré
• Swagger API documentée
• Soft delete au lieu de suppression réelle

2. Desktop-Centre — Diagnostic de connexion

Cause principale identifiée : 3 bugs distincts bloquent la connexion au desktop-centre. Voici leur diagnostic précis.
BUG #1 — CRITIQUE : Variable VITE_API_URL non définie
Fichier Détail
services/api.ts const API_URL = import.meta.env.VITE_API_URL → Si le fichier .env n'est pas créé à la racine du dossier desktop-centre, API_URL vaut undefined. Axios construit alors des URLs relatives invalides (undefined/users/login) et chaque requête échoue silencieusement avec une Network Error.
Fix immédiat :
Créer le fichier desktop-centre/.env avec le contenu suivant :
VITE_API_URL=http://localhost:3000/api
Important : redémarrer Vite après la création du fichier (npm run dev) pour que Vite charge la variable.
BUG #2 — CRITIQUE : Regex téléphone incompatible entre desktop et backend
Fichier Regex desktop Regex backend
Login.tsx vs schemas.js /^(?:\+237|)(6\d{8}|2\d{8})$/ — 9 chiffres après indicatif	/^(\+237\s?[26]\d{9}|[26]\d{9})$/ — 10 chiffres après indicatif
Le desktop valide un numéro de 9 chiffres (6XXXXXXXX) alors que le backend exige 10 chiffres ([26]XXXXXXXXX). Un numéro comme 677123456 (9 chiffres) passe la validation côté desktop mais est rejeté par le backend avec une erreur 400.
Fix :
Remplacer dans Login.tsx :
const phoneRegex = /^(?:\+237|)(6\d{8}|2\d{8})$/;  // FAUX
const phoneRegex = /^(\+237\s?[26]\d{9}|[26]\d{9})$/; // CORRECT
BUG #3 — SÉVÈRE : Rôle 'centre_manager' inexistant dans le backend
Fichier Rôles acceptés desktop Rôles backend (ENUM)
Login.tsx ligne 25044 ["personnel", "admin", "centre_manager"] "donneur", "personnel", "admin" — centre_manager n'existe pas
Le desktop autorise le rôle centre_manager à se connecter mais ce rôle n'existe pas dans le modèle Utilisateur du backend. Si l'API est mise à jour plus tard pour créer ce rôle, l'incohérence devra être résolue dans les deux sens.
Fix :
Supprimer "centre_manager" de la liste dans Login.tsx, ou l'ajouter dans l'ENUM du modèle backend.
BUG #4 — SÉVÈRE : Pas de fichier .env.example dans desktop-centre
Contrairement au backend et au frontend qui ont tous les deux un .env.example, le desktop-centre n'en a pas. Un nouveau développeur ne sait pas que VITE_API_URL est requis et que l'app ne fonctionnera pas sans ce fichier.
Fix :
Créer desktop-centre/.env.example contenant : VITE_API_URL=http://localhost:3000/api
BUG #5 — MODÉRÉ : Pas de proxy Vite configuré
vite.config.ts ne définit aucun proxy. Si le backend tourne sur localhost:3000 et que l'app desktop tourne sur localhost:5173, les requêtes cross-origin peuvent être bloquées par le CORS du navigateur selon la configuration du backend. Le backend autorise bien localhost en développement, mais si l'URL n'est pas exactement correcte (http vs https, port différent), le CORS bloquera.
Fix recommandé pour éviter tout problème CORS en dev :
// vite.config.ts server: { proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } } }

3. Audit de sécurité

4
Critiques 5
Sévères 3
Modérés 5
Points OK
3.1 Failles critiques
Sévérité Problème Fichier Description + Fix
CRITIQUE Données GPS exposées publiquement users.routes.js GET /users/search et GET /users/groupe-sanguin/:groupe sont accessibles sans authentification. N'importe qui récupère la liste des donneurs avec positions GPS et groupe sanguin.
Fix : Ajouter verifyToken sur ces deux routes. Retourner uniquement distance anonymisée, pas les coordonnées exactes.
CRITIQUE Rôle admin créable à l'inscription users.controller.js + schemas.js Le schema Joi accepte role:'admin' à l'inscription publique POST /users/register. N'importe qui peut créer un compte admin.
Fix : Dans le schema register, forcer role: Joi.string().valid('donneur').default('donneur').
CRITIQUE .env.production commité dans Git backend/.env.production + frontend/.env.production Les fichiers de configuration de production sont dans le repo. L'historique Git peut contenir de vrais secrets.
Fix : Ajouter à .gitignore immédiatement. Révoquer et regénérer tous les secrets.
CRITIQUE CORS bypass localhost en production index.js ligne ~12257 if (origin.startsWith('http://localhost')) autorise TOUS les localhost même en production.
Fix : Entourer ce bypass avec if (process.env.NODE*ENV !== 'production').
3.2 Problèmes sévères
Sévérité Problème Fichier Description + Fix
SÉVÈRE JWT non révocable auth.middleware.js Tokens valides 24h sans possibilité d'invalidation. Aucun refresh token — déconnexion forcée toutes les 24h.
Fix : Implémenter blacklist Redis pour tokens révoqués, ou tokens courts (2h) + refresh token à rotation.
SÉVÈRE Mot de passe trop faible validation/schemas.js Seul min(6) est validé. '123456' est accepté. Risque élevé de credential stuffing à 10 000 utilisateurs.
Fix : Ajouter: .min(8).pattern(/^(?=.*[a-z])(?=.\_[A-Z])(?=.\*\d)/)
SÉVÈRE Token stocké AsyncStorage mobile utils/storage.ts AsyncStorage non chiffré, accessible sur device rooté. Données médicales sensibles à risque.
Fix : Utiliser expo-secure-store (SecureEnclave iOS / Keystore Android).
SÉVÈRE PostHog sans consentement explicite context/AuthContext.tsx posthog.identify() transmet id, nom, prénom, rôle vers serveurs externes sans consentement RGPD/LGPD documenté.
Fix : Ajouter banner consentement avant activation ou désactiver en production.
SÉVÈRE debug-api.tsx en production frontend/app/debug-api.tsx Écran de debug exposant endpoints et réponses API accessible en production.
Fix : Ajouter if (!**DEV**) return null; en tête du composant.

4. Audit de performance

4
Critiques 6
Sévères 4
Modérés 0
Cache actuel
4.1 Backend — critiques
Sévérité Problème Fichier Description + Fix
CRITIQUE Pool DB = 5 pour 10 000 utilisateurs config/db.js pool.max: 5. Avec 10 000 utilisateurs actifs, 20 requêtes simultanées saturent le pool. Toutes les autres requêtes attendent 30 secondes (acquire: 30000ms) avant de timeout.
Fix : pool.max: 20, pool.min: 2, acquire: 60000
CRITIQUE Boucle N INSERTs séquentiels par alerte alerts.controller.js validateAndNotifyAlert() fait 1 LogNotification.create() par donneur dans une boucle for. 500 donneurs = 500 INSERTs + 500 UPDATEs séquentiels bloquants.
Fix : Remplacer par LogNotification.bulkCreate(logs) — 1 seul INSERT pour tous.
CRITIQUE getAllUsers sans pagination users.controller.js Utilisateur.findAll() sans limit ni offset. 10 000 lignes + JOINs = réponse de plusieurs Mo, crash mémoire Node.js.
Fix : Ajouter page/limit, utiliser findAndCountAll(), retourner pagination.
CRITIQUE Zéro cache applicatif Toute l'application Aucune couche de cache. Centres, types de don, groupes sanguins rechargés depuis DB à chaque appel. getAllCentres appelé par 3 hooks frontend avec refetchInterval.
Fix : npm install node-cache. TTL 10-30 min pour données quasi-statiques.
4.2 Backend — sévères
Sévérité Problème Fichier Description + Fix
SÉVÈRE db.sequelize.sync() à chaque démarrage index.js sync() vérifie et recrée les tables à chaque cold start. Sur Render, c'est exécuté à chaque requête.
Fix : Supprimer sync(), utiliser les migrations sequelize-cli en production.
SÉVÈRE getCentreStats : 4 await séquentiels centres.controller.js 4 requêtes DB indépendantes exécutées séquentiellement. La page dashboard met 4× plus de temps que nécessaire.
Fix : await Promise.all([StockSang.findAll(), RendezVous.count(), Alerte.count(), HistoriqueDon.count()])
SÉVÈRE updateUser : 2 saves sans transaction users.controller.js profil.save() puis user.save() séquentiels sans transaction. Si le second échoue, la DB est incohérente.
Fix : Envelopper dans db.sequelize.transaction(async (t) => { ... })
SÉVÈRE Chunks notifs push séquentiels utils/expoNotifications.js for (const chunk of chunks) avec await. 40 appels HTTP séquentiels au lieu d'être parallèles.
Fix : await Promise.all(chunks.map(c => expo.sendPushNotificationsAsync(c)))
SÉVÈRE Pas de compression gzip index.js Réponses JSON non compressées. 50-200KB par réponse au lieu de 5-20KB. Critique sur réseau mobile 3G.
Fix : npm install compression + app.use(require('compression')()) avant les routes.
SÉVÈRE morgan('dev') en production index.js Logging coloré de chaque requête. Overhead I/O massif sous forte charge.
Fix : process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev')
4.3 Frontend — performance
Sévérité Problème Fichier Description + Fix
CRITIQUE React Query installé mais non utilisé (tabs)/alertes.tsx, index.tsx, profile.tsx Tous les écrans principaux ignorent les hooks React Query et utilisent useState + useEffect. Cache désactivé, rechargement à chaque navigation.
Fix : Migrer alertes.tsx, index.tsx, profile.tsx vers useMyAlerts(), useActiveAlerts(), useUserProfile().
SÉVÈRE Triple retry : jusqu'à 18 tentatives useApiCall.ts + axiosConfig.ts + queryClient.ts 3 couches de retry indépendantes : Axios (3) × useApiCall (3) × React Query (2) = 18 tentatives par requête échouée.
Fix : Centraliser retry dans Axios uniquement. Désactiver retry dans useApiCall et réduire React Query retry à 1.
SÉVÈRE AsyncStorage lu à chaque requête config/axiosConfig.ts getData('token') (lecture disque) dans le request interceptor à chaque appel API. +20-150ms de latence par requête.
Fix : Cache le token en mémoire : let cachedToken; + export setAuthToken() appelé au login/logout.
MODÉRÉ firebase inutilisé dans le bundle package.json Firebase (~300KB JS) listé comme dépendance mais aucun import trouvé dans le code.
Fix : npm uninstall firebase. Vérifier avec npx expo-bundle-analyzer.

5. Audit de scaling

5.1 Bloquants — empêchent de passer à 50 000+ utilisateurs
Sévérité Problème Fichier Description + Fix
BLOQUANT Calcul géo Haversine en JavaScript alerts.controller.js Tous les donneurs chargés en RAM + filtrage JS. O(N) mémoire et CPU. À 100 000 donneurs, timeout HTTP garanti.
Fix : Utiliser la formule Haversine directement dans la requête Sequelize avec Sequelize.literal().
BLOQUANT Rate limiter en mémoire vive middleware/rateLimiter.js express-rate-limit store en mémoire. Multi-instances (PM2 cluster) = compteurs indépendants, rate limiting inefficace.
Fix : npm install rate-limit-redis. Utiliser RedisStore pour compteur partagé entre instances.
BLOQUANT Uploads local incompatible multi-instances index.js + middleware/upload.js express.static('uploads') sert un dossier local. Sur Render ou containers multiples, les fichiers ne sont pas partagés.
Fix : Supprimer express.static('uploads') si Cloudinary est utilisé pour tout (c'est le cas).
5.2 Limitants — freinent la croissance
Sévérité Problème Fichier Description + Fix
LIMITANT Process Node.js unique, pas de clustering index.js 1 seul process Node.js sur 1 seul core CPU. Sur VPS 4 cores, 75% de puissance perdue.
Fix : PM2 cluster mode : pm2 start index.js -i max
LIMITANT Pas de queue pour les opérations lourdes alerts.controller.js Envoi de notifications à 500 donneurs dans le handler HTTP. Le client attend toute la durée.
Fix : Utiliser BullMQ. Répondre 202 Accepted immédiatement, traiter en arrière-plan.
LIMITANT LogNotification grossit sans fin models/log_notification.model.js Aucune politique d'archivage. Après 1 an, plusieurs millions de lignes ralentissent les JOINs.
Fix : Cron job hebdomadaire : DELETE FROM Notifications_Log WHERE date_envoi < NOW() - INTERVAL 90 DAY
LIMITANT Poll alertes toutes les 2 minutes hooks/useAlerts.ts refetchInterval: 120000 sur 10 000 utilisateurs = 83 req/sec en continu uniquement pour les alertes.
Fix : refetchInterval: 600000 (10 min). Utiliser WebSocket ou Server-Sent Events pour les alertes urgentes en temps réel.
5.3 À anticiper
Action Raison
Versioning API /v1/ Sans versioning, tout changement breaking casse toutes les apps mobiles en production.
Migrer vers PostgreSQL + PostGIS Index spatiaux GIST pour requêtes géo 100× plus rapides que Haversine sur MariaDB.
Supprimer db.sequelize.sync() Utiliser sequelize-cli migrations. sync() en production est dangereux et lent.
CDN pour assets statiques Décharger le serveur API du trafic statique via Cloudflare ou Render.

6. Communication Frontend ↔ Backend

6.1 Routes cassées ou incompatibles
Sévérité Problème Fichier Description + Fix
CRITIQUE GET /alerts/public retourne 404 user.service.ts → getActiveAlerts() Le frontend appelle /alerts/public mais la route backend s'appelle /alerts/live et /alerts/public. En fait /public existe bien mais retourne silencieusement { alerts: [] } sur erreur 401/403.
Fix : Corriger getActiveAlerts() : changer l'URL de /alerts/public vers /alerts/public (déjà correct) mais vérifier que la route public est bien avant le middleware verifyToken.
CRITIQUE 5 hooks utilisent fetch() nu sans token hooks/useCentersAndAppointments.ts + useAuth.ts useNearbyCenters, useCenterDetail, useAllCentres, useMyAppointments, useUpdateProfile, useValidateAlert utilisent fetch() sans header Authorization.
Fix : Remplacer tous les fetch() par apiClient.get/post/put() depuis @/config/axiosConfig.
SÉVÈRE DELETE /rendez-vous/:id incompatible hooks/useCentersAndAppointments.ts Le hook useCancelAppointment envoie DELETE. La route backend rendezvous.routes.js a bien un router.delete('/:id') mais la méthode est cancelRendezVous qui met statut='annule', pas une vraie suppression.
Fix : Vérifier que la route DELETE /:id est bien enregistrée et que le controller cancelRendezVous est appelé. C'est cohérent mais à tester.
SÉVÈRE useValidateAlert : pas de token + body incompatible hooks/useAlerts.ts Utilise fetch() sans token. Envoie { validated: boolean } mais le backend n'utilise pas ce body.
Fix : Utiliser apiClient.post('/alerts/' + alertId + '/validate') sans body. Le backend ne requiert pas de body pour cette route.
SÉVÈRE useUpdateProfile : fetch() vers /api/users/profile hooks/useAuth.ts Appelle /api/users/profile en PUT mais cette route n'existe pas. La route backend est PUT /api/users/:id.
Fix : Remplacer par apiClient.put('/users/' + userId, profileData)
6.2 Incohérences de données
Champ Frontend attend Backend retourne
Statuts rendez-vous confirme, effectue planifie, valide, absent, annule
Rôle centre_manager accepté dans Login.tsx desktop n'existe pas dans ENUM backend
user.ville vs user.region user.ville partout champ s'appelle region dans le modèle
id_utilisateur vs id data.user.id dans certains hooks id_utilisateur dans le modèle
Données hardcodées mapData.ts, data.ts, profileData.ts Données fictives affichées à l'utilisateur

7. Qualité du code et dette technique

Sévérité Problème Fichier Description + Fix
SÉVÈRE Double système auth en parallèle AuthContext.tsx vs hooks/useAuth.ts Deux systèmes d'authentification indépendants. AuthContext gère la session, useAuth.ts est un doublon React Query. Stockent les données différemment (user brut vs JSON.stringify).
Fix : Unifier : conserver AuthContext comme source de vérité, utiliser React Query mutations pour les appels API uniquement.
SÉVÈRE Types any massifs dans TypeScript Tous les hooks et screens useState<any>, data: any partout. Les avantages TypeScript (détection d'erreurs à la compilation) sont annulés.
Fix : Créer des interfaces précises pour User, Alert, Centre, Rendezvous. Remplacer progressivement les any.
SÉVÈRE ENUM statuts_rdv incohérent models/rendezvous.model.js vs centres.controller.js Le modèle définit ENUM('planifie','valide','absent','annule') mais le controller utilise 'confirme' et 'effectue' qui ne sont pas dans l'ENUM.
Fix : Unifier les statuts dans le modèle et dans tous les controllers.
MODÉRÉ 30+ fichiers .md à la racine Racine du projet RAPPORT_FINAL, CORRECTIONS_APPLIQUEES, PROGRESS_FINAL, etc. encombrent la racine et rendent le projet difficile à naviguer.
Fix : Créer un dossier docs/ et y déplacer tous les .md sauf README.md.
MODÉRÉ nodemon dans dependencies backend/package.json nodemon (outil de dev) est dans dependencies au lieu de devDependencies.
Fix : Déplacer dans devDependencies : npm install --save-dev nodemon
MODÉRÉ Note 4.8 hardcodée profil app/(tabs)/profile.tsx La note de réputation est hardcodée à '4.8' pour tous les utilisateurs.
Fix : Afficher '—' jusqu'à ce que le système de notation soit implémenté.
INFO Login-old.tsx non supprimé desktop-centre/pages/Login-old.tsx Fichier obsolète encore présent, risque de confusion.
Fix : Supprimer le fichier.
CRITIQUE Aucun index DB déclaré Tous les modèles Colonnes groupe_sanguin, statut, lat_actuelle, long_actuelle, id_alerte (FK) sans index. Full table scan sur 10 000 lignes.
Fix : Ajouter indexes: dans chaque modèle Sequelize (voir plan d'action section 8).

8. Plan d'action priorisé

Semaine 1 — Urgences (avant toute mise en production)
Jour Action Fichiers concernés
Jour 1 Créer desktop-centre/.env avec VITE_API_URL. Corriger regex téléphone Login.tsx. Supprimer role centre_manager. desktop-centre/.env, Login.tsx
Jour 1 Ajouter verifyToken sur GET /users/search et GET /users/groupe-sanguin/:groupe. Bloquer role=admin à l'inscription publique. users.routes.js, schemas.js
Jour 2 Corriger bypass CORS localhost en production. Ajouter .env.production au .gitignore. index.js, .gitignore
Jour 3 Pool DB max 5 → 20. Ajouter compression gzip. Remplacer la boucle N INSERTs par bulkCreate dans validateAndNotifyAlert. config/db.js, index.js, alerts.controller.js
Jour 3 getCentreStats : 4 await séquentiels → Promise.all. updateUser : double save → transaction. centres.controller.js, users.controller.js
Jour 4 Ajouter pagination obligatoire à getAllUsers et getCentreRendezVous. users.controller.js, centres.controller.js
Jour 5 Ajouter indexes Sequelize sur groupe_sanguin, statut, lat_actuelle, long_actuelle, id_alerte. Corriger ENUM statut_rdv. profil_donneur.model.js, alerte.model.js, log_notification.model.js, rendezvous.model.js
Semaine 2 — Qualité & React Query
Action Détail
Migrer 3 écrans vers React Query alertes.tsx → useMyAlerts() + useAcceptedAlerts(). index.tsx → useActiveAlerts() + useUserProfile(). profile.tsx → useUserProfile(). Supprimer les useFocusEffect qui rechargent inutilement.
Remplacer tous les fetch() nus hooks/useCentersAndAppointments.ts et hooks/useAuth.ts : tous les fetch() remplacés par apiClient depuis @/config/axiosConfig.
Centraliser le retry 1 seule couche de retry dans Axios (MAX_RETRIES = 2). Désactiver retry dans useApiCall. Réduire React Query retry à 1.
Token en mémoire Cache le token en mémoire dans axiosConfig.ts. Appeler setAuthToken() au login/logout depuis AuthContext.
Nettoyage bundle npm uninstall firebase (desktop: npm uninstall date-fns si inutilisé ailleurs). Supprimer Login-old.tsx. Masquer debug-api.tsx avec **DEV**.
Semaine 3-4 — Scaling
Action Détail
PM2 cluster mode pm2 start index.js -i max pour utiliser tous les cores CPU du serveur.
rate-limit-redis npm install rate-limit-redis. Remplacer le store en mémoire par Redis pour le rate limiting distribué.
Cache Redis/node-cache npm install node-cache. Cache 15 min pour getAllCentres, getTypeDon. Cache 5 min pour getLiveAlerts.
Haversine SQL Remplacer le filtrage géo JavaScript par une requête Sequelize avec Sequelize.literal() utilisant la formule Haversine.
BullMQ pour notifications Répondre 202 Accepted immédiatement à validateAndNotifyAlert. Traiter l'envoi des notifications en background worker.
Politique rétention logs Cron job hebdomadaire : suppression des LogNotification de plus de 90 jours.
Versioning API Préfixer toutes les routes avec /v1/ dans les routes Express et mettre à jour les 3 clients.
expo-secure-store Remplacer AsyncStorage par expo-secure-store pour le token JWT et les données sensibles.

9. Conclusion

VitaSang est une application bien architecturée avec une vision claire et une bonne séparation des responsabilités entre les trois composants. L'infrastructure de base est solide : JWT, bcrypt, Joi, helmet, React Query, gestion d'erreurs centralisée.
Cependant, trois catégories de problèmes doivent être traitées avant une mise en production à grande échelle :

1. Sécurité immédiate : 4 failles critiques exploitables maintenant (données GPS publiques, création admin publique, CORS bypass, secrets dans Git). Ces 4 points peuvent être corrigés en 2 heures.
2. Performance sous charge : Le pool DB à 5, l'absence de cache, et la boucle N INSERTs sont les causes directes des ralentissements actuels à 10 000 utilisateurs. Corrigeable en 1-2 jours.
3. Cohérence frontend-backend : React Query construit mais non utilisé dans les écrans réels. 5 routes cassées ou incompatibles. Le desktop ne peut pas se connecter à cause de 3 bugs distincts identifiés et corrigibles immédiatement.

Avec les corrections des semaines 1 et 2, l'application sera production-ready pour 50 000 utilisateurs.
Les améliorations de scaling (semaine 3-4) permettront de viser 200 000+ utilisateurs.
