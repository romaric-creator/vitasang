import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Rect,
  G,
  Line,
  Polygon,
} from 'react-native-svg';
import { router } from 'expo-router';
import { color } from '@/constant/color';
import ThemedView from '@/components/ThemedView';
import { TabBarIcon } from '@/components/TabBarIcon';
import { useTranslation } from 'react-i18next';

const { width: viewportWidth } = Dimensions.get('window');

// ─────────────────────────────────────────────
// MASCOTTE 1 — Sangu pointe un repère GPS
// Slide : "Trouvez des donneurs proches"
// ─────────────────────────────────────────────
const SanguLocaliseur = () => (
  <Svg width={260} height={280} viewBox="0 0 260 280">
    {/* Ombre sol */}
    <Ellipse cx={130} cy={268} rx={58} ry={10} fill="#B71C1C" opacity={0.25} />

    {/* ── Bras gauche (tenu sur la hanche) ── */}
    <Path d="M88 148 Q60 162 64 186" stroke="#B71C1C" strokeWidth={20} strokeLinecap="round" fill="none" />
    <Path d="M88 148 Q60 162 64 186" stroke="#EF3340" strokeWidth={12} strokeLinecap="round" fill="none" />

    {/* ── Bras droit levé (pointe le pin) ── */}
    <Path d="M172 140 Q196 110 194 80" stroke="#B71C1C" strokeWidth={20} strokeLinecap="round" fill="none" />
    <Path d="M172 140 Q196 110 194 80" stroke="#EF3340" strokeWidth={12} strokeLinecap="round" fill="none" />
    {/* Main droite */}
    <Circle cx={194} cy={72} r={16} fill="#EF3340" stroke="#B71C1C" strokeWidth={4} />

    {/* ── PIN GPS flottant ── */}
    {/* Tige du pin */}
    <Path d="M210 48 Q210 68 194 72" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.9} />
    {/* Corps du pin */}
    <Path
      d="M210 20 C222 20 232 30 232 42 C232 58 210 72 210 72 C210 72 188 58 188 42 C188 30 198 20 210 20 Z"
      fill="#FFFFFF"
      stroke="#FFCDD2"
      strokeWidth={2}
    />
    {/* Cercle intérieur du pin */}
    <Circle cx={210} cy={41} r={9} fill="#EF3340" />
    {/* Petite croix médicale dans le pin */}
    <Rect x={206} y={37} width={8} height={3} rx={1.5} fill="white" />
    <Rect x={208.5} y={34.5} width={3} height={8} rx={1.5} fill="white" />

    {/* ── Corps ── */}
    <Path
      d="M130 60 C176 74 190 120 190 166 Q190 220 130 220 Q70 220 70 166 C70 120 84 74 130 60 Z"
      fill="#EF3340"
      stroke="#B71C1C"
      strokeWidth={5}
      strokeLinejoin="round"
    />

    {/* ── Pieds ── */}
    <Ellipse cx={108} cy={225} rx={22} ry={11} fill="#B71C1C" transform="rotate(-8)" />
    <Ellipse cx={152} cy={225} rx={22} ry={11} fill="#B71C1C" transform="rotate(8)" />

    {/* ── Yeux ── */}
    <Circle cx={110} cy={152} r={22} fill="white" />
    <Circle cx={150} cy={152} r={22} fill="white" />
    <Circle cx={114} cy={154} r={10} fill="#1A1A2E" />
    <Circle cx={154} cy={154} r={10} fill="#1A1A2E" />
    {/* Brillance */}
    <Circle cx={120} cy={148} r={4.5} fill="white" />
    <Circle cx={160} cy={148} r={4.5} fill="white" />

    {/* ── Joues ── */}
    <Ellipse cx={86} cy={168} rx={13} ry={9} fill="#EF9A9A" opacity={0.55} />
    <Ellipse cx={174} cy={168} rx={13} ry={9} fill="#EF9A9A" opacity={0.55} />

    {/* ── Sourire ── */}
    <Path d="M110 183 Q130 205 150 183" fill="none" stroke="#B71C1C" strokeWidth={5} strokeLinecap="round" />

    {/* ── Sourcils amicaux ── */}
    <Path d="M96 128 Q110 119 124 126" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
    <Path d="M136 126 Q150 119 164 128" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
  </Svg>
);

