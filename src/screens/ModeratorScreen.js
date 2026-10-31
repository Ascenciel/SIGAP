import React, { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { Badge, SafetyNote } from '../components/UI';

function ModeratorScreen({ reports, onSelect }) {
  const [filter, setFilter] = useState('Perlu ditinjau');
  const pending = reports.filter(r => ['Menunggu verifikasi', 'Sedang diperiksa'].includes(r.status));
  const list = filter === 'Perlu ditinjau' ? pending : reports;
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.screenTitle}>Tinjau laporan</Text>
    <Text style={styles.screenSubtitle}>Buka detail untuk memeriksa konteks dan mencatat alasan sebelum mengubah status.</Text>
    <View style={styles.statsRow}>
      <View style={styles.stat}><Text style={styles.statNumber}>{reports.filter(r => r.status === 'Menunggu verifikasi').length}</Text><Text style={styles.statLabel}>Menunggu</Text></View>
      <View style={styles.statDivider} />
      <View style={styles.stat}><Text style={[styles.statNumber, { color: C.orange }]}>{reports.filter(r => r.status === 'Sedang diperiksa').length}</Text><Text style={styles.statLabel}>Diperiksa</Text></View>
      <View style={styles.statDivider} />
      <View style={styles.stat}><Text style={[styles.statNumber, { color: C.green }]}>{reports.filter(r => r.status === 'Terverifikasi').length}</Text><Text style={styles.statLabel}>Terverifikasi</Text></View>
    </View>
    <View style={styles.reviewTabs}>{['Perlu ditinjau', 'Semua'].map(t => <Pressable key={t} onPress={() => setFilter(t)} style={[styles.reviewTab, filter === t && styles.reviewTabActive]}><Text style={[styles.reviewTabText, filter === t && styles.reviewTabTextActive]}>{t}{t === 'Perlu ditinjau' ? ` (${pending.length})` : ''}</Text></Pressable>)}</View>
    {list.length === 0 ? <View style={styles.emptyState}><Text style={{ fontSize: 28, color: C.green }}>✓</Text><Text style={styles.emptyTitle}>Semua sudah ditinjau</Text><Text style={styles.emptyBody}>Belum ada laporan yang memerlukan pemeriksaan.</Text></View> : list.map(r => <Pressable accessibilityRole="button" key={r.id} onPress={() => onSelect(r)} style={styles.reviewCard}>
      <View style={styles.cardTop}><Text style={styles.categoryLabel}>{r.id} · {r.category.toUpperCase()}</Text><Badge status={r.status} small /></View>
      <Text style={styles.reportTitle}>{r.title}</Text>
      <Text style={styles.reviewDescription} numberOfLines={2}>{r.description}</Text>
      <Text style={styles.metaText}>⌖  {r.place}  ·  {r.time}</Text>
      <Text style={[styles.link, { marginTop: 11 }]}>Buka detail dan catat hasil pemeriksaan  ›</Text>
    </Pressable>)}
    <View style={styles.reviewDisclosure}><Text style={styles.caveatIcon}>ⓘ</Text><Text style={styles.caveatText}>Verifikasi SIGAP berarti diperiksa berdasarkan prosedur komunitas, bukan pengesahan otoritas.</Text></View>
    <SafetyNote />
  </ScrollView>;
}

export default ModeratorScreen;
