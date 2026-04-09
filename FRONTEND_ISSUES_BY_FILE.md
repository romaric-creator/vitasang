# Index des Problèmes par Fichier - Frontend VitaSang

**Format:** Chemin du fichier → [Ligne] Problème | Sévérité

---

## 📁 A - APP SCREENS

### app/OnboardingCarousel.tsx

- [L26] `const { width: viewportWidth } = Dimensions.get("window")` - Déclaration correcte ✅
- [L551-562] Traductions onboarding utilisées (`t("onboarding.slide1.title")` etc.) ✅
- [L581] `onMomentumScrollEnd = (event: any)` - **TYPE: Devrait être `NativeScrollEvent`** 🟡
- [L586] `renderItem = ({ item, index }: { item: any })` - **TYPE: Item devrait être typé avec interface** 🟡
- [L607] `router.replace("/login")` - Usage router correct ✅
- [L610] `t("common.actions.skip")` - Clé i18n vérifiée ✅
- [L671] `t("alert.emergencySOS")` avec fallback ✅
- [L682-683] `t("common.actions.start")`, `t("common.actions.next")` ✅

### app/edit-profile.tsx

- [L37] `const [userData, setUserData] = useState<any>(null)` - **TYPE: À remplacer par UserProfile** 🟡
- [L40] `const [userId, setUserId] = useState<number | null>(null)` ✅
- [L41-42] Propriétés état bien typées ✅
- [L54] `router.replace("/login")` ✅
- [L66] `Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL?.replace(...)` - **MAGIC STRING: À centraliser** 🟡
- [L79-83] `t("editProfile.loadError")` - Clé vérifiée ✅
- [L84] `console.error("Error loading profile:", error)` - **CONSOLE: À supprimer** 🟡
- [L107] `async (values: any)` - **TYPE: À typer avec FormikValues** 🟡
- [L117] `console.error("Image upload failed:", uploadErr)` - **CONSOLE: À supprimer** 🟡
- [L118] `t("editProfile.image.error")` ✅
- [L132] `t("editProfile.success")` ✅
- [L135-138] `t("editProfile.error")` ✅
- [L137] `catch (error: any)` - **TYPE: À typer comme Error** 🟡
- [L139] `console.error("Error updating profile:", error)` - **CONSOLE: A supprimer** 🟡
- [L148-292] Traductions éditeur: `t("editProfile.*")` - Toutes vérifiées ✅
- [L241-288] Multiples `error={errors.nom as any}` - **TYPE: À typer avec FormikTouched** 🟡

### app/historique.tsx

- [L59] `console.error("Error loading history:", error)` - **CONSOLE: À supprimer** 🟡
- [L90-92] Traductions: `t("history.date")`, `t("history.center")`, `t("history.city")` ✅
- [L91-92] Optional chaining avec centre: `item.centre?.nom`, `item.centre?.ville` ✅
- [L97] `t("history.defaultType")` ✅
- [L98] `item?.quantite || 0` - Fallback correct ✅
- [L111, L119, L123, L128] Traductions history ✅

### app/(tabs)/profile.tsx

- [L38] `name={icon as any}` - **TYPE: À remplacer par IconName type** 🟡
- [L50] `const [userId, setUserId] = useState<number | null>(null)` ✅
- [L60] `const userData = profileQuery.data?.user` - Optional chaining ✅
- [L108] `.replace("/api", "")` - **MAGIC STRING: À centraliser** 🟡
- Traductions profile ✅

### app/(tabs)/index.tsx (Home)

- [L37] `const [userId, setUserId] = useState<number | null>(null)` ✅
- [L60] `const userData = profileQuery.data?.user` ✅
- [L66] `.replace("/api", "")` - **MAGIC STRING: À centraliser** 🟡
- [L75] `t("profile.defaultUser")` ✅
- Composants enfants bien structurés ✅

### app/(tabs)/alertes.tsx

- [L20] `export default function AlertesScreen()` ✅

### app/(tabs)/map.tsx

- [L65] `console.error("Permission error:", e)` - **CONSOLE: À supprimer** 🟡
- [L78-80] Plusieurs `console.log("[Map]")` - **CONSOLE: À supprimer** 🟡 (5 occurrences)
- [L83] `console.warn("[Map] Could not get location:")` - **CONSOLE: À supprimer** 🟡
- [L89-91] API logging - **CONSOLE: À supprimer** 🟡
- [L97] `console.error("[Map] Error fetching centres:")` - **CONSOLE: À supprimer** 🟡
- [L164] `console.log("[Map] Rendering...")` - **CONSOLE: À supprimer** 🟡

