export default {
    common: {
        seeAll: "Voir tout",
        cancel: "Annuler",
        confirm: "Confirmer",
        error: "Erreur",
        success: "Succès",
        bloodGroup: "Groupe sanguin"
    },
    home: {
        profileLabel: "Profil",
        launchAlert: "Lancer une Alerte",
        urgentNeed: "Besoin Urgent ?",
        urgentSection: "Besoins Urgents",
        donate: "Donner",
        myStatus: "Mon Statut",
        nextDonation: "Prochain don",
        livesSaved: "Vies sauvées",
        tips: "Aide & Conseils",
        tipsData: {
            t1: "Pourquoi donner ?",
            d1: "Un seul don peut sauver jusqu'à trois vies.",
            t2: "Après le don",
            d2: "Hydratez-vous et reposez-vous pendant 15 min.",
            t3: "Éligibilité",
            d3: "Vérifiez les conditions avant de vous déplacer."
        }
    },
    profile: {
        title: "Mon Profil",
        edit: "Éditer mon profil",
        history: "Historique des dons",
        appointments: "Mes rendez-vous",
        centers: "Centres de dons",
        settings: "Paramètres",
        notifications: "Notifications",
        language: "Langue",
        logout: "Déconnexion",
        logoutConfirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
        defaultUser: "Utilisateur",
        donations: "Dons",
        alerts: "Alertes",
        rating: "Note",
        menu: "Menu"
    },
    centers: {
        title: "Centres de Santé",
        searchPlaceholder: "Rechercher centre...",
        nearby: "Centres à proximité",
        noResults: "Aucun centre trouvé",
        bookAppointment: "Prendre RDV",
        appointmentModal: {
            title: "Rendez-vous",
            info: "La prise de rendez-vous en ligne sera bientôt disponible pour ce centre.",
            close: "FERMER"
        },
        address: "Adresse :",
        phone: "Téléphone :"
    },
    history: {
        title: "Historique des Dons",
        empty: "Aucun don enregistré",
        createAlert: "Créer une alerte",
        date: "Date :",
        center: "Centre :",
        city: "Ville :",
        defaultType: "Don de sang"
    },
    appointments: {
        title: "Mes Rendez-vous",
        empty: "Aucun rendez-vous",
        book: "Prendre rendez-vous",
        cancel: "Annuler",
        canceled: "Rendez-vous annulé",
        cancelError: "Erreur annulation",
        cancelGenericError: "Erreur lors de l'annulation",
        date: "Date :",
        time: "Heure :",
        type: "Type :",
        code: "Code :",
        phone: "Tél :",
        status: {
            confirmed: "Confirmé",
            completed: "Complété",
            cancelled: "Annulé",
            pending: "En attente"
        }
    },
    editProfile: {
        title: "Paramètres",
        header: "Profil",
        subtitle: "Modifiez vos informations personnelles",
        save: "ENREGISTRER LES MODIFICATIONS",
        success: "Profil mis à jour avec succès",
        error: "Erreur mise à jour profil",
        loadError: "Erreur chargement profil",
        notFound: "Impossible de charger le profil",
        back: "RETOUR",
        fields: {
            lastName: "Nom",
            firstName: "Prénom",
            phone: "Téléphone",
            city: "Ville"
        },
        placeholders: {
            lastName: "Ex: Dupont",
            firstName: "Ex: Jean",
            phone: "Ex: 6XXXXXXXX",
            city: "Douala"
        }
    },
    notifications: {
        title: "Notifications",
        channels: "Canaux de réception",
        push: {
            title: "Notifications Push",
            desc: "Recevoir les alertes sur le téléphone"
        },
        email: {
            title: "Emails",
            desc: "Recevoir les récapitulatifs par mail"
        },
        sms: {
            title: "SMS",
            desc: "Pour les alertes extrêmement urgentes"
        },
        preferences: "Préférences d'alertes",
        urgentOnly: {
            title: "Urgences uniquement",
            desc: "Ne pas être notifié pour les besoins normaux"
        },
        commitment: "VitaSang s'engage à ne vous envoyer que des notifications pertinentes liées à votre groupe sanguin et votre zone géographique."
    },
    login: {
        title: "VitaSang",
        subtitle: "Connectez-vous à votre compte",
        forgotPassword: "Mot de passe oublié ?",
        submit: "CONNEXION",
        noAccount: "Pas de compte ?",
        registerLink: "Inscrivez-vous ici",
        error: "Une erreur inattendue est survenue.",
        fields: {
            phone: "Téléphone",
            password: "Mot de passe"
        },
        placeholders: {
            phone: "Ex: +2376XXXXXXXX",
            password: "Votre mot de passe"
        }
    },
    register: {
        title: "VitaSang",
        subtitle: "Créez votre profil",
        submit: "CRÉER MON COMPTE",
        alreadyRegistered: "Déjà inscrit ?",
        loginLink: "Connectez-vous ici",
        error: "Une erreur inattendue est survenue.",
        hintPhone: "Format requis : +237 suivi de 9 chiffres",
        fields: {
            lastName: "Nom",
            firstName: "Prénom",
            phone: "Téléphone",
            password: "Mot de passe",
            confirmPassword: "Confirmer mot de passe",
            bloodGroup: "Groupe sanguin"
        },
        placeholders: {
            lastName: "Ex: Dupont",
            firstName: "Ex: Jean",
            phone: "Ex: +2376XXXXXXXX",
            password: "Min 6 chars, majuscule, chiffre",
            confirmPassword: "Confirmez votre mot de passe"
        }
    },
    alert: {
        title: "Nouvelle Alerte",
        submit: "DIFFUSER L'ALERTE",
        donorFound: "{{count}} donneurs {{group}} trouvés dans un rayon de 10km.",
        searchingDonors: "Recherche de donneurs compatibles...",
        locationError: "Permission de localisation refusée ou non disponible",
        idError: "Erreur : ID alerte non reçu",
        genericError: "Une erreur est survenue lors de la diffusion.",
        fields: {
            location: "Lieu",
            quantity: "Quantité requise (poches)",
            urgency: "Niveau d'urgence",
            description: "Description (optionnel)"
        },
        placeholders: {
            location: "Ex: Hôpital Ibn Sina",
            quantity: "Ex: 5",
            description: "Détails supplémentaires"
        },
        urgencyLevels: {
            NORMAL: "NORMAL",
            URGENT: "URGENT",
            TRES_URGENT: "TRÈS URGENT"
        },
        response: {
            title: "Urgence Sang",
            details: "Détails de l'alerte",
            distance: "à {{distance}} km",
            confirmTitle: "Pouvez-vous aider ?",
            confirmDesc: "Votre groupe sanguin est compatible. Si vous acceptez, vos coordonnées seront transmises au demandeur.",
            yes: "Je viens",
            no: "Pas maintenant",
            success: "Merci ! Le demandeur a été notifié.",
            contactInfo: "Coordonnées du demandeur"
        },
        tabs: {
            myAlerts: "Mes Demandes",
            myResponses: "Mes Interventions"
        },
        status: {
            en_cours: "En cours",
            resolu: "Résolu",
            annule: "Annulé"
        },
        actions: {
            accept: "Accepter",
            ignore: "Ignorer",
            call: "Appeler",
            close: "Fermer"
        },
        empty: {
            sent: "Aucune alerte lancée",
            accepted: "Aucune intervention acceptée",
            subSent: "Appuyez sur 'Lancer une alerte' depuis l'accueil",
            subAccepted: "Les alertes auxquelles vous répondez s'afficheront ici"
        }
    }
};
