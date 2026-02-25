// screens/PracticeStack/MemoryTester/TrainingShowScreen.js — показ элементов по одному
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function TrainingShowScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sequence = [], moduleId, count, doMath, showIndex, options } = route.params || {};
  const [index, setIndex] = useState(0);

  if (!sequence.length) {
    navigation.navigate('MemoryTester');
    return null;
  }

  const current = sequence[index];
  const isLast = index >= sequence.length - 1;

  const onNext = () => {
    if (isLast) {
      const params = { sequence, moduleId, count, options };
      if (doMath) {
        navigation.navigate('TrainingMath', params);
      } else {
        navigation.navigate('TrainingInput', params);
      }
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <View style={styles.container}>
      {showIndex && <Text style={styles.counter}>Элемент {index + 1} из {sequence.length}</Text>}
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
  counter: { fontSize: 18, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  valueWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 48, fontWeight: '700', color: '#ffffff', textAlign: 'center' },
  button: { height: 56, borderRadius: 26, backgroundColor: '#49c0f8', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
