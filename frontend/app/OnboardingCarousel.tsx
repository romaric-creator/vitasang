import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { color } from '@/constant/color';
import ThemedView from '@/components/ThemedView';

const { width: viewportWidth } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Trouvez des donneurs proches',
    description: 'Connectez-vous avec des donneurs de sang compatibles dans votre région en cas d\'urgence.',
    image: require('@/assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Suivez vos dons',
    description: 'Gardez un historique de vos dons et recevez des rappels pour votre prochaine opportunité de sauver une vie.',
    image: require('@/assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Recevez des alertes urgentes',
    description: 'Soyez informé en temps réel des besoins urgents en sang et agissez rapidement.',
    image: require('@/assets/images/onboarding-3.png'),
  },
];

export default function OnboardingCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const _renderItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width: viewportWidth }]}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeSlide + 1 });
      setActiveSlide(activeSlide + 1);
    } else {
      router.replace('/login');
    }
  };

  const onScroll = (event: any) => {
    const slideOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(slideOffset / viewportWidth);
    if (currentIndex !== activeSlide) {
      setActiveSlide(currentIndex);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Passer</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={_renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { opacity: index === activeSlide ? 1 : 0.4, transform: [{ scale: index === activeSlide ? 1 : 0.8 }] },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {activeSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipButtonText: {
    color: color.background,
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.primary,
    paddingHorizontal: 20,
  },
  image: {
    width: '80%',
    height: '50%',
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: color.background,
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: color.background,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: color.background,
  },
  nextButton: {
    backgroundColor: color.background,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  nextButtonText: {
    color: color.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
