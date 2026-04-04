# Améliorations de Performance - VitaSang

## 1. Configuration Serveur

### Compression
La compression est déjà activée (level 6) ✅

### Suggestions :
```javascript
// Activer le cache HTTP pour les réponses statiques
app.use("/uploads", express.static("uploads", {
  maxAge: "7d",
  etag: true,
  lastModified: true,
}));

// Ajouter cache pour les endpoints publics fréquents
app.get("/api/alerts/public", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
}, alertRoute);
```

## 2. Base de Données - TiDB Cloud

### Problèmes identifiés
- Requêtes sans indexes sur certains champs
- Pas de connexion persistente (pool)

### Améliorations suggérées :

```javascript
// config/db.js - Optimiser le pool de connexions
module.exports = {
  // ...existing config
  pool: {
    max: 30,  // Augmenter
    min: 5,   // Garder des connexions warm
    acquire: 30000,
    idle: 10000,
  },
  // Ajouter retry
  retry: {
    max: 3,
  },
};
```

### Index SQL manquants (à ajouter via migration) :
```sql
-- Index pour les recherches de donors par localisation
CREATE INDEX idx_profil_lat_long ON ProfilDonneur(lat_actuelle, long_actuelle);

-- Index pour les alertes par statut et date
CREATE INDEX idx_alerte_statut_date ON Alertes_Urgence(statut, createdAt);

-- Index pour les utilisateurs par téléphone
CREATE INDEX idx_utilisateur_telephone ON Utilisateurs(telephone);
```

## 3. Cache Redis

### Améliorations :
- Mettre en cache les requêtes fréquentes (centres,alertes publiques)
- Ajouter TTL pour les données qui changent peu

```javascript
// Exemple de cache dans un contrôleur
const getCentres = async (req, res) => {
  const cacheKey = "centres:all";
  
  // Vérifier cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Requête DB
  const centres = await Centre.findAll();
  
  // Mettre en cache (TTL 5 min)
  await redisClient.setEx(cacheKey, 300, JSON.stringify(centres));
  
  res.json(centres);
};
```

## 4. Requêtes Sequelize - Optimisation

### Probleme : N+1 queries
```javascript
// AVANT (lent)
const users = await Utilisateur.findAll();
for (const user of users) {
  const profil = await ProfilDonneur.findOne({ where: { id_donneur: user.id } });
}

// APRÈS (rapide) - Utiliser include
const users = await Utilisateur.findAll({
  include: [{ model: ProfilDonneur, as: "profilDonneur" }],
});
```

### Limiter les champs retournés :
```javascript
// Champs spécifiques seulement
const users = await Utilisateur.findAll({
  attributes: ["id_utilisateur", "nom", "prenom", "telephone", "role"],
});
```

## 5. Rate Limiting

### Optimisation Redis :
- Utiliser Redis pipeline pour les opérations en lot
- Ajouter sliding window au lieu de fixed window

## 6. Frontend - Optimisations

### Cache React Query (déjà utilisé ✅)
- Persister le cache dans AsyncStorage
- Configurer staleTime approprié

### Images :
- Utiliser `expo-image` avec resize
- Mettre en cache les images Cloudinary

### Bundle Size :
- Ajouter code splitting
- Lazy load les écrans non essentiels

## 7. Métriques à surveiller

| Métrique | Cible |
|----------|-------|
| Temps de réponse API | < 200ms |
| TTFB (Time To First Byte) | < 500ms |
| Taille bundle JS | < 1MB |
| Couverture cache | > 70% |

## Priorités d'implémentation

1. **Haute priorité** :
   - Ajouter les index SQL
   - Optimiser les requêtes Sequelize (éviter N+1)
   - Mettre en cache les alertes publiques

2. **Moyenne priorité** :
   - Augmenter le pool de connexions DB
   - Ajouter cache Redis pour les centres
   - Optimiser le bundle frontend

3. **Basse priorité** :
   - Implementer code splitting
   - Ajouter lazy loading
   - Optimiser les images
