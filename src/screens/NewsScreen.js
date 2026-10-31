import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import styles from '../theme/styles';
import { NEWS_SOURCE } from '../services/newsApi';
import { SafetyNote } from '../components/UI';

function publishedLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Waktu terbit tidak tersedia' : date.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NewsScreen({ articles, loading, error, onRefresh }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>KABAR DARI PENERBIT</Text><Text style={styles.screenTitle}>Berita kebencanaan</Text><Text style={styles.screenSubtitle}>Berita ditautkan ke penerbit aslinya. Periksa tanggal dan sumber sebelum membagikan.</Text>
    <View style={styles.newsNotice}><Text style={styles.newsNoticeIcon}>i</Text><Text style={styles.newsNoticeText}>Berita media bukan laporan warga SIGAP dan bukan peringatan resmi. Untuk keselamatan, ikuti pengumuman otoritas.</Text></View>
    <View style={styles.newsToolbar}><Text style={styles.newsSource}>{NEWS_SOURCE}</Text><Pressable onPress={onRefresh}><Text style={styles.link}>Muat ulang  ↻</Text></Pressable></View>
    {error && articles?.length ? <Text style={styles.weatherWarning}>Feed gagal diperbarui · berita sebelumnya masih ditampilkan</Text> : null}
    {loading && !articles?.length ? <View style={styles.newsEmpty}><Text style={styles.newsMessage}>Memuat berita…</Text></View> : null}
    {error && !articles?.length ? <View style={styles.newsEmpty}><Text style={styles.newsEmptyTitle}>Berita belum dapat dimuat</Text><Text style={styles.newsMessage}>Periksa koneksi internet lalu coba lagi.</Text><Pressable onPress={onRefresh} style={styles.newsRetry}><Text style={styles.newsRetryText}>Coba lagi</Text></Pressable></View> : null}
    {(articles || []).map(article => <Pressable key={article.url} onPress={() => Linking.openURL(article.url).catch(() => {})} style={styles.newsCard}>
      <View style={styles.newsCardTop}><View style={styles.newsBadge}><Text style={styles.newsBadgeText}>BERITA</Text></View><Text style={styles.newsDate}>{publishedLabel(article.publishedAt)}</Text></View>
      <Text style={styles.newsTitle}>{article.title}</Text><View style={styles.newsCardFooter}><Text style={styles.newsPublisher}>{article.source}</Text><Text style={styles.newsOpen}>Baca artikel  ↗</Text></View>
    </Pressable>)}
    {!loading && !error && !articles?.length ? <View style={styles.newsEmpty}><Text style={styles.newsMessage}>Belum ada berita di feed.</Text></View> : null}
    <SafetyNote />
  </ScrollView>;
}
