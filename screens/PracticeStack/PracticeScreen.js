// screens/PracticeStack/PracticeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../../components/AppIcon';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

const ROW_ICON_SIZE = 24;
const ROW_ICON_COLOR = '#49c0f8';

export default function PracticeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Практика" />
      <TouchableOpacity
        style={styles.tile}
        onPress={() => {
          hapticImpact('light');
          navigation.navigate('CardMemorizationInput');
        }}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <AppIcon name="cards-playing-outline" family="material" size={ROW_ICON_SIZE} color={ROW_ICON_COLOR} style={styles.titleIcon} />
          <Text style={styles.title}>Запоминание карт</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => {
          hapticImpact('light');
          navigation.navigate('MemoryTester');
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>Memory Tester</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tile}
        onPress={() => {
          hapticImpact('light');
          navigation.navigate('ToolsScreen');
        }}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <AppIcon name="construct-outline" size={ROW_ICON_SIZE} color={ROW_ICON_COLOR} style={styles.titleIcon} />
          <Text style={styles.title}>Инструменты</Text>
        </View>
        <Text style={styles.subtitle}>Кодировщики и помощники</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingHorizontal: 20 },
  tile: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleIcon: { marginRight: 14 },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  subtitle: { fontSize: 16, color: '#94a3b8', marginTop: 5 },
});
