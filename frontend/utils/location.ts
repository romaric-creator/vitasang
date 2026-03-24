import * as Location from 'expo-location';

export const getCurrentPositionAsync = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }

    // Stratégie de localisation robuste avec timeout (15s)
    // On tente la précision Haute en priorité, sinon on retombe sur Balanced
    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('GPS_TIMEOUT')), 15000))
    ]).catch(async () => {
      // Fallback sur une précision moindre si le fix GPS est trop long
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    }) as Location.LocationObject;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
