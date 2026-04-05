# 📊 Diagramme Simplifié - Blood Donation (ASCII)

## Vue d'Ensemble Compacte

```
                             ┌──────────────────────────────┐
                             │   UTILISATEUR (Parent)       │
                             ├──────────────────────────────┤
                             │ PK: id_utilisateur           │
                             │ nom, prenom, email           │
                             │ role: donneur|personnel|etc  │
                             │ FK: id_centre (nullable)     │
                             └──────┬───────────────────────┘
                                    │
                    ┌───────────────┼───────────────┬─────────────┐
                    │               │               │             │
             1:1 (donneur)    1:N (member)   1:N (donor)    1:N (sender/receiver)
                    │               │               │             │
        ┌───────────────────┐    ┌─────────────┐ ┌──────────────┐ ┌────────────┐
        │ PROFIL_DONNEUR    │    │ CENTRE      │ │ RENDEZ_VOUS  │ │ MESSAGE    │
        ├───────────────────┤    ├─────────────┤ ├──────────────┤ ├────────────┤
        │ PK: id_donneur    │    │ PK: id      │ │ PK: id_rdv   │ │ PK: id_msg │
        │ groupe_sanguin    │    │ nom_centre  │ │ date_heure   │ │ titre      │
        │ poids, taille     │    │ latitude    │ │ statut_rdv   │ │ from/to    │
        │ dernier_don       │    │ longitude   │ │ code_unique  │ │ lu: bool   │
        │ prochain_don      │    │ contact     │ └──────────────┘ └────────────┘
        │ disponible        │    │ capacite    │
        │ lat/long_actuelle │    └────┬────────┘
        └───────────────────┘         │ 1:N
                                      │
                        ┌─────────────┼────────────┬──────────┐
                        │             │            │          │
                    1:N │         1:N │        1:N │      1:N │
                   stock  histories  alertes  rdv_center
                        │             │            │          │
            ┌──────────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────┐
            │ STOCK_SANG       │ │ HISTORIQUE   │ │ ALERTE     │ │ CAMPAGNE    │
            ├──────────────────┤ │___DON        │ ├────────────┤ ├─────────────┤
            │ PK: id_stock     │ ├──────────────┤ │ PK: id     │ │ PK: id      │
            │ groupe_sanguin   │ │ PK: id       │ │ id_centre  │ │ titre       │
            │ quantite_poches  │ │ date_don     │ │ groupe_req │ │ message     │
            │ seuil_alerte     │ │ volume_ml    │ │ urgence    │ │ statut      │
            │ FK: id_centre    │ │ statut_don   │ │ lat/long   │ │ FK: centre  │
            └──────────────────┘ │ FK: id_type  │ │ rayon_km   │ └─────────────┘
                                 │ FK: id_centre│ │ statut     │
                                 │ FK: id_donner│ └────────────┘
                                 └──────────────┘       │ 1:N
                                         │              │
                                    TYPE_DON      LOG_NOTIFICATION
                                    ┌──────────┐  ┌────────────────┐
                                    │ PK: id   │  │ PK: id_notif   │
                                    │ nom_type │  │ message        │
                                    │ composant│  │ statut_envoi   │
                                    └──────────┘  │ type_notif     │
                                                  │ FK: id_alerte  │
                                                  │ FK: id_user    │
                                                  └────────────────┘
```

## Workflow Routes

### 🩹 Pipeline du Don

```
Utilisateur (donneur)
    ↓
    ├─→ Crée RENDEZ_VOUS
    │       ├─ Centre
    │       ├─ TypeDon
    │       └─ Date/Heure
    ↓
Centre Personnel
    ├─→ Enregistre HISTORIQUE_DON
    │       ├─ Volume récupéré
    │       └─ Statut réussi/échoué
    ↓
Système Auto
    ├─→ Met à jour PROFIL_DONNEUR
    │       ├─ dernier_don = TODAY
    │       └─ prochain_don_possible = TODAY + 56 jours
    ├─→ Met à jour STOCK_SANG
    │       └─ quantite_poches += 1
    └─→ Si Stock < Seuil
            └─ Crée ALERTE (auto-notification)
```

### 🚨 Pipeline de l'Urgence

```
Personnel Centre
    ↓
    ├─→ Crée ALERTE
    │       ├─ Groupe requis
    │       ├─ Urgence level
    │       ├─ Localisation
    │       ├─ Quantité
    │       └─ Statut = en_attente_validation
    ↓
Admin/Chef Centre
    ├─→ Valide ALERTE
    │       └─ Statut = en_cours
    ↓
Système Notification
    ├─→ Recherche donneurs éligibles
    │       ├─ groupe_sanguin = groupe_requis
    │       ├─ disponible = true
    │       ├─ distance < rayon_action_km
    │       └─ prochain_don_possible <= TODAY
    ├─→ Crée LOG_NOTIFICATION pour chaque
    │       └─ Envoie push_token
    ↓
Donneur Disponible
    ├─→ Accepte ALERTE
    │       └─ Crée RENDEZ_VOUS immédiat
    ↓
Centre
    ├─→ Récolte le don
    │       └─ Enregistre HISTORIQUE_DON
    │           └─ Crée LOG_NOTIFICATION "Merci!"
    ↓
Système
    └─→ Si all quantite_requise atteinte
            └─ ALERTE.statut = resolu
```