// ─────────────────────────────────────────────
// MASCOTTE 2 — Sangu tient un cœur + check
// Slide : "Suivez vos dons"
// ─────────────────────────────────────────────
const SanguHistorique = () => (
  <Svg width={260} height={280} viewBox="0 0 260 280">
    {/* Ombre sol */}
    <Ellipse cx={130} cy={268} rx={58} ry={10} fill="#B71C1C" opacity={0.25} />

    {/* ── Bras gauche levé (tient le clipboard) ── */}
    <Path d="M88 148 Q52 132 44 96" stroke="#B71C1C" strokeWidth={20} strokeLinecap="round" fill="none" />
    <Path d="M88 148 Q52 132 44 96" stroke="#EF3340" strokeWidth={12} strokeLinecap="round" fill="none" />
    {/* Main gauche */}
    <Circle cx={44} cy={88} r={16} fill="#EF3340" stroke="#B71C1C" strokeWidth={4} />

    {/* ── Clipboard flottant ── */}
    <Rect x={10} y={28} width={64} height={80} rx={8} fill="white" stroke="#FFCDD2" strokeWidth={2.5} />
    {/* Clip */}
    <Rect x={34} y={22} width={18} height={14} rx={5} fill="#EF3340" stroke="#B71C1C" strokeWidth={2} />
    {/* Lignes sur le clipboard */}
    <Line x1={22} y1={52} x2={62} y2={52} stroke="#FFCDD2" strokeWidth={3} strokeLinecap="round" />
    <Line x1={22} y1={64} x2={56} y2={64} stroke="#FFCDD2" strokeWidth={3} strokeLinecap="round" />
    <Line x1={22} y1={76} x2={58} y2={76} stroke="#FFCDD2" strokeWidth={3} strokeLinecap="round" />
    <Line x1={22} y1={88} x2={50} y2={88} stroke="#FFCDD2" strokeWidth={3} strokeLinecap="round" />
    {/* Check vert sur le clipboard */}
    <Circle cx={58} cy={88} r={10} fill="#4CAF50" />
    <Path d="M52 88 L56 93 L64 82" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

    {/* ── Bras droit (pointé vers l'avant) ── */}
    <Path d="M172 148 Q200 138 210 158" stroke="#B71C1C" strokeWidth={20} strokeLinecap="round" fill="none" />
    <Path d="M172 148 Q200 138 210 158" stroke="#EF3340" strokeWidth={12} strokeLinecap="round" fill="none" />
    <Circle cx={214} cy={164} r={16} fill="#EF3340" stroke="#B71C1C" strokeWidth={4} />

    {/* ── Petit cœur flottant à droite ── */}
    <Path
      d="M234 130 C234 124 242 120 246 126 C250 120 258 124 258 130 C258 138 246 148 246 148 C246 148 234 138 234 130 Z"
      fill="#FF6B6B"
      stroke="#B71C1C"
      strokeWidth={1.5}
    />
    <Path
      d="M214 104 C214 98 222 94 226 100 C230 94 238 98 238 104 C238 112 226 122 226 122 C226 122 214 112 214 104 Z"
      fill="#FFFFFF"
      opacity={0.85}
      stroke="#FFCDD2"
      strokeWidth={1.5}
    />

    {/* ── Corps ── */}
    <Path
      d="M130 60 C176 74 190 120 190 166 Q190 220 130 220 Q70 220 70 166 C70 120 84 74 130 60 Z"
      fill="#EF3340"
      stroke="#B71C1C"
      strokeWidth={5}
      strokeLinejoin="round"
    />

    {/* ── Pieds ── */}
    <Ellipse cx={108} cy={225} rx={22} ry={11} fill="#B71C1C" transform="rotate(-8)" />
    <Ellipse cx={152} cy={225} rx={22} ry={11} fill="#B71C1C" transform="rotate(8)" />

    {/* ── Yeux (fiers, légèrement plissés) ── */}
    <Circle cx={110} cy={152} r={22} fill="white" />
    <Circle cx={150} cy={152} r={22} fill="white" />
    <Circle cx={114} cy={154} r={10} fill="#1A1A2E" />
    <Circle cx={154} cy={154} r={10} fill="#1A1A2E" />
    <Circle cx={120} cy={148} r={4.5} fill="white" />
    <Circle cx={160} cy={148} r={4.5} fill="white" />

    {/* ── Joues ── */}
    <Ellipse cx={86} cy={168} rx={13} ry={9} fill="#EF9A9A" opacity={0.55} />
    <Ellipse cx={174} cy={168} rx={13} ry={9} fill="#EF9A9A" opacity={0.55} />

    {/* ── Grand sourire satisfait ── */}
    <Path d="M108 180 Q130 208 152 180" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />

    {/* ── Sourcils (fiers) ── */}
    <Path d="M96 126 Q110 118 124 125" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
    <Path d="M136 125 Q150 118 164 126" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
  </Svg>
);

