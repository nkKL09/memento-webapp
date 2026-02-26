// screens/LearningStack/MnemotechnicsScreen.js — раздел Мнемотехника: плитка «Учебник мнемотехники 2002»
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

export default function MnemotechnicsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Мнемотехника" showBackButton />
      <TouchableOpacity
        style={styles.tile}
        onPress={() => {
          hapticImpact('light');
          navigation.navigate('TextbookToc');
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>Учебник мнемотехники 2002</Text>
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
  },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
});
