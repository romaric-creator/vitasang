/**
 * Composant Image avec caching automatique
 * Utilise useCachedImage pour cacher les images automatiquement
 */

import React, { useMemo } from "react";
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from "react-native";
import { useCachedImage, getCachedImagePath } from "@/hooks/useCachedImage";
import { color } from "@/constant/color";

interface CachedImageProps extends Omit<ImageProps, "source"> {
  uri: string;
  cacheKey?: string;
  placeholder?: React.ReactNode;
  defaultSource?: any;
  showLoader?: boolean;
  loaderColor?: string;
}

/**
 * Composant Image qui cache automatiquement les images téléchargées
 * 
 * Usage:
 * <CachedImage uri="https://..." style={{width: 100, height: 100}} />
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  cacheKey,
  placeholder,
  defaultSource,
  showLoader = true,
  loaderColor = color.primary,
  style,
  ...props
}) => {
  // Utiliser le hook de caching
  const { data: cachedUri, isLoading, error } = useCachedImage(uri);

  // Déterminer l'URI à utiliser (cachée ou originale)
  const imageUri = useMemo(() => {
    if (isLoading) {
      return defaultSource;
    }
    return cachedUri || uri;
  }, [cachedUri, isLoading, uri, defaultSource]);

  return (
    <View style={style}>
      <Image
        source={
          imageUri
            ? {
                uri: imageUri,
                cache: "force-cache",
              }
            : defaultSource || require("@/assets/images/placeholder.png")
        }
        style={style}
        {...props}
      />

      {/* Loader pendant le téléchargement */}
      {isLoading && showLoader && (
        <ActivityIndicator
          style={StyleSheet.absoluteFill}
          color={loaderColor}
          size="small"
        />
      )}

      {/* Placeholder custom */}
      {isLoading && placeholder && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
          {placeholder}
        </View>
      )}
    </View>
  );
};

export default CachedImage;
