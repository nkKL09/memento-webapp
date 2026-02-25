// screens/LearningStack/LearningScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const TILE_ICON_COLOR = '#49c0f8';
const TILE_ICON_SIZE = 28;

const Tile = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
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
      <Text style={styles.header}>Обучение</Text>

      <View style={styles.tilesContainer}>
        <Tile
          icon={<MaterialCommunityIcons name="cards-outline" size={TILE_ICON_SIZE} color={TILE_ICON_COLOR} />}
          title="Образные коды"
          subtitle="Справочник и тренировка"
          onPress={goToMnemonicCodes}
        />
        <Tile
          icon={<Ionicons name="book-outline" size={TILE_ICON_SIZE} color={TILE_ICON_COLOR} />}
          title="Мнемотехника"
          subtitle="Теория и уроки"
          onPress={goToMnemonics}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20 },
  header: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', marginBottom: 40, textAlign: 'center' },
  tilesContainer: { gap: 16 },
  tile: { backgroundColor: '#1a2a35', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, backgroundColor: '#121e24', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  icon: { fontSize: 28 },
  textContainer: { flex: 1 },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#94a3b8' },
});