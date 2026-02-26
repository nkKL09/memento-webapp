// screens/LearningStack/LearningScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../../components/AppIcon';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

const TILE_ICON_COLOR = '#49c0f8';
const TILE_ICON_SIZE = 28;

const Tile = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.tile}
    onPress={() => {
      hapticImpact('light');
      onPress?.();
    }}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      {typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon}
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default function LearningScreen() {
  const navigation = useNavigation();

  const goToMnemonicCodes = () => navigation.navigate('MnemonicCodesScreen');
  const goToMnemonics = () => navigation.navigate('MnemotechnicsScreen');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Обучение" />
      <View style={styles.tilesContainer}>
        <Tile
          icon={<AppIcon name="cards-outline" family="material" size={TILE_ICON_SIZE} color={TILE_ICON_COLOR} />}
          title="Образные коды"
          subtitle="Справочник и тренировка"
          onPress={goToMnemonicCodes}
        />
        <Tile
          icon={<AppIcon name="book-outline" size={TILE_ICON_SIZE} color={TILE_ICON_COLOR} />}
          title="Мнемотехника"
          subtitle="Теория и уроки"
          onPress={goToMnemonics}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingHorizontal: 20 },
  tilesContainer: { gap: 16 },
  tile: { backgroundColor: '#1a2a35', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, backgroundColor: '#121e24', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  icon: { fontSize: 28 },
  textContainer: { flex: 1 },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#94a3b8' },
});