import { apiClient } from "@/config/axiosConfig";

export const loginUser = async (telephone: string, mot_de_passe: string) => {
  try {
    const response = await apiClient.post(`users/login`, {
      telephone,
      mot_de_passe,
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la connexion:", error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Erreur de connexion inconnue");
    }
  }
};

export const registerUser = async (
  nom: string,
  prenom: string,
  telephone: string,
  mot_de_passe: string,
  groupe_sanguin: string,
  role: string,
  code_parrainage?: string,
) => {
  try {
    const response = await apiClient.post(`users/register`, {
      nom,
      prenom,
      telephone,
      mot_de_passe,
      groupe_sanguin: groupe_sanguin === "" ? null : groupe_sanguin,
      role,
      code_parrainage,
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de l'inscription:", error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Erreur d'inscription inconnue");
    }
  }
};

export const searchDonors = async (
  latitude: number,
  longitude: number,
  groupe_sanguin: string,
  radius: number,
) => {
  try {
    const response = await apiClient.get(`users/search`, {
      params: { latitude, longitude, groupe_sanguin, radius },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la recherche de donneurs:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Erreur de recherche inconnue");
    }
  }
};

export const sendAlert = async (alertData: {
  latitude: number;
  longitude: number;
  groupe_sanguin: string;
  radius: number;
  urgence: string;
  quantite_requise: number;
  lieu: string;
  description?: string;
}) => {
  try {
    const response = await apiClient.post(`alerts`, alertData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.userMessage || error.message || "Erreur lors de l'envoi de l'alerte");
  }
};

export const getAlertStatus = async (alertId: number) => {
  try {
    const response = await apiClient.get(`alerts/${alertId}/status`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération du statut",
    );
  }
};

export const getMyAlerts = async () => {
  try {
    const response = await apiClient.get(`alerts/my-alerts`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération de vos alertes",
    );
  }
};

export const getActiveAlerts = async () => {
  try {
    const response = await apiClient.get(`alerts/public`);
    return response.data;
  } catch (error: any) {
    // Gracefully handle 401/403 errors (user not authenticated)
    // Return empty alerts response instead of throwing
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("User not authenticated - returning empty alerts");
      return { success: true, alerts: [] };
    }
    console.error("Erreur lors de la récupération des alertes actives:", error);
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération des urgences",
    );
  }
};

export const getUserProfile = async (userId: number) => {
  try {
    const response = await apiClient.get(`users/${userId}/profile`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération du profil",
    );
  }
};

export const updatePushToken = async (userId: number, pushToken: string) => {
  try {
    const response = await apiClient.put(`users/${userId}/push-token`, {
      pushToken,
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du token push:", error);
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la mise à jour du token push",
    );
  }
};
export const updateUserProfile = async (userId: number, profileData: any) => {
  try {
    const data = {
      ...profileData,
      groupe_sanguin: profileData.groupe_sanguin === "" ? null : profileData.groupe_sanguin,
    };
    const response = await apiClient.put(`users/${userId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la mise à jour du profil",
    );
  }
};

export const updateUserLocation = async (
  userId: number,
  latitude: number,
  longitude: number,
) => {
  try {
    const response = await apiClient.put(`users/${userId}`, {
      latitude,
      longitude,
    });
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la localisation:", error);
    return false;
  }
};

export const getUserHistory = async (userId: number) => {
  try {
    const response = await apiClient.get(`users/${userId}/history`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération de l'historique",
    );
  }
};

export const getMyAppointments = async (userId: number) => {
  try {
    const response = await apiClient.get(`rendez-vous/my-appointments`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération des rendez-vous",
    );
  }
};

export const cancelAppointment = async (appointmentId: number) => {
  try {
    const response = await apiClient.delete(`rendez-vous/${appointmentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'annulation",
    );
  }
};

export const getAllCentres = async () => {
  try {
    const response = await apiClient.get(`centres`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération des centres",
    );
  }
};

export const searchCentresNearby = async (params: {
  latitude: number;
  longitude: number;
  radius: number;
}) => {
  try {
    const response = await apiClient.get(`centres/search`, { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la recherche de centres",
    );
  }
};

export const uploadProfilePicture = async (
  userId: number,
  imageUri: string,
) => {
  try {
    const formData = new FormData();

    // On extract l'extension pour le type MIME
    const uriParts = imageUri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    formData.append("photo", {
      uri: imageUri,
      name: `profile.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await apiClient.post(
      `users/${userId}/upload-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de l'upload de la photo:", error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'upload de la photo",
    );
  }
};

export const respondToAlert = async (
  alertId: number,
  response: "accepte" | "ignore",
) => {
  try {
    const res = await apiClient.post(`alerts/${alertId}/respond`, {
      response,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la réponse à l'alerte",
    );
  }
};

export const getAcceptedAlerts = async () => {
  try {
    const res = await apiClient.get(`alerts/accepted`);

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération des interventions",
    );
  }
};

export const getCentreDetails = async (id: number) => {
  try {
    const response = await apiClient.get(`centres/${id}`);

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération du centre",
    );
  }
};

export const createAppointment = async (data: {
  id_centre: number;
  date_rdv: string;
  heure_debut: string;
}) => {
  try {
    const response = await apiClient.post(`rendez-vous`, data);

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la création du rendez-vous",
    );
  }
};

// --- Donor Profile ---

export const getDonorProfile = async (userId: number) => {
  try {
    const response = await apiClient.get(`users/${userId}/profile`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération du profil donneur",
    );
  }
};

export const updateDonorProfile = async (
  userId: number,
  data: {
    disponible?: boolean;
    raison_indisponibilite?: string;
    date_disponibilite?: string;
    poids?: number;
    taille?: number;
  },
) => {
  try {
    const response = await apiClient.put(`users/${userId}/donor-profile`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la mise à jour du profil donneur",
    );
  }
};

// --- Centre Availability ---

export const getCentreAvailability = async (centreId: number) => {
  try {
    const response = await apiClient.get(`centres/${centreId}/availability`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération des disponibilités",
    );
  }
};
