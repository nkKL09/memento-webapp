// screens/LearningStack/StarsView.js — 3 звёзды (0–3 заполненных)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FILLED = '★';
const EMPTY = '☆';

export default function StarsView({ filled = 0, style }) {
  const count = Math.min(3, Math.max(0, filled));
  return (
    <View style={[styles.wrap, style]}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={[styles.star, i < count && styles.filled]}>
          {i < count ? FILLED : EMPTY}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 22, color: '#334155' },
  filled: { color: '#fbbf24' },
});
