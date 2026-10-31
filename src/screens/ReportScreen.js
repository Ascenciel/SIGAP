
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import styles from '../theme/styles';
import C from '../theme/colors';
import { CATEGORIES } from '../data/reports';
import { FieldLabel } from '../components/UI';

function ReportScreen({ onSubmit, onNavigate }) {
  const [category, setCategory] = useState('Banjir');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Izin lokasi diperlukan',
          'Izinkan akses lokasi untuk mengambil koordinat kejadian. Kamu tetap bisa mengisi lokasi secara manual.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      Alert.alert(
        'Lokasi berhasil diambil',
        'Koordinat GPS sudah ditambahkan ke laporan.'
      );
    } catch (error) {
      Alert.alert(
        'Gagal mengambil lokasi',
        error.message || 'Tidak dapat memperoleh koordinat GPS.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickPhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Izin galeri diperlukan',
          'Izinkan akses galeri untuk memilih foto pendukung.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const selected = result.assets[0];

        if (selected.fileSize && selected.fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            'Ukuran foto terlalu besar',
            'Pilih foto dengan ukuran maksimal 5 MB.'
          );
          return;
        }

        setPhoto(selected);
      }
    } catch (error) {
      Alert.alert(
        'Gagal memilih foto',
        error.message || 'Terjadi kesalahan saat membuka galeri.'
      );
    }
  };

  const submit = async () => {
    if (!place.trim() || !description.trim()) {
      Alert.alert(
        'Lengkapi laporan',
        'Isi lokasi dan deskripsi singkat agar laporan dapat dikirim.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        category,
        place: place.trim(),
        description: description.trim(),
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        photo,
      });

      setPlace('');
      setDescription('');
      setCoordinates(null);
      setPhoto(null);
      setCategory('Banjir');

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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>BANTU WARGA SEKITAR</Text>
        <Text style={styles.screenTitle}>Kirim laporan</Text>
        <Text style={styles.screenSubtitle}>
          Bagikan kondisi yang kamu lihat. Laporan akan diperiksa sebelum
          ditandai terverifikasi.
        </Text>

        <View style={styles.formNotice}>
          <Text style={styles.formNoticeIcon}>✓</Text>
          <Text style={styles.formNoticeText}>
            Laporan baru berstatus{' '}
            <Text style={{ fontWeight: '800', color: C.blue }}>
              Menunggu verifikasi
            </Text>
            . Lokasi dan identitas pelapor tidak ditampilkan pada kartu publik.
          </Text>
        </View>

        <FieldLabel>Kategori kejadian</FieldLabel>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[
                styles.categoryOption,
                category === c && styles.categoryOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  category === c && styles.categoryOptionTextActive,
                ]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <FieldLabel>Lokasi kejadian</FieldLabel>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>⌖</Text>
          <TextInput
            value={place}
            onChangeText={setPlace}
            placeholder="Contoh: Jalan Raya Darmo"
            placeholderTextColor="#9AA6A2"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={getCurrentLocation}
          disabled={loadingLocation}
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: C.mint,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loadingLocation ? (
            <ActivityIndicator color={C.green} />
          ) : (
            <Text style={{ color: C.green, fontSize: 17 }}>⌖</Text>
          )}
          <Text style={{ color: C.green, fontWeight: '700' }}>
            {loadingLocation
              ? 'Mengambil lokasi...'
              : coordinates
                ? 'Perbarui koordinat GPS'
                : 'Gunakan lokasi GPS'}
          </Text>
        </Pressable>

        {coordinates && (
          <Text style={styles.helperText}>
            Koordinat GPS berhasil ditambahkan ke laporan.
            {'\n'}
            {coordinates.latitude.toFixed(6)},{' '}
            {coordinates.longitude.toFixed(6)}
          </Text>
        )}

        <Text style={styles.helperText}>
          Tuliskan area atau nama jalan. Hindari membagikan alamat rumah
          pribadi.
        </Text>

        <FieldLabel>Waktu kejadian</FieldLabel>
        <View style={styles.readonlyField}>
          <Text style={styles.inputIcon}>◷</Text>
          <Text style={styles.readonlyText}>
            Sekarang · otomatis dicatat
          </Text>
        </View>

        <FieldLabel>Deskripsi</FieldLabel>
        <TextInput
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Jelaskan kondisi yang kamu lihat dengan singkat dan faktual…"
          placeholderTextColor="#9AA6A2"
          textAlignVertical="top"
          style={[styles.input, styles.textArea]}
        />
        <Text style={styles.helperText}>
          Tuliskan yang kamu lihat. Jangan menyimpulkan area aman atau memberi
          arahan darurat.
        </Text>

        <FieldLabel optional="OPSIONAL">Foto pendukung</FieldLabel>

        <Pressable
          onPress={pickPhoto}
          style={styles.uploadBox}
          disabled={submitting}
        >
          {photo ? (
            <>
              <Image
                source={{ uri: photo.uri }}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  marginBottom: 10,
                }}
                resizeMode="cover"
              />
              <Text style={styles.uploadText}>Foto dipilih</Text>
              <Text style={styles.uploadSub}>
                Ketuk untuk mengganti foto
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.uploadIcon}>＋</Text>
              <Text style={styles.uploadText}>Tambahkan foto</Text>
              <Text style={styles.uploadSub}>
                Pilih foto dari galeri · Maksimal 5 MB
              </Text>
            </>
          )}
        </Pressable>

        {photo && (
          <Pressable
            onPress={() => setPhoto(null)}
            style={{ alignSelf: 'flex-end', padding: 8 }}
          >
            <Text style={{ color: C.red, fontWeight: '700' }}>
              Hapus foto
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={submit}
          disabled={submitting || loadingLocation}
          style={[
            styles.primaryButton,
            (submitting || loadingLocation) && { opacity: 0.6 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Kirim laporan  →
            </Text>
          )}
        </Pressable>

        <Text style={styles.consentText}>
          Dengan mengirim laporan, kamu memahami bahwa informasi akan
          ditampilkan sebagai laporan komunitas dan perlu diperiksa.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ReportScreen;
