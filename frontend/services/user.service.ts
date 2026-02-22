import axios from 'axios'; // Import axios

export const loginUser = async (telephone: string, mot_de_passe: string) => {
  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/login`, {
      telephone,
      mot_de_passe,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Erreur de connexion inconnue');
    }
  }
};

// You can add other API functions here (e.g., registerUser, getUserProfile, etc.)

export const registerUser = async (
  nom: string,
  prenom: string,
  telephone: string,
  mot_de_passe: string,
  groupe_sanguin: string,
  role: string
) => {
  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/register`, {
      nom,
      prenom,
      telephone,
      mot_de_passe,
      groupe_sanguin,
      role
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Erreur d\'inscription inconnue');
    }
  }
};
export const searchDonors = async (lat: number, long: number, blood: string, rayon: number) => {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/search`, {
      params: { lat, long, blood, rayon },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la recherche de donneurs:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Erreur de recherche inconnue');
    }
  }
};

export const sendAlert = async (alertData: {
  latitude: number,
  longitude: number,
  bloodType: string,
  radius: number,
  degree: string,
  poches: number,
  id_initiateur?: number
}) => {
  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/alerts/search`, alertData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de l'envoi de l'alerte");
  }
};

export const getAlertStatus = async (alertId: number) => {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/alerts/${alertId}/status`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du statut");
  }
};

export const getMyAlerts = async (userId: number) => {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/alerts/my-alerts`, {
      params: { id_utilisateur: userId }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération de vos alertes");
  }
};

export const getUserProfile = async (userId: number) => {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/${userId}/profile`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil");
  }
};
