// screens/LearningStack/TextbookTocScreen.js — оглавление учебника: все главы и статьи видны сразу
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { textbookChapters } from '../../content/textbook/index.js';
import { getReadArticleIds, isArticleRead } from './textbookRead.js';
import { isTelegramWebApp } from '../../telegramWebApp';
import ScreenHeader from '../../components/ScreenHeader';
import { hapticImpact } from '../../telegramWebApp';

function ReadIcon({ read }) {
  return (
    <View style={[styles.readIcon, read ? styles.readIconRead : styles.readIconUnread]}>
      <Text style={[styles.readIconCheck, read ? styles.readIconCheckRead : styles.readIconCheckUnread]}>✓</Text>
    </View>
  );
}

export default function TextbookTocScreen() {
  const navigation = useNavigation();
  const [readIds, setReadIds] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getReadArticleIds().then(setReadIds);
    }, [])
  );

  const isTwa = Platform.OS === 'web' && isTelegramWebApp();
  const contentFirstStyle = isTwa ? styles.contentFirstTwa : styles.contentFirst;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, contentFirstStyle]} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Учебник мнемотехники 2002" showBackButton />
      {textbookChapters.map((chapter) => (
        <View key={chapter.id} style={styles.chapterBlock}>
          <Text style={styles.chapterTitle}>{chapter.id}. {chapter.title}</Text>
          {chapter.articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleRow}
              onPress={() => {
                hapticImpact('light');
                navigation.navigate('TextbookArticle', { article });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.articleTitle} numberOfLines={2}>{article.id} {article.title}</Text>
              <ReadIcon read={isArticleRead(readIds, article.id)} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24' },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  contentFirst: { paddingTop: 26 },
  contentFirstTwa: { paddingTop: 0 },
  chapterBlock: { marginBottom: 28 },
  chapterTitle: { fontSize: 20, fontWeight: '700', color: '#49c0f8', marginBottom: 12 },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2a35',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  articleTitle: { flex: 1, fontSize: 16, color: '#e2e8f0', marginRight: 12 },
  readIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readIconUnread: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#64748b',
  },
  readIconRead: {
    backgroundColor: '#49c0f8',
    borderWidth: 0,
  },
  readIconCheck: { fontSize: 14, fontWeight: '700' },
  readIconCheckUnread: { color: '#64748b' },
  readIconCheckRead: { color: '#ffffff' },
});
