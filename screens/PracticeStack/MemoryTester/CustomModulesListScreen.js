// Список своих модулей: создание и переход к редактированию
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import { getCustomModules } from './customModules';

export default function CustomModulesListScreen() {
  const navigation = useNavigation();
  const [list, setList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getCustomModules().then((data) => {
        if (!cancelled) setList(data);
      });
      return () => { cancelled = true; };
    }, [])
  );

  const openEdit = (item) => {
    navigation.navigate('CustomModuleEdit', { module: item });
  };

  const createNew = () => {
    navigation.navigate('CustomModuleEdit', {});
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openEdit(item)} activeOpacity={0.7}>
      <Text style={styles.rowName} numberOfLines={1}>{item.name || 'Без названия'}</Text>
      <Text style={styles.rowMeta}>{item.elements?.length ?? 0} элементов</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Свои модули" showBackButton />
      <Text style={styles.subtitle}>Создайте набор элементов (слов, фраз) и тренируйте память по ним в разделе «Тренировка».</Text>
      {list.length === 0 ? (
        <Text style={styles.empty}>Пока нет своих модулей. Создайте первый.</Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity style={styles.createBtn} onPress={createNew} activeOpacity={0.8}>
        <Text style={styles.createBtnText}>+ Создать модуль</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 },
  empty: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 24 },
  list: { paddingBottom: 100 },
  row: {
    backgroundColor: '#1a2a35',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  rowName: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  rowMeta: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  createBtn: { position: 'absolute', bottom: 24, left: 20, right: 20, height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center' },
  createBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
