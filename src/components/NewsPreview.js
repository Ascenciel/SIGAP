import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styles from '../theme/styles';
import { SectionTitle } from './UI';
import { NEWS_SOURCE } from '../services/newsApi';

export default function NewsPreview({ articles, loading, onOpen }) {
  return <View style={styles.newsPreview}>
    <SectionTitle title="Berita kebencanaan" action="Semua berita" onPress={onOpen} />
    {loading && !articles?.length ? <Text style={styles.newsMessage}>Mengambil berita terbaru…</Text> : null}
    {(articles || []).slice(0, 2).map(article => <Pressable key={article.url} onPress={() => onOpen(article)} style={styles.newsPreviewItem}>
      <Text style={styles.newsPreviewSource}>{article.source}</Text><Text style={styles.newsPreviewTitle} numberOfLines={2}>{article.title}</Text>
    </Pressable>)}
    <Text style={styles.newsAttribution}>{NEWS_SOURCE}. Buka berita untuk membaca artikel dari penerbit.</Text>
  </View>;
}
