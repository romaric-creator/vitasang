import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores a value in AsyncStorage.
 * @param key The key to store the value under.
 * @param value The value to store. Can be any type, as it will be JSON.stringified.
 */
export const storeData = async (key: string, value: any) => {
  if (value === undefined || value === null) {
    console.warn(`[Storage] Tentative de sauvegarde d'une valeur nulle ou indéfinie pour la clé: ${key}. Opération annulée.`);
    return;
  }
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Failed to save data to storage', e);
  }
};

/**
 * Retrieves a value from AsyncStorage.
 * @param key The key of the value to retrieve.
 * @returns The parsed value, or null if it doesn't exist or an error occurs.
 */
export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch data from storage', e);
    return null;
  }
};

/**
 * Removes a value from AsyncStorage.
 * @param key The key of the value to remove.
 */
export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to remove data from storage', e);
  }
};

/**
 * Récupère l'id_utilisateur depuis le cache ou via le token JWT.
 * Utile quand l'objet "user" n'est pas encore en cache (ancien token).
 */
export const getUserIdFromStorage = async (): Promise<number | null> => {
  // 1. Essai depuis l'objet user sauvegardé
  const user = await getData('user');
  if (user?.id_utilisateur) {
    return user.id_utilisateur;
  }

  // 2. Fallback : décode le token JWT (format base64) sans vérification de signature
  const token = await getData('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.id || null;
  } catch (e) {
    console.error('Failed to decode token or parse payload', e);
    return null;
  }
};
