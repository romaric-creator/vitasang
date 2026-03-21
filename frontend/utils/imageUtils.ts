import Constants from "expo-constants";

/**
 * Get the full URL for a profile image.
 * Handles both absolute URLs and relative paths from the backend.
 * 
 * @param path The image path or URL from the user object
 * @returns An image source object compatible with React Native Image component or null
 */
export const getProfileImageSource = (path: string | null | undefined) => {
    if (!path) return null;

    if (path.startsWith("http")) {
        return { uri: path };
    }

    const baseUrl = (
        Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_API_BASE_URL ||
        "https://vitasang-api.onrender.com/"
    ).replace("/api", "");

    // Ensure path starts with / if it doesn't
    const formattedPath = path.startsWith("/") ? path : `/${path}`;

    return { uri: `${baseUrl}${formattedPath}` };
};
