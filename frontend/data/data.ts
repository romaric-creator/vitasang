import { UrgentNeed, Stat, Collection } from "@/types/types";

export const urgentNeed: UrgentNeed = {
  bloodType: "O-",
  hospital: "Hôpital Central",
  distance: 2.4,
};

export const stat: Stat = {
  donations: 12,
  availability: "Dès aujourd'hui",
};

export const collections: Collection[] = [
  {
    date: {
      day: 12,
      month: "FEVR",
    },
    hospital: "Hôpital Laquintinie",
    type: "Don de Masse",
    time: "08:00 - 17:00",
  },
];
