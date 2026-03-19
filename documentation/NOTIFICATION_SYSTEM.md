# Système de Notifications et Gestion des Alertes

## Vue d'ensemble

Le système de notifications du Vita Sang comprend :

1. **Notifications en application** - Affichées quand l'utilisateur est sur l'app
2. **Notifications push** - Via Expo Server SDK (quand l'app est en arrière-plan)
3. **Système de retry d'alertes** - Relance les alertes toutes les 15 minutes si non acceptées
4. **Analyse de fatigue** - Suivi de l'engagement et recommandations

## Architecture

### 1. NotificationContext (Frontend)

**Fichier:** `frontend/context/NotificationContext.tsx`

Fournit un système d'affichage pour les notifications en application.

```tsx
// Utilisation dans un composant
import { useNotification } from "@/hooks/useNotification";

function MyComponent() {
  const { showSuccess, showError, showAlert } = useNotification();

  // Notification auto-dismiss après 3 secondes
  showSuccess("Alerte acceptée !");

  // Alerte persistante (duration: 0 = aucun auto-dismiss)
  showAlert("Votre profil a expiré", { duration: 0 });

  // Erreur avec action
  showError("Connexion échouée", {
    action: {
      text: "Réessayer",
      onPress: () => handleRetry(),
    },
  });
}
```

**Types de notifications:**

- `success` - Succès, couleur verte
- `error` - Erreur, couleur rouge
- `warning` - Avertissement, couleur orange
- `info` - Info, couleur bleue
- `alert` - Alerte urgente, couleur rouge (persistant)

### 2. Alert Retry Service

**Fichier:** `frontend/services/alertRetryService.ts`

Gère la persistance et la relance automatique des alertes.

```tsx
import { useAlertRetry } from "@/hooks/useAlertRetry";

function AlertsList() {
  const { handleRetryAlerts, dismissAlert, alertStats } = useAlertRetry();

  // Obtenir les statistiques
  const stats = alertStats; // { total, dismissed, pending, overLimit }

  // Ajouter une alerte au queue de retry
  await alertRetryManager.addAlertToRetryQueue({
    id: "alert-123",
    type: "O+",
    location: "Casablanca",
    timestamp: Date.now(),
  });

  // Marquer une alerte comme acceptée
  await dismissAlert("alert-123");

  // Obtenir les alertes prêtes pour retry
  const readyAlerts = await alertRetryManager.getAlertsReadyForRetry();
}
```

**Configuration:**

- `ALERT_RETRY_INTERVAL = 15 * 60 * 1000` (15 minutes)
- `MAX_ALERTS_DISPLAYED = 5` (max d'alertes actives)
- `MAX_RETRY_COUNT = 6` (max de relances = 90 minutes total)
- Stockage: AsyncStorage (persistant même après fermeture de l'app)

### 3. Background Retry Check

**Fichier:** `frontend/hooks/useAlertRetryCheck.ts`

Hook qui vérifie périodiquement les alertes à relancer.

**Fonctionnement:**

1. Lancé au montage de RootLayout
2. Vérifie toutes les 15 minutes
3. Pour chaque alerte prête: marque comme relancée + affiche notification
4. Nettoie les alertes expirées (> 24 heures)

**Intégration:**

```tsx
// Dans app/_layout.tsx
import { useAlertRetryCheck } from "@/hooks/useAlertRetryCheck";

function RootLayoutNav() {
  // Lance le background task
  useAlertRetryCheck();

  // ...
}
```

### 4. Alert Fatigue Service

**Fichier:** `frontend/services/alertFatigueService.ts`

Suivi des métriques d'engagement utilisateur.

```tsx
import { useAlertFatigue } from "@/services/alertFatigueService";

function MyComponent() {
  const { recordInteraction, getFatigueStats, shouldShowAlert } =
    useAlertFatigue();

  // Enregistrer une interaction
  await recordInteraction(
    "alert-123",
    "shown", // type: 'shown' | 'accepted' | 'dismissed'
    "O+", // bloodType
    "Casablanca", // location
  );

  // Vérifier les stats
  const stats = await getFatigueStats();
  // { totalAlertsToday, acceptedAlertsToday, acceptanceRate, isFatigued }

  // Vérifier si on doit afficher une alerte
  const canShow = await shouldShowAlert();

  // Obtenir les recommandations
  const recs = await getFatigueRecommendations();
}
```

**Métriques:**

- Alertes reçues aujourd'hui
- Taux d'acceptation (%)
- Statut de fatigue (basé sur taux < 30%)
- Interactions par type sanguin

### 5. Alert Fatigue Insights Component

**Fichier:** `frontend/components/AlertFatigueInsights.tsx`

Composant UI pour afficher les métriques d'engagement.

```tsx
import { AlertFatigueInsights } from "@/components/AlertFatigueInsights";

function ProfileScreen() {
  return (
    <View>
      {/* Affiche les stats, taux d'acceptation, statut de fatigue, recommandations */}
      <AlertFatigueInsights visible={true} />
    </View>
  );
}
```

## Flux de données

### Quand un utilisateur se connecte à l'app:

1. **RootLayout monte**
   - NotificationProvider initialise le contexte
   - useAlertRetryCheck lance le background task

2. **Home page charge les alertes**
   - Récupère les alertes actives du backend
   - Enregistre "shown" via alertFatigueService

3. **Utilisateur répond à une alerte**
   - Appel API pour accepter/rejeter
   - alertRetryManager.dismissAlert()
   - Enregistre "accepted"/"dismissed"
   - Affiche notification de confirmation

4. **Toutes les 15 minutes**
   - useAlertRetryCheck vérifie les alertes prêtes
   - Pour chaque alerte: notifie + enregistre "retried"
   - Nettoie les alertes expirées

### Quand l'utilisateur quitte l'app:

- Les alertes restent dans AsyncStorage
- Push notifications continueront (Expo SDK)
- Données de retry persistent

## Limite de fatigue

- **Max alertes par jour:** 10
- **Seuil de fatigue:** Taux d'acceptation < 30%
- **Max relances:** 6 (90 minutes total avec intervalle 15min)
- **Max affichées:** 5 alertes actives simultanément

## Recommandations automatiques

Le système suggère:

- Si fatigué: "Prenez une pause"
- Si trop d'alertes: "Ajustez vos préférences"
- Si faible taux: "Vérifiez vos critères"

## Intégration avec le Backend

### Endpoints importants:

```
GET /api/alerts/my-alerts
  -> Récupère les alertes actives pour l'utilisateur
  -> Frontend enregistre "shown" localement

POST /api/alerts/:id/respond
  -> Utilisateur accepte/rejette l'alerte
  -> Frontend appelle dismissAlert()

POST /api/alerts/:id/retry
  -> [Optionnel] Backend peut déclencher retry
  -> Frontend enregistre "retried"
```

## Dépannage

### Alertes ne se relancent pas:

1. Vérifier AsyncStorage:

   ```tsx
   import AsyncStorage from "@react-native-async-storage/async-storage";
   const retryQueue = await AsyncStorage.getItem("alert_retry_queue");
   console.log(JSON.parse(retryQueue));
   ```

2. Vérifier l'intervalle de 15 minutes
3. Vérifier que useAlertRetryCheck est appelé

### Notifications ne s'affichent pas:

1. Vérifier que NotificationProvider enveloppe l'app
2. Vérifier que useNotification() est disponible
3. Vérifier les logs: `NotificationContainer rendering:`

### Stats de fatigue incorrectes:

1. Réinitialiser: `alertFatigueManager.resetStats()`
2. Vérifier que les interactions sont enregistrées
3. Vérifier la date/heure du device

## Tests

```typescript
// Test unitaire basique
import { alertRetryManager } from "@/services/alertRetryService";
import { alertFatigueManager } from "@/services/alertFatigueService";

async function testRetrySystem() {
  // Ajouter une alerte
  await alertRetryManager.addAlertToRetryQueue({
    id: "test-1",
    type: "O+",
    location: "Test",
    timestamp: Date.now(),
  });

  // Vérifier qu'elle existe
  const alerts = await alertRetryManager.getAlertsReadyForRetry();
  console.log("Alertes prêtes:", alerts);

  // Tester la fatigue
  await alertFatigueManager.recordInteraction("test-1", "shown", "O+");
  const stats = await alertFatigueManager.getFatigueStats();
  console.log("Stats:", stats);
}
```

## Fichiers impliqués

```
Frontend:
├── context/NotificationContext.tsx          (In-app notifications)
├── hooks/useAlertRetryCheck.ts             (Background task)
├── hooks/useNotification.ts                (Hook pour montrer notifications)
├── hooks/useAlertRetry.ts                  (Hook pour gérer retry)
├── services/alertRetryService.ts           (Logique retry + persistance)
├── services/alertFatigueService.ts         (Tracking engagement)
├── components/AlertFatigueInsights.tsx     (UI des stats)
└── app/_layout.tsx                         (Initialisation globale)

Backend:
├── models/alerte.model.js                  (DB)
├── controllers/alerts.controller.js        (API)
└── routes/alerts.routes.js                 (Routes)
```

## Notes importantes

- Les notifications en app ne remplacent PAS les push notifications
- Elles se complètent: in-app quand actif, push quand en arrière-plan
- AsyncStorage est limité (~5-10MB), nettoyer les anciennes interactions
- Respecter GDPR: permettre suppression des données de fatigue