---

## Nombre de Clés pour chaque Entité

```
┌────────────────────┬─────────────┬──────────────────────┐
│ Entité             │ Clé Prim.   │ Clés Étrayères       │
├────────────────────┼─────────────┼──────────────────────┤
│ Utilisateur        │ id_util     │ id_centre (nullable) │
│ ProfilDonneur      │ id_donneur* │ (PK is FK)           │
│ Centre             │ id_centre   │ —                    │
│ TypeDon            │ id_type_don │ —                    │
│ HistoriqueDon      │ id_hist     │ id_donneur, id_ctr,  │
│                    │             │ id_type_don          │
│ RendezVous         │ id_rdv      │ id_donneur, id_ctr,  │
│                    │             │ id_type_don          │
│ Alerte             │ id_alerte   │ id_centre(nullable), │
│                    │             │ id_initiateur(null)  │
│ StockSang          │ id_stock    │ id_centre            │
│ LogNotification    │ id_notif    │ id_alerte, id_user   │
│ Message            │ id_message  │ id_expediteur,       │
│                    │             │ id_destinataire      │
│ Campagne           │ id_campagne │ id_centre            │
└────────────────────┴─────────────┴──────────────────────┘
```

---

## Cardinalité Résumée

| Relation                    | Type | Notes                            |
| --------------------------- | ---- | -------------------------------- |
| Utilisateur → ProfilDonneur | 1:1  | Un donneur = un profil           |
| Utilisateur → Centre        | N:1  | Plusieurs personnels par centre  |
| Utilisateur → HistoriqueDon | 1:N  | Donneur = plusieurs dons         |
| Utilisateur → RendezVous    | 1:N  | Donneur = plusieurs RDV          |
| Utilisateur → Message       | 1:N  | Sender/Receiver: 1:N chacun      |
| Centre → StockSang          | 1:N  | Centre = 8 stocks (1 par groupe) |
| Centre → HistoriqueDon      | 1:N  | Plusieurs dons par centre        |
| Centre → RendezVous         | 1:N  | Plusieurs RDV par centre         |
| Centre → Alerte             | 1:N  | Plusieurs alertes par centre     |
| Centre → Campagne           | 1:N  | Plusieurs campagnes par centre   |
| TypeDon → HistoriqueDon     | 1:N  | Type = plusieurs dons            |
| TypeDon → RendezVous        | 1:N  | Type = plusieurs RDV             |
| Alerte → LogNotification    | 1:N  | Alerte = plusieurs notifs        |

---

## Statuts Principaux

### Utilisateur.role

```
donneur     → Peut donner son sang
personnel   → Travaille dans un centre
admin       → Gère le système
cnts        → Coordinateur national
```

### RendezVous.statut_rdv

```
planifie    → Créé, pas encore effectué
valide      → Confirmé par centre
confirme    → Confirmé par donneur
absent      → Donneur pas présenté
annule      → RDV annulé
effectue    → Don effectué ✓
```

### HistoriqueDon.statut_don

```
réussi      → Don complété ✓
échoué      → Problème durant la récolte
partiel     → Moins que prévu récolté
```

### Alerte.statut

```
en_attente_validation  → Créée, pas validée
en_cours               → Activement recherche donneurs
resolu                 → Quantité requise atteinte ✓
annule                 → Urgence terminée/annulée
```

### Alerte.degre_urgence

```
NORMAL      → Processus standard
URGENT      → À traiter dans 24h
TRÈS_URGENT → Immédiate, vie en danger
```

### LogNotification.statut_envoi

```
pending     → En attente d'envoi
sent        → Envoyé ✓
delivered   → Reçu ✓
failed      → Erreur d'envoi
```

---

## Indexes Clés

```
PRIMARY:
  Utilisateur.id_utilisateur  [AI]
  ProfilDonneur.id_donneur    [FK]
  Centre.id_centre            [AI]
  HistoriqueDon.id_historique [AI]
  RendezVous.id_rdv          [AI]
  Alerte.id_alerte           [AI]
  StockSang.id_stock         [AI]

UNIQUE:
  Utilisateur.telephone
  ProfilDonneur.id_donneur (même clé!)
  RendezVous.code_unique

SEARCH:
  RendezVous.statut_rdv       [SEARCH frequent]
  Alerte.statut               [SEARCH frequent]
  ProfilDonneur.groupe_sanguin [SEARCH frequent]
  Utilisateur.role            [SEARCH frequent]
```

---

## Exemple Donnée Réelle

### ① Créer un Utilisateur Donneur