### app/(tabs)/\_layout.tsx

- [L29] `console.log("[Notifications] Token obtenu...")` - **CONSOLE: À supprimer** 🟡
- [L32] `console.log("[Notifications] Pas de token...")` - **CONSOLE: À supprimer** 🟡
- [L35] `console.error("[Notifications] Erreur setup:")` - **CONSOLE: À supprimer** 🟡
- [L49, L57, L62] Autres `console.log` - **CONSOLE: À supprimer** 🟡 (6 totales)

### app/create-alert/index.tsx

- [L58] `console.warn("Location error:", e)` - **CONSOLE: À supprimer** 🟡
- [L77] `console.error(error)` - **CONSOLE + TYPE: Sans contexte, non typé** 🟡
- [L89] `console.error(e)` - **CONSOLE + TYPE: Non typé** 🟡
- [L131] `console.error("Submit Alert Error:", error)` - **CONSOLE: À supprimer** 🟡

### app/register.tsx

- [L47] `.replace(/\s/g, "")` - Nettoyage téléphone ✅
- [L93] `router.replace()` avec params ✅
- [L100] `console.warn(...)` - **CONSOLE: À supprimer** 🟡
- [L107] `console.warn("Error checking pending alert", e)` - **CONSOLE: À supprimer** 🟡
- [L111] `router.replace("/(tabs)")` ✅
- [L113] `console.error("Registration error:", err.message)` - **CONSOLE: À supprimer** 🟡

### app/login.tsx

- [L41] `console.error("Login error:", err)` - **CONSOLE: À supprimer** 🟡

### app/alert-tracking/[id].tsx

- [L46] `console.error("Tracking Error:", error)` - **CONSOLE: À supprimer** 🟡

### app/rendezvous.tsx

- [L64] `console.error("Error loading appointments:", error)` - **CONSOLE: À supprimer** 🟡

### app/alert-response/[id].tsx

- [L72] `console.error("Fetch Error:", error)` - **CONSOLE: À supprimer** 🟡

### app/alert-confirmation.tsx

- [L16] `console.warn("AlertConfirmation: Invalid alertId...")` - **CONSOLE: À supprimer** 🟡
- [L23] `console.log('AlertConfirmation: Redirecting ...')` - **CONSOLE: À supprimer** 🟡

### app/guest-alert.tsx

- [L61] `console.warn("Location error:", e)` - **CONSOLE: À supprimer** 🟡
- [L83] `console.error(error)` - **CONSOLE + TYPE: Non structuré** 🟡
- [L119] `console.error("Failed to store pending alert:", error)` - **CONSOLE: À supprimer** 🟡

### app/messages/index.tsx

- [L29] `console.error("Error fetching inbox:", e)` - **CONSOLE: À supprimer** 🟡

### app/messages/[id].tsx

- [L49] `console.error("Error fetching messages:", e)` - **CONSOLE: À supprimer** 🟡
- [L77] `console.error("Error sending message:", e)` - **CONSOLE: À supprimer** 🟡

### app/eligibility-test.tsx

- Pas de problèmes détectés ✅

### app/book-appointment/[centreId].tsx

- [L159] `date.toISOString().split('T')[0]` - **SPLIT: Sûr (format fixe ISO)** ✅

### app/\_layout.tsx

- [L135-138] Navigation logic ✅

---

## 📁 B - COMPONENTS

### components/home/LaunchAlertButton.tsx

- [L18] `console.log("[LaunchAlertButton] Redirecting to /create-alert")` - **CONSOLE: À supprimer** 🟡

### components/home/UrgentAlertsSection.tsx

- [L10] `activeAlerts: any[]` - **TYPE: Devrait être Alert[]** 🟡
- [L20-22] Traductions: `t("home.urgentSection")`, `t("common.seeAll")` ✅
- [L63] `t("home.nearby")` ✅
- [L66] `t("home.donate")` ✅
- [L78-79] `t("alert.empty.sent")`, `t("home.noUrgentAlerts")` ✅

### components/home/BentoStats.tsx

