import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Pressable, Text, TextInput, View } from 'react-native';
import styles from '../theme/styles';
import C from '../theme/colors';
import { CATEGORIES } from '../data/reports';
import { FieldLabel } from '../components/UI';

function ReportScreen({ onSubmit, onNavigate }) {
  const [category, setCategory] = useState('Banjir');
  const [place, setPlace] = useState(''); const [description, setDescription] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const submit = async () => {
    if (!place.trim() || !description.trim()) { Alert.alert('Lengkapi laporan', 'Isi lokasi dan deskripsi singkat agar laporan dapat dikirim.'); return; }
    try {
      await onSubmit({
        category,
        place: place.trim(),
        description: description.trim(),
      });

      Alert.alert(
        'Laporan terkirim',
        'Laporan berhasil disimpan dan menunggu verifikasi.',
        [
          {
            text: 'Lihat laporan',
            onPress: () => onNavigate('map'),
          },
        ]
      );
    } catch (error) {
      // Error sudah ditampilkan oleh createReport di App.js.
    }
  };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>BANTU WARGA SEKITAR</Text><Text style={styles.screenTitle}>Kirim laporan</Text><Text style={styles.screenSubtitle}>Bagikan kondisi yang kamu lihat. Laporan akan diperiksa sebelum ditandai terverifikasi.</Text>
      <View style={styles.formNotice}><Text style={styles.formNoticeIcon}>✓</Text><Text style={styles.formNoticeText}>Laporan baru berstatus <Text style={{ fontWeight: '800', color: C.blue }}>Menunggu verifikasi</Text>. Lokasi dan identitas pelapor tidak ditampilkan pada kartu publik.</Text></View>
      <FieldLabel>Kategori kejadian</FieldLabel><View style={styles.categoryGrid}>{CATEGORIES.map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[styles.categoryOption, category === c && styles.categoryOptionActive]}><Text style={[styles.categoryOptionText, category === c && styles.categoryOptionTextActive]}>{c}</Text></Pressable>)}</View>
      <FieldLabel>Lokasi kejadian</FieldLabel><View style={styles.inputWrap}><Text style={styles.inputIcon}>⌖</Text><TextInput value={place} onChangeText={setPlace} placeholder="Contoh: Jalan Raya Darmo" placeholderTextColor="#9AA6A2" style={styles.input} /></View><Text style={styles.helperText}>Tuliskan area atau nama jalan. Hindari membagikan alamat rumah pribadi.</Text>
      <FieldLabel>Waktu kejadian</FieldLabel><View style={styles.readonlyField}><Text style={styles.inputIcon}>◷</Text><Text style={styles.readonlyText}>Sekarang · otomatis dicatat</Text></View>
      <FieldLabel>Deskripsi</FieldLabel><TextInput multiline value={description} onChangeText={setDescription} placeholder="Jelaskan kondisi yang kamu lihat dengan singkat dan faktual…" placeholderTextColor="#9AA6A2" textAlignVertical="top" style={[styles.input, styles.textArea]} /><Text style={styles.helperText}>Tuliskan yang kamu lihat. Jangan menyimpulkan area aman atau memberi arahan darurat.</Text>
      <FieldLabel optional="OPSIONAL">Foto pendukung</FieldLabel><Pressable onPress={() => setPhotoAdded(!photoAdded)} style={styles.uploadBox}><Text style={styles.uploadIcon}>{photoAdded ? '✓' : '＋'}</Text><Text style={styles.uploadText}>{photoAdded ? 'Foto ditambahkan (simulasi)' : 'Tambahkan foto'}</Text><Text style={styles.uploadSub}>{photoAdded ? 'Ketuk untuk menghapus' : 'Fitur foto tersedia setelah integrasi kamera'}</Text></Pressable>
      <Pressable onPress={submit} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Kirim laporan  →</Text></Pressable>
      <Text style={styles.consentText}>Dengan mengirim laporan, kamu memahami bahwa informasi akan ditampilkan sebagai laporan komunitas dan perlu diperiksa.</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export default ReportScreen;