// ─────────────────────────────────────────────
// MASCOTTE 3 — Sangu avec mégaphone + urgence
// Slide : "Recevez des alertes urgentes"
// ─────────────────────────────────────────────
const SanguAlertes = () => (
  <Svg width={260} height={280} viewBox="0 0 260 280">
    {/* Ombre sol */}
    <Ellipse cx={130} cy={268} rx={58} ry={10} fill="#B71C1C" opacity={0.25} />

    {/* ── Bras gauche (sur la hanche) ── */}
    <Path d="M88 148 Q62 160 66 184" stroke="#B71C1C" strokeWidth={20} strokeLinecap="round" fill="none" />
    <Path d="M88 148 Q62 160 66 184" stroke="#EF3340" strokeWidth={12} strokeLinecap="round" fill="none" />

    {/* ── Bras droit levé (tient le mégaphone) ── */}
    <Path d="M172 138 Q200 108 202 74" stroke="#B71C1C" strokeWidth={20} strokeLinecap="round" fill="none" />
    <Path d="M172 138 Q200 108 202 74" stroke="#EF3340" strokeWidth={12} strokeLinecap="round" fill="none" />
    {/* Main droite */}
    <Circle cx={202} cy={66} r={16} fill="#EF3340" stroke="#B71C1C" strokeWidth={4} />

    {/* ── MÉGAPHONE ── */}
    {/* Corps conique du mégaphone */}
    <Path d="M200 40 L240 24 L240 72 L200 56 Z" fill="#FFD600" stroke="#F9A825" strokeWidth={2.5} strokeLinejoin="round" />
    {/* Embout */}
    <Rect x={188} y={42} width={16} height={16} rx={4} fill="#EF3340" stroke="#B71C1C" strokeWidth={2} />
    {/* Pavillon */}
    <Path d="M240 24 Q258 28 260 48 Q258 68 240 72" fill="#EF9A9A" stroke="#F9A825" strokeWidth={2} />
    {/* Poignée */}
    <Rect x={226} y={56} width={10} height={18} rx={5} fill="#EF3340" stroke="#B71C1C" strokeWidth={2} />
    {/* Ondes sonores */}
    <Path d="M218 20 Q226 30 218 40" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
    <Path d="M226 14 Q238 28 226 44" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.65} />
    <Path d="M234 8 Q250 26 234 48" fill="none" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />

    {/* ── Éclairs d'urgence ── */}
    {/* Éclair gauche */}
    <Polygon points="28,60 18,82 30,82 20,106 40,78 28,78" fill="#FFD600" stroke="#F9A825" strokeWidth={1.5} strokeLinejoin="round" />
    {/* Point d'exclamation */}
    <Circle cx={46} cy={30} r={14} fill="#FFFFFF" opacity={0.9} stroke="#FFCDD2" strokeWidth={2} />
    <Rect x={43} y={20} width={6} height={10} rx={3} fill="#EF3340" />
    <Circle cx={46} cy={34} r={3} fill="#EF3340" />

    {/* ── Corps ── */}
    <Path
      d="M130 60 C176 74 190 120 190 166 Q190 220 130 220 Q70 220 70 166 C70 120 84 74 130 60 Z"
      fill="#EF3340"
      stroke="#B71C1C"
      strokeWidth={5}
      strokeLinejoin="round"
    />

    {/* ── Pieds ── */}
    <Ellipse cx={108} cy={226} rx={22} ry={11} fill="#B71C1C" transform="rotate(-7)" />
    <Ellipse cx={152} cy={226} rx={22} ry={11} fill="#B71C1C" transform="rotate(7)" />

    {/* ── Yeux (grands, urgents) ── */}
    <Circle cx={110} cy={150} r={23} fill="white" />
    <Circle cx={150} cy={150} r={23} fill="white" />
    <Circle cx={114} cy={152} r={11} fill="#1A1A2E" />
    <Circle cx={154} cy={152} r={11} fill="#1A1A2E" />
    <Circle cx={121} cy={146} r={5} fill="white" />
    <Circle cx={161} cy={146} r={5} fill="white" />

    {/* ── Joues ── */}
    <Ellipse cx={85} cy={167} rx={13} ry={9} fill="#EF9A9A" opacity={0.55} />
    <Ellipse cx={175} cy={167} rx={13} ry={9} fill="#EF9A9A" opacity={0.55} />

    {/* ── Bouche ouverte (urgent!) ── */}
    <Path d="M108 180 Q130 208 152 180" fill="#B71C1C" stroke="#B71C1C" strokeWidth={2} strokeLinecap="round" />
    <Path d="M108 180 Q130 196 152 180" fill="white" />

    {/* ── Sourcils relevés (alarme) ── */}
    <Path d="M96 122 Q110 112 124 120" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
    <Path d="M136 120 Q150 112 164 122" fill="none" stroke="#B71C1C" strokeWidth={5.5} strokeLinecap="round" />
  </Svg>
);

