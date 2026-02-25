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
import BackButton from '../../components/BackButton';

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
      sessionTitle: title,
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
      contentContainerStyle={[styles.content, Platform.OS === 'web' && { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {Platform.OS === 'web' ? (
        <View style={styles.headerRow}>
          <BackButton inRow />
          <View style={styles.headerCenterWrap} pointerEvents="box-none">
            <Text style={styles.headerWebCentered}>{title}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.headerCentered}>{title}</Text>
      )}

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
  content: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', minHeight: 48, position: 'relative' },
  headerCenterWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  headerWebCentered: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', lineHeight: 40, textAlign: 'center' },
  header: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', marginLeft: 12, flex: 1, lineHeight: 40 },
  headerCentered: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 40 },
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
