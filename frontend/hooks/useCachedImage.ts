/**
 * Configuration et hooks pour le caching des images
 * Utilise React Query + FileSystem pour le stockage local
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryKeys, queryOptions } from "@/config/reactQuery";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Répertoire de cache pour les images
const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ""}images/`;

/**
 * Initialise le répertoire de cache des images
 */
export const initImageCache = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, {
        intermediates: true,
      });
      console.log("[ImageCache] Répertoire créé:", IMAGE_CACHE_DIR);
    }
  } catch (error) {
    console.error("[ImageCache] Erreur initialisation:", error);
  }
};

/**
 * Génère une clé de cache pour une URL (Alternative simple à Buffer/Base64)
 */
const generateCacheKey = (url: string): string => {
  return url.split('/').pop()?.split('?')[0] || Math.random().toString(36).substring(7);
};

/**
 * Récupère le chemin du fichier en cache
 */
export const getCachedImagePath = (url: string): string => {
  const fileName = generateCacheKey(url);
  return `${IMAGE_CACHE_DIR}${fileName}.jpg`;
};

/**
 * Télécharge et cache une image
 */
const downloadAndCacheImage = async (url: string): Promise<string> => {
  try {
    const cachedPath = getCachedImagePath(url);

    // Vérifier si l'image est déjà en cache
    const fileInfo = await FileSystem.getInfoAsync(cachedPath);
    if (fileInfo.exists) {
      console.log("[ImageCache] Image trouvée en cache:", url);
      return cachedPath;
    }

    // Télécharger et sauvegarder l'image
    console.log("[ImageCache] Téléchargement:", url);
    const downloadResult = await FileSystem.downloadAsync(url, cachedPath);

    if (downloadResult.status !== 200) {
      throw new Error(`HTTP ${downloadResult.status}`);
    }

    console.log("[ImageCache] Image sauvegardée:", cachedPath);
    return cachedPath;
  } catch (error) {
    console.error("[ImageCache] Erreur téléchargement:", error);
    // Retourner l'URL originale en cas d'erreur
    return url;
  }
};

/**
 * Hook pour charger et cacher une image
 * Utilise React Query pour la gestion du cache
 */
export const useCachedImage = (
  url: string | null,
): UseQueryResult<string, Error> => {
  return useQuery({
    queryKey: queryKeys.images.url(url || ""),
    queryFn: async () => {
      if (!url) {
        throw new Error("URL manquante");
      }
      return downloadAndCacheImage(url);
    },
    enabled: !!url,
    ...queryOptions.images,
  });
};

/**
 * Efface tout le cache des images
 */
export const clearImageCache = async () => {
  try {
    await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
    await initImageCache();
    console.log("[ImageCache] Cache vidé avec succès");
  } catch (error) {
    console.error("[ImageCache] Erreur suppression cache:", error);
  }
};

/**
 * Nettoie le cache image si la taille dépasse la limite en Mo
 */
export const manageImageCacheSize = async (maxSizeMB: number = 50) => {
  try {
    const size = await getImageCacheSize();
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (size > maxSizeBytes) {
      console.log(`[ImageCache] Limite atteinte (${(size / (1024 * 1024)).toFixed(2)}MB > ${maxSizeMB}MB). Nettoyage global...`);
      await clearImageCache();
    }
  } catch (error) {
    console.error("[ImageCache] Erreur lors du nettoyage auto:", error);
  }
};

/**
 * Récupère la taille du cache des images
 */
export const getImageCacheSize = async (): Promise<number> => {
  try {
    const files = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(
        `${IMAGE_CACHE_DIR}${file}`,
      );
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error("[ImageCache] Erreur calcul taille:", error);
    return 0;
  }
};

/**
 * Récupère les statistiques du cache
 */
export const getImageCacheStats = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);
    const size = await getImageCacheSize();

    return {
      count: files.length,
      size: size,
      sizeInMB: (size / (1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    console.error("[ImageCache] Erreur stats:", error);
    return { count: 0, size: 0, sizeInMB: "0" };
  }
};
