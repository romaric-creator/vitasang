# 📊 Diagramme de Classes - Blood Donation App

## Vue d'Ensemble Textuelle

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     BLOOD DONATION APPLICATION                             │
│                          Class Diagram v1.0                                │
└────────────────────────────────────────────────────────────────────────────┘


                              ┌─────────────────────┐
                              │   Utilisateur       │
                              ├─────────────────────┤
                              │ - id_utilisateur    │
                              │ - nom               │
                              │ - prenom            │
                              │ - email             │
                              │ - telephone         │
                              │ - mot_de_passe      │
                              │ - role (enum)       │
                              │ - region            │
                              │ - est_actif         │
                              │ - photo_profil      │
                              │ - id_centre (FK)    │
                              │ - push_token        │
                              └─────────────────────┘
                                      △
                          ┌───────────┼───────────┐
                          │           │           │
                          │ 1:1       │ 1:N       └─────────────────┐
                    ┌─────────────┐   │                              │
                    │ ProfilDonneur│   │                    ┌────────────────┐
                    ├─────────────┤   │                    │    Centre       │
                    │ id_donneur   │◄──┘         ┌────────►├────────────────┤
                    │ groupe_sang  │             │ 1:N     │ id_centre       │
                    │ poids        │             │         │ nom_centre      │
                    │ taille       │             │         │ adresse         │
                    │ dernier_don  │             │         │ ville           │
                    │ prochain_don │             │         │ latitude        │
                    │ disponible   │             │         │ longitude       │
                    │ lat_actuelle │             │         │ contact_urgence │
                    │ long_actuelle│             │         └────────────────┘
                    └─────────────┘             │              △
                                               │         ┌─────┼─────┬────┐
                                               │         │     │     │    │
                    ┌──────────────────┐       │    1:N  │ 1:N │ 1:N │1:N│
                    │ HistoriqueDon    │       │         │     │     │    │
                    ├──────────────────┤       │    ┌─────────────────────┐
                    │ id_historique    │◄──────┘    │                     │
                    │ date_don         │            │                     │
                    │ volume_ml        │       ┌────────────┐  ┌──────────────┐
                    │ statut_don       │       │ Alerte     │  │ RendezVous   │
                    │ id_donneur (FK)  │       ├────────────┤  ├──────────────┤
                    │ id_centre (FK)   │       │ id_alerte  │  │ id_rdv       │
                    │ id_type_don (FK) │       │ id_centre  │  │ id_donneur   │
                    └──────────────────┘       │ groupe_req │  │ id_centre    │
                              △               │ urgence    │  │ id_type_don  │
                              │               │ rayon_km   │  │ date_heure   │
                              │               │ latitude   │  │ statut_rdv   │
                              │               │ longitude  │  │ code_unique  │
                              │           1:N │ lieu       │  │ createdAt    │
                    ┌─────────────────┐   ┌──►│ description│  │ updatedAt    │
                    │  TypeDon        │   │   │ statut     │  └──────────────┘
                    ├─────────────────┤   │   └────────────┘       △
                    │ id_type_don     │◄──┘         │ 1:N          │
                    │ nom_type        │          ┌──┴──────────┐   │
                    │ composant       │          │             │   │
                    └─────────────────┘   ┌─────────────────┐ │   │
                                          │ LogNotification │ │   │
                                          ├─────────────────┤ │  1:N
                                          │ id_notif        │◄───┘
                                          │ id_alerte       │
                                          │ message         │
                                          │ statut_envoi    │
                                          │ date_envoi      │
                                          └─────────────────┘


RELATIONSHIPS:
═════════════════════════════════════════════════════════════════════════════

Utilisateur (1) ──── (1) ProfilDonneur
└─ Un utilisateur donneur possède un profil donneur unique

Utilisateur (1) ──── (N) HistoriqueDon
└─ Un donneur a plusieurs historiques de dons

Utilisateur (1) ──── (N) RendezVous
└─ Un donneur peut avoir plusieurs rendez-vous

Utilisateur (N) ──── (1) Centre
└─ Plusieurs personnels appartiennent à un centre

Utilisateur (1) ──── (N) Message
└─ Un utilisateur peut envoyer/recevoir plusieurs messages

Centre (1) ──── (N) StockSang
└─ Un centre gère plusieurs stocks (un par groupe sanguin)

Centre (1) ──── (N) Alerte
└─ Un centre émet plusieurs alertes d'urgence

Centre (1) ──── (N) HistoriqueDon
└─ Plusieurs dons sont effectués dans un centre

Centre (1) ──── (N) RendezVous
└─ Plusieurs rendez-vous ont lieu dans un centre

Alerte (1) ──── (N) LogNotification
└─ Une alerte déclenche plusieurs notifications

TypeDon (1) ──── (N) HistoriqueDon
└─ Plusieurs dons peuvent être du même type