- [L25] `t("home.livesSaved")` ✅
- [L27] `t("history.empty")?.split(".")[0]` - **SPLIT LOGIC: Problématique, retourne ["Aucun don enregistré"]** 🔴
  - Traduction: "Aucun don enregistré" - **N'a pas de point, split ne fonctionne pas correctement**
- [L33] `t("home.bloodGroup")` ✅
- [L48-49] `t("home.nextDonation")`, `t("home.available")` ✅

### components/home/AideSensibilisationSection.tsx

- [L26] `t("home.helpAndAwareness")` ✅
- [L29] `t("home.discoverTips")` ✅

### components/home/HomeHeader.tsx

- [L24] `t("home.profileLabel")` ✅

### components/AlertFatigueInsights.tsx

- [L51] `console.error("Error loading engagement status:", error)` - **CONSOLE: À supprimer** 🟡

### components/AideEtConseilSection.tsx

- [L241] `t("helpAndAdvice.statDays").split(' ')[0]` - **TRANSLATION MISSING: Clé introuvable** 🔴
  - La clé `helpAndAdvice.statDays` **n'existe pas dans les fichiers de traduction**

### components/ErrorBoundary.tsx

- [L30] `console.error('Error caught by boundary:', error, errorInfo)` - **CONSOLE: À supprimer** 🟡

### components/SanguHappy.tsx

- [L13] `const AnimatedG: any = Animated.createAnimatedComponent(G)` - **TYPE: À remplacer** 🟡
- [L132, L146, L167] Multiples `as any` pour les styles - **TYPE: À remplacer** 🟡

### components/SanguNeutral.tsx

- [L14] `const AnimatedG: any = Animated.createAnimatedComponent(G)` - **TYPE: À remplacer** 🟡

### components/SanguHero.tsx

- [L15] `const AnimatedG: any = Animated.createAnimatedComponent(G)` - **TYPE: À remplacer** 🟡

### components/ModernSpinner.tsx

- Pas de problèmes détectés ✅

### components/LoadingSpinner.tsx

- Pas de problèmes détectés ✅

### Autres components (FormField, PrimaryButton, etc.)

- Rien de critique détecté ✅

---

## 📁 C - CONFIG & SERVICES

### config/axiosConfig.ts

- [L112] `console.log("[API Request]", { ... })` - **CONSOLE: À supprimer** 🟡
- [L122] `console.error("[Request Interceptor Error]", error.message)` - **CONSOLE: À supprimer** 🟡
- [L138] `console.log("[API Response]", { ... })` - **CONSOLE: À supprimer** 🟡
- [L160] `console.error("[API Error]", { ... })` - **CONSOLE: À supprimer** 🟡
- [L194] `console.log(...)` - **CONSOLE: À supprimer** 🟡

### config/queryKeys.ts

- Pas de problèmes ✅

### config/queryClient.ts

- Bien structuré, commentaire sur "unused" expliqué ✅

### config/reactQuery.ts

- Pas de problèmes ✅

### services/user.service.ts

- [L12] `console.error("Erreur lors de la connexion:", error)` - **CONSOLE: À supprimer** 🟡
- [L45] `console.error("Erreur lors de l'inscription:", error)` - **CONSOLE: À supprimer** 🟡
- [L69] `console.error("Erreur lors de la recherche de donneurs:", error)` - **CONSOLE: À supprimer** 🟡
- [L96] `console.error("Send Alert API Error:", ...)` - **CONSOLE: À supprimer** 🟡
- [L137] `console.warn("User not authenticated - returning empty alerts")` - **CONSOLE: À supprimer** 🟡
- [L140] `console.error("Erreur lors de la récupération des alertes:", error)` - **CONSOLE: À supprimer** 🟡
- [L167] `console.error("Erreur lors de la mise à jour du token push:", error)` - **CONSOLE: À supprimer** 🟡
- [L202] `console.error("Erreur lors de la mise à jour de la localisation:", error)` - **CONSOLE: À supprimer** 🟡
- [L298] `console.error("Erreur lors de l'upload de la photo:", error)` - **CONSOLE: À supprimer** 🟡

### services/toastService.ts

- [L35] `console.log('[${type.toUpperCase()}]...')` - **CONSOLE: À supprimer** 🟡

### services/errorService.ts

- Pas de problèmes ✅

### services/analyticsService.ts

- Pas de problèmes ✅

### services/alertRetryService.ts

- Pas de problèmes ✅

### services/alertFatigueService.ts

- Pas de problèmes ✅

