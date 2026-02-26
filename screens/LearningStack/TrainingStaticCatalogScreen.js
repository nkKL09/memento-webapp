// screens/LearningStack/TrainingStaticCatalogScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProgress } from './trainingProgress.js';
import StarsView from './StarsView.js';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

export default function TrainingStaticCatalogScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { catalogId, title } = route.params || {};

  const [stars, setStars] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getProgress(catalogId, title).then(({ stars: s }) => {
        if (!cancelled) setStars(s);
      });
      return () => { cancelled = true; };
    }, [catalogId, title])
  );

  const handleTraining = () => {
    hapticImpact('light');
    navigation.navigate('TrainingSessionScreen', {
      catalogId,
      subRange: title,
    });
  };

  const handleShuffleAll = () => {
    hapticImpact('light');
    navigation.navigate('TrainingSessionScreen', {
      catalogId,
      shuffleMode: true,
      sessionTitle: title,
    });
  };

  const handleKnowledgeCheck = () => {
    hapticImpact('light');
    navigation.navigate('KnowledgeCheckScreen', {
      catalogId,
      title,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, Platform.OS === 'web' && { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title={title} showBackButton />
      <View style={styles.tilesContainer}>
        <TouchableOpacity
          style={styles.tile}
          onPress={handleTraining}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>Обучение</Text>
          <StarsView filled={stars} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={handleShuffleAll}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>Весь каталог</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={handleKnowledgeCheck}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>Проверка знаний</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  tilesContainer: { gap: 12 },
  tile: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
});
