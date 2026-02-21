export interface Profile {
  name: string;
  bloodType: string;
}

export interface ProfileItem {
  icon: string;
  label: string;
}

export const profile: Profile = {
  name: "INGENIEUR CHRIS",
  bloodType: "O+",
};

export const profileItems: ProfileItem[] = [
  {
    icon: "user",
    label: "Informations personnelles",
  },
  {
    icon: "history",
    label: "Historique des dons",
  },
  {
    icon: "bell",
    label: "Paramètres de notification",
  },
  {
    icon: "globe",
    label: "Choisir la langue",
  },
];