### services/messages.service.ts

- Pas de problèmes ✅

---

## 📁 D - CONTEXT & HOOKS

### context/AuthContext.tsx

- [L59] `console.error("Failed to check auth status:", error)` - **CONSOLE: À supprimer** 🟡
- [L99] `console.log("Envoi de l'alerte en attente...")` - **CONSOLE: À supprimer** 🟡
- [L102] `console.log("Alerte en attente envoyée...")` - **CONSOLE: À supprimer** 🟡
- [L105] `console.error("Erreur lors de l'envoi...")` - **CONSOLE: À supprimer** 🟡
- [L110] `console.error("Sign in failed:", error)` - **CONSOLE: À supprimer** 🟡
- [L129] `console.error("Sign out failed:", error)` - **CONSOLE: À supprimer** 🟡

### context/NotificationContext.tsx

- Bien structuré, pas de console.log ✅

### hooks/useAuth.ts

- Bien typé avec React Query ✅

### hooks/useAlerts.ts

- Pas de problèmes ✅

### hooks/useCachedImage.ts

- [L24] `console.log("[ImageCache] Répertoire créé:", ...)` - **CONSOLE: À supprimer** 🟡
- [L56] `console.log("[ImageCache] Image trouvée en cache:", ...)` - **CONSOLE: À supprimer** 🟡
- [L61] `console.log("[ImageCache] Téléchargement:", ...)` - **CONSOLE: À supprimer** 🟡
- [L68] `console.log("[ImageCache] Image sauvegardée:", ...)` - **CONSOLE: À supprimer** 🟡
- [L104] `console.log("[ImageCache] Cache vidé...")` - **CONSOLE: À supprimer** 🟡

### hooks/useErrorHandler.ts

- Pas de problèmes ✅

### hooks/useApiRequest.ts

- Pas de problèmes ✅

### hooks/useNotification.ts

- Pas de problèmes ✅

### hooks/useQueryHooks.ts

- Pas de problèmes ✅

### Autres hooks

- Pas de problèmes détectés ✅

---

## 📁 E - UTILS & AUTRES

### i18n.ts

- [L30] `console.log('Error reading language', error)` - **CONSOLE: À supprimer** 🟡
- [L39] `console.log('Error saving language', error)` - **CONSOLE: À supprimer** 🟡

### utils/storage.ts

- [L63] `const payload = token.split('.')[1]` - Extraction JWT, logique correcte ✅

### utils/logger.ts

- Bien structuré pour usage futur ✅

### utils/tracking.ts

- Pas de problèmes ✅

### utils/location.ts

- [L17] `.split("/").pop()` - Extraction d'URL, sûr ✅

### utils/pushNotifications.ts

- [L42] `.split("/").pop()` - Extraction URL, correct ✅

### validation/ValidationSchemas.ts

- Bien structuré avec Yup ✅

### constant/color.ts

- Pas de problèmes ✅

### data/data.ts, profileData.ts, mapData.ts

- Pas de problèmes ✅

### types/types.ts

- Interfaces bien définies ✅

### locales/fr/translation.ts

- **MISSING KEY: `helpAndAdvice.statDays` - Introuvable** 🔴

### locales/en/translation.ts

- **MISSING KEY: `helpAndAdvice.statDays` - Introuvable** 🔴

---

## 🎯 RÉSUMÉ STATISTIQUE

**Total Problèmes trouvés: 71**

- 🔴 **Critiques (2):** Clés i18n manquantes
- 🟡 **Moyen (69):**
  - Console.log/error: 46
  - Typage `any`: 18
  - Magic strings: 2
  - Split logic: 1
  - Logique split risquée: 2

---

## ✅ FICHIERS SANS PROBLÈMES (À GARDER COMME MODÈLE)

- config/queryClient.ts
- config/queryKeys.ts
- config/reactQuery.ts
- services/errorService.ts
- services/analyticsService.ts
- services/alertRetryService.ts
- services/alertFatigueService.ts
- services/messages.service.ts
- context/NotificationContext.tsx
- hooks/useAuth.ts
- hooks/useAlerts.ts
- hooks/useErrorHandler.ts
- hooks/useApiRequest.ts
- hooks/useNotification.ts
- hooks/useQueryHooks.ts
- utils/logger.ts
- utils/tracking.ts
- validation/ValidationSchemas.ts
- constant/color.ts
- types/types.ts
