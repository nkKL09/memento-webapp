// screens/LearningStack/TrainingSubRangesScreen.js
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
import BackButton from '../../components/BackButton';

export default function TrainingSubRangesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { catalogId, title } = route.params || {};

  const [starsMap, setStarsMap] = useState({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const keys = [];
        if (catalogId && catalogId.includes('-')) {
          const [startStr] = catalogId.split('-');
          const startNum = parseInt(startStr, 10);
          const digits = startStr.length;
          for (let i = 0; i < 10; i++) {
            const from = startNum + i * 10;
            const to = from + 9;
            const fromStr = from.toString().padStart(digits, '0');
            const toStr = to.toString().padStart(digits, '0');
            keys.push(`${fromStr}-${toStr}`);
          }
        } else if (catalogId === 'cards') {
          keys.push('Трефы', 'Черви', 'Бубны', 'Пики');
        }
        keys.push('full');
        const next = {};
        for (const k of keys) {
          const { stars } = await getProgress(catalogId, k === 'full' ? 'full' : k);
          next[k] = stars;
        }
        if (!cancelled) setStarsMap(next);
      })();
      return () => { cancelled = true; };
    }, [catalogId])
  );

  let subRanges = [];

  if (catalogId && catalogId.includes('-')) {
    const [startStr] = catalogId.split('-');
    const startNum = parseInt(startStr, 10);
    const digits = startStr.length;

    for (let i = 0; i < 10; i++) {
      const from = startNum + i * 10;
      const to = from + 9;
      const fromStr = from.toString().padStart(digits, '0');
      const toStr = to.toString().padStart(digits, '0');
      subRanges.push({ title: `${fromStr}-${toStr}`, key: `${fromStr}-${toStr}` });
    }
  } else if (catalogId === 'cards') {
    subRanges = [
      { title: 'Трефы', key: 'Трефы' },
      { title: 'Черви', key: 'Черви' },
      { title: 'Бубны', key: 'Бубны' },
      { title: 'Пики', key: 'Пики' },
    ];
  }

  const handlePress = (sub) => {
    navigation.navigate('TrainingSessionScreen', {
      subRange: sub.title,
      catalogId,
    });
  };

  const handleFullCatalogTraining = () => {
    navigation.navigate('TrainingSessionScreen', {
      catalogId,
      fullCatalog: true,
      sessionTitle: `${title} — обучение`,
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
      <BackButton />
      <Text style={styles.header}>{title}</Text>

      <View style={styles.tilesContainer}>
        {subRanges.map((sub, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tile}
            onPress={() => handlePress(sub)}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>{sub.title}</Text>
            <StarsView filled={starsMap[sub.key] ?? 0} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.tile}
          onPress={handleFullCatalogTraining}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>Весь каталог — обучение</Text>
          <StarsView filled={starsMap.full ?? 0} />
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
    textAlign: 'center' 
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