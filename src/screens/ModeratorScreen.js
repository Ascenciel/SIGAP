import React, { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { Badge, SafetyNote } from '../components/UI';
import { REVIEW_STATES } from '../data/reports';

function ModeratorScreen({ reports, onSelect, onStatus }) {
  const [filter, setFilter] = useState('Perlu ditinjau');
  const list = filter === 'Perlu ditinjau' ? reports.filter(r => ['Menunggu verifikasi', 'Sedang diperiksa'].includes(r.status)) : reports;
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>RUANG PENGELOLA</Text><Text style={styles.screenTitle}>Tinjau laporan</Text><Text style={styles.screenSubtitle}>Periksa konteks dan catat alasan sebelum mengubah status.</Text>
    <View style={styles.simulationBanner}><View style={styles.simIcon}><Text>i</Text></View><Text style={styles.simText}><Text style={{ fontWeight: '800' }}>Akses demo moderator.</Text> Perubahan hanya tersimpan di sesi ini.</Text></View>
    <View style={styles.statsRow}><View style={styles.stat}><Text style={styles.statNumber}>{reports.filter(r => r.status === 'Menunggu verifikasi').length}</Text><Text style={styles.statLabel}>Menunggu</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={[styles.statNumber, { color: C.orange }]}>{reports.filter(r => r.status === 'Sedang diperiksa').length}</Text><Text style={styles.statLabel}>Diperiksa</Text></View><View style={styles.statDivider} /><View style={styles.stat}><Text style={[styles.statNumber, { color: C.green }]}>{reports.filter(r => r.status === 'Terverifikasi').length}</Text><Text style={styles.statLabel}>Terverifikasi</Text></View></View>
    <View style={styles.reviewTabs}>{['Perlu ditinjau', 'Semua'].map(t => <Pressable key={t} onPress={() => setFilter(t)} style={[styles.reviewTab, filter === t && styles.reviewTabActive]}><Text style={[styles.reviewTabText, filter === t && styles.reviewTabTextActive]}>{t}</Text></Pressable>)}</View>
    {list.length === 0 ? <View style={styles.emptyState}><Text style={{ fontSize: 28 }}>✓</Text><Text style={styles.emptyTitle}>Semua sudah ditinjau</Text><Text style={styles.emptyBody}>Belum ada laporan yang memerlukan pemeriksaan.</Text></View> : list.map(r => <View key={r.id} style={styles.reviewCard}><Pressable onPress={() => onSelect(r)}><View style={styles.cardTop}><Text style={styles.categoryLabel}>{r.id} · {r.category.toUpperCase()}</Text><Badge status={r.status} small /></View><Text style={styles.reportTitle}>{r.title}</Text><Text style={styles.reviewDescription} numberOfLines={2}>{r.description}</Text><Text style={styles.metaText}>⌖  {r.place}  ·  {r.time}</Text></Pressable><View style={styles.reviewActions}><Pressable onPress={() => onStatus(r, 'Sedang diperiksa')} style={styles.reviewSecondary}><Text style={styles.reviewSecondaryText}>Periksa</Text></Pressable><Pressable onPress={() => onStatus(r, 'Terverifikasi')} style={styles.reviewApprove}><Text style={styles.reviewApproveText}>✓ Verifikasi</Text></Pressable><Pressable onPress={() => onStatus(r, 'Ditolak')} style={styles.reviewReject}><Text style={styles.reviewRejectText}>Tolak</Text></Pressable></View></View>)}
    <View style={styles.reviewDisclosure}><Text style={styles.caveatIcon}>ⓘ</Text><Text style={styles.caveatText}>Verifikasi SIGAP berarti diperiksa berdasarkan prosedur proyek, bukan pengesahan otoritas.</Text></View><SafetyNote />
  </ScrollView>;
}

export default ModeratorScreen;
