// Показ элементов экзамена по одному (фиксируем время начала)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import BackButton from '../../../components/BackButton';

export default function ExamShowScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sequence = [], moduleId, moduleName, count } = route.params || {};
  const [index, setIndex] = useState(0);
  const startTimeRef = useRef(null);

  if (!sequence.length) {
    navigation.navigate('MemoryTester');
    return null;
  }

  if (startTimeRef.current === null) {
    startTimeRef.current = Date.now();
  }

  const current = sequence[index];
  const isLast = index >= sequence.length - 1;

  const onNext = () => {
    if (isLast) {
      navigation.navigate('ExamMath', {
        sequence,
        moduleId,
        moduleName,
        count,
        startTime: startTimeRef.current,
      });
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.valueWrap}>
        <Text style={styles.value} numberOfLines={2}>{current}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{isLast ? 'Далее' : 'Следующий'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20, justifyContent: 'space-between' },
  valueWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 48, fontWeight: '700', color: '#ffffff', textAlign: 'center' },
  button: { height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
