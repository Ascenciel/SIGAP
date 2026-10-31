import React, { useState } from 'react';
import { Alert, Image, ScrollView, Pressable, Text, TextInput, View } from 'react-native';
import C from '../theme/colors';
import styles from '../theme/styles';
import { STATUS, REVIEW_STATES } from '../data/reports';
import { Badge, SafetyNote } from '../components/UI';
import MapPreview from '../components/MapPreview';

function DetailScreen({ report, onBack, isModerator, onStatus }) {
  const [note, setNote] = useState(report.note || '');
  const updateStatus = state => {
    if (state === report.status) return;
    if (!note.trim()) {
      Alert.alert('Catatan diperlukan', 'Tuliskan alasan atau sumber pemeriksaan sebelum mengubah status.');
      return;
    }
    onStatus(report, state, note.trim());
  };
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹  Kembali</Text></Pressable>
    <Text style={styles.detailTitle}>{report.title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}><Badge status={report.status} /><Text style={styles.metaText}>{report.time}</Text></View>
    <View style={styles.detailMap}><MapPreview reports={report.status === 'Ditolak' ? [] : [report]} onReport={() => {}} /><View style={styles.detailLocation}><Text style={{ color: C.green }}>⌖</Text><Text style={styles.detailPlace}>{report.place}</Text></View></View>
    <Text style={styles.sectionHeading}>Keterangan laporan</Text><Text style={styles.detailDescription}>{report.description}</Text>
    {report.photoUri ? <View style={styles.detailPhoto}><Text style={styles.infoLabel}>FOTO PENDUKUNG</Text><Image source={{ uri: report.photoUri }} style={styles.detailPhotoImage} resizeMode="cover" accessibilityLabel="Foto pendukung laporan" /></View> : null}
    <View style={styles.infoRow}><Text style={styles.infoLabel}>SUMBER</Text><Text style={styles.infoValue}>{report.source}</Text></View>
    <View style={styles.infoRow}><Text style={styles.infoLabel}>DIPERBARUI</Text><Text style={styles.infoValue}>{report.updated || report.time}</Text></View>
    <View style={styles.noteBox}><Text style={styles.noteTitle}>Catatan pemeriksaan</Text><Text style={styles.noteText}>{report.note || 'Belum ada catatan pemeriksaan.'}</Text></View>
    <Text style={[styles.sectionHeading, { marginTop: 20, marginBottom: 9 }]}>Riwayat status</Text>
    {(report.history?.length ? report.history : [{ status: report.status, note: report.note || 'Laporan diterima untuk pemeriksaan.', time: report.time }]).slice().reverse().map((event, index) => <View key={`${event.status}-${index}`} style={styles.historyRow}><View style={[styles.historyMarker, { backgroundColor: (STATUS[event.status] || STATUS['Menunggu verifikasi']).dot }]} /><View style={{ flex: 1 }}><View style={styles.historyHeading}><Text style={styles.historyStatus}>{event.status}</Text><Text style={styles.historyTime}>{event.time}</Text></View><Text style={styles.historyNote}>{event.note || 'Status laporan diperbarui.'}</Text></View></View>)}
    {isModerator ? <><Text style={[styles.sectionHeading, { marginTop: 23 }]}>Perbarui status</Text><Text style={styles.helperText}>Catatan wajib untuk perubahan status dan akan tampil di riwayat laporan.</Text><TextInput value={note} onChangeText={setNote} placeholder="Alasan atau sumber pemeriksaan…" placeholderTextColor="#9AA6A2" style={styles.noteInput} multiline /><View style={styles.statusActions}>{REVIEW_STATES.map(state => <Pressable key={state} accessibilityRole="button" accessibilityState={{ selected: report.status === state }} onPress={() => updateStatus(state)} style={[styles.statusAction, report.status === state && styles.statusActionCurrent]}><Text style={[styles.statusActionText, report.status === state && { color: C.green }]}>{state === report.status ? '✓ ' : ''}{state}</Text></Pressable>)}</View></> : null}
    <View style={styles.mapCaveat}><Text style={styles.caveatIcon}>ⓘ</Text><Text style={styles.caveatText}>Status komunitas ini bukan arahan resmi. Ikuti informasi dari otoritas terkait.</Text></View>
    <SafetyNote />
  </ScrollView>;
}

export default DetailScreen;
