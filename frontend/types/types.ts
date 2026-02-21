export interface UrgentNeed {
  bloodType: string;
  hospital: string;
  distance: number;
}

export interface Stat {
  donations: number;
  availability: string;
}

export interface Collection {
  date: {
    day: number;
    month: string;
  };
  hospital: string;
  type: string;
  time: string;
}
