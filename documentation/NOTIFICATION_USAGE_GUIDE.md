# 📱 Guide d'utilisation - Système de Notifications

## Quick Start

### 1. Dans ton composant, importe le hook:

```tsx
import { useNotification } from "@/hooks/useNotification";
```

### 2. Utilise le hook:

```tsx
function MyComponent() {
  const { showSuccess, showError, showAlert, showInfo, showWarning } =
    useNotification();

  const handleDonate = () => {
    showSuccess("Alerte lancée avec succès !");
  };

  const handleError = () => {
    showError("Une erreur est survenue");
  };

  return (
    <TouchableOpacity onPress={handleDonate}>
      <Text>Lancer alerte</Text>
    </TouchableOpacity>
  );
}
```

---

## API Complète

### showSuccess(message, options?)

Affiche une notification de succès (verte) qui disparaît après 3 secondes.

```tsx
showSuccess("Alerte acceptée !");
showSuccess("Profil mis à jour", {
  duration: 5000, // custom duration en ms
});
```

### showError(message, options?)

Affiche une notification d'erreur (rouge) qui disparaît après 4 secondes.

```tsx
showError("Erreur serveur");
showError("Connexion échouée", {
  title: "Oops...",
  duration: 5000,
});
```

### showWarning(message, options?)

Affiche une notification d'avertissement (orange) qui disparaît après 3.5 secondes.

```tsx
showWarning("Données limitées");
showWarning("À bientôt votre prochain don", {
  title: "Rappel",
  duration: 6000,
});
```

### showInfo(message, options?)

Affiche une notification info (bleue) qui disparaît après 3 secondes.

```tsx
showInfo("Nouvelle alerte disponible");
showInfo("Mise à jour complétée", {
  duration: 4000,
});
```

### showAlert(message, options?)

Affiche une alerte **persistante** (rouge vif) qui NE disparaît PAS automatiquement. Besoin d'une action utilisateur.

```tsx
// Alerte simple (persistante)
showAlert("Confirmez votre âge");

// Alerte avec bouton d'action
showAlert("Internet requis ⚠️", {
  action: {
    text: "Réessayer",
    onPress: () => {
      // Tu as cliqué sur le bouton
      console.log("Utilisateur a cliqué");
    },
  },
});
```

---

## Options complètes

```typescript
interface ShowOptions {
  title?: string; // Titre optionnel
  duration?: number; // Durée en ms (0 = persistant)
  action?: {
    // Bouton optionnel
    text: string; // Texte du bouton
    onPress: () => void; // Callback au clic
  };
}
```

---

## Exemples pratiques

### Gestion d'erreur d'API

```tsx
const { showError, showSuccess } = useNotification();

try {
  await acceptAlert(alertId);
  showSuccess("Alerte acceptée!");
} catch (error) {
  showError("Impossible d'accepter l'alerte");
}
```

### Validation de formulaire

```tsx
const { showWarning } = useNotification();

const validateEmail = (email: string) => {
  if (!email.includes("@")) {
    showWarning("Email invalide");
    return false;
  }
  return true;
};
```

### Notification persistante avec action

```tsx
const { showAlert } = useNotification();

const askConfirmation = () => {
  showAlert("Êtes-vous sûr ?", {
    action: {
      text: "Confirmer",
      onPress: () => {
        // Logique de confirmation
        console.log("Confirmé");
      },
    },
  });
};
```

### Requête en arrière-plan

```tsx
const { showInfo } = useNotification();

const syncData = async () => {
  showInfo("Synchronisation en cours...");

  try {
    await fetchData();
    // Pas de notification de succès, on laisse passer
  } catch (error) {
    // handleError affichera l'alerte d'erreur
    showError("Sync failed");
  }
};
```

---

## ⚠️ Points Importants

### 1. NotificationContext doit envelopper l'app

```tsx
// Dans app/_layout.tsx
import { NotificationProvider } from "@/context/NotificationContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootLayoutNav />
      </NotificationProvider>
    </AuthProvider>
  );
}
```

