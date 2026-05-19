import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { color } from "@/constant/color";
import ThemedView from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { TabBarIcon } from "@/components/TabBarIcon";
import { PrimaryButton } from "@/components/PrimaryButton";

const { width: viewportWidth } = Dimensions.get("window");

const slideConfig = [
  {
    emoji: "🩸",
    bgColor: color.primaryGhost,
    titleKey: "onboarding.slide1.title",
    descKey: "onboarding.slide1.desc",
    titleFallback: "Trouvez un centre de don",
    descFallback: "Localisez facilement les centres de collecte de sang près de chez vous.",
  },
  {
    emoji: "🏥",
    bgColor: color.accentLight,
    titleKey: "onboarding.slide2.title",
    descKey: "onboarding.slide2.desc",
    titleFallback: "Suivez vos dons",
    descFallback: "Gardez un historique complet de vos dons et consultez vos statistiques.",
  },
  {
    emoji: "💪",
    bgColor: color.successLight,
    titleKey: "onboarding.slide3.title",
    descKey: "onboarding.slide3.desc",
    titleFallback: "Sauvez des vies",
    descFallback: "Chaque don compte. Rejoignez la communauté des donneurs et faites la différence.",
  },
];

interface SlideIllustrationProps {
  index: number;
}

const SlideIllustration: React.FC<SlideIllustrationProps> = ({ index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const config = slideConfig[index];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.illustrationCircle,
        { backgroundColor: config.bgColor, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.illustrationEmoji}>{config.emoji}</Text>
    </Animated.View>
  );
};

export default function OnboardingCarousel() {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = useMemo(
    () =>
      slideConfig.map((cfg, i) => ({
        id: String(i + 1),
        title: t(cfg.titleKey, cfg.titleFallback),
        description: t(cfg.descKey, cfg.descFallback),
      })),
    [t],
  );

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeSlide + 1,
        animated: true,
      });
    } else {
      router.replace("/login");
    }
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / viewportWidth);
    setActiveSlide(index);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.slide}>
      <View style={styles.mascotContainer}>
        <SlideIllustration index={index} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.replace("/login")}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.skipButtonText}>{t("common.actions.skip", "Passer")}</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationContainer}>
        {slides.map((_, i) => {
          const inputRange = [
            (i - 1) * viewportWidth,
            i * viewportWidth,
            (i + 1) * viewportWidth,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveSlide(i);
              }}
              accessibilityRole="tab"
              accessibilityLabel={`Slide ${i + 1} sur ${slides.length}`}
            >
              <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => router.push("/guest-alert")}
          activeOpacity={0.8}
        >
          <TabBarIcon name="exclamation-triangle" size={18} color={color.primary} />
          <Text style={styles.sosButtonText}>
            {t("alert.emergencySOS", "Urgence : Lancer une alerte")}
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          title={
            activeSlide === slides.length - 1
              ? t("common.actions.start", "Commencer")
              : t("common.actions.next", "Suivant")
          }
          onPress={handleNext}
          accessibilityLabel={
            activeSlide === slides.length - 1
              ? t("common.actions.start", "Commencer")
              : t("common.actions.next", "Suivant")
          }
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.surface,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    zIndex: 10,
  },
  skipButtonText: {
    color: color.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.8,
  },
  slide: {
    width: viewportWidth,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  mascotContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationEmoji: {
    fontSize: 80,
    textAlign: "center",
  },
  textContainer: {
    height: 160,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: color.textMain,
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: color.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: color.primary,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    gap: 16,
  },
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: color.primary,
    backgroundColor: color.surface,
  },
  sosButtonText: {
    color: color.textMain,
    fontSize: 16,
    fontWeight: "700",
  },
});