// ─────────────────────────────────────────────
// MAP DES MASCOTES PAR SLIDE
// ─────────────────────────────────────────────
const MASCOTS = [SanguLocaliseur, SanguHistorique, SanguAlertes];


export default function OnboardingCarousel() {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides = useMemo(() => [
    {
      id: '1',
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
    },
    {
      id: '2',
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
    },
    {
      id: '3',
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
    },
  ], [t]);

  const _renderItem = ({ item, index }: { item: any; index: number }) => {
    const MascotComponent = MASCOTS[index];
    return (
      <View style={[styles.slide, { width: viewportWidth }]}>
        <View style={styles.mascotContainer}>
          <MascotComponent />
        </View>
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
        <Text style={styles.skipButtonText}>{t('common.actions.skip')}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={_renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={viewportWidth}
        decelerationRate="fast"
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
              {
                opacity: index === activeSlide ? 1 : 0.4,
                transform: [{ scale: index === activeSlide ? 1 : 0.8 }],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => router.push('/guest-alert')}
        >
          <TabBarIcon name="exclamation-triangle" size={18} color="white" />
          <Text style={styles.alertButtonText}>{t('onboarding.actions.emergency')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {activeSlide === slides.length - 1 ? t('common.actions.start') : t('common.actions.next')}
          </Text>
        </TouchableOpacity>
      </View>
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
  mascotContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.9,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  nextButtonText: {
    color: color.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    width: '100%',
    justifyContent: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
