# 📱 Analyse UI/UX - VitaSang Blood Donation App

## Architecture Actuelle des Écrans

### Bottom Tab Navigation (4 onglets principaux)
```
TAB 1: Accueil (Home)        → index.tsx
TAB 2: Centres (Map)         → map.tsx
TAB 3: Alertes (Notifications) → alertes.tsx
TAB 4: Profil (Profile)      → profile.tsx
```

---

## 🏠 TAB 1: ACCUEIL (index.tsx)
**Objectif:** Dashboard principal avec actualités urgentes

### Éléments actuels:
- ✅ Header avec nom utilisateur
- ✅ Section "BESOIN URGENT" (alerte active)
- ✅ Statistiques (dons, acceptés, résolus)
- ✅ Mes alertes actives (scroll horizontal)
- ✅ Collectes à proximité
- ✅ Bouton flottant "LANCER UNE ALERTE"
- ✅ Section "Accès Rapide" (4 boutons)

**À AMÉLIORER:**
- ❌ Hiérarchie visuelle peu claire
- ❌ Accès rapide mal intégré
- ✅ Garder le layout

---

## 🗺️ TAB 2: CENTRES (map.tsx)
**Objectif:** Localiser les centres de sang à proximité

### Éléments actuels:
- ✅ Carte Google Maps avec marqueurs
- ✅ Filtres (layers, géolocalisation)

**À AMÉLIORER:**
- ❌ Pas de liste alternative en-dessous
- ❌ Pas de détails des centres
- ✅ Ajouter liste centres à proximité + détails

**NOUVEAU: Créer écran `/centres` dédié:**
- Liste centres avec recherche
- Filtres (distance, type)
- Détails centre + RDV (lien vers `/rendezvous`)

---

## 🔔 TAB 3: ALERTES (alertes.tsx)
**Objectif:** Historique des alertes créées

### Éléments actuels:
- ✅ Liste alertes avec statut
- ✅ Détails alerte (groupe, date, stats)
- ✅ Pull-to-refresh

**À AMÉLIORER:**
- ✅ C'est correct

---

## 👤 TAB 4: PROFIL (profile.tsx)
**Objectif:** Voir infos perso + paramètres

### Éléments actuels:
- ✅ Avatar + Nom
- ✅ Groupe sanguin
- ✅ Stats (dons, alertes, note)
- ✅ Menu paramètres
- ✅ Bouton déconnexion

**PROBLÈME DÉTECTÉ:**
- ❌ Clic sur avatar ou menu = rien!
- ❌ Pas de lien vers `/edit-profile`
- ❌ Pas de lien vers `/historique`
- ❌ Pas de lien vers `/rendezvous`

**À CORRIGER:**
- ✅ Ajouter lien "Éditer profil" → `/edit-profile`
- ✅ Ajouter lien "Mes dons" → `/historique`
- ✅ Ajouter lien "Rendez-vous" → `/rendezvous`
- ✅ Restructurer menu

---

## 📄 ÉCRANS MODALE/NAVIGATION

### `/edit-profile` (Stack)
**Objectif:** Modifier infos perso

**Éléments requis:**
- Nom, Prénom
- Téléphone
- Groupe sanguin
- Ville
- Bouton "Enregistrer"

**À CORRIGER:**
- ✅ C'est bon mais améliorer présentation

---

### `/historique` (Stack)
**Objectif:** Voir dons antérieurs

**Éléments requis:**
- Liste des dons (date, centre, quantité)
- Filtres (date, centre)

**À CORRIGER:**
- ✅ C'est bon

---

### `/rendezvous` (Stack)
**Objectif:** Gestion des rendez-vous

**Éléments requis:**
- Mes rendez-vous (liste)
- Prendre RDV (date/centre)
- Annuler RDV

**À CORRIGER:**
- ✅ C'est bon

---

### `/centres` (Stack)
**Objectif:** Chercher centres + prendre RDV

**Éléments requis:**
- Recherche + filtres
- Liste centres
- Clic → détails + prendre RDV
- Lien vers `/rendezvous`

**À CORRIGER:**
- ✅ À créer correctement

---

## 🔗 NAVIGATION COMPLÈTE

```
ACCUEIL (index)
  ├── Besoin urgent → /alert-tracking/[id]
  ├── Mes alertes → /alert-tracking/[id]
  ├── Bouton "Lancer alerte" → /create-alert (modal)
  └── Accès rapide:
      ├── Profil → /edit-profile
      ├── Historique → /historique
      ├── Rendez-vous → /rendezvous
      └── Centres → /centres

CENTRES (map)
  ├── Clic marqueur → détails
  └── "Voir tout" → /centres

ALERTES (alertes)
  └── Clic alerte → /alert-tracking/[id]

PROFIL (profile)
  ├── Clic avatar → /edit-profile
  ├── Menu "Historique" → /historique
  ├── Menu "Rendez-vous" → /rendezvous
  ├── Menu "Centres" → /centres
  └── Clic "Déconnexion" → /login
```

---

## 🎨 AMÉLIORATIONS UI/UX À FAIRE

### 1. **Profile Screen (profile.tsx)**
- ✅ Ajouter liens cliquables vers écrans
- ✅ Ajouter icônes menu pour chaque action
- ✅ Ajouter "Éditer profil" clickable

### 2. **Map Screen (map.tsx)**
- ✅ Ajouter liste centres en bas (collapsible)
- ✅ Ajouter "Prendre RDV" pour chaque centre

### 3. **Edit Profile Screen**
- ✅ Améliorer layout formulaire
- ✅ Ajouter confirmation avant sauvegarde

### 4. **Centres Screen**
- ✅ Créer interface de recherche
- ✅ Ajouter distance calculée
- ✅ Lien vers RDV

---

## ✅ RÉSUMÉ DES CORRECTIONS À FAIRE

| Écran | Problem | Solution |
|-------|---------|----------|
| profile.tsx | Pas de liens | Ajouter onPress → navigation |
| map.tsx | Pas de liste | Ajouter BottomSheet centres |
| edit-profile.tsx | Layout confus | Réorganiser champs formulaire |
| centres.tsx | UI confuse | Créer interface claire |
| index.tsx | Navigation floue | Ajouter liens "Accès rapide" |

