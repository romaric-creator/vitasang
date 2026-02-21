export interface MarkerData {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  subtitle: string;
}

export const markers: MarkerData[] = [
  {
    coordinate: {
      latitude: 4.0511,
      longitude: 9.7085,
    },
    title: "Hôpital Central",
    subtitle: "2.4 km • 15 min",
  },
];
