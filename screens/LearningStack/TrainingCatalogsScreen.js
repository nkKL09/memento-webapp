// screens/LearningStack/TrainingCatalogsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StarsView from './StarsView.js';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

const catalogs = [
  { id: '00-99', title: '00-99', type: 'numbers' },
  { id: '000-099', title: '000-099', type: 'numbers' },
  { id: '100-199', title: '100-199', type: 'numbers' },
  { id: '200-299', title: '200-299', type: 'numbers' },
  { id: '300-399', title: '300-399', type: 'numbers' },
  { id: '400-499', title: '400-499', type: 'numbers' },
  { id: '500-599', title: '500-599', type: 'numbers' },
  { id: '600-699', title: '600-699', type: 'numbers' },
  { id: '700-799', title: '700-799', type: 'numbers' },
  { id: '800-899', title: '800-899', type: 'numbers' },
  { id: '900-999', title: '900-999', type: 'numbers' },
  { id: 'months', title: 'Месяцы', type: 'static' },
  { id: 'week', title: 'Неделя', type: 'static' },
  { id: 'ru-alphabet', title: 'Русский алфавит', type: 'static' },
  { id: 'en-alphabet', title: 'Английский алфавит', type: 'static' },
  { id: 'cards', title: 'Карты', type: 'cards' },
];

export default function TrainingCatalogsScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, Platform.OS === 'web' && { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Тренировка" showBackButton />
      <View style={styles.tilesContainer}>
        {catalogs.map((cat) => {
          const handlePress = () => {
            hapticImpact('light');
            if (cat.type === 'numbers' || cat.type === 'cards') {
              navigation.navigate('TrainingSubRangesScreen', {
                catalogId: cat.id,
                title: cat.title,
              });
            } else {
              // Статические каталоги (Неделя, Месяцы, Алфавит) — экран выбора режима
              navigation.navigate('TrainingStaticCatalogScreen', {
                catalogId: cat.id,
                title: cat.title,
              });
            }
          };

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.tile}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={styles.title}>{cat.title}</Text>
              <StarsView filled={0} />
            </TouchableOpacity>
          );
        })}
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