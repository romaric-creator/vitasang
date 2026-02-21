---
name: Demande de fonctionnalité
about: Suggérer une idée pour ce projet
title: '[FONCTIONNALITÉ] Recherche de donneurs par géolocalisation'
labels: 'feature, backend, frontend'
---

**Description de la fonctionnalité**
Implémenter un système de recherche de donneurs de sang basé sur la géolocalisation, le groupe sanguin et un rayon de recherche.

**Logique de la fonctionnalité**
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

**Critères d'acceptation**
- [ ] Une nouvelle route API `POST /api/alerts/search` est créée.
- [ ] Le backend calcule correctement la distance (formule de Haversine).
- [ ] Le backend envoie des notifications aux bons utilisateurs.
- [ ] Le frontend dispose d'un formulaire pour lancer la recherche.
- [ ] Le frontend affiche les résultats de la recherche.
