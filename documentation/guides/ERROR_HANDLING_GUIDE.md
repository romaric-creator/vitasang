# Système de Gestion d'Erreurs - Vitasang

## Vue d'ensemble

Nous avons mis en place un système **robuste et cohérent** de gestion des erreurs sur le backend et le frontend.

## Améliorations apportées

### 🔧 Backend

1. **Classe `AppError`** (`backend/utils/errorHandler.js`)
   - Classe custom pour les erreurs applicatives
   - Codes d'erreur standardisés
   - Format de réponse JSON cohérent

2. **Middleware `errorHandler`** (`backend/middleware/errorHandler.js`)
   - Capture et traite tous les types d'erreurs
   - Gère les erreurs Sequelize (validation, contraintes)
   - Gère les erreurs JWT
   - Logging centralisé
   - Exposition du stack trace uniquement en développement

3. **Types d'erreurs prédéfinis** (ErrorTypes)

   ```javascript
   ErrorTypes.BAD_REQUEST(message);
   ErrorTypes.UNAUTHORIZED(message);
   ErrorTypes.FORBIDDEN(message);
   ErrorTypes.NOT_FOUND(message);
   ErrorTypes.VALIDATION_ERROR(message);
   ErrorTypes.RESOURCE_NOT_FOUND(resourceName);
   ErrorTypes.UNAUTHORIZED_ACCESS(message);
   ErrorTypes.RATE_LIMIT(message);
   ErrorTypes.INTERNAL_SERVER_ERROR(message);
   ErrorTypes.DATABASE_ERROR(message);
   ErrorTypes.EXTERNAL_API_ERROR(message);
   ```

4. **Correction de l'ordre des routes** (`backend/routes/alerts.routes.js`)
   - Routes spécifiques AVANT les routes dynamiques
   - Évite le problème 404 avec `/my-alerts`, `/accepted`, `/active`

### 🎨 Frontend

1. **Service d'erreur** (`frontend/services/errorService.ts`)
   - Parsing des erreurs API
   - Messages user-friendly avec traductions
   - Détection des erreurs authentification, validation, réseau
   - Logique de retry automatique

2. **Configuration Axios améliorée** (`frontend/config/axiosConfig.ts`)
   - Intercepteurs requête/réponse robustes
   - Gestion automatique des tokens
   - Retry exponentiel pour les erreurs temporaires
   - Logging détaillé en développement

3. **Hook `useErrorHandler`** (`frontend/hooks/useErrorHandler.ts`)
   - Gestion centralisée des erreurs
   - Affichage Toast automatique
   - Gestion des états d'erreur
   - Intégration avec alerts modales

4. **Hook `useApiRequest`** (`frontend/hooks/useApiRequest.ts`)
   - Wrapper pour les requêtes API
   - Gestion automatique du loading
   - Callbacks onSuccess/onError
   - Contexte pour le logging

### ✅ Exemples d'utilisation

#### Backend - Lancer une erreur

```javascript
// Avant (ancien style)
if (!alerte) {
  return res
    .status(404)
    .json({ success: false, message: "Alerte non trouvée" });
}

// Après (nouveau style)
if (!alerte) {
  throw ErrorTypes.RESOURCE_NOT_FOUND("Alerte");
}
```

#### Frontend - Hook useApiRequest

```typescript
const { execute, isLoading, data } = useApiRequest();

const handleRespondToAlert = async () => {
  const result = await execute(
    () => apiClient.post(`/alerts/${alertId}/respond`, { response: "accepte" }),
    {
      context: "Alert response",
      showError: true,
      onSuccess: () => console.log("Success!"),
    },
  );
};
```

#### Frontend - Hook useErrorHandler

```typescript
const { handleError, error, message, clearError } = useErrorHandler();

try {
  const response = await apiClient.get("/some-endpoint");
} catch (error) {
  handleError(error, {
    showToast: true,
    showAlert: false,
    context: "Getting data",
  });
}
```

## Format de réponse API

### Succès

```json
{
  "success": true,
  "data": { ... }
}
```

### Erreur

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Alerte non trouvée",
    "statusCode": 404,
    "timestamp": "2026-03-13T10:30:00.000Z",
    "details": { ... }
  }
}
```

## Codes d'erreur standardisés

| Code                  | Status | Description                  |
| --------------------- | ------ | ---------------------------- |
| BAD_REQUEST           | 400    | Requête invalide             |
| VALIDATION_ERROR      | 400    | Erreur de validation         |
| UNAUTHORIZED          | 401    | Token invalide/expiré        |
| FORBIDDEN             | 403    | Accès refusé                 |
| NOT_FOUND             | 404    | Ressource non trouvée        |
| CONFLICT              | 409    | Ressource existe déjà        |
| RATE_LIMIT            | 429    | Trop de requêtes             |
| INTERNAL_SERVER_ERROR | 500    | Erreur serveur               |
| DATABASE_ERROR        | 500    | Erreur BD                    |
| EXTERNAL_API_ERROR    | 503    | Service externe indisponible |

## Gestion des erreurs courantes

### Erreur 404 sur `/api/alerts/:id/respond`

**Cause** : Ordre des routes incorrect
**Solution** : ✅ Routes spécifiques avant routes dynamiques

### Erreur Token expiré

**Frontend** : Déconne automatiquement, redirige vers login
**Backend** : JwtError capturé par le middleware

### Erreur de validation

**Frontend** : Le hook détecte `isValidationError()` et affiche un warning Toast
**Backend** : SequelizeValidationError géré avec détails

### Erreur réseau temporaire

**Frontend** : Retry automatique avec backoff exponentiel (max 3 tentatives)
**Backend** : Logging de tous les erreurs

## Bonnes pratiques

✅ **DO**

- Toujours utiliser `ErrorTypes.*` pour les erreurs prévisibles
- Utiliser `useApiRequest()` ou `useErrorHandler()` dans les composants
- Logger avec le contexte des erreurs
- Afficher des messages user-friendly

❌ **DON'T**

- Utiliser `return res.status().json()` pour les erreurs
- Exposer les détails techniques aux utilisateurs
- Ignorer les erreurs de réseau
- Envoyer des stack traces en production

## Prochaines étapes

1. Mettre à jour tous les contrôleurs backend pour utiliser ErrorTypes
2. Envelopper les composants API-heavy avec les hooks
3. Ajouter des tests pour les scénarios d'erreur
4. Configurer le monitoring/alerting des erreurs serveur