TypeDon (1) ──── (N) RendezVous
└─ Plusieurs RDV peuvent être du même type de don
```

---

## Structure Détaillée par Entité

### 🧑 Utilisateur

**Responsabilité:** Représente toutes les personnes dans le système

```
Attributs Clés:
├── Identification: id_utilisateur (PK), nom, prenom
├── Contact: email, telephone, region
├── Sécurité: mot_de_passe, est_actif
├── Rôle: role (donneur|personnel|admin|cnts)
├── Localisation: Centre via id_centre
└── Communications: push_token, photo_profil

Roles Possibles:
├── donneur : Utilisateur qui donne du sang
├── personnel : Personnel d'un centre
├── admin : Administrateur système
└── cnts : Coordinateur national

Associations:
├── hasOne: ProfilDonneur (donneur)
├── belongsTo: Centre (personnel)
├── hasMany: HistoriqueDon
├── hasMany: RendezVous
├── hasMany: Message (expediteur & destinataire)
└── hasMany: Alerte (initiateur)
```

### 💉 ProfilDonneur

**Responsabilité:** Informations spécifiques des donneurs

```
Attributs Clés:
├── Santé: groupe_sanguin, poids, taille
├── Historique: dernier_don, prochain_don_possible
├── Disponibilité: disponible, raison_indisponibilite, date_disponibilite
└── Localisation: lat_actuelle, long_actuelle

Groupe Sanguin Supportés:
├── A+ | A- | B+ | B- | AB+ | AB- | O+ | O-

Status Disponibilité:
├── Raisons: Maladie, voyage, allaitement, etc.
└── Alerte: Si indisponible > date_disponibilite → revérification
```

### 🏥 Centre

**Responsabilité:** Gestion des centres de transfusion

```
Attributs Clés:
├── Identification: id_centre (PK), nom_centre
├── Localisation: adresse, ville, latitude, longitude
├── Capacité: capacite_stockage_max (nombre de poches)
├── Contact: contact_urgence
└── Associations: Personnel, Stocks, Alertes, RendezVous

Responsabilités:
├── Gérer les stocks de sang
├── Émettre les alertes d'urgence
├── Organiser les rendez-vous
├── Enregistrer les dons
└── Manager le personnel
```

### 📋 HistoriqueDon

**Responsabilité:** Suivi de chaque don effectué

```
Attributs Clés:
├── Identification: id_historique (PK)
├── Timing: date_don
├── Volume: volume_ml
├── Résultat: statut_don (réussi|échoué|partiel)

Associations:
├── belongsTo: Utilisateur (donneur)
├── belongsTo: Centre
└── belongsTo: TypeDon

Suivi: Timestamps auto (timestamps: false actuellement)
```

### 📅 RendezVous

**Responsabilité:** Gestion des rendez-vous pour les dons

```
Attributs Clés:
├── Identification: id_rdv (PK), code_unique (QR/texte)
├── Planning: date_heure_rdv
├── Statut: statut_rdv (planifie|valide|absent|annule|confirme|effectue)

Associations:
├── belongsTo: Utilisateur (donneur)
├── belongsTo: Centre
└── belongsTo: TypeDon

Workflow de Statut:
└── planifie → valide → effectue
    ├── ou → annule
    └── ou → absent

Indexé sur: statut_rdv
```

### 🚨 Alerte

**Responsabilité:** Gestion des urgences de transfusion

```
Attributs Clés:
├── Identification: id_alerte (PK)
├── Patient: nom_patient, telephone_contact
├── Médical: groupe_requis, quantite_requise, degre_urgence
├── Localisation: latitude, longitude, lieu, rayon_action_km
├── Détails: description
├── Statut: en_attente_validation|en_cours|resolu|annule

Degrés d'Urgence:
├── NORMAL : Traitement régulier
├── URGENT : À traiter dans les 24h
└── TRÈS_URGENT : Immédiate

Workflow d'Alerte:
└── en_attente_validation → en_cours → resolu
    └── ou → annule

Indexé sur: statut
```

### 💾 StockSang

**Responsabilité:** Gestion de l'inventaire de sang

```
Attributs Clés:
├── Identification: id_stock (PK)
├── Type: groupe_sanguin (A+|A-|B+|B-|...)
├── Quantité: quantite_poches
├── Alerte: seuil_alerte_min

Associations:
└── belongsTo: Centre

Gestion:
├── Décrémente: quand don effectué
├── Augmente: quand nouveau don
└── Alerte: si quantite_poches < seuil_alerte_min
```

### 📬 LogNotification

**Responsabilité:** Suivi des notifications push/SMS

```
Attributs Clés:
├── Identification: id_notif (PK)
├── Contenu: message
├── Statut: statut_envoi (pending|sent|failed|delivered)
├── Timing: date_envoi
├── Type: type_notif (alert|rappel|info)

Associations:
├── belongsTo: Alerte
└── belongsTo: Utilisateur (destinataire)
```

### 📤 Message

**Responsabilité:** Communication entre utilisateurs

```
Attributs Clés:
├── Identification: id_message (PK)
├── Contenu: titre, corps, type
├── Expéditeur: id_expediteur
├── Destinataire: id_destinataire
├── Statut: lu|non_lu

