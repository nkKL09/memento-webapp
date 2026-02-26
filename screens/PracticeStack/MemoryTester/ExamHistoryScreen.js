// Список сохранённых результатов экзаменов
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../../components/ScreenHeader';
import { getExamHistory, clearExamHistory } from './examHistory';

function formatDate(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${h}:${m}`;
}

function formatCoefficient(k) {
  if (k == null) return '—';
  if (Number.isInteger(k * 100)) return (k * 100).toFixed(0) + '%';
  return (k * 100).toFixed(1).replace('.', ',') + '%';
}

export default function ExamHistoryScreen() {
  const navigation = useNavigation();
  const [list, setList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getExamHistory().then((data) => {
        if (!cancelled) setList(data);
      });
      return () => { cancelled = true; };
    }, [])
  );

  const openResult = (item) => {
    navigation.navigate('ExamResult', {
      correctCount: item.correct ?? 0,
      total: item.total ?? 0,
      coefficient: item.coefficient ?? 0,
      errors: item.errors ?? [],
      moduleId: item.moduleId ?? '',
      moduleName: item.moduleName ?? '',
      count: item.count ?? 0,
      startTime: item.startTime,
      endTime: item.endTime,
      fromHistory: true,
      examId: item.id,
    });
  };

  const onClearAll = () => {
    Alert.alert(
      'Удалить всю историю?',
      'Все сохранённые результаты экзаменов будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: async () => {
          await clearExamHistory();
          setList([]);
        } },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openResult(item)} activeOpacity={0.7}>
      <View style={styles.rowMain}>
        <Text style={styles.rowModule} numberOfLines={1}>{item.moduleName || item.moduleId}</Text>
        <Text style={styles.rowMeta}>Элементов: {item.count} · {item.correct ?? 0}/{item.total ?? 0}</Text>
        <Text style={styles.rowDate}>{formatDate(item.endTime ?? item.startTime ?? 0)}</Text>
      </View>
      <Text style={styles.rowCoef}>{formatCoefficient(item.coefficient)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="История экзаменов" showBackButton />
      {list.length === 0 ? (
        <Text style={styles.empty}>Пока нет сохранённых результатов. Пройдите экзамен.</Text>
      ) : (
        <>
          <FlatList
            data={list}
            keyExtractor={(item) => item.id || String(item.startTime)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity style={styles.clearAllBtn} onPress={onClearAll} activeOpacity={0.8}>
            <Text style={styles.clearAllBtnText}>Удалить всю историю</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  empty: { fontSize: 16, color: '#94a3b8', paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a2a35',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowMain: { flex: 1, minWidth: 0, marginRight: 12 },
  rowModule: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  rowMeta: { fontSize: 14, color: '#94a3b8', marginBottom: 2 },
  rowDate: { fontSize: 12, color: '#64748b' },
  rowCoef: { fontSize: 18, fontWeight: '700', color: '#49c0f8' },
  clearAllBtn: { marginHorizontal: 20, marginTop: 8, marginBottom: 40, paddingVertical: 14, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center' },
  clearAllBtnText: { fontSize: 16, color: '#f87171', fontWeight: '600' },
});
