// screens/LearningStack/MnemonicCodesScreen.js
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

export default function MnemonicCodesScreen() {
  const navigation = useNavigation();

  const goToReference = () => navigation.navigate('CodeLibrary');
  const goToTraining = () => navigation.navigate('TrainingCatalogsScreen');
  
  return (
    <View style={styles.container}>
      <ScreenHeader title="Образные коды" showBackButton />
      <View style={styles.tilesContainer}>
        <Tile
          icon={<AppIcon name="folder-open-outline" size={TILE_ICON_SIZE} color={TILE_ICON_COLOR} />}
          title="Справочник"
          subtitle="Поиск и все каталоги"
          onPress={goToReference}
        />
        <Tile
          icon={<AppIcon name="barbell" size={TILE_ICON_SIZE} color={TILE_ICON_COLOR} />}
          title="Тренировка"
          subtitle="Запоминание карточек образных кодов"
          onPress={goToTraining}
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