Associations:
├── belongsTo: Utilisateur (expediteur)
└── belongsTo: Utilisateur (destinataire)
```

### 💊 TypeDon

**Responsabilité:** Classification des types de dons

```
Attributs Clés:
├── Identification: id_type_don (PK)
├── Description: nom_type
└── Composition: composant (sang_total|plaquettes|...)

Exemples:
├── Sang Total : 450ml de sang complet
├── Plaquettes : Prélèvement des plaquettes
├── Plasma : Prélèvement du plasma
└── Globules Rouges : Globules rouges sélectionnés
```

### 🗂️ Campagne

**Responsabilité:** Campagnes de recrutement de donneurs

```
Attributs Clés:
├── Identification: id_campagne (PK)
├── Contenu: titre, message
├── Ciblage: groupe_sanguin_cible
├── Impact: donneurs_touches
├── Statut: lancee|terminee|annulee

Associations:
└── belongsTo: Centre
```

### ⚠️ Alerte (Note)

**Note sur le modèle Alerte:**

- Un utilisateur personnel peut lancer une alerte
- L'alerte a un statut de validation
- Les dons correspondants sont manuellement matchés
- Les notifications sont envoyées aux donneurs éligibles

```

---

## Patterns & Conventions

### 🔑 Clés Primaires
- Toutes les tables: `id_[entite]` (auto-increment INT)
- Composées uniquement sur ProfilDonneur: `id_donneur` (FK)

### 🔗 Clés Étrangères
- Nommage: `id_[entite]` (ex: `id_donneur`, `id_centre`)
- Cascade delete activé où pertinent
- NULL allowed pour relations optionnelles

### ⏰ Timestamps
- Defaults: `createdAt`, `updatedAt`
- Sauf: ProfilDonneur, Centre, TypeDon, StockSang (explicitement false)

### 📑 Indexes
- RendezVous: `statut_rdv` (requêtes fréquentes)
- Alerte: `statut` (filtrage par statut)
- ProfilDonneur: `groupe_sanguin` (recherche par groupe)

---

## Flux de Données Clé

### 🩹 Flux d'un Don
```

1. Utilisateur (Donneur) crée un RendezVous
2. RDV assigné à un Centre et TypeDon
3. À la date/heure, centre enregistre HistoriqueDon
4. HistoriqueDon met à jour:
   ├── ProfilDonneur.dernier_don
   ├── ProfilDonneur.prochain_don_possible (+/- 8 semaines)
   └── StockSang.quantite_poches (+1 poche)
5. Si StockSang < seuil → Alerte auto-générée
6. LogNotification envoyée aux personnels

```

### 🚨 Flux d'une Urgence
```

1. Personnel crée une Alerte
2. Alerte en attente_validation
3. Admin valide → Alerte en_cours
4. Système trouve donneurs éligibles:
   ├── groupe_sanguin match
   └── distance < rayon_action_km
5. LogNotification + push token
6. Donneur disponible → HistoriqueDon
7. Stock mis à jour
8. Alerte → resolu (ou annule)

```

### 📱 Flux de Communication
```

Utilisateur1 → Message → Utilisateur2
├── Stocké avec timestamps
├── Statut: lu/non_lu
└── Chiffré (optionnel)

```

---

## Contraintes & Règles Métier

### 👤 Donneurs
- ✅ Groupe sanguin requis pour accès
- ✅ Minimum 50kg, 18 ans (implicite)
- ✅ Délai entre dons: 8 semaines (pour sang total)
- ✅ Indisponibilité: maladie, voyage, grossesse
- ✅ Rayon d'action: max 20km (par défaut)

### 🏥 Centres
- ✅ Capacité de stockage máx
- ✅ Contact urgence: requis
- ✅ Localisation: GPS exact
- ✅ Personnel: min 2 personnes

### 📋 Rendez-vous
- ✅ Code unique: QR ou numérique (12 chars)
- ✅ Statut workflow: strict
- ✅ Non overbooking: planning
- ✅ Rappel: 24h avant

### 🚨 Alertes
- ✅ Urgence 3 niveaux
- ✅ Rayon de diffusion variable
- ✅ Validation requise
- ✅ Time-bound: auto-expiration

---

## Scalabilité & Performance

### 🎯 Optimisations Prévues
1. **Indexation**
   - Statuts: rendez_vous, alertes
   - Groupe sanguin: donneurs, alertes
   - Dates: historique dons, rdv

2. **Partitioning**
   - Par centre géographiquement
   - Par mois pour historique

3. **Caching**
   - Stocks sanguin: Redis 5min TTL
   - Profils donneurs: Redis 1h TTL
   - Centres: Redis 24h TTL

4. **Pagination**
   - HistoriqueDon: 20 records par page
   - Alertes: 10 records par page
   - RendezVous: 50 records par page

---

## Version History
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-05 | Diagramme initial complet |

```
