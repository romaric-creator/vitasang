import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores a value in AsyncStorage.
 * @param key The key to store the value under.
 * @param value The value to store. Can be any type, as it will be JSON.stringified.
 */
export const storeData = async (key: string, value: any) => {
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
