---
name: Demande de fonctionnalité
about: Suggérer une idée pour ce projet
title: '[FONCTIONNALITÉ] Recherche de donneurs par géolocalisation'
labels: 'feature, backend, frontend'
---

# Description de la fonctionnalité

Implémenter un système de recherche de donneurs de sang basé sur la géolocalisation, le groupe sanguin et un rayon de recherche.

## Logique de la fonctionnalité

1.  **Déclencheur :** Un utilisateur (centre de transfusion, etc.) lance une recherche.
2.  **Entrées :**
    *   Position GPS de l'initiateur.
    *   Groupe sanguin recherché.
    *   Rayon de recherche (en km).
3.  **Traitement (Backend) :**
    *   Filtrer les donneurs par groupe sanguin.
    *   Calculer la distance entre l'initiateur et chaque donneur.
    *   Sélectionner les donneurs dans le rayon spécifié.
    *   Envoyer une notification push aux donneurs sélectionnés.
4.  **Retour (Frontend) :**
    *   Afficher le nombre de donneurs trouvés.
    *   Afficher une liste anonymisée des donneurs/distances.

---

## Détails d'implémentation technique

### Backend

*   **Route API :** `POST /api/alerts/search`
*   **Body de la requête (exemple) :**
    ```json
    {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "bloodType": "A+",
      "radius": 10
    }
    ```
*   **Calcul de distance :**
    Le calcul de la distance entre deux points GPS (latitude, longitude) devra se faire à l'aide de la **formule de Haversine**. On pourra utiliser une librairie NPM existante comme `haversine-distance` pour simplifier l'implémentation.
*   **Réponse de l'API (exemple) :**
    ```json
    {
      "donorsFound": 3,
      "message": "Notifications envoyées à 3 donneurs."
    }
    ```

### Frontend

*   **Gestion de la localisation :** Utiliser le module `expo-location` pour obtenir les coordonnées GPS de l'utilisateur.
*   **Appel API :** La fonction d'appel dans `user.service.ts` devra envoyer la requête POST avec le body ci-dessus.

## Critères d'acceptation

- [ ] Une nouvelle route API `POST /api/alerts/search` est créée.
- [ ] Le backend calcule correctement la distance en utilisant la formule de Haversine.
- [ ] Le backend envoie des notifications aux bons utilisateurs.
- [ ] Le frontend dispose d'un formulaire pour lancer la recherche.
- [ ] Le frontend affiche les résultats de la recherche.
