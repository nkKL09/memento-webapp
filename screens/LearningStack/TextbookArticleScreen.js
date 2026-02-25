// screens/LearningStack/TextbookArticleScreen.js — просмотр одной статьи учебника
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { setArticleRead, removeArticleRead, getReadArticleIds, isArticleRead } from './textbookRead.js';
import BackButton from '../../components/BackButton';
import OptimizedImage from '../../components/OptimizedImage';

const BODY_COLOR = '#e2e8f0';
const IMAGE_PLACEHOLDER = /^\[IMAGE:([^\]]+)\]$/;

/** Разбивает текст на блоки: текст, markdown-таблицы и плейсхолдеры [IMAGE:id]. */
function parseContentWithTables(content) {
  const segments = [];
  const lines = content.split('\n');
  let i = 0;
  let textBuffer = [];

  function flushText() {
    if (textBuffer.length) {
      const value = textBuffer.join('\n');
      if (value.trim()) segments.push({ type: 'text', value });
      textBuffer = [];
    }
  }

  function isTableRow(line) {
    const t = line.trim();
    return t.length > 0 && t.startsWith('|') && t.endsWith('|');
  }

  function parseTableRow(line) {
    return line.trim().slice(1, -1).split(/\|/).map((c) => c.trim());
  }

  function isSeparatorRow(cells) {
    return cells.length > 0 && cells.every((c) => /^-+$/.test(c));
  }

  while (i < lines.length) {
    const line = lines[i];
    const imgMatch = line.trim().match(IMAGE_PLACEHOLDER);
    if (imgMatch) {
      flushText();
      segments.push({ type: 'image', value: imgMatch[1] });
      i++;
      continue;
    }
    if (isTableRow(line)) {
      flushText();
      const tableRows = [];
      while (i < lines.length) {
        const current = lines[i];
        if (isTableRow(current)) {
          tableRows.push(parseTableRow(current));
          i++;
        } else if (tableRows.length > 0 && current.trim().length > 0) {
          // Продолжение последней ячейки (перенос внутри ячейки в контенте)
          const last = tableRows[tableRows.length - 1];
          const lastIdx = last.length - 1;
          last[lastIdx] = (last[lastIdx] || '') + '\n' + current.trim();
          i++;
        } else {
          break;
        }
      }
      if (tableRows.length === 0) continue;
      const headers = tableRows[0];
      let rows = tableRows.slice(1);
      if (rows.length > 0 && isSeparatorRow(rows[0])) rows = rows.slice(1);
      segments.push({ type: 'table', value: { headers, rows } });
      continue;
    }
    textBuffer.push(line);
    i++;
  }
  flushText();
  return segments;
}

const CELL_NL = '\\n'; // в контенте ячейки перенос задаётся как \n (чтобы не ломать парсер таблицы)

/** Ячейка таблицы: если в тексте есть переносы (\\n), каждая строка выводится с маркером • */
function TableCell({ text, styleLast }) {
  const normalized = text.replace(/\\n/g, '\n');
  const lines = normalized.split('\n').filter((s) => s.trim());
  if (lines.length <= 1) {
    return <Text style={[styles.tableCell, styleLast]} numberOfLines={15}>{normalized}</Text>;
  }
  return (
    <View style={[styles.tableCellWrap, styleLast]}>
      {lines.map((line, i) => (
        <Text key={i} style={styles.tableCellBulletLine}>
          • {line.trim()}
        </Text>
      ))}
    </View>
  );
}