### 2. Durées par défaut

- `showSuccess()` → 3 secondes
- `showError()` → 4 secondes
- `showWarning()` → 3.5 secondes
- `showInfo()` → 3 secondes
- `showAlert()` → persistant (0)

### 3. Notifications persistantes

```tsx
// ❌ Cette notification disparaît après 4 secondes
showError("Connection lost");

// ✅ Cette notification reste jusqu'à action utilisateur
showAlert("Connection lost", {
  action: {
    text: "Réessayer",
    onPress: () => reconnect(),
  },
});
```

### 4. Pile de notifications

Les notifications s'affichent les unes au-dessus des autres. Max recommandé: 3-4 notifications.

---

## Background Tasks

### Alert Retry Every 15 Minutes

Lancé automatiquement dans `app/_layout.tsx`:

```tsx
import { useAlertRetryCheck } from "@/hooks/useAlertRetryCheck";

function RootLayoutNav() {
  // Lance le background task
  useAlertRetryCheck();

  // Affichera des notifications toutes les 15 min
  // si des alertes sont prêtes pour retry
}
```

### Alert Fatigue Tracking

Tracker dans les composants:

```tsx
import { useAlertFatigue } from "@/services/alertFatigueService";

function AlertResponseScreen() {
  const { recordInteraction } = useAlertFatigue();

  const handleAccept = async (alertId) => {
    // Enregistrer l'interaction
    await recordInteraction(alertId, "accepted", "O+", "Casablanca");

    // Appeler API
    await acceptAlert(alertId);
  };
}
```

---

## Fichiers concernés

```
Frontend:
├── context/NotificationContext.tsx        ← NotificationProvider + hooks
├── hooks/useNotification.ts              ← Hook pour accéder au contexte
├── hooks/useAlertRetryCheck.ts          ← Background task 15min
├── services/alertFatigueService.ts      ← Tracking engagement
├── services/alertRetryService.ts        ← Persistence alerts
├── components/AlertFatigueInsights.tsx  ← UI du statut engagement
└── app/_layout.tsx                      ← Setup providers
```

---

## Debugging

### Vérifier les notifications

```tsx
import { AlertFatigueInsights } from "@/components/AlertFatigueInsights";

// Ajouter sur n'importe quel screen pour debug
<AlertFatigueInsights visible={true} />;
```

### Vérifier les alertes en queue

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dans console
const queue = await AsyncStorage.getItem("alert_retry_queue");
console.log(JSON.parse(queue));
```

### Vérifier les stats de fatigue

```tsx
import { alertFatigueManager } from "@/services/alertFatigueService";

const stats = await alertFatigueManager.getFatigueStats();
console.log({
  total: stats.totalAlertsToday,
  accepted: stats.acceptedAlertsToday,
  rate: stats.acceptanceRate + "%",
  fatigued: stats.isFatigued,
});
```

---

## Bonnes pratiques

✅ **À FAIRE:**

- Utiliser le hook dans les composants fonctionnels
- Afficher le message clair et court
- Utiliser `showAlert` pour les actions critiques
- Personnaliser `duration` selon l'importance

❌ **À ÉVITER:**

- Afficher trop de notifications en même temps
- Messages cryptiques ou trop longs
- Oublier de `showSuccess` après action réussie
- Utiliser `showAlert` pour les messages simples

---

## Exemples de messages

### ✅ Bons

- "Alerte lancée !"
- "Profil sauvegardé"
- "Erreur de connexion"
- "À proximité: 2.3 km"

### ❌ Mauvais

- "La requête API vers /api/alerts a échoué avec le code 500"
- "ReferenceError: showAlert is not defined"
- "Opération effectuée avec succès" (trop générique)
- "ERR_NETWORK_REQUEST_FAILED_DATABASE_CONNECTION_TIMEOUT"

---

## Support

Pour toute question ou bug:

1. Vérifier que NotificationProvider enveloppe ton composant
2. Vérifier que useNotification() est appelé correctement
3. Vérifier la console pour les erreurs
4. Consulter les exemples ci-dessus
