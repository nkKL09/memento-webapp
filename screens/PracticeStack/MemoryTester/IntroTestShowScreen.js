// screens/PracticeStack/MemoryTester/IntroTestShowScreen.js — показ 20 чисел по одному
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function IntroTestShowScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const sequence = route.params?.sequence || [];
  const [index, setIndex] = useState(0);

  if (sequence.length === 0) {
    navigation.replace('IntroTestInstruction');
    return null;
  }

  const current = sequence[index];
  const isLast = index >= 19;

  const onNext = () => {
    if (isLast) {
      navigation.navigate('IntroTestMath', { sequence });
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Число {index + 1} из 20</Text>
      <View style={styles.numberWrap}>
        <Text style={styles.number}>{current}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{isLast ? 'Далее' : 'Следующее число'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20, justifyContent: 'space-between' },
  counter: { fontSize: 18, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  numberWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  number: { fontSize: 72, fontWeight: '700', color: '#ffffff' },
  button: {
    height: 56,
    borderRadius: 26,
    backgroundColor: '#49c0f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