function ArticleTable({ headers, rows }) {
  const colCount = headers.length;
  return (
    <View style={styles.tableWrap}>
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {headers.map((cell, idx) => (
          <Text key={idx} style={[styles.tableHeaderCell, idx === colCount - 1 && styles.tableCellLast]} numberOfLines={3}>
            {cell}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={[styles.tableRow, rowIdx === rows.length - 1 && styles.tableRowLast]}>
          {row.slice(0, colCount).map((cell, idx) => (
            <TableCell
              key={idx}
              text={cell}
              styleLast={idx === colCount - 1 && styles.tableCellLast}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function TextbookArticleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { article } = route.params || {};
  const [zoomedImageSource, setZoomedImageSource] = useState(null);
  const [markedRead, setMarkedRead] = useState(false);

  useEffect(() => {
    if (!article?.id) return;
    getReadArticleIds().then((ids) => setMarkedRead(isArticleRead(ids, article.id)));
  }, [article?.id]);

  const onToggleRead = () => {
    if (!article?.id) return;
    if (markedRead) {
      removeArticleRead(article.id);
      setMarkedRead(false);
    } else {
      setArticleRead(article.id);
      setMarkedRead(true);
    }
  };

  if (!article) {
    return (
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>Статья не найдена</Text>
      </View>
    );
  }

  const segments = parseContentWithTables(article.content);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
        <Text style={styles.title}>{article.id} {article.title}</Text>
        {segments.map((seg, idx) =>
          seg.type === 'text' ? (
            <Text key={idx} style={styles.body}>{seg.value}</Text>
          ) : seg.type === 'table' ? (
            <ArticleTable key={idx} headers={seg.value.headers} rows={seg.value.rows} />
          ) : article.images && article.images[seg.value] ? (
            <TouchableOpacity key={idx} activeOpacity={1} onPress={() => setZoomedImageSource(article.images[seg.value])}>
              <OptimizedImage source={article.images[seg.value]} style={styles.articleImage} resizeMode="contain" />
            </TouchableOpacity>
          ) : null
        )}
        {article.sourceUrl ? (
          <TouchableOpacity style={styles.sourceWrap} onPress={() => Linking.openURL(article.sourceUrl)} activeOpacity={0.7}>
            <Text style={styles.sourceLink}>Источник</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.readBtnWrap}>
          <TouchableOpacity
            style={[styles.readBtn, markedRead ? styles.readBtnActive : styles.readBtnDisabled]}
            onPress={onToggleRead}
            activeOpacity={0.8}
          >
            <Text style={styles.readBtnText}>Прочитано</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={zoomedImageSource != null} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setZoomedImageSource(null)}>
          <View style={styles.imageModalOverlay}>
            <View style={styles.imageModalContent} pointerEvents="box-none">
              {zoomedImageSource ? (
                <OptimizedImage key="zoomed" source={zoomedImageSource} style={styles.imageModalImage} resizeMode="contain" />
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121e24', paddingTop: 18, paddingHorizontal: 20 },
  header: { fontSize: 22, color: '#ffffff', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 20 },
  body: { fontSize: 16, color: BODY_COLOR, lineHeight: 26 },
  tableWrap: { borderWidth: 1, borderColor: '#334155', borderRadius: 6, marginVertical: 12, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#334155' },
  tableCell: { flex: 1, padding: 10, fontSize: 14, color: BODY_COLOR, borderRightWidth: 1, borderRightColor: '#334155' },
  tableCellWrap: { flex: 1, padding: 10, paddingLeft: 12, borderRightWidth: 1, borderRightColor: '#334155' },
  tableCellBulletLine: { fontSize: 14, color: BODY_COLOR, lineHeight: 22, marginBottom: 2 },
  tableHeaderRow: { backgroundColor: '#1e293b' },
  tableHeaderCell: { flex: 1, padding: 10, fontSize: 14, backgroundColor: '#1e293b', color: '#ffffff', fontWeight: '600', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#334155' },
  tableCellLast: { borderRightWidth: 0 },
  tableRowLast: { borderBottomWidth: 0 },
  articleImage: { width: '100%', maxHeight: 280, marginVertical: 12, borderRadius: 6 },
  sourceWrap: { marginTop: 24, marginBottom: 8 },
  sourceLink: { fontSize: 16, color: '#49c0f8', fontWeight: '600' },
  readBtnWrap: { width: '100%', alignItems: 'center', marginTop: 24, marginBottom: 24 },
  readBtn: {
    height: 56,
    minWidth: 200,
    paddingHorizontal: 32,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readBtnDisabled: { backgroundColor: '#334155', opacity: 0.7 },
  readBtnActive: { backgroundColor: '#49c0f8' },
  readBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  imageModalContent: { flex: 1, width: '100%', justifyContent: 'center' },
  imageModalImage: { width: '100%', height: '100%' },
});
