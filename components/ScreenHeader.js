/**
 * Единый заголовок экрана по образцу раздела «Обучение».
 * Стиль: fontSize 34, bold, white, center, marginBottom 40, paddingTop 18.
 * В TWA: paddingTop 12 — заголовки на одном уровне с началом статьи, первая строка не уходит под блок.
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import BackButton from './BackButton';
import { isTelegramWebApp } from '../telegramWebApp';

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 18,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  wrapTwa: { paddingTop: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  left: { minWidth: 44, alignItems: 'flex-start' },
  center: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  right: { minWidth: 44, alignItems: 'flex-end' },
});

export default function ScreenHeader({ title, showBackButton = false, rightContent }) {
  if (!title && !showBackButton && !rightContent) return null;
  const isTwa = Platform.OS === 'web' && isTelegramWebApp();

  return (
    <View style={[styles.wrap, isTwa && styles.wrapTwa]}>
      <View style={styles.row}>
        <View style={styles.left} pointerEvents="box-none">
          {showBackButton ? <BackButton inRow /> : null}
        </View>
        <View style={styles.center} pointerEvents="box-none">
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        <View style={styles.right} pointerEvents="box-none">
          {rightContent ?? null}
        </View>
      </View>
    </View>
  );
}
