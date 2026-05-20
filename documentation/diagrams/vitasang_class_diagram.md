# Diagramme de Classe - VitaSang

Le diagramme suivant représente la structure des données du backend VitaSang (Sequelize). Ce format Mermaid est compatible avec l'importation directe dans des outils comme **StarUML**, **Draw.io**, ou via l'extension **Mermaid** de VS Code.

```mermaid
classDiagram
    class Utilisateur {
        +int id_utilisateur
        +string nom
        +string prenom
        +string region
        +string email
        +string telephone
        +string role
        +string push_token
        +boolean est_actif
        +string photo_profil
        +int id_centre
        +login()
        +register()
    }

    class Centre {
        +int id_centre
        +string nom_centre
        +string adresse
        +string ville
        +double latitude
        +double longitude
        +string contact_urgence
        +int capacite_stockage_max
    }

    class ProfilDonneur {
        +int id_donneur
        +string groupe_sanguin
        +decimal poids
        +decimal taille
        +date dernier_don
        +date prochain_don_possible
        +boolean disponible
        +string raison_indisponibilite
        +double lat_actuelle
        +double long_actuelle
    }

    class Alerte {
        +int id_alerte
        +int id_initiateur
        +string nom_patient
        +string telephone_contact
        +int id_centre
        +string groupe_requis
        +string degre_urgence
        +int rayon_action_km
        +string lieu
        +string description
        +double latitude
        +double longitude
        +int quantite_requise
        +string statut
    }

    class StockSang {
        +int id_stock
        +int id_centre
        +string groupe_sanguin
        +int quantite_poches
        +int seuil_alerte_min
    }

    class RendezVous {
        +int id_rdv
        +int id_donneur
        +int id_centre
        +int id_type_don
        +datetime date_heure_rdv
        +string statut_rdv
        +string code_unique
    }

    class HistoriqueDon {
        +int id_historique
        +int id_donneur
        +int id_centre
        +int id_type_don
        +datetime date_don
        +int volume_ml
        +string statut_don
    }

    class TypeDon {
        +int id_type_don
        +string libelle
        +int delai_attente_jours
    }

    class Message {
        +int id_message
        +int id_expediteur
        +int id_destinataire
        +string contenu
        +boolean est_lu
    }

    class LogNotification {
        +int id_notification
        +int id_utilisateur
        +int id_alerte
        +datetime date_envoi
        +string statut_reception
        +string canal
        +string push_token
        +string details_echec
    }

    class Campagne {
        +int id_campagne
        +int id_centre
        +string titre
        +string message
        +string groupe_sanguin_cible
        +int donneurs_touches
        +string statut
    }

    %% Associations
    Utilisateur "1" -- "0..1" ProfilDonneur : possède
    Centre "1" -- "*" Utilisateur : travaille
    Centre "1" -- "*" StockSang : gère
    Centre "1" -- "*" Alerte : émet
    Centre "1" -- "*" RendezVous : héberge
    Centre "1" -- "*" HistoriqueDon : enregistre
    Centre "1" -- "*" Campagne : lance
    
    Utilisateur "1" -- "*" RendezVous : planifie
    Utilisateur "1" -- "*" HistoriqueDon : effectue
    Utilisateur "1" -- "*" Message : envoie
    Utilisateur "1" -- "*" Message : reçoit
    Utilisateur "1" -- "*" LogNotification : reçoit
    
    Alerte "1" -- "*" LogNotification : génère
    Alerte "1" -- "0..1" Utilisateur : initiée_par
    
    TypeDon "1" -- "*" RendezVous : catégorie
    TypeDon "1" -- "*" HistoriqueDon : catégorie
```

### Note pour StarUML
Pour importer ce diagramme :
1. Installez l'extension **Mermaid** dans StarUML (si disponible).
2. Sinon, vous pouvez utiliser ce code dans l'éditeur en ligne de Mermaid pour exporter une image SVG/PNG et l'intégrer à votre documentation.
