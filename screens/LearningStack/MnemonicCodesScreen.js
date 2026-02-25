// screens/LearningStack/MnemonicCodesScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../../components/AppIcon';
import BackButton from '../../components/BackButton';

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

export default function MnemonicCodesScreen() {
  const navigation = useNavigation();

  const goToReference = () => navigation.navigate('CodeLibrary');
  const goToTraining = () => navigation.navigate('TrainingCatalogsScreen');
  
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.headerRow}>
          <BackButton inRow />
          <View style={styles.headerCenterWrap} pointerEvents="box-none">
            <Text style={styles.headerWebCentered}>Образные коды</Text>
          </View>
        </View>
      ) : (
        <>
          <BackButton />
          <Text style={styles.header}>Образные коды</Text>
        </>
      )}

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
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', minHeight: 48, position: 'relative' },
  headerCenterWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  headerWebCentered: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', lineHeight: 40, textAlign: 'center' },
  header: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', marginBottom: 40, textAlign: 'center' },
  tilesContainer: { gap: 16 },
  tile: { backgroundColor: '#1a2a35', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, backgroundColor: '#121e24', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  icon: { fontSize: 28 },
  textContainer: { flex: 1 },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#94a3b8' },
});