```sql
INSERT INTO Utilisateurs (
  nom, prenom, email, telephone,
  mot_de_passe, role, region
) VALUES (
  'Dupont', 'Jean', 'jean@ex.com', '+33612345678',
  '$2b$10$...hash...', 'donneur', 'Île-de-France'
);
-- id_utilisateur auto-généré: 1
```

### ② Créer son Profil

```sql
INSERT INTO Profils_Donneurs (
  id_donneur, groupe_sanguin, poids, taille, disponible
) VALUES (
  1, 'O+', 75.5, 180.0, true
);
```

### ③ Donner le sang

```sql
-- Créer RDV
INSERT INTO Rendez_Vous (
  id_donneur, id_centre, id_type_don,
  date_heure_rdv, statut_rdv
) VALUES (
  1, 5, 2, '2026-04-10 09:00:00', 'planifie'
);
-- id_rdv: 42

-- [Plus tard] Enregistrer le don
INSERT INTO Historique_Dons (
  id_donneur, id_centre, id_type_don,
  date_don, volume_ml, statut_don
) VALUES (
  1, 5, 2, NOW(), 450, 'réussi'
);
-- id_historique: 101

-- Mettre à jour profil
UPDATE Profils_Donneurs SET
  dernier_don = '2026-04-10',
  prochain_don_possible = '2026-06-05'
WHERE id_donneur = 1;

-- Mettre à jour stock
UPDATE Stocks_Sang SET
  quantite_poches = quantite_poches + 1
WHERE id_centre = 5 AND groupe_sanguin = 'O+';

-- RDV marqué effectué
UPDATE Rendez_Vous SET statut_rdv = 'effectue'
WHERE id_rdv = 42;
```

### ④ Cas d'Urgence

```sql
-- Créer alerte
INSERT INTO Alertes_Urgence (
  id_centre, nom_patient, groupe_requis,
  degre_urgence, rayon_action_km, lieu,
  quantite_requise, statut
) VALUES (
  5, 'Patient X', 'O-',
  'TRÈS_URGENT', 25, 'Hôpital Y',
  3, 'en_attente_validation'
);
-- id_alerte: 99

-- Valider
UPDATE Alertes_Urgence SET statut = 'en_cours'
WHERE id_alerte = 99;

-- [Système] Trouver donneurs (O-, dispo, distance)
SELECT u.id_utilisateur, u.push_token
FROM Utilisateurs u
JOIN Profils_Donneurs pd ON u.id_utilisateur = pd.id_donneur
WHERE pd.groupe_sanguin = 'O-'
  AND pd.disponible = true
  AND pd.prochain_don_possible <= CURDATE()
  AND SQRT(POW(pd.lat_actuelle-5.45, 2) +
           POW(pd.long_actuelle-2.35, 2)) < 0.3;
-- Résultat: 5 donneurs trouvés

-- Envoyer notifications
INSERT INTO Log_Notifications (id_alerte, message, statut_envoi)
VALUES
  (99, 'Urgence O- Hôpital Y', 'pending'),
  (99, 'Urgence O- Hôpital Y', 'pending'),
  ...;

-- [Donneur accepte]
-- Crée RDV immédiat + don
-- Marque alerte résolue si quota atteint
UPDATE Alertes_Urgence SET statut = 'resolu'
WHERE id_alerte = 99;
```

---

## Conseils Requêtes Fréquentes

```sql
-- Trouver donneurs disponibles pour groupe sanguin
SELECT * FROM Profils_Donneurs pd
JOIN Utilisateurs u ON pd.id_donneur = u.id_utilisateur
WHERE pd.groupe_sanguin = 'O+'
  AND pd.disponible = true
  AND pd.prochain_don_possible <= CURDATE();

-- Alertes actives (en_cours)
SELECT * FROM Alertes_Urgence
WHERE statut = 'en_cours'
ORDER BY degre_urgence DESC;

-- Historique don d'un donneur
SELECT hd.* FROM Historique_Dons hd
WHERE hd.id_donneur = ?
ORDER BY hd.date_don DESC;

-- Stock critique
SELECT * FROM Stocks_Sang
WHERE quantite_poches < seuil_alerte_min;

-- RDV à venir (7 jours)
SELECT * FROM Rendez_Vous
WHERE id_donneur = ?
  AND date_heure_rdv BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
  AND statut_rdv IN ('planifie', 'valide', 'confirme');

-- Notifications envoyées aujourd'hui
SELECT * FROM Log_Notifications
WHERE DATE(date_envoi) = CURDATE()
  AND statut_envoi IN ('sent', 'delivered');
```

---

## Améliorations Futures

```
- [ ] Audit Trail pour tous les changements
- [ ] Versioning du schéma
- [ ] Partitioning des dons par année
- [ ] Données anonymisées pour analytics
- [ ] Soft delete (deleted_at) où approprié
- [ ] Encryption PII (email, téléphone)
- [ ] Audit compliance (RGPD, logs)
```

---

**Last Updated:** 2026-04-05 | **Version:** 1.0
