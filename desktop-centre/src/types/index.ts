/* ============================================================================
 * Types for VitaSang Desktop Application
 * ============================================================================ */

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User/Auth types
export interface User {
  id_utilisateur?: string | number;
  nom: string;
  prenom: string;
  email?: string;
  telephone: string;
  role: "personnel" | "admin" | "centre_manager";
  centre?: Centre;
}

export interface LoginRequest {
  telephone: string;
  mot_de_passe: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// Centre types
export interface Centre {
  id_centre: string | number;
  nom_centre: string;
  nom?: string;
  adresse: string;
  ville?: string;
  telephone: string;
  contact_urgence?: string;
  latitude: number;
  longitude: number;
  capacite_stockage_max: number;
}

// Blood Stock types
export interface BloodStock {
  id_stock: string | number;
  groupe_sanguin: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  quantite_poches: number;
  seuil_alerte_min: number;
  id_centre: string | number;
}

export interface BloodStockDetail extends BloodStock {
  max_stock?: number;
  status?: "Critique" | "Faible" | "Suffisant";
}

// Alert types
export interface Alert {
  id_alerte: number;
  groupe_requis: string;
  degre_urgence: "NORMAL" | "URGENT" | "TRES_URGENT";
  quantite_requise: number;
  lieu: string;
  description: string;
  createdAt: string;
  statut: "en_attente_validation" | "en_cours" | "termine" | "annule";
  initiateur?: {
    id_utilisateur?: number;
    nom: string;
    prenom: string;
    telephone?: string;
  };
}

// Appointment/RendezVous types
export interface Appointment {
  id_rdv: number;
  id_donneur: number;
  id_centre: number;
  id_type_don: number;
  date_heure_rdv: string;
  statut_rdv: "planifie" | "valide" | "absent" | "annule";
  code_unique?: string;
  createdAt?: string;
  updatedAt?: string;
  donneur?: {
    nom: string;
    prenom: string;
    email?: string;
    telephone: string;
  };
  centre?: Centre;
  typeDon?: {
    id_type_don: number;
    nom_type_don: string;
  };
}

// Dashboard Stats types
export interface DashboardStats {
  donationsThisMonth: number;
  appointmentsToday: number;
  activeAlerts: number;
  totalStock: number;
  bloodDetail: BloodStockDetail[];
}

// Type don (Donation type)
export interface TypeDon {
  id_type_don: number;
  nom_type_don: string;
  description?: string;
  volume_prevu?: number;
}

// Historique des dons
export interface DonationHistory {
  id_historique: number;
  id_donneur: number;
  id_centre: number;
  date_don: string;
  groupe_sanguin: string;
  type_don: string;
  volume_collecte: number;
  statut_collecte: "reussi" | "abandonne" | "reporte";
}

// Notification Log
export interface NotificationLog {
  id_log: number;
  id_utilisateur: number;
  titre: string;
  corps: string;
  date_envoi: string;
  statut: "envoye" | "recu" | "lu";
}

// Error type for API calls
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
