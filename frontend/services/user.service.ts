import axios from 'axios'; // Import axios

export const loginUser = async (telephone: string, mot_de_passe: string) => {
  try {
    const response = await axios.post(`${process.env.API_BASE_URL}/users/login`, {
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
  telephone: string,
  mot_de_passe: string,
  groupe_sanguin: string,
  role:string
) => {
  try {
    const response = await axios.post(`${process.env.API_BASE_URL}/users/register`, {
      nom,
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

