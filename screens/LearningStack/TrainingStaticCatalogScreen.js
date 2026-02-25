// screens/LearningStack/TrainingStaticCatalogScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProgress } from './trainingProgress.js';
import StarsView from './StarsView.js';

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
    navigation.navigate('TrainingSessionScreen', {
      catalogId,
      subRange: title,
    });
  };

  const handleShuffleAll = () => {
    navigation.navigate('TrainingSessionScreen', {
      catalogId,
      shuffleMode: true,
      sessionTitle: `${title} — наугад`,
    });
  };

  const handleKnowledgeCheck = () => {
    navigation.navigate('KnowledgeCheckScreen', {
      catalogId,
      title,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>{title}</Text>

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
          <Text style={styles.title}>Весь каталог — наугад</Text>
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
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 100 },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
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
