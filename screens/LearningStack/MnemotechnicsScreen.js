// screens/LearningStack/MnemotechnicsScreen.js — раздел Мнемотехника: плитка «Учебник мнемотехники 2002»
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MnemotechnicsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Мнемотехника</Text>
      <TouchableOpacity
        style={styles.tile}
        onPress={() => navigation.navigate('TextbookToc')}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>Учебник мнемотехники 2002</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 18, color: '#49c0f8', fontWeight: '600' },
  header: { fontSize: 34, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 40 },
  tile: {
    backgroundColor: '#1a2a35',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
});
