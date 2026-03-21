import { apiClient } from "@/config/axiosConfig";

// --- Messaging Service ---

export interface MessageData {
    id_message: number;
    contenu: string;
    est_lu: boolean;
    id_expediteur: number;
    id_destinataire: number;
    createdAt: string;
    expediteur?: { id_utilisateur: number; nom: string; prenom: string; photo_profil?: string };
    destinataire?: { id_utilisateur: number; nom: string; prenom: string; photo_profil?: string };
}

export interface ConversationSummary {
    id_message: number;
    contenu: string;
    createdAt: string;
    partner_id: number;
    nom: string;
    prenom: string;
    photo_profil?: string;
    unread_count: number;
}

export const sendMessage = async (id_destinataire: number, contenu: string) => {
    try {
        const response = await apiClient.post(`messages`, {
            id_destinataire,
            contenu,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Erreur lors de l'envoi du message",
        );
    }
};

export const getInbox = async () => {
    try {
        const response = await apiClient.get(`messages/inbox`);
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            "Erreur lors de la récupération de la boîte de réception",
        );
    }
};

export const getConversation = async (
    otherId: number,
    page: number = 1,
    limit: number = 30,
) => {
    try {
        const response = await apiClient.get(`messages/${otherId}`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            "Erreur lors de la récupération de la conversation",
        );
    }
};
