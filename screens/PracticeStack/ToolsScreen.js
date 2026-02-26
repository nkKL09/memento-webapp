// screens/PracticeStack/ToolsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

export default function ToolsScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Инструменты" showBackButton />
      <View style={styles.tilesContainer}>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => {
            hapticImpact('light');
            navigation.navigate('EncodersScreen');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>Кодировщики</Text>
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
